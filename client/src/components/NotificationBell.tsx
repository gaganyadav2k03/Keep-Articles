import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { getSocket } from "../utils/socket";
import { useNavigate } from "react-router-dom";

type Notification = {
  _id: string;
  recipient: string;
  message: string;
  articleId?: string;
  read: boolean;
  createdAt: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  setHasUnread?: (hasUnread: boolean) => void;
};

export default function NotificationDrawer({ open, onClose, setHasUnread }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = getSocket();

  useEffect(() => {
    if (open) {
      axios
        .get("/user/notifications")
        .then((res) => {
          setNotifications(res.data);
          if (setHasUnread) {
            const hasUnread = res.data.some((n:Notification) => !n.read);
            setHasUnread(hasUnread);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, setHasUnread]);

  useEffect(() => {
    socket.on("notification", (data: Notification) => {
      setNotifications((prev) => {
        const updated = [data, ...prev];
        if (setHasUnread) setHasUnread(true);
        return updated;
      });
    });

    return () => {
      socket.off("notification");
    };
  }, [socket, setHasUnread]);

  const markAllAsRead = async () => {
    try {
      await axios.put("/user/notificationsRead");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      if (setHasUnread) setHasUnread(false);
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    } finally {
      onClose();
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">🔔 Notifications</Typography>
          <IconButton onClick={markAllAsRead}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {loading ? (
          <Box textAlign="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {notifications.length === 0 ? (
              <Typography variant="body2" textAlign="center">
                No notifications
              </Typography>
            ) : (
              notifications
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((n) => (
                  <ListItemButton
                    key={n._id}
                    onClick={() => {
                      if (n.articleId) {
                        navigate(`/articles/${n.articleId}`);
                        onClose();
                      }
                    }}
                    sx={{
                      backgroundColor: n.read ? "#f5f5f5" : "#e1f5fe",
                      borderRadius: 2,
                      mb: 1,
                      px: 2,
                      py: 1,
                      "&:hover": {
                        backgroundColor: "#b3e5fc",
                      },
                    }}
                  >
                    <ListItemText
                      primary={n.message}
                      secondary={new Date(n.createdAt).toLocaleString()}
                      primaryTypographyProps={{
                        fontWeight: n.read ? 400 : 600,
                      }}
                    />
                  </ListItemButton>
                ))
            )}
          </List>
        )}
      </Box>
    </Drawer>
  );
}
