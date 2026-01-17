import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    college: "",
    role: "STUDENT",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const registerUser = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Basic validation
    if (!form.name || !form.email || !form.password || !form.role) {
      setErrorMsg("Please fill all required fields!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      /**
       * ✅ DATA MAPPING FOR BACKEND
       * 1. Auto-generate username from email if blank
       * 2. 'password' maps to 'rawPassword' in DTO via @JsonProperty
       */
      const registrationData = {
        username: form.username.trim() || form.email.split("@")[0],
        fullName: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phoneNumber: form.phone.trim(),
        college: form.college.trim(),
        role: form.role.toUpperCase().trim(),
      };

      await api.post("/auth/register", registrationData);

      alert("Registration successful! Redirecting to login...");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      if (!error.response) {
        setErrorMsg("Network error: Server is unreachable.");
      } else {
        setErrorMsg(
          error.response.data?.message || "An unexpected error occurred."
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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          borderRadius: 4,
          width: { xs: "100%", sm: 450 },
          background: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={1}
          color="primary"
        >
          SkillForge
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          mb={3}
          color="textSecondary"
        >
          Create your account to start learning
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={registerUser}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            sx={{ mb: 2 }}
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
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
            sx={{ mb: 2 }}
            value={form.password}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            sx={{ mb: 2 }}
            value={form.phone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="College / Organization"
            name="college"
            sx={{ mb: 2 }}
            value={form.college}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            select
            label="Account Type"
            name="role"
            sx={{ mb: 3 }}
            value={form.role}
            onChange={handleChange}
          >
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
            <MenuItem value="ADMIN">Administrator</MenuItem>
          </TextField>

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
              "Create Account"
            )}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2">
            Already have an account?{" "}
            <span
              style={{
                color: "#1976d2",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/login")}
            >
              Sign in
            </span>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
