// src/pages/GameEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGames, putGames } from "../Api.jsx";
import { Container, Typography, Button, Box, Grid, Alert } from "@mui/material";
import { useNotification } from "../utils/useNotification.js";
import QuestionCard from "../components/QuestionCard.jsx";
import TopBar from "../components/TopBar.jsx";

export default function GameEdit() {
  const { gameId } = useParams(); // get gameId from route params
  const [game, setGame] = useState(null); // store current game data
  const { notify } = useNotification();
  const navigate = useNavigate();

  // Fetch all games and select the game with matching ID
  useEffect(() => {
    getGames()
      .then((games) => {
        const found = games.find((g) => String(g.id) === gameId);
        if (!found) throw new Error("Game not found");
        setGame(found);
      })
      .catch((err) => notify(err.message, "error"));
  }, [gameId, notify]);

  // Add a new blank question to this game
  const handleAddQuestion = async () => {
    const existingIds = game.questions.map((q) => q.questionId || 0);
    const newQuestionId = Math.max(0, ...existingIds) + 1;

    const newQ = {
      questionId: newQuestionId,
      duration: 30,
      correctAnswers: [],
      Answers: [],
      type: "single",
      text: "",
      points: 100,
      media: "",
    };

    const updatedGame = {
      ...game,
      questions: [...game.questions, newQ],
    };

    await putGamesReplace(updatedGame);
    notify("Question Added", "success");
  };

  // Remove a question by ID
  const handleDeleteQuestion = async (qid) => {
    const updated = game.questions.filter((q) => q.questionId !== qid);
    const updatedGame = {
      ...game,
      questions: updated,
    };

    await putGamesReplace(updatedGame);
    notify("Question Deleted", "info");
  };

  // Save updated game list to backend
  const putGamesReplace = async (updatedGame) => {
    const allGames = await getGames();
    const newList = allGames.map((g) =>
      g.id === updatedGame.id ? updatedGame : g
    );
    await putGames(newList);
    setGame(updatedGame);
  };

  // Show loading state if game not loaded yet
  if (!game) return null;

  return (
    <>
      {/* Page header nav bar */}
      <TopBar />

      {/* Responsive content container */}
      <Container sx={{ mt: 4, px: { xs: 2, sm: 4 } }}>
        <Typography
          variant="h4"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, fontWeight: "bold" }}
        >
          Edit Game: {game.name || `Game ${game.id}`}
        </Typography>

        {/* Action row with question count and add button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            my: 2,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              component="span"
              sx={{
                textAlign: "center",
                p: 4,
                fontFamily: "monospace",
                bgcolor: "#e0e0e0",
                px: 1,
                py: 0.3,
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontWeight: "bold",
                color: "text.secondary",
              }}
            >
              You have {game.questions.length} question(s)
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleAddQuestion}>
            Add New Question
          </Button>
        </Box>

        {/* Show message if there are no questions yet */}
        {game.questions.length === 0 && (
          <Alert severity="info" sx={{ my: 2 }}>
            No questions yet. Click “Add New Question” to create one!
          </Alert>
        )}

        {/* Grid list of QuestionCard components */}
        <Grid container spacing={2}>
          {game.questions.map((q, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={q.questionId || index}>
              <QuestionCard
                index={index}
                question={q}
                onDelete={() => handleDeleteQuestion(q.questionId)}
                onEdit={() =>
                  navigate(`/game/${gameId}/question/${q.questionId}`)
                }
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
