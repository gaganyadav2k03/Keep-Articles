import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  Divider,
  useMediaQuery,
  useTheme,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupIcon from "@mui/icons-material/Group";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import NotificationDrawer from "../components/NotificationBell";
import { colors } from "../assets/colors"; // ✅ imported color variables

const Navbar = ({ onShowUsers }: { onShowUsers: () => void }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchUnreadStatus = async () => {
      if (!user) return;
      try {
        const res = await axios.get("/user/notification-status");
        setHasUnread(res.data.hasUnread);
      } catch (err) {
        console.error("Failed to fetch unread status", err);
      }
    };

    fetchUnreadStatus();
  }, [user]);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    setUser(null);
    await axios.get("/user/logout");
    navigate("/");
  };

  const toggleDrawer = () => setOpen(!open);

  const NavLinks = (
    <>
      {user ? (
        user.role === "admin" ? (
          <>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              color={isMobile ? "default" : "inherit"}
            >
              <Badge
                color="error"
                variant="dot"
                invisible={!hasUnread}
                overlap="circular"
              >
                <NotificationsIcon sx={{color:"black"}}/>
              </Badge>
            </IconButton>
            <NotificationDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              setHasUnread={setHasUnread}
            />
            <Button
              onClick={onShowUsers}
              sx={isMobile ? mobileBtnStyle : navBtnStyle}
              startIcon={<GroupIcon />}
              fullWidth={isMobile}
            />
            <Button
              component={Link}
              to="/Home"
              sx={isMobile ? mobileBtnStyle : navBtnStyle}
              startIcon={<DashboardIcon />}
              fullWidth={isMobile}
            />
            <Button
              onClick={handleLogout}
              sx={isMobile ? mobileBtnStyle : navBtnStyle}
              startIcon={<LogoutIcon />}
              fullWidth={isMobile}
            />
          </>
        ) : (
          <>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              color={isMobile ? "default" : "inherit"}
            >
              <Badge
                color="error"
                variant="dot"
                invisible={!hasUnread}
                overlap="circular"
              >
                <NotificationsIcon sx={{color:"black"}}/>
              </Badge>
            </IconButton>
            <NotificationDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              setHasUnread={setHasUnread}
            />
            <Button
              component={Link}
              to="/Home"
              sx={isMobile ? mobileBtnStyle : navBtnStyle}
              startIcon={<HomeIcon />}
              fullWidth={isMobile}
            />
            <Button
              onClick={handleLogout}
              sx={isMobile ? mobileBtnStyle : navBtnStyle}
              startIcon={<LogoutIcon />}
              fullWidth={isMobile}
            />
          </>
        )
      ) : (
        <>
          <Button
            component={Link}
            to="/"
            sx={isMobile ? mobileBtnStyle : navBtnStyle}
            startIcon={<ArticleIcon />}
            fullWidth={isMobile}
          >
            Articles
          </Button>
          <Button
            component={Link}
            to="/login"
            sx={isMobile ? mobileBtnStyle : navBtnStyle}
            startIcon={<LoginIcon />}
            fullWidth={isMobile}
          >
            Login
          </Button>
          <Button
            component={Link}
            to="/register"
            sx={isMobile ? mobileBtnStyle : navBtnStyle}
            startIcon={<PersonAddIcon />}
            fullWidth={isMobile}
          >
            Register
          </Button>
        </>
      )}
    </>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          height: "70px",
          background: `${colors.blush}`,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderBottom: `1px solid ${colors.beige}`,
          transition: "background 0.3s ease",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              letterSpacing: 1.2,
              "&:hover": { color: colors.backgroundLight },
            }}
          >
            Keep Articles
          </Typography>

          {!isMobile && <Box>{NavLinks}</Box>}

          {isMobile && (
            <IconButton onClick={toggleDrawer} sx={{ color: "#fff" }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={toggleDrawer}>
        <Box sx={{ width: 250, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 1, backgroundColor: colors.sand }} />
          <Box display="flex" flexDirection="column" gap={1}>
            {NavLinks}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;

// ✅ Updated to use color variables
const navBtnStyle = {
  color: "black",
  mx: 1,
  fontWeight: 500,
  borderRadius: 2,
  textTransform: "none",
  transition: "all 0.25s ease-in-out",
  "&:hover": {
    // color: colors.backgroundLight,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    // transform: "translateY(-2px)",
  },
};

const mobileBtnStyle = {
  justifyContent: "flex-start",
  color: "#333",
  fontWeight: 500,
  textTransform: "none",
  borderRadius: 2,
  px: 2,
  py: 1.2,
  "&:hover": {
    backgroundColor: colors.beige,
  },
};
