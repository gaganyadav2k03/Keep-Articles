// src/components/ChatSidebar.tsx
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Avatar,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { colors } from "../assets/colors"; // ✅ import your palette

interface ChatUser {
  id: string;
  name: string;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: ChatUser) => void;
}

export default function ChatSidebar({ open, onClose, onSelectUser }: Props) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios
      .get("/user/users")
      .then((res) => {
        const filtered = res.data.filter((u: ChatUser) => u.id !== user?.id);
        setUsers(filtered);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [open, user]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          top: "140px",
          height: "calc(100vh - 140px)",
          borderLeft: `1px solid ${colors.sand}`, // 🟠 updated
          boxShadow: 3,
          backgroundColor: colors.backgroundLight, // 🟠 optional
        },
      }}
    >
      <Box sx={{ width: 300, p: 2, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          💬 Message Users
        </Typography>
        <Divider sx={{ mb: 2, backgroundColor: colors.sand }} />{" "}
        {/* 🟠 optional color tint */}
        {loading ? (
          <Box textAlign="center" mt={4}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <List sx={{ flex: 1, overflowY: "auto" }}>
            {users.map((u) => (
              <ListItemButton
                key={u.id}
                onClick={() => {
                  onSelectUser(u);
                  onClose();
                }}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: colors.beige, // 🟠 updated hover color
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    mr: 2,
                    bgcolor: colors.sand, // 🟠 optional avatar bg
                    color: "#fff",
                  }}
                >
                  {u.name.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={u.name}
                  secondary={u.email}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondaryTypographyProps={{
                    fontSize: "0.8rem",
                    color: colors.blush, // 🟠 optional for text emphasis
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
}
