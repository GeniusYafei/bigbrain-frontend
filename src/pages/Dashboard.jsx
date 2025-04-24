// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGames, createGame, putGames } from "../Api.jsx";
import GameCard from "../components/GameCard.jsx";
import GameFormModal from "../components/GameFormModal.jsx";
import TopBar from "../components/TopBar.jsx";
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotification } from "../utils/useNotification.js";

export default function Dashboard() {
  // State for games and modal/dialog visibility
  const [games, setGames] = useState([]);
  const [open, setOpen] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  const { notify } = useNotification();
  const navigate = useNavigate();

  // Fetch games on load and ensure user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Please login first", "error");
      navigate("/login");
      return;
    }
    getGames()
      .then((sortedGames) => setGames(sortedGames))
      .catch((err) => notify(err.message, "error"));
  }, [navigate, notify]);

  // Handle game creation
  const handleCreate = async (name, thumbnail) => {
    try {
      const newGame = await createGame(name, thumbnail);
      setGames((prev) =>
        [...prev, newGame].sort((a, b) => b.createdAt - a.createdAt)
      );
      notify("Game created successfully!", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setOpen(false);
    }
  };

  // Handle single game deletion
  const handleDelete = async (gameId) => {
    try {
      const updatedGames = games.filter((g) => g.id !== gameId);
      await putGames(updatedGames);
      setGames(updatedGames);
      notify("Game deleted successfully", "info");
    } catch (err) {
      notify(err.message || "Failed to delete game", "error");
    }
  };

  // Handle clearing all games
  const handleClearAll = async () => {
    try {
      await putGames([]);
      setGames([]);
      notify("All games cleared", "warning");
    } catch (err) {
      notify(err.message || "Failed to clear games", "error");
    } finally {
      setShowClearAllDialog(false);
    }
  };

  return (
    <>
      {/* Top navigation bar */}
      <TopBar />
      {/* Page content container with responsive padding */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Page heading and action buttons */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            mb: 2,
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontSize: { xs: "1.4rem", sm: "2rem" }, fontWeight: "bold" }}
          >
            My Games
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Create Game
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setShowClearAllDialog(true)}
            >
              Clear All
            </Button>
          </Box>
        </Box>

        {/* Info alert when there are no games */}
        {games.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You don’t have any games yet. Click “Create Game” to get started!
          </Alert>
        )}

        {/* Game cards grid layout */}
        <Grid container spacing={2}>
          {games.map((game) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
              <GameCard
                game={game}
                onClick={() => navigate(`/game/${game.id}`)}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>

        {/* Create game modal */}
        <GameFormModal
          open={open}
          onClose={() => setOpen(false)}
          onCreate={handleCreate}
        />

        {/* Confirmation dialog for clearing all games */}
        <Dialog
          open={showClearAllDialog}
          onClose={() => setShowClearAllDialog(false)}
        >
          <DialogTitle color="red">Confirm Clear All</DialogTitle>
          <DialogContent>
            <Typography>
              This will permanently delete <strong>all your games</strong> . Are
              you sure you want to proceed?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowClearAllDialog(false)}>Cancel</Button>
            <Button color="error" onClick={handleClearAll}>
              Clear All
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
