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
import { useNavigate } from "react-router-dom";

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

const formatDate = (timestamp: string) =>
  new Date(timestamp).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function MessagePage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isTyping, setIsTyping] = useState(false);
  // import { Navigate } from "react-router-dom";
  const socketRef = useRef(getSocket());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = socketRef.current;
    socket.emit("get-online-users");

    socket.on("online-users", (ids: string[]) => {
      setOnlineUserIds(ids);
    });

    socket.on("userTyping", (data: { from: string; to: string }) => {
      // ✅ Only show typing if YOU are the target and THEY are the sender
      if (data.from === selectedUser?.id && data.to === user?.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    });

    return () => {
      socket.off("online-users");
      socket.off("userTyping");
    };
  }, [selectedUser, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    axios.get("/user/messageList").then((res) => {
      const filtered = res.data.filter((u: ChatUser) => u.id !== user.id);
      setUsers(filtered);
    });

    axios.get("/user/unreadCounts").then((res) => {
      setUnreadCounts(res.data);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);

    axios
      .get(`/user/messages/${selectedUser.id}?limit=50&skip=0`)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));

    axios.post(`/user/markAsRead/${selectedUser.id}`).then(() => {
      setUnreadCounts((prev) => {
        const updated = { ...prev };
        delete updated[selectedUser.id];
        return updated;
      });
    });
  }, [selectedUser]);

  useEffect(() => {
    const socket = socketRef.current;

    socket.on("receive-message", (msg: Message) => {
      if (
        msg.sender === selectedUser?.id ||
        msg.receiver === selectedUser?.id
      ) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
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

    setMessages((prev) => [...prev, { ...newMessage, createdAt: Date() }]);
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
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const groupedMessages = messages.reduce(
    (acc: Record<string, Message[]>, msg) => {
      const date = formatDate(msg.createdAt!);
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    },
    {}
  );

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
            const unread = unreadCounts[u.id] || 0;

            return (
              <ListItemButton
                key={u.id}
                selected={selectedUser?.id === u.id}
                // onClick={() => setSelectedUser(u)}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor:
                    selectedUser?.id === u.id ? "#e3f2fd" : "transparent",
                  "&:hover": { backgroundColor: "#f1f1f1" },
                }}
              >
                <Box sx={{ position: "relative", mr: 2 }}>
                  <Avatar
                    sx={{
                      background:
                        "linear-gradient(135deg, rgb(95, 99, 100), rgb(85, 87, 88))",
                    }}
                    onClick={() => navigate(`/user/${u.id}`)}
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
                    <Box
                      onClick={() => setSelectedUser(u)}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ fontWeight: 500 }}>{u.name}</Typography>
                      {unread > 0 && (
                        <Box
                          sx={{
                            backgroundColor: "rgb(90,90,90)",
                            color: "white",
                            borderRadius: "12px",
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            ml: 1,
                          }}
                        >
                          {unread}
                        </Box>
                      )}
                    </Box>
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
        <Typography
          variant="h6"
          onClick={() => {
            if (selectedUser?.id) {
              navigate(`/user/${selectedUser.id}`);
            }
          }}
          sx={{ mb: 1, fontWeight: 600 }}
        >
          {selectedUser
            ? `Chat with ${selectedUser.name}`
            : "Select a user to start chat"}
        </Typography>

        <Divider sx={{ mb: 2 }} />

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
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <Box key={date}>
                <Typography
                  variant="caption"
                  align="center"
                  display="block"
                  sx={{ my: 1, opacity: 0.6 }}
                >
                  {date}
                </Typography>
                {msgs.map((msg, i) => {
                  const isSender = msg.sender === user?.id;

                  return (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: isSender ? "flex-end" : "flex-start",
                        mb: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: isSender ? "#d0f0c0" : "#fff",
                          color: "#333",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          maxWidth: "70%",
                          boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
                          borderTopRightRadius: isSender ? 0 : 12,
                          borderTopLeftRadius: isSender ? 12 : 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {msg.text}
                        </Typography>
                        {msg.createdAt && (
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.6,
                              mt: 0.5,
                              fontSize: "0.7rem",
                              textAlign: "right",
                              display: "block",
                            }}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {isTyping && (
          <Typography
            variant="body2"
            sx={{ fontStyle: "italic", color: "#999", mb: 1 }}
          >
            {selectedUser?.name} is typing...
          </Typography>
        )}

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
              onChange={(e) => {
                setText(e.target.value);
                socketRef.current.emit("typing", { to: selectedUser?.id });
                // console.warn("typing emited")
              }}
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
