import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import ChatIcon from "@mui/icons-material/Chat";
import FloatingProfilePanel from "../pages/Profile";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // ✅ New icon
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import GameOverlay from "../components/GameOverlay";


const drawerWidth = { xs: 60, md: 100 };

export default function Sidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameOpen, setGameOpen] = useState(false);

  const menu = [
    {
      tooltip: "Create Article",
      icon: <AddCircleOutlineIcon />,
      path: "/Home",
    }, // ✅ New item
    { tooltip: "All Articles", icon: <GroupIcon />, path: "/all-articles" },
    { tooltip: "My Articles", icon: <ArticleIcon />, path: "/my-articles" },
    { tooltip: "Chat with Friends", icon: <ChatIcon />, path: "/chat" },
    { tooltip: "Play Game", icon: <SportsEsportsIcon />, action: "game" },
  ];

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            top: "70px",
            height: "calc(100% - 70px)",
            background: "linear-gradient(135deg, rgb(166, 171, 172), rgb(179, 187, 191))",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "6px 0 20px rgba(0, 0, 0, 0.15)",
            overflowX: "hidden",
            px: { xs: 0.5, md: 1 },
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
          }}
        >
          {/* ✅ User Info */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 2,
              width: "100%",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          > 
            <AccountCircleIcon  sx={{ fontSize: 32, color: "#1976d2" }}onClick={() => setProfileOpen(true)} />
            <Tooltip title={user?.name || ""} placement="right">
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  // color: "#000",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                  display: { xs: "none", md: "block" },
                }}
              >
                {user?.name || "User"}
              </Typography>
            </Tooltip>
          </Box>

          {/* ✅ Menu Items */}
          <List>
            {menu.map((item) => (
              <Tooltip
                key={item.tooltip}
                title={item.tooltip}
                placement="right"
              >
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() =>
                      item.path
                        ? navigate(item.path)
                        : item.action === "game"
                        ? setGameOpen(true)
                        : null
                    }
                    sx={{
                      justifyContent: "center",
                      minHeight: 60,
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        backgroundColor:
                          item.tooltip === "Create Article"
                            ? "rgba(13, 243, 20, 0.15)"
                            : "rgba(215, 115, 39, 0.15)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "unset",
                        color:
                          item.tooltip === "Create Article"
                            ? "black"
                            : "black",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* ✅ Floating Game Overlay */}
      <GameOverlay open={gameOpen} onClose={() => setGameOpen(false)} />
      {/* floating profile*/}
      <FloatingProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
