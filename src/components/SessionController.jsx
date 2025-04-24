// src/components/SessionController.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import AvatarGroup from "@mui/material/AvatarGroup";
import { mutateGame } from "../Api.jsx";
import { useNotification } from "../utils/useNotification.js";

export default function SessionController({ session, reload }) {
  const [countdown, setCountdown] = useState(null);
  const { notify } = useNotification();

  // Destructure relevant fields from the session prop
  const { position, isoTimeLastQuestionStarted, questions, players, gameId } =
    session;
  const currentQuestion = questions?.[position] || null;
  const isLastQuestion = position >= 0 && position === questions.length - 1;

  // Filter out dummy players like "__validate"
  const playerNames = (players || []).filter((name) => name !== "__validate");
  const playerCount = playerNames.length;

  // Countdown timer effect: update every second if a question has started
  useEffect(() => {
    if (position >= 0 && isoTimeLastQuestionStarted && currentQuestion) {
      const duration = currentQuestion.duration || 0;
      const startTime = new Date(isoTimeLastQuestionStarted).getTime();

      const updateCountdown = () => {
        const now = Date.now();
        const remaining = Math.max(
          0,
          duration - Math.floor((now - startTime) / 1000)
        );
        setCountdown(remaining);
      };

      updateCountdown(); // initialize immediately
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval); // clean up on unmount
    } else {
      setCountdown(null); // reset timer if no question is active
    }
  }, [isoTimeLastQuestionStarted, position, currentQuestion]);

  // Advance to next question or finish game
  const handleAdvance = async () => {
    try {
      await mutateGame(gameId, "ADVANCE");
      notify(
        isLastQuestion ? "Final question completed!" : "Advanced to next stage",
        "success"
      );
      reload(); // trigger parent update
    } catch (err) {
      notify(err.message || "Failed to advance", "error");
    }
  };

  // End game session
  const handleStop = async () => {
    try {
      await mutateGame(gameId, "END");
      notify("Game session ended", "success");
      reload();
    } catch (err) {
      notify(err.message || "Failed to stop game", "error");
    }
  };

  // Display media content (YouTube, video, image)
  const renderMedia = (q) => {
    if (!q?.media) return null;
    // YouTube video embed
    if (q.media.includes("youtube.com") || q.media.includes("youtu.be")) {
      const match = q.media.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
      );
      const videoId = match?.[1];
      if (videoId) {
        return (
          <Box sx={{ px: { xs: 2, sm: 4 } }}>
            <Box
              sx={{
                position: "relative",
                paddingTop: { xs: "50%", sm: "56.25%" },
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  borderRadius: "8px",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </Box>
        );
      }
    }

    // Image rendering (base64 or file path)
    if (
      q.media.startsWith("data:image") ||
      /\.(png|jpg|jpeg|gif|webp)$/i.test(q.media)
    ) {
      return (
        <Box sx={{ mt: 2 }}>
          <img
            src={q.media}
            alt="question media"
            style={{
              width: "100%",
              maxHeight: 280,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        </Box>
      );
    }

    return null; // fallback if media format not recognized
  };

  // Display Lobby view before game starts
  if (position === -1) {
    return (
      <Box
        textAlign="center"
        p={4}
        sx={{
          border: "1px dashed #ccc",
          borderRadius: 2,
          backgroundColor: "#fefefe",
        }}
      >
        <Typography variant="h5" gutterBottom>
          🧑‍🤝‍🧑 Lobby
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Waiting for players to join...
        </Typography>
        <Chip
          label={`Players joined: ${playerCount}`}
          color="primary"
          variant="outlined"
          sx={{ mt: 2 }}
        />
        <Box mt={2} display="flex" justifyContent="center">
          <AvatarGroup max={6}>
            {playerNames.map((name, index) => (
              <Avatar sx={{ bgcolor: "#00bcd4" }} key={index}>
                {name[0].toUpperCase()}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>
        <Box mt={3}>
          <Button variant="contained" onClick={handleAdvance}>
            Start Game
          </Button>
        </Box>
      </Box>
    );
  }

  // Game in progress view after game has started
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🎮 Game In Progress
      </Typography>

      {/* Question and timer panel */}
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 3,
          mb: 4,
          backgroundColor: "#fafafa",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography fontWeight="bold">
            Question {position + 1} of {questions.length}
          </Typography>
          <Chip
            label={`${playerCount} players`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Stack>

        <Typography variant="body1" gutterBottom>
          {currentQuestion?.text || "No question text provided."}
        </Typography>

        {/* Show media if any */}
        {renderMedia(currentQuestion)}

        {/* Countdown indicator */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            px: 2,
            borderRadius: 2,
            bgcolor: "rgb(221, 221, 221)",
            display: "inline-block",
          }}
        >
          {/* Time's up warning */}
          <Typography sx={{ mt: 0.5, fontSize: { xs: "0.95rem", sm: "1rem" } }}>
            ⏰ Time Left: {countdown ?? "-"}s
          </Typography>
        </Box>
        {countdown === 0 && (
          <Typography sx={{ mt: 1 }} color="error">
            ⏰ Time&apos;s up! Click &quot;
            {isLastQuestion ? "Finish Game" : "Next Question"}&quot; to
            continue.
          </Typography>
        )}

        {/* Visual countdown bar */}
        <LinearProgress
          variant="determinate"
          value={(countdown / (currentQuestion?.duration || 1)) * 100}
          color={countdown <= 5 ? "error" : "primary"}
          sx={{
            height: 8,
            borderRadius: 4,
            mt: 1,
            width: "100%",
          }}
        />

        {/* Display correct answer after time is up */}
        {currentQuestion?.correctAnswers?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="success.main">
              ✅ Correct Answer
              {currentQuestion.correctAnswers.length > 1 ? "s" : ""}:
            </Typography>
            <Typography variant="body1">
              {currentQuestion.correctAnswers.join(", ")}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation controls */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleAdvance}>
          {isLastQuestion ? "Finish Game" : "Next Question"}
        </Button>
        <Button variant="outlined" color="error" onClick={handleStop}>
          Stop Game
        </Button>
      </Stack>

      {/* Optional pulse animation (not currently used) */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
}
