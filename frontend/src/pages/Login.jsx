import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Clear session on load to ensure a fresh start
  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const loginUser = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setErrorMsg("Please enter both email and password");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // ✅ Using your updated logic with the 'form' state
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      // ✅ 1. Save data to localStorage (Important for ProtectedRoutes)
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role.toUpperCase());
      localStorage.setItem("user", JSON.stringify(response.data));

      // Optional: store userId specifically if needed
      if (response.data.id) {
        localStorage.setItem("userId", response.data.id);
      }

      console.log("Login Success:", response.data.role);

      // ✅ 2. Role-based navigation
      const userRole = response.data.role.toUpperCase();

      if (userRole === "INSTRUCTOR") {
        navigate("/instructor/dashboard");
      } else if (userRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      console.error("Login failure:", error);

      if (!error.response) {
        setErrorMsg("Server is unreachable. Please check your backend.");
      } else if (error.response.status === 401) {
        setErrorMsg("Invalid email or password.");
      } else {
        setErrorMsg(
          error.response.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        padding: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: 4,
          width: { xs: "100%", sm: 420 },
          background: "#ffffff",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="800"
          textAlign="center"
          mb={1}
          sx={{ color: "#1a202c" }}
        >
          SkillForge
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          mb={3}
          sx={{ color: "#718096" }}
        >
          Sign in to access your dashboard
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={loginUser}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            autoComplete="email"
            sx={{ mb: 2 }}
            value={form.email}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            sx={{ mb: 3 }}
            value={form.password}
            onChange={handleChange}
            required
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              fontWeight: "bold",
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2">
            Don’t have an account?{" "}
            <span
              style={{
                color: "#4f7cff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/register")}
            >
              Register here
            </span>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
