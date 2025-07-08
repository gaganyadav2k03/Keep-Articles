import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  CircularProgress,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "../utils/axios";

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // ✅ Load article data
  useEffect(() => {
    axios
      .get(`/user/article/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setDescription(res.data.description);
      })
      .catch((err) => console.error("Failed to load article", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    try {
      await axios.post(`/user/update-article/${id}`, { title, description });
      navigate("/my-articles");
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) return;
    setGenerating(true);
    try {
      const res = await axios.post("/ai/describe", { topic: title });
      setDescription(res.data.description);
    } catch (err) {
      console.error("Failed to generate description", err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 6,
        px: 3,
        py: 4,
        background: "linear-gradient(145deg, #f5f7fa, #c3cfe2)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        borderRadius: 3,
      }}
    >
      <Typography
        variant={isMobile ? "h6" : "h5"}
        gutterBottom
        sx={{
          fontWeight: 700,
          color: "#2c3e50",
          mb: 3,
          textAlign: "center",
        }}
      >
        ✏️ Edit Your Article
      </Typography>

      <TextField
        label="Title"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter article title"
        sx={{
          backgroundColor: "#fff",
          borderRadius: 1,
          "& .MuiOutlinedInput-root:hover": {
            "& fieldset": { borderColor: "#1976d2" },
          },
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          onClick={handleGenerateDescription}
          size="small"
          variant="outlined"
          disabled={!title || generating}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": {
              backgroundColor: "#e3f2fd",
              borderColor: "#1565c0",
            },
          }}
        >
          {generating ? "Generating..." : "✨ Generate Description"}
        </Button>
      </Box>

      <TextField
        label="Description"
        fullWidth
        margin="normal"
        multiline
        rows={6}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Article description..."
        sx={{
          backgroundColor: "#fff",
          borderRadius: 1,
          "& .MuiOutlinedInput-root:hover": {
            "& fieldset": { borderColor: "#1976d2" },
          },
        }}
      />

      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="contained"
          onClick={handleUpdate}
          sx={{
            px: 5,
            py: 1.2,
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 2,
            backgroundColor: "#1976d2",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          ✅ Update
        </Button>
      </Box>
    </Container>
  );
}
