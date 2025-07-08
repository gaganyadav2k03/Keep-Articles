import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import { getSocket } from "../utils/socket";

interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  text: string;
  createdAt?: string;
}

interface ChatUser {
  id: string;
  name: string;
  email: string;
}

export default function MessagePage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;
    socket.emit("get-online-users");

    socket.on("online-users", (ids: string[]) => {
      setOnlineUserIds(ids);
    });

    return () => {
      socket.off("online-users");
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    axios.get("/user/messageList").then((res) => {
      const filtered = res.data.filter((u: ChatUser) => u.id !== user.id);
      setUsers(filtered);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);

    axios
      .get(`/user/messages/${selectedUser.id}`)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [selectedUser]);

  useEffect(() => {
    const socket = socketRef.current;

    socket.on("receive-message", (msg: Message) => {
      if (
        msg.sender === selectedUser?.id ||
        msg.receiver === selectedUser?.id
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      setUsers((prev) => {
        const index = prev.findIndex(
          (u) => u.id === msg.sender || u.id === msg.receiver
        );
        if (index === -1) return prev;
        const updated = [...prev];
        const [recent] = updated.splice(index, 1);
        return [recent, ...updated];
      });
    });

    return () => {
      socket.off("receive-message");
    };
  }, [selectedUser]);

  const handleSend = async () => {
    if (!text.trim() || !selectedUser || !user) return;

    const newMessage: Message = {
      sender: user.id,
      receiver: selectedUser.id,
      text,
    };

    setMessages((prev) => [...prev, newMessage]);
    setText("");

    setUsers((prev) => {
      const index = prev.findIndex((u) => u.id === selectedUser.id);
      if (index === -1) return prev;
      const updated = [...prev];
      const [recent] = updated.splice(index, 1);
      return [recent, ...updated];
    });

    try {
      await axios.post("/user/messages", newMessage);
      socketRef.current.emit("send-message", newMessage);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 70px)",
        ml: "100px",
        bgcolor: "#f4f6f8",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          flexBasis: "28%",
          borderRight: "1px solid #ddd",
          p: 2,
          overflowY: "auto",
          bgcolor: "#fff",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 2, color: "#2c3e50" }}
        >
          💬 Chat Users
        </Typography>
        <List>
          {users.map((u) => {
            const isOnline = onlineUserIds.includes(u.id);
            return (
              <ListItemButton
                key={u.id}
                selected={selectedUser?.id === u.id}
                onClick={() => setSelectedUser(u)}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  backgroundColor:
                    selectedUser?.id === u.id ? "#e3f2fd" : "transparent",
                  "&:hover": {
                    backgroundColor: "#f1f1f1",
                  },
                }}
              >
                <Box sx={{ position: "relative", mr: 2 }}>
                  <Avatar
                    sx={{
                      background:
                        "linear-gradient(135deg, rgb(95, 99, 100), rgb(85, 87, 88))",
                    }}
                  >
                    {u.name[0]}
                  </Avatar>
                  {isOnline && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        bgcolor: "#44b700",
                        borderRadius: "50%",
                        border: "2px solid white",
                      }}
                    />
                  )}
                </Box>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 500 }}>{u.name}</Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Chat Panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
          overflow: "hidden",
          bgcolor: "#f9fafc",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {selectedUser
            ? `Chat with ${selectedUser.name}`
            : "Select a user to start chat"}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Chat Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            px: 1,
            pb: 2,
          }}
        >
          {loading ? (
            <CircularProgress sx={{ alignSelf: "center", mt: 5 }} />
          ) : messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No messages yet.
            </Typography>
          ) : (
            messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf:
                    msg.sender === user?.id ? "flex-end" : "flex-start",
                  bgcolor: msg.sender === user?.id ? "#d0f0c0" : "#ffffff",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  maxWidth: "75%",
                  transition: "all 0.2s ease",
                }}
              >
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  {msg.text}
                </Typography>
                {msg.createdAt && (
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.6, mt: 0.5, display: "block" }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Box>

        {/* Message Input */}
        {selectedUser && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              pt: 1,
              borderTop: "1px solid #ddd",
              px: 1,
              bgcolor: "#fff",
            }}
          >
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              size="small"
              sx={{
                backgroundColor: "#f0f0f0",
                borderRadius: 1,
              }}
            />
            <IconButton
              onClick={handleSend}
              color="primary"
              sx={{
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: "#d0e8ff",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
