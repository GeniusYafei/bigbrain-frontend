// src/components/QuestionCard.jsx
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Divider,
  Box,
  Tooltip,
} from "@mui/material";
import {
  AccessTime,
  FormatListBulleted,
  Quiz,
  CheckCircleOutline,
  InfoOutlined,
  WarningAmberOutlined,
  TaskAltOutlined,
} from "@mui/icons-material";

export default function QuestionCard({ index, question, onEdit, onDelete }) {
  // Extract question type and readable display label
  const qType = question.type || "single";
  const displayType =
    qType === "single"
      ? "Single Choice"
      : qType === "multiple"
        ? "Multiple Choice"
        : qType === "judgement"
          ? "Judgement"
          : "Unknown";

  // Set type-specific icon with color
  const icon =
    qType === "single" ? (
      <Quiz fontSize="small" sx={{ color: "#1976d2" }} />
    ) : qType === "multiple" ? (
      <FormatListBulleted fontSize="small" sx={{ color: "#43a047" }} />
    ) : (
      <CheckCircleOutline fontSize="small" sx={{ color: "#f57c00" }} />
    );

  // Count non-empty answer choices and correct answers
  const answerCount = (question.Answers || []).filter(
    (a) => a.Answer.trim() !== ""
  ).length;
  const correctCount = (question.correctAnswers || []).length;
  const isJudgement = qType === "judgement";

  // Determine question completion status
  let statusIcon = <InfoOutlined fontSize="small" color="info" />;
  let statusLabel = "New";

  if (
    question.text?.trim() &&
    ((isJudgement && correctCount >= 1) ||
      (!isJudgement && answerCount >= 2 && correctCount >= 1))
  ) {
    statusIcon = <TaskAltOutlined fontSize="small" sx={{ color: "green" }} data-testid="complete-icon"/>;
    statusLabel = "Complete";
  } else if (question.text?.trim() || answerCount > 0 || correctCount > 0) {
    statusIcon = <WarningAmberOutlined fontSize="small" color="warning" data-testid="Incomplete-icon"/>;
    statusLabel = "Incomplete";
  }

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minWidth: 0,
        transition: "0.3s",
        "&:hover": {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        {/* Question heading and status icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            ariant="h6"
            sx={{
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              fontWeight: "bold",
            }}
          >
            Question {index + 1}
          </Typography>
          <Tooltip title={statusLabel}>{statusIcon}</Tooltip>
        </Box>

        {/* Divider under title */}
        <Divider sx={{ mb: 1 }} />

        {/* Question metadata rows */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
          {icon}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            <strong>Type:</strong> {displayType}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
          <AccessTime fontSize="small" sx={{ color: "gray" }} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            <strong>Duration:</strong> {question.duration || 0}s
          </Typography>
        </Box>

        {/* Question text content */}
        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
          <strong>Q:</strong> {question.text || "(empty)"}
        </Typography>
      </CardContent>

      {/* Card footer with edit/delete actions */}
      <CardActions sx={{ mt: "auto", px: 2, pb: 2 }}>
        <Button size="small" variant="contained" onClick={onEdit}>
          Edit
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={onDelete}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}
