import { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  Typography,
  Card,
  CardContent,
  Divider,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "../utils/axios";

type Props = {
  open: boolean;
  onClose: () => void;
};

interface users {
  _id: string;
  name: string;
  email: string;
  articles: object[];
}

export default function UserSideList({ open, onClose }: Props) {
  const [users, setUsers] = useState<users[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (open) {
      setLoading(true);
      axios.get("/user/users").then((res) => {
        setUsers(res.data);
        setLoading(false);
      });
    }
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "90%" : 320,
          background: "linear-gradient(145deg, #e0f7fa, #ffffff)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          borderTopLeftRadius: "20px",
          borderBottomLeftRadius: "20px",
          animation: "slideIn 0.5s ease-out",
          overflowY: "auto",
          maxHeight: "100vh",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* 🧠 Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: 1,
              color: "#006064",
            }}
          >
            🌍 All Users
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#333",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "rotate(90deg)", color: "#d32f2f" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ⌛ Loading */}
        {loading ? (
          <Box textAlign="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          users.map((user, i) => (
            <Card
              key={user._id}
              sx={{
                mb: 2,
                borderRadius: 3,
                background: "linear-gradient(135deg, #f0f0f0, #ffffff)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "transform 0.3s, box-shadow 0.3s",
                animation: `fadeIn 0.4s ease forwards`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  👤 {user.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ wordWrap: "break-word" }}
                >
                  📧 {user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📚 Articles: {user.articles.length}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* ✨ Animations */}
      <style>
        {`
          @keyframes slideIn {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }

          @keyframes fadeIn {
            0% { transform: translateY(10px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </Drawer>
  );
}
