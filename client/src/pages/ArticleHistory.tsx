import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import { colors } from "../assets/colors"; // ✅ Import centralized colors

interface Version {
  _id: string;
  description: string;
  updatedAt: string;
}

export default function ArticleHistory() {
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`/user/version/${id}`)
      .then((res) => setHistory(res.data))
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="60vh"
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );

  if (history.length === 0)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">No history found.</Alert>
      </Container>
    );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          textAlign: "center",
          mb: 3,
          color: colors.sand, // ✅ replaced #00796b
        }}
      >
        📜 Article History
      </Typography>

      {history.map((v, index) => (
        <Card
          key={v._id}
          sx={{
            my: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${colors.beige}, #ffffff)`, // ✅ replaced raw colors
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            animation: `fadeIn 0.5s ease forwards`,
            animationDelay: `${index * 0.1}s`,
            opacity: 0,
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
            },
          }}
        >
          <CardContent>
            <Typography
              variant="caption"
              sx={{ fontStyle: "italic", color: colors.sand }} // ✅ replaced #555
            >
              🕒 {new Date(v.updatedAt).toLocaleString()}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 1,
                color: colors.blush, // ✅ replaced #333
                whiteSpace: "pre-wrap",
                fontSize: "0.95rem",
              }}
            >
              {v.description}
            </Typography>
          </CardContent>
        </Card>
      ))}

      <style>
        {`
          @keyframes fadeIn {
            0% {
              transform: translateY(10px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </Container>
  );
}
