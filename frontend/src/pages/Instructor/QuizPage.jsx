import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QuizIcon from "@mui/icons-material/Quiz";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "../../utils/axiosConfig";
import QuizResultDialog from "../../components/QuizResultDialog";

const QuizPage = () => {
  // --- States ---
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  // --- Test Taking States ---
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Debug logging
    console.log("Axios baseURL:", axios.defaults.baseURL);
    console.log("Token exists:", !!localStorage.getItem("token"));
    console.log("User role:", localStorage.getItem("role"));

    fetchCourses();
    fetchAllQuizzes();
  }, []);

  // --- API Functions ---
  const fetchCourses = async () => {
    try {
      console.log("Fetching courses...");
      // Use just /courses if your baseURL already has /api
      // OR use /api/courses if baseURL doesn't have /api
      const res = await axios.get("/api/courses");
      console.log("Courses response:", res.data);
      setCourses(res.data);
    } catch (err) {
      console.error(
        "Error fetching courses:",
        err.response?.status,
        err.message
      );
      // Use mock data for development
      setCourses([
        { id: 1, title: "Mathematics" },
        { id: 2, title: "Science" },
        { id: 3, title: "History" },
        { id: 4, title: "Literature" },
      ]);
    }
  };

  const fetchAllQuizzes = async () => {
    try {
      console.log("Fetching quizzes...");
      const res = await axios.get("/api/quizzes");
      console.log("Quizzes response:", res.data);
      setQuizzes(res.data);
    } catch (err) {
      console.error(
        "Error fetching quizzes:",
        err.response?.status,
        err.message
      );
      // Mock data
      setQuizzes([
        {
          id: 1,
          quizDisplayId: "QUIZ001",
          title: "Basic Math Quiz",
          createdAt: new Date().toISOString(),
          difficulty: "Easy",
          duration: 30,
          totalQuestions: 5,
        },
        {
          id: 2,
          quizDisplayId: "QUIZ002",
          title: "Science Knowledge Test",
          createdAt: new Date().toISOString(),
          difficulty: "Medium",
          duration: 45,
          totalQuestions: 8,
        },
      ]);
    }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedSubject("");
    setSelectedTopic("");
    try {
      const res = await axios.get(`/api/subjects/course/${courseId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      // Fallback dummy data
      const mockSubjects = [
        { id: 1, name: "Algebra", courseId: 1 },
        { id: 2, name: "Geometry", courseId: 1 },
        { id: 3, name: "Physics", courseId: 2 },
      ];
      setSubjects(mockSubjects.filter((s) => s.courseId == courseId));
    }
  };

  const handleSubjectChange = async (subjectId) => {
    setSelectedSubject(subjectId);
    setSelectedTopic("");
    try {
      const res = await axios.get(`/api/topics/subject/${subjectId}`);
      setTopics(res.data);
    } catch (err) {
      console.error("Error fetching topics:", err);
      // Fallback dummy data
      const mockTopics = [
        { id: 1, title: "Linear Equations", subjectId: 1 },
        { id: 2, title: "Quadratic Equations", subjectId: 1 },
        { id: 3, title: "Thermodynamics", subjectId: 3 },
      ];
      setTopics(mockTopics.filter((t) => t.subjectId == subjectId));
    }
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/quizzes/generate", {
        title: quizTitle,
        topicId: selectedTopic,
      });

      setQuizzes([response.data, ...quizzes]);
      setGeneratedQuiz(response.data);
      setIsDialogOpen(true);
      setQuizTitle("");
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err.response?.data || "AI Generation failed. Please try again.");

      // For development: Create mock quiz if backend fails
      setTimeout(() => {
        const newQuiz = {
          id: Date.now(),
          quizDisplayId: `QUIZ${String(Date.now()).slice(-4)}`,
          title: quizTitle || "Generated Quiz",
          createdAt: new Date().toISOString(),
          difficulty: "Medium",
          duration: 30,
          totalQuestions: 5,
        };

        setQuizzes([newQuiz, ...quizzes]);
        setGeneratedQuiz(newQuiz);
        setIsDialogOpen(true);
        setQuizTitle("");
        setLoading(false);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizQuestions = async (quizId) => {
    try {
      // Assuming you have an endpoint to get quiz questions
      const res = await axios.get(`/api/quizzes/${quizId}/questions`);
      return res.data;
    } catch (err) {
      console.error("Error fetching quiz questions:", err);
      // Return dummy questions for development
      return [
        {
          id: 1,
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: "Paris",
          points: 1,
        },
        {
          id: 2,
          question: "Which planet is known as the Red Planet?",
          options: ["Earth", "Mars", "Jupiter", "Venus"],
          correctAnswer: "Mars",
          points: 1,
        },
        {
          id: 3,
          question: "What is 5 + 7?",
          options: ["10", "11", "12", "13"],
          correctAnswer: "12",
          points: 1,
        },
      ];
    }
  };

  // --- Test Taking Functions ---
  const handleTakeTest = async (quiz) => {
    setSelectedQuiz(quiz);
    setTestDialogOpen(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTestSubmitted(false);
    setTestScore(0);
    setTestResult(null);

    // Fetch questions for this quiz
    const questions = await fetchQuizQuestions(quiz.id);
    setTestQuestions(questions);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    let score = 0;
    let totalPoints = 0;

    testQuestions.forEach((question) => {
      totalPoints += question.points;
      if (userAnswers[question.id] === question.correctAnswer) {
        score += question.points;
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);
    const result = {
      score,
      totalPoints,
      percentage,
      totalQuestions: testQuestions.length,
      correctAnswers: testQuestions.filter(
        (q) => userAnswers[q.id] === q.correctAnswer
      ).length,
      wrongAnswers: testQuestions.filter(
        (q) => userAnswers[q.id] && userAnswers[q.id] !== q.correctAnswer
      ).length,
      unanswered: testQuestions.filter((q) => !userAnswers[q.id]).length,
      questions: testQuestions.map((q) => ({
        ...q,
        userAnswer: userAnswers[q.id],
        isCorrect: userAnswers[q.id] === q.correctAnswer,
      })),
    };

    setTestScore(score);
    setTestResult(result);
    setTestSubmitted(true);

    // Submit attempt to backend if user is a student
    try {
      const userId = localStorage.getItem("userId"); // Assuming you store user ID
      if (userId && selectedQuiz) {
        const attemptData = {
          userId: parseInt(userId),
          quizId: selectedQuiz.id,
          score: score,
          totalQuestions: testQuestions.length,
          percentage: percentage,
          completedAt: new Date().toISOString(),
        };

        await axios.post("/api/quizzes/submit-attempt", attemptData);
      }
    } catch (err) {
      console.error("Error submitting attempt:", err);
    }
  };

  const handleCloseTest = () => {
    setTestDialogOpen(false);
    setSelectedQuiz(null);
    setTestQuestions([]);
    setUserAnswers({});
    setTestSubmitted(false);
    setTestScore(0);
    setTestResult(null);
  };

  const handleRetakeTest = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTestSubmitted(false);
    setTestScore(0);
    setTestResult(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  const currentQuestion = testQuestions[currentQuestionIndex];

  return (
    <Box sx={{ p: 4, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: "bold", color: "#1e293b" }}
      >
        Instructor Dashboard
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3, color: "#64748b" }}>
        Create, manage, and test quizzes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* --- Quiz Generation Section --- */}
      <Paper sx={{ p: 4, borderRadius: 3, mb: 5 }}>
        <Typography
          variant="h6"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <AutoAwesomeIcon color="primary" /> Generate New Quiz
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            gap: 3,
          }}
        >
          <TextField
            select
            label="Course"
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            <MenuItem value="">Select Course</MenuItem>
            {courses.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Subject"
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            disabled={!selectedCourse}
          >
            <MenuItem value="">Select Subject</MenuItem>
            {subjects.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={!selectedSubject}
          >
            <MenuItem value="">Select Topic</MenuItem>
            {topics.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quiz Title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Enter quiz title"
            error={quizTitle.length > 0 && quizTitle.length < 5}
            helperText={
              quizTitle.length > 0 && quizTitle.length < 5
                ? "Title must be at least 5 characters"
                : ""
            }
          />
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleGenerateQuiz}
          disabled={
            !quizTitle.trim() ||
            quizTitle.length < 5 ||
            !selectedTopic ||
            loading
          }
          sx={{ mt: 4, px: 6, fontWeight: "bold" }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Generate Quiz (AI)"
          )}
        </Button>
      </Paper>

      {/* --- Quizzes Table --- */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <QuizIcon color="primary" /> Available Quizzes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {quizzes.length} quiz{quizzes.length !== 1 ? "es" : ""} found
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                <TableCell>
                  <b>Quiz ID</b>
                </TableCell>
                <TableCell>
                  <b>Title</b>
                </TableCell>
                <TableCell>
                  <b>Difficulty</b>
                </TableCell>
                <TableCell>
                  <b>Questions</b>
                </TableCell>
                <TableCell>
                  <b>Duration</b>
                </TableCell>
                <TableCell>
                  <b>Date</b>
                </TableCell>
                <TableCell>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id} hover>
                  <TableCell sx={{ color: "#2563eb", fontWeight: "bold" }}>
                    {quiz.quizDisplayId}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{quiz.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={quiz.difficulty || "Easy"}
                      color={getDifficultyColor(quiz.difficulty)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{quiz.totalQuestions || 5}</TableCell>
                  <TableCell>{quiz.duration || 30} min</TableCell>
                  <TableCell>
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleTakeTest(quiz)}
                      >
                        Take Test
                      </Button>
                      <Button size="small">Edit</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- Test Taking Dialog --- */}
      <Dialog
        open={testDialogOpen}
        onClose={handleCloseTest}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {selectedQuiz?.title || "Take a Test"}
            </Typography>
            <IconButton onClick={handleCloseTest} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {testSubmitted ? (
            // Test Results View
            <Box sx={{ p: 2 }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  color={
                    testResult.percentage >= 70 ? "success.main" : "error.main"
                  }
                >
                  Test Completed!
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {testResult.percentage}%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Score: {testResult.score}/{testResult.totalPoints}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 2,
                  mb: 4,
                }}
              >
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <CheckCircleIcon
                    color="success"
                    sx={{ fontSize: 40, mb: 1 }}
                  />
                  <Typography variant="h6">
                    {testResult.correctAnswers}
                  </Typography>
                  <Typography variant="body2">Correct</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <CancelIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">
                    {testResult.wrongAnswers}
                  </Typography>
                  <Typography variant="body2">Wrong</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontSize: 40, mb: 1 }}>
                    ?
                  </Typography>
                  <Typography variant="h6">{testResult.unanswered}</Typography>
                  <Typography variant="body2">Unanswered</Typography>
                </Paper>
              </Box>

              {/* Detailed Results */}
              <Typography variant="h6" gutterBottom>
                Detailed Answers:
              </Typography>
              {testResult.questions.map((q, index) => (
                <Paper
                  key={q.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: q.isCorrect ? "#f0f9ff" : "#fef2f2",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Typography fontWeight="medium">
                      Q{index + 1}: {q.question}
                    </Typography>
                    <Chip
                      label={q.isCorrect ? "Correct" : "Incorrect"}
                      color={q.isCorrect ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                  <Typography>
                    Your answer:{" "}
                    <strong>{q.userAnswer || "Not answered"}</strong>
                  </Typography>
                  <Typography>
                    Correct answer:{" "}
                    <strong style={{ color: "#10b981" }}>
                      {q.correctAnswer}
                    </strong>
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            // Test Taking View
            <>
              {testQuestions.length > 0 && (
                <>
                  <Stepper
                    activeStep={currentQuestionIndex}
                    alternativeLabel
                    sx={{ mb: 4 }}
                  >
                    {testQuestions.map((q, index) => (
                      <Step key={q.id}>
                        <StepLabel>Q{index + 1}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  {currentQuestion && (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Question {currentQuestionIndex + 1} of{" "}
                        {testQuestions.length}
                      </Typography>

                      <Paper sx={{ p: 3, mb: 3, bgcolor: "#f8fafc" }}>
                        <Typography variant="h6" gutterBottom>
                          {currentQuestion.question}
                        </Typography>

                        <RadioGroup
                          value={userAnswers[currentQuestion.id] || ""}
                          onChange={(e) =>
                            handleAnswerSelect(
                              currentQuestion.id,
                              e.target.value
                            )
                          }
                        >
                          {currentQuestion.options.map((option, idx) => (
                            <FormControlLabel
                              key={idx}
                              value={option}
                              control={<Radio />}
                              label={
                                <Typography variant="body1">
                                  {option}
                                </Typography>
                              }
                              sx={{
                                mb: 1,
                                p: 1,
                                borderRadius: 1,
                                bgcolor:
                                  userAnswers[currentQuestion.id] === option
                                    ? "#e0f2fe"
                                    : "transparent",
                                "&:hover": { bgcolor: "#f1f5f9" },
                              }}
                            />
                          ))}
                        </RadioGroup>
                      </Paper>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 3,
                        }}
                      >
                        <Button
                          onClick={handlePrevQuestion}
                          disabled={currentQuestionIndex === 0}
                          variant="outlined"
                        >
                          Previous
                        </Button>

                        <Box sx={{ display: "flex", gap: 2 }}>
                          {Object.keys(userAnswers).length ===
                          testQuestions.length ? (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={handleSubmitTest}
                            >
                              Submit Test
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              onClick={handleSubmitTest}
                            >
                              Submit Anyway
                            </Button>
                          )}

                          {currentQuestionIndex < testQuestions.length - 1 ? (
                            <Button
                              variant="contained"
                              onClick={handleNextQuestion}
                              disabled={!userAnswers[currentQuestion.id]}
                            >
                              Next Question
                            </Button>
                          ) : null}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          {testSubmitted ? (
            <>
              <Button onClick={handleRetakeTest} variant="outlined">
                Retake Test
              </Button>
              <Button onClick={handleCloseTest} variant="contained">
                Finish
              </Button>
            </>
          ) : (
            <Button onClick={handleCloseTest}>Cancel Test</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* --- Success Dialog --- */}
      <QuizResultDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        quizData={generatedQuiz}
      />
    </Box>
  );
};

export default QuizPage;
