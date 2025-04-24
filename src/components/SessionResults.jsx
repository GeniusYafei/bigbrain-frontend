// Updated SessionResults component with refined Apple-style card layout
import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import { getSessionResults, getSessionStatus } from "../Api.jsx";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

export default function SessionResults({ sessionId }) {
  // Local state for fetched data and loading indicator
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch session results and questions from API
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await getSessionResults(sessionId); // Get player answers
        const status = await getSessionStatus(sessionId); // Get question metadata
        setResults(res);
        setQuestions(status.results?.questions || []);
      } catch (err) {
        console.error("Failed to load session data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [sessionId]);

  // Compute the total score for a player based on their answers and the question data
  const computeScore = (answers, questions) => {
    let total = 0;

    answers.forEach((res, i) => {
      const q = questions[i];
      if (!q) return; // Skip if question is undefined

      // Default point value and duration fallback
      const base = q.points || 100;
      const duration = q.duration || 30;

      // Calculate time used to answer (in seconds), default to full duration if timestamps are missing
      const timeUsed =
        res.answeredAt && res.questionStartedAt
          ? (new Date(res.answeredAt) - new Date(res.questionStartedAt)) / 1000
          : duration;

      // Ratio of time taken relative to total time allowed (clamped at 1)
      const ratio = Math.min(timeUsed / duration, 1);

      // Scoring multiplier: fast answers get higher score (exponential decay)
      const maxFactor = 2.0;
      const k = Math.log(8); // controls steepness of curve
      const multiplier = maxFactor * Math.exp(-k * ratio);

      // === Single choice & Judgement scoring ===
      if ((q.type === "single" || q.type === "judgement") && res.correct) {
        total += Math.round(base * multiplier); // === Multiple choice scoring ===
      } else if (q.type === "multiple") {
        const correctSet = new Set(q.correctAnswers || []);
        const answerSet = new Set(res.answers || []);
        // Count how many selected answers are correct
        const correctMatches = [...correctSet].filter((a) => answerSet.has(a));
        const incorrectSelected = [...answerSet].filter(
          (a) => !correctSet.has(a)
        );
        if (
          correctMatches.length === correctSet.size &&
          incorrectSelected.length === 0
        ) {
          total += Math.round(base * multiplier); // All correct, none wrong → full score
        }
        // else if (
        //   correctMatches.length > 0 &&
        //   incorrectSelected.length === 0
        // ) {
        //   total += Math.round(base * 0.5 * multiplier);
        // }
      }
    });
    return total;
  };

  // Display loading spinner before data is ready
  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  // Filter out internal player "__validate"
  const filtered = results.results.filter((p) => p.name !== "__validate");

  // Score all players and extract top 5
  const scoredPlayers = filtered.map((p) => ({
    name: p.name,
    score: computeScore(p.answers, questions),
  }));
  const top5 = scoredPlayers.sort((a, b) => b.score - a.score).slice(0, 5);

  // General statistics
  const totalQuestions = questions.length;
  const totalParticipants = filtered.length;
  const totalCorrect = filtered
    .flatMap((p) => p.answers)
    .filter((a) => a.correct).length;
  const avgCorrectRate =
    totalParticipants > 0 && totalQuestions > 0
      ? Math.round((totalCorrect / (totalParticipants * totalQuestions)) * 100)
      : 0;

  return (
    <Box sx={{ px: 4, py: 5, borderRadius: 3, backgroundColor: "#f8f9fb" }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        📊 Game Summary
      </Typography>
      <Divider sx={{ my: 3 }} />

      {/* Stat Cards */}
      <Grid container spacing={3} mb={4} justifyContent="space-between">
        {[
          ["👥 Players", totalParticipants, "Joined this session"],
          ["🎯 Avg Accuracy", `${avgCorrectRate}%`, "Overall correct rate"],
          ["📄 Questions", totalQuestions, "In this game"],
        ].map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              elevation={2}
              sx={{ p: 3, borderRadius: 3, bgcolor: "white" }}
            >
              <Typography variant="h6">{item[0]}</Typography>
              <Typography variant="h4">{item[1]}</Typography>
              <Typography variant="caption">{item[2]}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Top 5 Players full row */}
      <Box mb={4}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "white",
            overflowX: "auto",
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            🏅 Top 5 Players
          </Typography>
          <Table size="small" sx={{ minWidth: 300 }}>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {top5.map((player, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* Accuracy & Time side by side */}
      <Grid
        container
        spacing={3}
        mb={8}
        sx={{
          alignItems: "stretch",
          justifyContent: { xs: "center", md: "space-between" },
          gap: '50px'
        }}
      >
        {/* Accuracy Chart */}
        <Grid item xs={12} md={5}>
          {/* Card container with hover shadow and responsive styling */}
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "white",
              height: "100%",
              overflowX: "auto",
              transition: "box-shadow 0.3s ease",
              // mb: { xs: 1, md: 0 }, // bottom margin for stacked layout on mobile
              "&:hover": { boxShadow: 4 },
            }}
          >
            <Typography variant="subtitle2">✅ Question Accuracy</Typography>
            <Box
              sx={{
                width: "100%",
                maxWidth: 400,
                mx: "auto",
                "& .MuiCharts-root": {
                  width: "100%",
                  height: "240px",
                },
              }}
            >
              {/* Render bar chart showing % of users who answered each question correctly */}
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: questions.map((_, i) => `Q${i + 1}`), // Label Q1, Q2, Q3...
                  },
                ]}
                series={[
                  {
                    data: questions.map((_, i) => {
                      const total = filtered.length;
                      const correct = filtered.filter(
                        (p) => p.answers[i]?.correct
                      ).length;
                      return total > 0
                        ? Math.round((correct / total) * 100)
                        : 0;
                    }),
                    label: "Accuracy (%)",
                    color: "#4caf50",
                  },
                ]}
                width={320}
                height={260}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Time Chart */}
        <Grid item xs={12} md={6}>
          {/* Similar card layout for average time chart */}
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "white",
              height: "100%",
              overflowX: "auto",
              transition: "box-shadow 0.3s ease",
              "&:hover": { boxShadow: 4 },
            }}
          >
            <Typography variant="subtitle2">
              ⏱️ Avg Time Per Question
            </Typography>
            <Box
              sx={{
                width: "100%",
                maxWidth: 400,
                mx: "auto",
                "& .MuiCharts-root": {
                  width: "100%!important",
                  height: "240px!important",
                },
              }}
            >
              {/* Render line chart showing average response time for each question */}
              <LineChart
                xAxis={[
                  {
                    scaleType: "point",
                    data: questions.map((_, i) => `Q${i + 1}`),
                  },
                ]}
                series={[
                  {
                    data: questions.map((_, i) => {
                      // Collect response durations from all players
                      const times = filtered
                        .map((p) => {
                          const res = p.answers[i];
                          if (!res?.answeredAt || !res?.questionStartedAt)
                            return null;
                          return (
                            (new Date(res.answeredAt) -
                              new Date(res.questionStartedAt)) /
                            1000
                          ); // duration in seconds
                        })
                        .filter((t) => t !== null);
                      if (times.length === 0) return 0;

                      // Average response time for this question
                      return Math.round(
                        times.reduce((a, b) => a + b, 0) / times.length
                      );
                    }),
                    label: "Avg Time (s)",
                    color: "#1976d2",
                  },
                ]}
                width={320}
                height={260}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Pie Chart Full Width */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "white",
          height: "100%",
          overflowX: "auto",
          mx: { xs: 0, md: 3 },
        }}
      >
        <Typography variant="subtitle2">
          📊 Correct Answers by Player
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: { xs: 300, sm: 400 },
            position: "relative",
            "& .MuiCharts-root": {
              width: "100%",
              height: "100%",
            },
          }}
        >
          {/* Render pie chart showing total correct answers per player */}
          <PieChart
            series={[
              {
                data: filtered.map((p, index) => ({
                  id: index,
                  label: p.name,
                  value: p.answers.filter((a) => a.correct).length, // count of correct answers
                })),
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
              },
            ]}
            width={500}
            height={320}
          />
        </Box>
      </Paper>
    </Box>
  );
}
