import { useEffect, useState } from "react";
import {
  Typography,
  Modal,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "../utils/axios";
// import { colors } from "../assets/colors"; // 🎨 use your palette

interface Article {
  id: string;
  title: string;
  description: string;
  user: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface ViewArticleProps {
  articleId: string | null;
  open: boolean;
  onClose: () => void;
}

const ViewArticle = ({ articleId, open, onClose }: ViewArticleProps) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    axios
      .get(`/user/article/${articleId}`)
      .then((res) => setArticle(res.data))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [articleId]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "80%", md: "60%", lg: "50%" },
          bgcolor: "white",
          boxShadow: 24,
          borderRadius: 4,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            📖 {article?.title || "Article"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : !article ? (
          <Alert severity="error">❌ Article not found</Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              🕓 Updated: {new Date(article.updatedAt).toLocaleDateString()}<br />
              🗓️ Created: {new Date(article.createdAt).toLocaleDateString()}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 2,
                whiteSpace: "pre-line",
                lineHeight: 1.8,
                color: "#333",
              }}
            >
              {article.description}
            </Typography>

            <Link
              href={`/user/${article.user.id}`}
              underline="hover"
              sx={{
                display: "inline-block",
                pt: 3,
                cursor: "pointer",
                color: "#1976d2",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              @{article.user.name}
            </Link>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ViewArticle;
