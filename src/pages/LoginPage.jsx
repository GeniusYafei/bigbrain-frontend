// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser } from "../Api.jsx";
import { useNotification } from "../utils/useNotification.js";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export default function LoginPage() {
  // State hooks for email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { notify } = useNotification();
  const location = useLocation();

  // Redirect to dashboard if token is already in local storage (user logged in)
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) navigate("/dashboard");
  }, [navigate]);

  // Show error notification if redirected here with a message in location state
  useEffect(() => {
    if (location.state?.message) notify(location.state.message, "error");
  }, [location.state, notify]);

  // Handle login when 'Sign in' button is clicked
  const handleLogin = async () => {
    if (!email || !password) {
      notify("Please fill in all fields.", "error");
      return;
    }
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      notify("Login successful!", "success");
      setTimeout(() => navigate("/dashboard"), 100);
    } catch (err) {
      notify(err.message, "error");
    }
  };

  // Allow login on pressing Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    // Main responsive container: splits vertically on mobile and horizontally on desktop
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
      }}
    >
      {/* Left panel - Branding and feature info */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "#f5f8fe",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 3, sm: 4, md: 6 },
          alignItems: { xs: "center", md: "flex-start" },
          textAlign: { xs: "center", md: "left" },
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "#1976d2", mb: 4, fontWeight: "bold" }}
        >
          BigBrain
        </Typography>
        {/* Reusable feature item component */}
        <FeatureItem
          title="Interactive Quiz Platform"
          text="Create and host custom quizzes in real-time for groups of players."
        />
        <FeatureItem
          title="Designed for Fun & Learning"
          text="Perfect for classrooms, meetings, or game nights to boost engagement."
        />
        <FeatureItem
          title="Real-Time Feedback"
          text="Track scores and performance instantly as players respond."
        />
        <FeatureItem
          title="No App Needed"
          text="Join games with just a browser — simple, fast, and no installation required."
        />
      </Box>

      {/* Right panel - Login form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Paper
          elevation={3}
          sx={{ width: "100%", maxWidth: 400, p: { xs: 3, sm: 4 } }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Sign in
          </Typography>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <FormControlLabel control={<Checkbox />} label="Remember me" />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleLogin}
          >
            Sign in
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don&apos;t have an account? <Link to="/register">Sign up</Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

// Subcomponent to render feature description in left panel
const FeatureItem = ({ title, text }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" } }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
      >
        {text}
      </Typography>
    </Box>
  );
}
