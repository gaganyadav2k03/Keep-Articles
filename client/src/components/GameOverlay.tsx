import {
  Dialog,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";

// ✅ Move this outside to avoid useEffect dependency issues
const gameUrls = [
  "https://h5p.org/h5p/embed/1205714", // Crossword
  "https://h5p.org/h5p/embed/1466205", // Game Map
  "https://h5p.org/h5p/embed/1320802", // Question Set
];

interface GameOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function GameOverlay({ open, onClose }: GameOverlayProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedGameUrl, setSelectedGameUrl] = useState(gameUrls[0]);

  useEffect(() => {
    if (open) {
      const randomUrl = gameUrls[Math.floor(Math.random() * gameUrls.length)];
      setSelectedGameUrl(randomUrl);
    }
  }, [open]);

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src*="h5p-resizer.js"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://h5p.org/sites/all/modules/h5p/library/js/h5p-resizer.js";
      script.async = true;
      script.charset = "UTF-8";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          m: isMobile ? 0 : "auto",
          width: isMobile ? "100%" : "100%",
          height: isMobile ? "100%" : "100%",
          maxWidth: "1000px",
          maxHeight: "800px",
          borderRadius: isMobile ? 0 : 3,
          backgroundColor: "#fff",
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          "&:hover": {
            backgroundColor: "#fff",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box
        component="iframe"
        src={selectedGameUrl}
        title="H5P Game"
        width="100%"
        height="100%"
        sx={{ border: "none" }}
      />
    </Dialog>
  );
}
