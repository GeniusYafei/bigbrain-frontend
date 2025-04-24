// src/pages/LobbyPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Fade,
} from "@mui/material";
import { getPlayerStatus } from "../Api.jsx";
import confetti from "canvas-confetti";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

// Dynamic phrases to cycle through
const phrases = [
  "🎮 Get ready to play!",
  "🚀 Game is about to launch...",
  "🧠 Warming up your brain...",
  "🎉 Waiting for others to join...",
  "⌛ Hang tight... Almost there!",
];

export default function LobbyPage() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [phraseIndex, setPhraseIndex] = useState(0); // Track which loading phrase to show

  // Trigger confetti effect once when component mounts
  useEffect(() => {
    confetti({
      spread: 80,
      origin: { y: 0.6 },
      particleCount: 80,
      scalar: 1.2,
    });
  }, []);

  // Cycle through motivational loading phrases every 2 seconds
  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(phraseTimer);
  }, []);

  // Poll player status every second to see if game has started or ended
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await getPlayerStatus(playerId);
        if (res.started) {
          // If session started, navigate to gameplay screen
          navigate(`/play/game/${playerId}`);
        } else if (res.active === false || res.sessionEnded === true) {
          // If session was closed or ended, redirect back to join screen
          navigate("/play/join");
        }
      } catch (err) {
        console.log(err);
        navigate("/play/join");
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000);
    return () => clearInterval(interval);
  }, [playerId, navigate]);

  // Initialize particles instance
  const particlesInit = async (main) => {
    await loadFull(main); // Load full tsparticles engine
  };

  return (
    <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {/* 🌌 Animated floating particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "#f0f4f8" } },
          fpsLimit: 60,
          particles: {
            number: { value: 80, density: { enable: true, area: 800 } },
            color: { value: "#2196f3" },
            shape: { type: "circle" },
            opacity: { value: 0.3 },
            size: { value: 3 },
            move: { enable: true, speed: 1.5, direction: "none" },
          },
        }}
        style={{
          position: "absolute",
          zIndex: 0,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Content container above particle background */}
      <Container
        maxWidth="sm"
        sx={{
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          mt: { xs: 6, sm: 10 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: "bold", mb: 1 }}>
          Lobby Room
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: "light", mb: 2 }}>
          Welcome! Please Wait...
        </Typography>

        {/* Spinner animation with optional glow */}
        <CircularProgress
          size={80}
          thickness={4}
          sx={{
            color: "primary.main",
            animation: "spin 2s linear infinite",
            // filter: "drop-shadow(0 0 10px #2196f3)",
          }}
        />

        {/* Fade-in text that changes every 2 seconds */}
        <Fade in timeout={500}>
          <Typography variant="h6" sx={{ mt: 4, fontWeight: 500 }}>
            {phrases[phraseIndex]}
          </Typography>
        </Fade>

        {/* Floating emoji bubbles */}
        <Box className="emoji-bubbles">
          {["🎈", "🎊", "✨", "🎮", "🧠"].map((e, i) => (
            <span
              key={i}
              className="bubble"
              style={{ left: `${15 * i + 10}%` }}
            >
              {e}
            </span>
          ))}
        </Box>

        {/* Custom CSS for animations */}
        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .emoji-bubbles {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 150px;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
          }

          .bubble {
            position: absolute;
            bottom: -30px;
            font-size: 1.5rem;
            animation: rise 4s ease-in infinite;
            opacity: 0.7;
          }

          @keyframes rise {
            0% {
              transform: translateY(0);
              opacity: 0.7;
            }
            100% {
              transform: translateY(-200px);
              opacity: 0;
            }
          }
          `}
        </style>
      </Container>
    </Box>
  );
}
