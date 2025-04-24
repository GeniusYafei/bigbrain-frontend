import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGames, putGames } from "../Api.jsx";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  Tooltip,
} from "@mui/material";
import TopBar from "../components/TopBar.jsx";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotification } from "../utils/useNotification.js";
import { fileToDataUrl } from "../utils/helpers";

const questionTypes = [
  { value: "single", label: "Single Choice" },
  { value: "multiple", label: "Multiple Choice" },
  { value: "judgement", label: "Judgement" },
];

export default function QuestionEdit() {
  const { gameId, questionId } = useParams();
  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const { notify } = useNotification();
  const navigate = useNavigate();

  // Fetch question by ID when component mounts
  useEffect(() => {
    getGames()
      .then((games) => {
        const foundGame = games.find((g) => String(g.id) === gameId);
        if (!foundGame) throw new Error("Game not found");

        const foundQuestion = foundGame.questions.find(
          (q) => String(q.questionId) === questionId
        );
        if (!foundQuestion) throw new Error("Question not found");

        setGame(foundGame);
        setQuestion({ ...foundQuestion });
      })
      .catch((err) => notify(err.message, "error"));
  }, [gameId, questionId, notify]);

  // Update a top-level field in question
  const updateField = (field, value) => {
    setQuestion((prev) => ({ ...prev, [field]: value }));
  };

  // Update a specific field in a specific answer
  const updateAnswer = (index, field, value) => {
    const newAnswers = [...(question.Answers || [])];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setQuestion((prev) => ({ ...prev, Answers: newAnswers }));
  };

  // Toggle if an answer is marked correct
  const toggleCorrect = (index) => {
    const answerText = question.Answers[index]?.Answer;
    if (!answerText) return;

    let updatedCorrect = [...(question.correctAnswers || [])];
    const alreadyCorrect = updatedCorrect.includes(answerText);

    if (question.type === "single") {
      updatedCorrect = alreadyCorrect ? [] : [answerText];
    } else {
      if (alreadyCorrect) {
        updatedCorrect = updatedCorrect.filter((ans) => ans !== answerText);
      } else {
        updatedCorrect.push(answerText);
      }
    }

    setQuestion((prev) => ({ ...prev, correctAnswers: updatedCorrect }));
  };

  // Add a new empty answer option
  const addAnswer = () => {
    if ((question.Answers || []).length >= 6) return;
    setQuestion((prev) => ({
      ...prev,
      Answers: [...(prev.Answers || []), { Answer: "" }],
    }));
  };

  // Remove an answer and also remove it from correct answers if necessary
  const removeAnswer = (index) => {
    const removed = question.Answers[index]?.Answer;
    const newAnswers = [...question.Answers];
    newAnswers.splice(index, 1);
    const updatedCorrect = (question.correctAnswers || []).filter(
      (ans) => ans !== removed
    );
    setQuestion((prev) => ({
      ...prev,
      Answers: newAnswers,
      correctAnswers: updatedCorrect,
    }));
  };

  // Save the edited question
  const saveChanges = async () => {
    const isJudgement = question.type === "judgement";
    const ansArray = question.Answers || [];
    const nonEmptyAnswers = ansArray.filter((a) => a.Answer.trim() !== "");

    // If type is judgement, overwrite answer list with fixed Yes/No
    const updatedQuestion = {
      ...question,
      media: question.media || "",
      ...(isJudgement && {
        Answers: [{ Answer: "Yes" }, { Answer: "No" }],
      }),
    };

    // Validation: multiple-choice requires 2–6 non-empty answers
    if (
      !isJudgement &&
      (nonEmptyAnswers.length < 2 || nonEmptyAnswers.length > 6)
    ) {
      notify("You must provide between 2 and 6 non-empty answers.", "warning");
      return;
    }

    // Replace question in the game's question list
    const updatedQuestions = game.questions.map((q) =>
      String(q.questionId) === questionId ? updatedQuestion : q
    );
    const updatedGame = { ...game, questions: updatedQuestions };
    // Replace this game in the global game list and upload
    const allGames = await getGames();
    const newList = allGames.map((g) =>
      g.id === updatedGame.id ? updatedGame : g
    );
    await putGames(newList);
    console.log(updatedQuestion);
    notify("Question saved", "success");
    navigate(`/game/${gameId}`);
  };

  if (!question) return null;

  // Determine the status of the question (complete/incomplete/new)
  const answerCount = (question.Answers || []).filter(
    (a) => a.Answer.trim() !== ""
  ).length;
  const correctCount = (question.correctAnswers || []).length;

  let statusColor = "info";
  let statusText = "New question (not yet edited)";

  // If text exists and answer count / correct count conditions are met
  if (
    question.text?.trim() &&
    (question.type === "judgement"
      ? correctCount >= 1
      : answerCount >= 2 && correctCount >= 1)
  ) {
    statusColor = "success";
    statusText = "Question is complete";
  } else if (question.text?.trim() || answerCount > 0) {
    statusColor = "warning";
    statusText = "Question is incomplete";
  }

  return (
    <>
      <TopBar />
      <Container sx={{ mt: 4 }}>
        <Alert severity={statusColor} sx={{ mb: 2 }}>
          {statusText}
        </Alert>

        {/* General question info */}
        <Typography variant="h5">Edit Question</Typography>

        {/* Question text input */}
        <TextField
          id="questionText"
          label="Question Text"
          fullWidth
          margin="normal"
          value={question.text || ""}
          onChange={(e) => updateField("text", e.target.value)}
        />

        {/* Question type select */}
        <TextField
          label="Type"
          select
          fullWidth
          margin="normal"
          value={question.type || "single"}
          onChange={(e) => {
            const newType = e.target.value;
            updateField("type", newType);
            if (newType === "judgement") {
              setQuestion((prev) => ({
                ...prev,
                Answers: [],
                correctAnswers: [],
              }));
            }
          }}
        >
          {questionTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Duration and points */}
        <TextField
          label="Duration (seconds)"
          type="number"
          fullWidth
          margin="normal"
          value={question.duration || 30}
          onChange={(e) => updateField("duration", parseInt(e.target.value))}
        />

        {/* Duration and points */}
        <TextField
          label="Points"
          type="number"
          fullWidth
          margin="normal"
          value={question.points || 100}
          onChange={(e) => updateField("points", parseInt(e.target.value))}
        />
        {/* Media field (image or YouTube URL) */}
        <TextField
          label="YouTube URL / Image URL"
          fullWidth
          margin="normal"
          value={
            question.media?.startsWith("data:image")
              ? "[Image uploaded]"
              : question.media || ""
          }
          onChange={(e) => updateField("media", e.target.value)}
          helperText={
            question.media?.startsWith("data:image")
              ? "Using uploaded image"
              : ""
          }
        />
        <Box sx={{ mt: 1, mb: 2 }}>
          <Button variant="outlined" component="label" sx={{ mr: 2 }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const dataUrl = await fileToDataUrl(file);
                  updateField("media", dataUrl);
                  notify("Image uploaded successfully", "success");
                }
              }}
            />
          </Button>
          {question.media?.startsWith("data:image") && (
            <IconButton
              color="error"
              onClick={() => updateField("media", "")}
            >
              <DeleteIcon />
            </IconButton>
          )}

          {/* Image upload and preview section */}
          {question.media && question.media.startsWith("data:image") && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Preview:
              </Typography>
              <img
                src={question.media}
                alt="preview"
                style={{ maxWidth: "100%", maxHeight: 200, marginTop: 8 }}
              />
            </Box>
          )}
        </Box>

        {/* Judgement type (Yes/No) or normal answer list */}
        {question.type === "judgement" ? (
          <>
            <Typography variant="h6" sx={{ mt: 3, mb: 2, textAlign: "center" }}>
              Judgement Options
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {["Yes", "No"].map((val) => {
                const isCorrect = question.correctAnswers?.includes(val);
                return (
                  <Grid item xs={6} md={4} key={val}>
                    <Tooltip title="Mark as Correct Answer">
                      <Box
                        onClick={() =>
                          setQuestion((prev) => ({
                            ...prev,
                            correctAnswers: [val],
                          }))
                        }
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 2,
                          border: "2px solid",
                          borderColor: isCorrect ? "green" : "#ccc",
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "0.2s",
                          "&:hover": {
                            boxShadow: 3,
                            borderColor: "primary.main",
                          },
                          userSelect: "none",
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isCorrect}
                              readOnly
                              sx={{
                                color: isCorrect ? "green" : undefined,
                                "&.Mui-checked": { color: "green" },
                              }}
                            />
                          }
                          label="Correct"
                        />
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {val}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ mt: 3 }}>
              Answers
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {(question.Answers || []).map((ans, index) => {
                const isCorrect = (question.correctAnswers || []).includes(
                  ans.Answer
                );

                return (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Tooltip title="Mark as Correct Answer">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isCorrect}
                              onChange={() => toggleCorrect(index)}
                              sx={{
                                color: isCorrect ? "green" : undefined,
                                "&.Mui-checked": {
                                  color: "green",
                                },
                              }}
                            />
                          }
                          label="Correct"
                        />
                      </Tooltip>
                      <TextField
                        fullWidth
                        type="answerFile"
                        label={`Answer ${index + 1}`}
                        value={ans.Answer || ""}
                        onChange={(e) =>
                          updateAnswer(index, "Answer", e.target.value)
                        }
                      />
                      <IconButton
                        color="error"
                        onClick={() => removeAnswer(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            <Button
              variant="outlined"
              onClick={addAnswer}
              disabled={(question.Answers || []).length >= 6}
            >
              Add Answer
            </Button>
          </>
        )}

        {/* Save button */}
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={saveChanges}
            disabled={question.type !== "judgement" && answerCount < 2}
          >
            Save Question
          </Button>
        </Box>
      </Container>
    </>
  );
}
