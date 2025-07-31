import { Container, TextField, Button, Typography, Alert } from "@mui/material";
import { useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { colors } from "../assets/colors"; // ✅ Import your custom color palette

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    try {
      await axios.post("/user/register", { name, email, password });
      navigate("/login");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Failed to register");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 10,
        px: 4,
        py: 5,
        borderRadius: 5,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        background: `linear-gradient(145deg, ${colors.sand}, ${colors.blush})`, // ✅ Updated background
        backdropFilter: "blur(10px)",
        animation: "fadeIn 0.7s ease-in-out",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 3,
          color: "#2c3e50",
          letterSpacing: 1,
          animation: "slideUp 0.8s ease-out",
        }}
      >
        🧾 Create Account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{
          mb: 3,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          animation: "slideUp 0.9s ease",
        }}
      />

      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{
          mb: 3,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          animation: "slideUp 1s ease",
        }}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{
          mb: 3,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          animation: "slideUp 1.1s ease",
        }}
      />

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={submit}
        sx={{
          py: 1.5,
          fontWeight: 600,
          fontSize: "1rem",
          borderRadius: 3,
          background: `linear-gradient(to right, ${colors.blush}, ${colors.sand})`, // ✅ Button gradient
          transition: "all 0.4s ease",
          animation: "slideUp 1.2s ease",
          textTransform: "none",
          "&:hover": {
            // background: `linear-gradient(to right, ${colors.sand}, ${colors.beige})`,
            transform: "scale(1.03)",
            boxShadow: "0 6px 20px rgba(21,101,192,0.3)",
          },
        }}
      >
        ✨ Register
      </Button>

      {/* 🔮 Keyframe Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Container>
  );
}
