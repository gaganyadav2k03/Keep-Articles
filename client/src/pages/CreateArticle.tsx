import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Container,
  useMediaQuery,
  useTheme,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import axios from "../utils/axios";
import { colors } from "../assets/colors"; // ✅ Color palette

export default function CreateArticle() {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const submit = async () => {
    try {
      if (!title || !description) {
        setError("Title or description is missing");
        return;
      }
      await axios.post("/user/create-article", { title, description });
      navigate("/my-articles");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Failed to create");
    }
  };

  const generateDescription = async () => {
    if (!title.trim()) {
      setError("Title is required to generate description");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await axios.post("/ai/describe", { topic: title });
      setDescription(res.data.description);
    } catch (err: unknown) {
      setError(
        `Failed to generate description: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 6, maxWidth: "900px" }}>
      <Paper
        elevation={6}
        sx={{
          px: 3,
          py: 3,
          borderRadius: 4,
          transition: "all 0.3s ease",
          background: ` ${colors.backgroundLight}`,
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
          "&:hover": { cursor: "text" },
        }}
        onClick={() => setExpanded(true)}
      >
        {!expanded && (
          <TextField
            fullWidth
            placeholder="Take a note....."
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              fontSize: "1.1rem",
              fontWeight: 500,
              
              // backgroundColor: "transparent",
            }}
            onFocus={() => setExpanded(true)}
          />
        )}

        {expanded && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                fontWeight: 700,
                // color: colors.sand,
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              📝 Create New Article
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              placeholder="Enter article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: "50px",
                  backgroundColor: "#ffffff",
                  paddingLeft: "16px",
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              minRows={5}
              placeholder="Type your article description or generate it"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: "20px",
                  backgroundColor: "#ffffff",
                  padding: "16px",
                },
              }}
            />

            {/* ✨ Generate button */}
            <Button
              onClick={generateDescription}
              disabled={generating}
              sx={{
                alignSelf: "flex-end",
                textTransform: "none",
                color: "",
                fontWeight: "bold",
                fontSize: "0.95rem",
                background: "transparent",
                boxShadow: "none",
                "&:hover": {
                  // background: colors.beige,
                  textDecoration: "none",
                },
              }}
            >
              {generating ? <CircularProgress size={18} /> : "✨ Generate description"}
            </Button>

            {/* Submit Button */}
            <Box
              display="flex"
              justifyContent="center"
              flexDirection={isMobile ? "column" : "row"}
              gap={2}
            >
              <Button
                variant="contained"
                onClick={submit}
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "50px",
                  // background: `linear-gradient(135deg, ${colors.sand}, ${colors.blush})`,
                  // boxShadow: "0 4px 14px rgba(33, 203, 243, 0.4)",
                  px: 5,
                  py: 1.5,
                  width: isMobile ? "100%" : "auto",
                  "&:hover": {
                    // background: `linear-gradient(135deg, ${colors.blush}, ${colors.sand})`,
                    // boxShadow: "0 6px 16px rgba(33, 203, 243, 0.6)",
                  },
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
