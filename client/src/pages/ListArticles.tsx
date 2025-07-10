import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme,
  Grid,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import SearchBar from "../components/Searchbar";
import { useAuth } from "../context/AuthContext";

interface Article {
  id: string;
  title: string;
  description: string;
  likes: string[];
  user: string;
  name: string;
  email: string;
}

export default function ListArticles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>(
    user?.following || []
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSearch = (query: string) => {
    const keyword = query.toLowerCase();
    const results = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(keyword) ||
        a.description.toLowerCase().includes(keyword)
    );
    setFiltered(results);
  };

  useEffect(() => {
    axios
      .get("/user/all-articles")
      .then((res) => {
        setArticles(res.data);
        setFiltered(res.data);

        const liked = res.data
          .filter((a: Article) => user?.id && a.likes.includes(user.id))
          .map((a: Article) => a.id);
        setLikedIds(liked);

        if (user?.following) {
          setFollowingIds(user.following);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleLike = async (articleId: string) => {
    try {
      if (!user) return navigate("/login");

      const res = await axios.post(`/user/likes/${articleId}`);
      const liked = res.data.liked;

      setLikedIds((prev) =>
        liked ? [...prev, articleId] : prev.filter((id) => id !== articleId)
      );

      const updateLikes = (arr: Article[]) =>
        arr.map((a) =>
          a.id === articleId
            ? {
                ...a,
                likes: liked
                  ? [...a.likes, "placeholder"]
                  : a.likes.slice(0, -1),
              }
            : a
        );

      setArticles(updateLikes);
      setFiltered(updateLikes);
    } catch (err) {
      console.error("Failed to like/unlike", err);
    }
  };

  const handleFollow = async (authorId: string) => {
    try {
      if (!user) return navigate("/login");

      const res = await axios.post(`/user/follow/${authorId}`);
      const isNowFollowing = res.data.following;

      setFollowingIds((prev) =>
        isNowFollowing
          ? [...prev, authorId]
          : prev.filter((id) => id !== authorId)
      );
    } catch (err) {
      console.error("Follow/Unfollow failed", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 6, mb: 4 }}>
      {/* Header and Search */}
      <Box
        sx={{
          display: "flex",
          justifyContent: isMobile ? "center" : "space-between",
          alignItems: isMobile ? "stretch" : "center",
          flexDirection: isMobile ? "column" : "row",
          mb: 4,
          gap: 2,
        }}
      >
        <Box sx={{ flexGrow: 1, textAlign: "center" }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: 700, color: "#2c3e50" }}
          >
            🌍 Articles
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <SearchBar onSearch={handleSearch} placeholder="Search articles..." />
        </Box>
      </Box>

      {/* Cards Grid */}
      <Grid container spacing={4}>
        {filtered.map((a) => (
          <Grid
            key={a.id}
            size={{ xs: 12, sm: 6, md: 4 }}
            display="flex"
            alignItems="stretch"
          >
            <Card
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
                borderRadius: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                  background:
                    "linear-gradient(30deg,rgb(198, 206, 206),rgb(197, 208, 208))",
                },
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "#3c3c3c" }}
                  >
                    👤 {a.name}
                  </Typography>

                  {user?.id !== a.user && (
                    <button
                      onClick={() => handleFollow(a.user)}
                      style={{
                        backgroundColor: followingIds.includes(a.user)
                          ? "rgb(64, 130, 211)"
                          : "rgb(90, 153, 231)",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        border: "none",
                        transition: "background 0.3s ease",
                      }}
                    >
                      {followingIds.includes(a.user) ? "Following" : "Follow"}
                    </button>
                  )}
                </Box>

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

                <Box
                  mt={3}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                      onClick={() => handleLike(a.id)}
                      sx={{
                        color: likedIds.includes(a.id)
                          ? "rgb(250, 86, 132)"
                          : "#888",
                      }}
                    >
                      {likedIds.includes(a.id) ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    {a.likes.length !== 0 && (
                      <Typography variant="body2" sx={{ color: "#333" }}>
                        {a.likes.length}
                      </Typography>
                    )}
                  </Box>
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
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
