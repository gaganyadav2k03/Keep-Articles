import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../context/AuthContext";

interface Article {
  id: string;
  title: string;
  description: string;
  user: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export default function MyArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const load = () => {
    axios
      .get("/user/list-articles")
      .then((res) => setArticles(res.data))
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this article?")) {
      await axios.delete(`/user/delete-article/${id}`);
      load();
    }
  };

  return (
    <Container sx={{ mt: 6, mb: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          textAlign: "center",
          mb: 4,
          color: "#2c3e50",
        }}
      >
        🧾 My Articles
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : articles.length === 0 ? (
        <Alert severity="info">No articles found.</Alert>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {articles.map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
                    background:
                      "linear-gradient(30deg,rgb(198, 206, 206),rgb(197, 208, 208))",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* Content Area */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "#2c3e50" }}
                    >
                      {a.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#444", lineHeight: 1.5 }}
                    >
                      {a.description.length > 100
                        ? `${a.description.slice(0, 100)}…`
                        : a.description}
                    </Typography>
                  </Box>

                  {/* Bottom Row */}
                  <Box
                    mt={3}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      {/* View */}
                      <Tooltip title="View">
                        <IconButton
                          onClick={() => navigate(`/articles/${a.id}`)}
                          sx={{
                            "&:hover": {
                              color: "#1565c0",
                              backgroundColor: "rgba(21, 101, 192, 0.08)",
                            },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Edit/Delete/History only if owner */}
                      {user?.id === a.user && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => navigate(`/articles/${a.id}/edit`)}
                              sx={{
                                "&:hover": {
                                  color: "#388e3c",
                                  backgroundColor: "rgba(56, 142, 60, 0.08)",
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDelete(a.id)}
                              sx={{
                                "&:hover": {
                                  color: "#d32f2f",
                                  backgroundColor: "rgba(211, 47, 47, 0.08)",
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="History">
                            <IconButton
                              onClick={() => navigate(`/articles/${a.id}/history`)}
                              sx={{
                                "&:hover": {
                                  color: "#6a1b9a",
                                  backgroundColor: "rgba(106, 27, 154, 0.08)",
                                },
                              }}
                            >
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>

                    {/* Like Count */}
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <IconButton
                        sx={{
                          color: "rgb(250, 86, 132)",
                        }}
                      >
                        <FavoriteIcon fontSize="small" />
                      </IconButton>
                      {a.likes.length !== 0 && (
                        <Typography variant="body2" sx={{ color: "#333" }}>
                          {a.likes.length}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
