// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../Api.jsx";
import { useNotification } from "../utils/useNotification.js";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function RegisterPage() {
  // State hooks for form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { notify } = useNotification();

  // Toggle between showing and hiding password
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Validation function for form inputs
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      notify("Please enter a valid email address.", "error");
      return false;
    }

    if (name.length < 3 || name.length > 50) {
      notify("Full name must be between 3 and 50 characters.", "warning");
      return false;
    }

    if (password.length < 6) {
      notify("Password must be at least 6 characters long.", "warning");
      return false;
    }

    if (password !== confirmPassword) {
      notify("Passwords do not match.", "error");
      return false;
    }

    return true;
  };

  // Handle registration logic
  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const data = await registerUser(email, password, name);
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      notify("Registration successful!", "success");
      setTimeout(() => navigate("/dashboard"), 100);
    } catch (err) {
      notify(err.message, "error");
    }
  };

  // Allow form submission via Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    // Responsive wrapper with vertical layout on mobile, horizontal on desktop
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
      }}
    >
      {/* Left panel: BigBrain branding and feature list */}
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

      {/* Right panel: Registration form */}
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
            Sign up
          </Typography>

          <TextField
            label="Email"
            type="email"
            name="email"
            fullWidth
            margin="normal"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <TextField
            label="Full Name"
            name="name"
            type="text"
            fullWidth
            margin="normal"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <TextField
            label="Password"
            id="password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm Password"
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleRegister}
          >
            Sign up
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

// Subcomponent to render a title and text paragraph for each feature
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
