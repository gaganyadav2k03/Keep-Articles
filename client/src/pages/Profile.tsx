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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import { AxiosError } from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FloatingProfilePanel({ open, onClose }: Props) {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await axios.put("/user/profile", { name }); // only update name
      setUser(res.data);
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Failed to edit");
      setTimeout(() => setError(""), 2000); // Auto-clear after 2s
      setName(user?.name || "");
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Paper
          elevation={12}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxWidth: "90vw",
            p: 4,
            borderRadius: 4,
            bgcolor: "#fefefe",
            boxShadow: "0 12px 28px rgba(0,0,0,0.3)",
            outline: "none",
          }}
        >
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700} color="#333">
              👤 Your Profile
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Profile Info */}
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Name Field */}
            <Box
              sx={{
                background: "#fafafa",
                borderRadius: 3,
                p: 2,
                boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <Typography variant="caption" sx={{ color: "#777" }}>
                Name
              </Typography>
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

            {/* Email Field (read-only) */}
            <Box
              sx={{
                background: "#fafafa",
                borderRadius: 3,
                p: 2,
                boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="caption" sx={{ color: "#777" }}>
                Email
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user?.email}
              </Typography>
            </Box>

            {/* Save Button */}
            {isEditing && (
              <Box textAlign="right">
                <Button
                  startIcon={<SaveIcon />}
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    background: "#1976d2",
                    px: 3,
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                  }}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
}
