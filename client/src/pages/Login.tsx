import { Container, TextField, Button, Typography, Alert, Box } from "@mui/material";
import { useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AxiosError } from "axios";
import { colors } from "../assets/colors"; // ✅ import palette

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const submit = async () => {
    try {
      const { data } = await axios.post("/user/login", { email, password });
      setUser(data.user);
      localStorage.setItem("token", data.token);
      navigate("/Home");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Failed to login");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
      }}
    >
      <Box
        sx={{
          px: 4,
          py: 5,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          background: `linear-gradient(145deg, ${colors.sand}, ${colors.blush})`,
          backdropFilter: "blur(12px)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: "center",
            color: "black"
          }}
        >
          Welcome Back
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            mb: 3,
            backgroundColor: "#fff",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: colors.blush,
              },
            },
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            mb: 3,
            backgroundColor: "#fff",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: colors.blush,
              },
            },
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
            borderRadius: 2,
            textTransform: "none",
            // background: `linear-gradient(to right, ${colors.sand}, ${colors.blush})`,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              // background: `linear-gradient(to right, ${colors.blush}, ${colors.sand})`,
            },
          }}
        >
          Login
        </Button>
      </Box>
    </Container>
  );
}
