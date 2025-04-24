// src/pages/PlayResult.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { getPlayerResult } from "../Api.jsx";

// Function to compute the score for each question
const computeScore = (res, q) => {
  const base = q.points || 100; // Default base point if not provided
  const duration = q.duration || 30; // Default duration

  // Calculate time used in seconds (if timestamps are available)
  const timeUsed =
    res.answeredAt && res.questionStartedAt
      ? (new Date(res.answeredAt) - new Date(res.questionStartedAt)) / 1000
      : duration;

  const ratio = Math.min(timeUsed / duration, 1); // Ensure ratio is max 1
  const maxFactor = 2.0;
  const k = Math.log(8);
  const multiplier = maxFactor * Math.exp(-k * ratio); // Speed-based multiplier

  // Scoring rules for single/judgement
  if ((q.type === "single" || q.type === "judgement") && res.correct) {
    return Math.round(base * multiplier);
  }

  // Scoring rules for multiple choice
  if (q.type === "multiple") {
    const correctSet = new Set(q.correctAnswers || []);
    const answerSet = new Set(res.answers || []);

    const correctMatches = [...correctSet].filter((a) => answerSet.has(a));
    const incorrectSelected = [...answerSet].filter((a) => !correctSet.has(a));

    if (
      correctMatches.length === correctSet.size &&
      incorrectSelected.length === 0
    ) {
      return Math.round(base * multiplier); // Full score
    }
    // else if (correctMatches.length > 0 && incorrectSelected.length === 0) {
    //   return Math.round(base * 0.5 * multiplier);
    // }
    else {
      return 0; // Incorrect
    }
  }

  return 0;
};

export default function PlayerResultPage() {
  const { playerId } = useParams();
  const [results, setResults] = useState(null); // Player's results from API
  const [questions, setQuestions] = useState([]); // Questions (from localStorage)
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();
  const [totalScore, setTotalScore] = useState(0); // Total score accumulator

  // Load questions from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem("playerQuestions");
      if (data && data !== "undefined") {
        setQuestions(JSON.parse(data));
      } else {
        setQuestions([]);
      }
    } catch (e) {
      console.error("Invalid playerQuestions JSON in localStorage", e);
      setQuestions([]);
    }
  }, []);

  // Fetch player's result from backend
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await getPlayerResult(playerId);
        setResults(res);
        setLoading(false);
      } catch (err) {
        const msg = (err.message || "").toLowerCase();

        // If result not ready yet, retry after 2s
        if (msg.includes("answers are not available yet")) {
          console.warn("Results not ready, retrying in 2 seconds...");
          setTimeout(fetchResult, 2000);
        } else {
          console.error("Failed to load player result:", err);
          setLoading(false);
        }
      }
    };
    fetchResult();
  }, [playerId]);

  // Compute total score after data is available
  useEffect(() => {
    if (!results || results.length === 0 || questions.length === 0) return;

    let sum = 0;
    results.forEach((res, i) => {
      const q = questions[i];
      console.log(`[Debug] Matching res[${i}] with q[${i}]`, {
        questionId: q?.questionId,
        resAnswers: res.answers,
        qCorrect: q?.correctAnswers,
      });
      if (!q) return;
      sum += computeScore(res, q);
    });

    setTotalScore(sum);

    setTotalScore(sum);
    console.log(`[Debug] Final total score: ${sum}`);
    console.log("✅ Results from backend:", results);
    console.log("📦 Questions from localStorage:", questions);
  }, [results, questions]);

  // Check for missing correctAnswers
  questions.forEach((q) => {
    if (!q.correctAnswers) {
      console.warn(
        `[⚠️ Missing] Question ${q.questionId} has no correctAnswers`
      );
    }
  });

  // Show loading spinner
  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  // No data fallback
  if (!results || results.length === 0) {
    return <Typography>No result data available.</Typography>;
  }

  // Helper function: get question by index
  const getQuestion = (index) =>
    questions && questions.length > index ? questions[index] : {};

  return (
    <Container sx={{ mt: 5 }}>
      {/* Page title */}
      <Typography variant="h4" gutterBottom>
        Your Results
      </Typography>
      {/* Results table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Question</TableCell>
            <TableCell>Your Answer</TableCell>
            <TableCell>Correct</TableCell>
            <TableCell>Time Used (s)</TableCell>
            <TableCell>score</TableCell>
          </TableRow>
        </TableHead>
        {/* foreach the result */}
        <TableBody>
          {results.map((res, i) => {
            const q = getQuestion(i);
            const answerList = Array.isArray(res.answers) ? res.answers : [];
            const answerLabels = answerList.map((id) =>
              q.Answers ? q.Answers[parseInt(id)]?.Answer || id : id
            );
            const timeUsed =
              res.answeredAt && res.questionStartedAt
                ? Math.floor(
                  (new Date(res.answeredAt) -
                      new Date(res.questionStartedAt)) /
                      1000
                )
                : "-";

            const score = computeScore(res, q);

            return (
              <TableRow key={i}>
                <TableCell>{q.text || `Question ${i + 1}`}</TableCell>
                <TableCell>
                  {answerLabels.length > 0
                    ? answerLabels.join(", ")
                    : "No answer submitted"}
                </TableCell>
                <TableCell>{res.correct ? "✅" : "❌"}</TableCell>
                <TableCell>{timeUsed}</TableCell>
                <TableCell>{score}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Total Score: {totalScore}
      </Typography>

      {/* Back to join page */}
      <Button
        variant="contained"
        onClick={() => navigate("/play/join")}
        sx={{ mt: 3 }}
      >
        Back to Join Session
      </Button>

      {/* Explanation of scoring rules */}
      <Box
        sx={{
          mt: 4,
          px: 2,
          py: 1.5,
          backgroundColor: "#f0f4f8",
          borderLeft: "4px solid #2196f3",
          borderRadius: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: 600, textTransform: "lowercase" }}
        >
          📘 how Points are Calculated
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          • <strong>Single choice & Judgement:</strong> full score if correct,
          scaled by how quickly you answered. <br />•{" "}
          <strong>Multiple choice:</strong> all correct and no wrong answers =
          full score; any incorrect = zero. <br />• <strong>Time:</strong> the
          faster you answer, the more you score.
        </Typography>

        {/* Display scoring formula */}
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            component="span"
            sx={{
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
            Formula: score = basePoints × 2.0 × exp(–ln(8) × (time used ÷ question
            time))
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
