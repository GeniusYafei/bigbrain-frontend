// src/pages/PlayGamePage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  getPlayerStatus,
  getCurrentQuestion,
  submitAnswer,
  getCorrectAnswer,
} from "../Api.jsx";
import { useNotification } from "../utils/useNotification.js";

export default function PlayGamePage() {
  // Game state
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [selected, setSelected] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState([]);
  const prevQuestionIdRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  const { notify } = useNotification();

  // Fetch current question + patch previous question with correctAnswers
  const fetchEverything = async () => {
    try {
      const status = await getPlayerStatus(playerId);

      // Handle redirection based on session status
      if (!status.started && !showAnswer) {
        navigate("/play/join");
        return;
      }

      if (!status.started && showAnswer) {
        navigate(`/play/${playerId}/result`);
        return;
      }

      if (!status.started) {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate(`/play/${playerId}/result`);
        }
        return;
      }

      // ✅ Get current question data
      const res = await getCurrentQuestion(playerId);
      const q = res.question;

      // ✅ Before switch to new question, patch previous one with correctAnswers
      if (
        prevQuestionIdRef.current !== null &&
        q &&
        String(q.questionId) !== String(prevQuestionIdRef.current)
      ) {
        try {
          const res = await getCorrectAnswer(playerId);
          const answers =
            res.correctAnswers ||
            res.answerIds?.map((id) => q.Answers?.[parseInt(id)]?.Answer) ||
            res.answers ||
            [];

          // storage the question in local
          const prev = JSON.parse(
            localStorage.getItem("playerQuestions") || "[]"
          );
          const updated = prev.map((item) =>
            item.questionId === prevQuestionIdRef.current
              ? { ...item, correctAnswers: answers }
              : item
          );
          // debugging on console.
          localStorage.setItem("playerQuestions", JSON.stringify(updated));
          console.log(
            `[Pre-Switch Patch] Stored correctAnswers for Q${prevQuestionIdRef.current}:`,
            answers
          );
        } catch (e) {
          console.warn("Pre-switch correct answer fetch failed", e);
        }
      }

      // If new question arrives, reset state
      if (q) {
        if (
          prevQuestionIdRef.current === null ||
          String(q.questionId) !== String(prevQuestionIdRef.current)
        ) {
          // Save new question into state
          setQuestion(q);
          setSelected([]);
          setShowAnswer(false);
          setCorrectAnswer([]);
          prevQuestionIdRef.current = q.questionId;

          // Save into localStorage (no correctAnswers yet)
          const prev = JSON.parse(
            localStorage.getItem("playerQuestions") || "[]"
          );
          const alreadyExists = prev.some(
            (item) => item.questionId === q.questionId
          );
          // handle the player exits
          if (!alreadyExists) {
            localStorage.setItem(
              "playerQuestions",
              JSON.stringify([...prev, q])
            );
          }
        }

        // Calculate countdown timer
        if (q.isoTimeLastQuestionStarted && q.duration) {
          const start = new Date(q.isoTimeLastQuestionStarted).getTime();
          const now = Date.now();
          const remaining = q.duration - Math.floor((now - start) / 1000);
          setTimeLeft(remaining > 0 ? remaining : 0);
        }
      }
    } catch (err) {
      const msg = (err.message || "").toLowerCase();
      if (
        msg.includes("not an active session") ||
        msg.includes("has ended") ||
        msg.includes("session not found")
      ) {
        // check the API's response
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate(`/play/${playerId}/result`);
        }
      } else {
        notify(err.message || "Error fetching game data", "error");
      }
    }
  };

  // Countdown and answer reveal logic
  useEffect(() => {
    if (timeLeft === null || showAnswer) return;

    // timer interval polling per seconds
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          getCorrectAnswer(playerId).then((res) => {
            const answers =
              res.answerIds || res.answers || res.correctAnswers || [];
            setCorrectAnswer(answers);
            setShowAnswer(true);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showAnswer]);

  // Poll question and status every 1s
  useEffect(() => {
    fetchEverything();
    const interval = setInterval(fetchEverything, 1000);
    return () => clearInterval(interval);
  }, []);

  // After answer is revealed, supplement with correctAnswers
  useEffect(() => {
    const fetchAndStoreCorrectAnswers = async () => {
      if (showAnswer && question && question.questionId) {
        try {
          const response = await getCorrectAnswer(playerId);
          const correct = response.answers;
          setCorrectAnswer(correct);

          // save the current question in local
          const prev = JSON.parse(
            localStorage.getItem("playerQuestions") || "[]"
          );
          const updated = prev.map((q) =>
            q.questionId === question.questionId
              ? { ...q, correctAnswers: correct }
              : q
          );

          localStorage.setItem("playerQuestions", JSON.stringify(updated));
          console.log(
            `[Debug] Stored correctAnswers for Q${question.questionId}:`,
            correct
          );
        } catch (err) {
          console.error("Failed to fetch correct answer:", err);
          notify("Could not fetch correct answer", "error");
        }
      }
    };

    fetchAndStoreCorrectAnswers();
  }, [showAnswer, question, playerId]);

  // Render media content (image, video, YouTube) same with session page
  const renderMedia = () => {
    if (!question.media) return null;
    if (
      question.media.includes("youtube.com") ||
      question.media.includes("youtu.be")
    ) {
      // check whether is Youtube URL
      const match = question.media.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
      );
      const videoId = match?.[1];
      if (videoId) {
        return (
          <Box sx={{ my: 2 }}>
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        );
      }
    }
    if (question.media.endsWith(".mp4")) {
      return <video width="100%" controls src={question.media} />;
    }
    return (
      <img
        src={question.media}
        alt="media"
        style={{
          width: "100%",
          maxHeight: "300px",
          objectFit: "contain",
        }}
      />
    );
  };

  // Handle user selecting an answer
  const isSelected = (val) => selected.includes(val);

  // user select the question when every time click
  const handleSelect = async (val) => {
    let updated;
    if (question.type === "multiple") {
      updated = isSelected(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
    } else {
      updated = [val];
    }

    setSelected(updated);

    try {
      await submitAnswer(playerId, {
        answers: updated.map((id) => question.Answers[parseInt(id)].Answer),
        timeRemaining: timeLeft,
      });
    } catch (err) {
      // notify("Choose at least one answer", "error");
      console.log(err);
      setSelected((prev) => [...prev]);
    }
  };

  // Loading UI if question not loaded yet
  if (!question) {
    return (
      <Container>
        <Box textAlign="center" mt={10}>
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            Loading question...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Render answer choices based on type
  const renderAnswers = () => {
    const isSingleOrJudgement =
      question.type === "single" || question.type === "judgement";

    // handle the judgement
    if (isSingleOrJudgement) {
      return (
        <RadioGroup
          value={selected[0] || ""}
          onChange={(e) => handleSelect(e.target.value)}
        >
          {question.Answers.map((ans, idx) => {
            const value = String(idx);
            const label = ans.Answer;
            const isCorrect = correctAnswer.includes(label);
            const isChosen = selected.includes(value);

            // render the select box
            return (
              <FormControlLabel
                key={idx}
                value={value}
                control={<Radio disabled={showAnswer} />}
                label={
                  showAnswer ? (
                    <span
                      style={{
                        color: isCorrect
                          ? "green"
                          : isChosen
                            ? "red"
                            : "inherit",
                      }}
                    >
                      {label}
                    </span>
                  ) : (
                    label
                  )
                }
              />
            );
          })}
        </RadioGroup>
      );
    }

    // Multiple choice rendering
    return question.Answers.map((ans, idx) => {
      const value = String(idx);
      const label = ans.Answer;
      const isCorrect =
        correctAnswer.includes(value) || correctAnswer.includes(label);
      const isChosen = selected.includes(value);

      return (
        <FormControlLabel
          key={idx}
          control={
            <Checkbox
              checked={isChosen}
              onChange={() => handleSelect(value)}
              disabled={showAnswer}
            />
          }
          label={
            showAnswer ? (
              <span
                style={{
                  color: isCorrect ? "green" : isChosen ? "red" : "inherit",
                }}
              >
                {label}
              </span>
            ) : (
              label
            )
          }
        />
      );
    });
  };

  // overall the frame
  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: "#fafafa" }}>
        <Typography variant="h6" fontWeight="bold" >
          Question {question.questionId}
        </Typography>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {question.text}
        </Typography>

        {renderMedia()}

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            px: 2,
            borderRadius: 2,
            bgcolor:"rgb(221, 221, 221)",
            display: "inline-block",
          }}
        >
          <Typography variant="subtitle2">⏰ Time Left: {timeLeft}s</Typography>
        </Box>

        {/* Progress bar for countdown */}
        <LinearProgress
          variant="determinate"
          value={(timeLeft / (question?.duration || 1)) * 100}
          color={timeLeft <= 5 ? 'error' : 'primary'}
          sx={{ height: 8, borderRadius: 4, mt: 1 }}
        />

        {/* Correct answer feedback */}
        {showAnswer && correctAnswer.length > 0 && (
          <Typography
            variant="body2"
            color="success.main"
            sx={{ mt: 1, fontWeight: 500 }}
          >
            ✅ Correct Answer: {correctAnswer.join(", ")}
          </Typography>
        )}

        {/* Waiting label */}
        {showAnswer && (
          <Typography variant="caption" color="text.secondary">
            ⌛ Waiting for admin to advance to the next step…
          </Typography>
        )}

        {/* Render answer options */}
        <Box mt={3}>{renderAnswers()}</Box>
      </Paper>
    </Container>
  );
}
