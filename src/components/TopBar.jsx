// src/components/TopBar.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../Api.jsx";
import { useState } from "react";
import { useNotification } from "../utils/useNotification.js";

export default function TopBar() {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const { notify } = useNotification();

  // Logout API call and cleanup localStorage
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      navigate("/login");
      notify("logout successful", "success");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  // Go back to previous page
  const handleBack = () => {
    navigate(-1);
  };

  // Force navigate to dashboard if not already there
  const handleHome = () => {
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  };

  // Get user's email initial for avatar display
  const email = localStorage.getItem("email");
  const initial = email ? email[0].toUpperCase() : "?";

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left section: Logo + optional back/dashboard buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              fontFamily: "Roboto, Arial, sans-serif",
              letterSpacing: 1,
              fontSize: "1.5rem",
            }}
          >
            BigBrain
          </Typography>

          {/* Only show navigation icons when not already on dashboard */}
          {location.pathname !== "/dashboard" && (
            <Tooltip title="Go Back">
              <IconButton color="inherit" onClick={handleBack} data-cy="go-back">
                <ReplyRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
          {location.pathname !== "/dashboard" && (
            <Tooltip title="Dashboard">
              <IconButton color="inherit" onClick={handleHome} data-cy="go-dashboard">
                <SpaceDashboardRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Right section: Logout and avatar (avatar hidden on xs screens) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Logout">
            <IconButton
              color="inherit"
              onClick={() => setShowLogoutDialog(true)}
              data-cy="go-logout"
            >
              <ExitToAppOutlinedIcon />
            </IconButton>
          </Tooltip>

          {/* Avatar hidden on xs (mobile) screens */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Avatar sx={{ bgcolor: "#00bcd4", border: 1 }}>{initial}</Avatar>
          </Box>
        </Box>
      </Toolbar>

      {/* Logout confirmation dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              setShowLogoutDialog(false);
              handleLogout();
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}
