// src/pages/PlayJoinPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { joinSession } from "../Api.jsx";
import { useNotification } from "../utils/useNotification.js";

export default function PlayJoinPage() {
  // If this page is accessed via `/play/join/:sessionId`, extract it
  const { sessionId: sessionIdParam } = useParams();
  // Local state to hold session ID, name, and current step (input or checking)
  const [sessionId, setSessionId] = useState(sessionIdParam || "");
  const [name, setName] = useState("");
  const [step, setStep] = useState(
    sessionIdParam ? "checking" : "enter-session"
  );
  const { notify } = useNotification();
  const navigate = useNavigate();

  // Handle sessionId passed from URL: if exists, validate it
  useEffect(() => {
    if (!sessionIdParam) {
      // If no session ID in URL, reset inputs and ask for session
      setStep("enter-session");
      setSessionId("");
      setName("");
    } else {
      verifySession(sessionIdParam);
    }
  }, [sessionIdParam]);

  // Verify session ID is valid and active
  const verifySession = async (id) => {
    if (!id || id.trim().length < 6 || /\D/.test(id)) {
      notify("Invalid session ID", "error");
      navigate("/play/join");
      return;
    }

    try {
      // "__validate" is used to test the session existence without joining
      await joinSession(id.trim(), "__validate");
      setSessionId(id.trim());
      setStep("enter-name");
      notify("Session found. Please enter your name.", "success");
    } catch (err) {
      const msg = err.message?.toLowerCase() || "";

      // Check msg to show relevant error and navigate to /play/join page
      if (msg.includes("has already begun")) {
        notify("Game already started", "error");
      } else if (msg.includes("not an active session")) {
        notify("Session has ended", "error");
      } else {
        notify("Session not found", "error");
      }

      navigate("/play/join");
    }
  };

  // Handle user submitting session ID manually
  const handleSessionSubmit = () => {
    if (!sessionId.trim()) {
      notify("Please enter a session ID", "warning");
      return;
    }
    localStorage.removeItem("playerQuestions");
    navigate(`/play/join/${sessionId.trim()}`);
  };

  // Handle joining the game after name input
  const handleJoin = async () => {
    try {
      const res = await joinSession(sessionId.trim(), name.trim());
      const playerId = res.playerId;
      notify("Joined successfully!", "success");
      localStorage.setItem("playerName", name);
      navigate(`/play/lobby/${playerId}`);
    } catch (err) {
      notify("Failed to join session", "error");
      console.log(err.message);
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 0,
        backgroundSize: "cover",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          zIndex: 1,
          mt: { xs: 6, sm: 10 },
          textAlign: "center",
          px: { xs: 2, sm: 0 },
        }}
      >
        {/* Page title */}
        <Typography variant="h4" gutterBottom>
          Join Game
        </Typography>

        {/* Step 1: Ask for session ID if none in URL */}
        {step === "enter-session" && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Enter Session ID"
              value={sessionId}
              autoFocus
              onChange={(e) => setSessionId(e.target.value)}
            />
            <Button variant="contained" onClick={handleSessionSubmit}>
              Join Session
            </Button>
          </Box>
        )}

        {/* Step 2: Session validated, ask for player's name */}
        {step === "enter-name" && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="subtitle1">
              Session ID: <strong>{sessionId}</strong>
            </Typography>
            <TextField
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              variant="contained"
              disabled={!name.trim()}
              onClick={handleJoin}
            >
              Enter Game
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
