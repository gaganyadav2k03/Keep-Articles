import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Modal,
  Paper,
  Fade,
  Alert,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { colors } from "../assets/colors"; // ✅ Importing centralized colors

interface Props {
  open: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function FloatingProfilePanel({ open, onClose }: Props) {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate=useNavigate();

  const [modalType, setModalType] = useState<"followers" | "following" | null>(
    null
  );
  const [listLoading, setListLoading] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await axios.put("/user/profile", { name });
      setUser(res.data);
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Failed to edit");
      setTimeout(() => setError(""), 2000);
      setName(user?.name || "");
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const openUserListModal = async (type: "followers" | "following") => {
    if (!user) return;
    setModalType(type);
    setListLoading(true);
    try {
      const res = await axios.get("/user/users");
      const allUsers: User[] = res.data;
      const idsToMatch = (
        type === "followers" ? user.followers : user.following
      ) as string[];
      const filteredUsers = allUsers.filter((u) => idsToMatch.includes(u.id));
      setUserList(filteredUsers);
    } catch (err) {
      console.error("Failed to load users list", err);
    } finally {
      setListLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Paper
          elevation={12}
          sx={{
            position: "absolute",
            top: "10%",
            left: "5%",
            transform: "translateY(0%)",
            width: 400,
            maxHeight: "90%",
            p: 4,
            borderRadius: 4,
            // bgcolor: colors.backgroundLight, // ✅ Updated
            boxShadow: "0 12px 28px rgba(0,0,0,0.3)",
            outline: "none",
          }}
        >
                      {/* Save Button */}
            {isEditing && (
              <Box textAlign="right" mt={2}>
                <Button
                  startIcon={<CheckCircleOutlineIcon />}
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    height:"20px",
                    width:"20px",
                    // background: colors.sand, // ✅ Updated
                    // px: 3,
                    "&:hover": {
                      // backgroundColor: colors.blush, // ✅ Updated
                    },
                  }}
                >
                
                </Button>
              </Box>
            )}
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={700} color="black">
              👤 {user?.name || user?.email}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box height={"40%"}>
            {/* Profile Info */}
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Name Field */}
              <Box
                sx={{
                  // background: colors.sand, // ✅ Updated
                  borderRadius: 3,
                  p: 2,
                  boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                <Typography variant="caption">Name</Typography>
                {isEditing ? (
                  <TextField
                    variant="standard"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <Typography variant="body1" fontWeight={500}>
                    {user?.name}
                  </Typography>
                )}
                {!isEditing && (
                  <Tooltip title="Edit Name">
                    <IconButton
                      onClick={() => setIsEditing(true)}
                      sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                      <EditOutlinedIcon sx={{ color: "#1976d2" }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Email */}
              <Box
                sx={{
                  // background: colors.sand, // ✅ Updated
                  borderRadius: 3,
                  p: 2,
                  boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="caption">Email</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user?.email}
                </Typography>
              </Box>

              {/* Buttons */}
              <Box display="flex" justifyContent="space-around" gap={2}>
                <Button
                  variant="contained"
                  onClick={() => openUserListModal("followers")}
                  sx={{
                    // background: `linear-gradient(to right, ${colors.sand}, ${colors.beige})`,
                    color: "#fff",
                    px: 3,
                    fontWeight: 600,
                    borderRadius: "20px",
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      // background: `linear-gradient(to right, ${colors.beige}, ${colors.sand})`,
                      transform: "scale(1.03)",
                    },
                  }}
                >
                  Followers{" "}
                  {(user?.followers?.length ?? 0) > 0
                    ? user?.followers?.length
                    : null}
                </Button>

                <Button
                  variant="contained"
                  onClick={() => openUserListModal("following")}
                  sx={{
                    // background: `linear-gradient(to right, ${colors.beige}, ${colors.blush})`,
                    color: "#fff",
                    px: 3,
                    fontWeight: 600,
                    borderRadius: "20px",
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      // background: `linear-gradient(to right, ${colors.blush}, ${colors.beige})`,
                      transform: "scale(1.03)",
                    },
                  }}
                >
                  Following{" "}
                  {(user?.following?.length ?? 0) > 0
                    ? user?.following?.length
                    : null}
                </Button>
              </Box>
            </Box>

            {/* Followers / Following List */}
            {modalType && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {modalType === "followers" ? "Followers" : "Following"}
                </Typography>

                {listLoading ? (
                  <Box textAlign="center" py={2}>
                    <CircularProgress />
                  </Box>
                ) : userList.length === 0 ? (
                  <Typography>No users found.</Typography>
                ) : (
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflowY: "auto",
                      pr: 1,
                      color: "black",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": { display: "none" },
                    }}
                  >
                    <List dense>
                      {userList.map((u) => (
                        <ListItem
                          key={u.id}
                          onClick={()=>navigate(`/user/${u.id}`)}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            px: 2,
                            cursor: "pointer",
                            transition: "background 0.3s",
                            "&:hover": {
                              // backgroundColor: colors.beige, // ✅ Updated
                              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ color: "#000", bgcolor: "#e0e0e0" }}>
                              {u.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={u.name} secondary={u.email} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </>
            )}

            {/* Save Button
            {isEditing && (
              <Box textAlign="right" mt={2}>
                <Button
                  startIcon={<SaveIcon />}
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    height:"30px",
                    // background: colors.sand, // ✅ Updated
                    // px: 3,
                    "&:hover": {
                      // backgroundColor: colors.blush, // ✅ Updated
                    },
                  }}
                >
                
                </Button>
              </Box>
            )} */}
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
}
