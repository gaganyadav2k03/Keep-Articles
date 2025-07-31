import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ViewArticle from "./ViewArticle";
import axios from "../utils/axios";
import { colors } from "../assets/colors"; // 🎨 Using your color palette

type Article = {
  id: string;
  title: string;
  description: string;
};

type UserProfile = {
  name: string;
  articles: Article[];
};

export default function UserProfilePage() {
  const { id } = useParams();
  const [viewingArticleId, setViewingArticleId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleViewArticle = (id: string) => {
    setViewingArticleId(id);
    setViewModalOpen(true);
  };

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/user/profile/${id}`)
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClose = () => navigate(-1);

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          p: 2,
          // background: `linear-gradient(145deg, ${colors.sand}, ${colors.beige})`,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pr: 4 }}>
        👤 {user?.name || "User Profile"}
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : !user ? (
          <Box mt={2}>
            <Alert severity="error">❌ User not found</Alert>
          </Box>
        ) : (
          <>
         

            {user.articles.length === 0 ? (
              <Typography color="text.secondary">No articles found.</Typography>
            ) : (
              <Grid container spacing={3}>
                {user.articles.map((article) => (
                  <Grid
                    key={article.id}
                  size={{ xs: 12, sm: 6, md: 4 }}
                    display="flex"
                    alignItems="stretch"
                  >
                    <Card
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        // background: `linear-gradient(135deg, ${colors.backgroundLight}, ${colors.beige})`,
                        borderRadius: 2,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "#2c3e50",
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#444",
                            lineHeight: 1.4,
                            fontSize: "0.85rem",
                          }}
                        >
                          {article.description.length > 80
                            ? article.description.slice(0, 80) + "…"
                            : article.description}
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ px: 2, pb: 1 }}>
                        <Tooltip title="View Article">
                          <IconButton
                            size="small"
                            onClick={() => handleViewArticle(article.id)}
                            sx={{
                              ml: "auto",
                              color: "#1976d2",
                              "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                              },
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        <ViewArticle
          articleId={viewingArticleId}
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
