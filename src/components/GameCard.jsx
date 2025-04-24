// src/components/GameCard.jsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CardMedia,
  Box,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { PlayArrow, StopCircle, ContentCopy } from "@mui/icons-material";
import { mutateGame, getGames } from "../Api.jsx";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../utils/useNotification.js";

export default function GameCard({ game, onClick, onRefresh, onDelete }) {
  const { id, questions, name, thumbnail, active } = game;
  const questionCount = questions.length;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [localActive, setLocalActive] = useState(false);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const totalDuration = questions.reduce(
    (sum, q) => sum + (q.duration || 0),
    0
  );

  // Determine if game is fully ready to start
  const isComplete =
    questionCount > 0 &&
    questions.every(
      (q) =>
        q.text?.trim() &&
        (q.Answers || []).filter((a) => a.Answer.trim() !== "").length >= 2 &&
        (q.correctAnswers || []).length >= 1
    );

  // Game is live if either active from backend or locally flagged
  const isLive = !!active || localActive;

  // Handle start game logic
  const handleStartGame = async () => {
    if (isLive) return;
    try {
      await mutateGame(id, "START");
      const refreshedGames = await getGames();
      const refreshed = refreshedGames.find((g) => g.id === id);
      if (refreshed?.active) {
        setSessionId(refreshed.active);
        setLocalActive(true);
        setShowStartDialog(true);

        // Auto copy link to clipboard
        try {
          await navigator.clipboard.writeText(
            `${window.location.origin}/play/join/${refreshed.active}`
          );
          setCopied(true);
        } catch (clipErr) {
          console.warn("Clipboard write failed:", clipErr);
        }
      }
      if (onRefresh) onRefresh();
      notify("Game started successfully!", "success");
    } catch (err) {
      notify(err, "error");
    }
  };

  // Initialize game state if already active
  useEffect(() => {
    if (game.active && !sessionId) {
      setSessionId(game.active);
      setLocalActive(true);

      if (!showStartDialog) {
        setShowStartDialog(true);
      }

      try {
        navigator.clipboard.writeText(
          `${window.location.origin}/play/join/${game.active}`
        );
        setCopied(true);
      } catch (clipErr) {
        console.warn("Clipboard write failed:", clipErr);
      }
    }
  }, [game.active, sessionId, showStartDialog]);

  // Handle stopping game session
  const handleStopGame = async () => {
    try {
      await mutateGame(id, "END");
      setConfirmStop(false);
      setLocalActive(false);
      if (onRefresh) onRefresh();
      notify("Game stopped!", "success");
      // const confirmed = window.confirm("Would you like to view the results?");
      // if (confirmed) navigate(`/session/${sessionId}`);
      navigate(`/session/${sessionId}`);
    } catch (err) {
      notify(err, "error");
    }
  };

  const sessionUrl = `${window.location.origin}/play/join/${sessionId}`;

  return (
    <Card
      sx={{
        position: "relative",
        minWidth: 250,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: isLive ? "2px solid green" : undefined,
      }}
    >
      {/* Show delete icon only if game not live */}
      {!isLive && (
        <IconButton
          data-testid="delete-button"
          size="small"
          color="error"
          onClick={() => setShowDeleteDialog(true)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: "white",
            "&:hover": { backgroundColor: "#f8d7da" },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}

      {/* Thumbnail or fallback banner */}
      {thumbnail ? (
        <CardMedia
          component="img"
          height="140"
          image={thumbnail}
          alt="game thumbnail"
        />
      ) : (
        <Box
          sx={{
            height: 140,
            background: "linear-gradient(to right, #2196f3, #21cbf3)",
          }}
        />
      )}

      {/* Card main content */}
      <CardContent sx={{ flexGrow: 1, opacity: isLive ? 0.6 : 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography gutterBottom variant="h6" component="div">
            {name || `Game ${id}`}
          </Typography>
          {/* {isLive && <Chip label="LIVE" color="success" size="small" />} */}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {questionCount} question{questionCount !== 1 && "s"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total duration: {totalDuration}s
        </Typography>
      </CardContent>

      {/* Card footer actions */}
      <CardActions sx={{ opacity: 1 }}>
        <Tooltip
          title={isLive ? "Cannot edit while game is live" : "Edit Game"}
        >
          <span>
            <Button size="small" onClick={onClick} disabled={isLive}>
              Edit Game
            </Button>
          </span>
        </Tooltip>
        {isLive && <Chip label="LIVE" color="success" size="small" />}
        {!isLive && (
          <>
            <Tooltip
              title={isComplete ? "Start Game" : "Complete all questions first"}
            >
              <span>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrow />}
                  disabled={!isComplete}
                  onClick={handleStartGame}
                >
                  Start Game
                </Button>
              </span>
            </Tooltip>
          </>
        )}
        {isLive && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<StopCircle />}
            onClick={() => setConfirmStop(true)}
          >
            Stop Game
          </Button>
        )}
      </CardActions>

      {/* Stop game confirmation dialog */}
      <Dialog open={confirmStop} onClose={() => setConfirmStop(false)}>
        <DialogTitle>Stop Game</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to stop this game session?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmStop(false)}>Cancel</Button>
          <Button color="error" onClick={handleStopGame}>
            Stop & View Results
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to show session link */}
      <Dialog open={showStartDialog} onClose={() => setShowStartDialog(false)}>
        <DialogTitle>Game Started</DialogTitle>
        <DialogContent>
          <Typography>Session ID: {sessionId}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <TextField
              fullWidth
              value={sessionUrl}
              InputProps={{ readOnly: true }}
              size="small"
            />
            <Tooltip title="Copy Link">
              <IconButton
                onClick={() => {
                  navigator.clipboard
                    .writeText(sessionUrl)
                    .catch((err) => console.warn(err));
                  setCopied(true);
                }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {copied && (
            <Typography variant="caption" color="success.main">
              Players can join the game through the URL!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStartDialog(false)}>Close</Button>
          <Button
            variant="outlined"
            onClick={() =>
              navigate(`/session/${sessionId}`, { state: { gameId: id } })
            }
          >
            Go to Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete game dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Game</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this game? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              onDelete?.(id);
              setShowDeleteDialog(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
