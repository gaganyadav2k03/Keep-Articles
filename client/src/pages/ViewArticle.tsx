import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import {
  Typography,
  Container,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";

interface Article {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const ViewArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/user/article/${id}`)
      .then((res) => setArticle(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (!article)
    return (
      <Box mt={5}>
        <Alert severity="error">❌ Article not found</Alert>
      </Box>
    );

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 6,
        px: { xs: 2, sm: 4 },
        py: 4,
        borderRadius: 4,
        background: "linear-gradient(to right, #fdfbfb, #ebedee)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#2c3e50",
          mb: 2,
          fontSize: { xs: "1.8rem", sm: "2.2rem" },
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        📖 {article.title}
      </Typography>

      <Typography
        variant="subtitle2"
        sx={{
          color: "text.secondary",
          fontStyle: "italic",
          mb: 0.5,
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        🕓 Updated on:{" "}
        {new Date(article.updatedAt).toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </Typography>

      <Typography
        variant="subtitle2"
        sx={{
          color: "text.secondary",
          fontStyle: "italic",
          mb: 3,
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        🗓️ Created on:{" "}
        {new Date(article.createdAt).toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: "1rem", sm: "1.1rem" },
          lineHeight: 1.8,
          color: "#34495e",
          whiteSpace: "pre-line",
        }}
      >
        {article.description}
      </Typography>
    </Container>
  );
};

export default ViewArticle;
