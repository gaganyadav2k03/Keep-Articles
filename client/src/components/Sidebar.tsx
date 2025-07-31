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
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import FloatingProfilePanel from "../pages/Profile";
import GameOverlay from "../components/GameOverlay";
import { colors } from "../assets/colors"; // ✅ Import centralized colors

const drawerWidth = { xs: 60, md: 100 };

export default function Sidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const menu = [
    {
      tooltip: "Create Article",
      icon: <AddCircleOutlineIcon />,
      path: "/Home",
    },
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
            background: `${colors.sand}`, // ✅ updated
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRight: `1px solid ${colors.beige}`, // ✅ updated
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
          {/* User Info */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 2,
              width: "100%",
              borderBottom: `1px solid ${colors.beige}`, // ✅ updated
            }}
          >
            <AccountCircleIcon
              sx={{ fontSize: 32, color: colors.blush }} // ✅ updated
              onClick={() => setProfileOpen(true)}
            />
            <Tooltip title={user?.name || ""} placement="right">
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.7rem",
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

          {/* Menu Items */}
          <List>
            {menu.map((item) => (
              <Tooltip key={item.tooltip} title={item.tooltip} placement="right">
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
                            ? `${colors.backgroundLight}CC` // 80% opacity
                            : `${colors.beige}CC`,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "unset",
                        color: "#000", // kept black for all
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

      <GameOverlay open={gameOpen} onClose={() => setGameOpen(false)} />
      <FloatingProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
