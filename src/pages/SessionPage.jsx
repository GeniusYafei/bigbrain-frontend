// src/pages/SessionPage.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Stack,
} from "@mui/material";
import { getSessionStatus } from "../Api.jsx";
import { useNotification } from "../utils/useNotification.js";
import TopBar from "../components/TopBar.jsx";
import SessionController from "../components/SessionController";
import SessionResults from "../components/SessionResults";

export default function SessionPage() {
  const { sessionId } = useParams(); // Get session ID from route parameters
  const location = useLocation(); // Access location state (passed from previous page)
  const gameId = location.state?.gameId; // Optional gameId passed from navigation
  // const navigate = useNavigate();

  const [sessionStatus, setSessionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  // Fetch session status from backend
  const loadStatus = async () => {
    try {
      const { results } = await getSessionStatus(sessionId);
      setSessionStatus(results);
    } catch (err) {
      notify("Failed to load session status", "error");
      console.error(err);
    } finally {
      setLoading(false); // Always disable loading state
    }
  };

  // Run once on mount, and then every 2 seconds to refresh session status
  useEffect(() => {
    loadStatus();
    const interval = setInterval(() => loadStatus(), 2000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [sessionId]);

  return (
    <>
      {/* Top navigation bar */}
      <TopBar />
      {/* Main content container */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Session ID: {sessionId}
          </Typography>
          {/* Button section (commented out for now) */}
          <Stack direction="row" spacing={1}>
            {/* <Button variant="outlined" onClick={loadStatus}>
              Refresh
            </Button> */}
            {/* <Button
              variant="contained"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button> */}
          </Stack>
        </Stack>

        {/* Content display logic */}
        {loading ? (
          <Box textAlign="center" mt={10}>
            <CircularProgress />
          </Box>
        ) : sessionStatus ? (
          sessionStatus.active ? (
            <SessionController
              session={{ ...sessionStatus, gameId }}
              reload={loadStatus}
            />
          ) : (
            <SessionResults sessionId={sessionId} />
          )
        ) : (
          // If no session data available (should rarely happen)
          <Typography color="error">No session data available.</Typography>
        )}
      </Container>
    </>
  );
}
