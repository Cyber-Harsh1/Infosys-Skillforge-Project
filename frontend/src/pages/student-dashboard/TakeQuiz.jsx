import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const TakeQuiz = () => {
  const { displayId } = useParams();
  const navigate = useNavigate();

  // State Management
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      // Check authentication first
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || role !== "STUDENT") {
        setError("Unauthorized: Please log in as a student");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/quizzes/public/${displayId}`);
        setQuiz(res.data);
      } catch (err) {
        console.error("Error loading quiz:", err);

        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
        } else if (err.response?.status === 403) {
          setError("You don't have permission to access this quiz.");
          setTimeout(() => navigate("/student/lobby"), 2000);
        } else {
          setError("Quiz not found or failed to load!");
          setTimeout(() => navigate("/student/lobby"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [displayId, navigate]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished) {
      handleSubmit();
    }
  }, [timeLeft, isFinished]);

  const handleOptionSelect = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: option });
  };

  const handleSubmit = async () => {
    setIsFinished(true);
    let score = 0;

    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        score++;
      }
    });

    try {
      await api.post("/quizzes/submit-attempt", {
        userId: localStorage.getItem("userId"),
        quizId: quiz.id,
        score: score,
        totalQuestions: quiz.questions.length,
        timestamp: new Date().toISOString(),
      });
      navigate("/student-dashboard");
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Quiz...</p>
      </div>
    );

  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Redirecting...</p>
        </div>
      </div>
    );

  if (!quiz) return <div className="text-center mt-5">Quiz not found.</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Header with Timer */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold">{quiz.title}</h4>
            <div
              className={`badge ${
                timeLeft < 60 ? "bg-danger" : "bg-dark"
              } p-2 fs-6`}
            >
              ⏱️ {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress mb-4" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Question Card */}
          <div className="card shadow-sm border-0 p-4 mb-4">
            <p className="text-muted small">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
            <h5 className="mb-4 fw-bold">{currentQuestion.text}</h5>

            <div className="d-grid gap-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`btn text-start p-3 border-2 ${
                    selectedAnswers[currentQuestionIndex] === option
                      ? "btn-primary border-primary"
                      : "btn-outline-secondary border-light bg-light text-dark"
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary px-4 rounded-pill"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            >
              Previous
            </button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                className="btn btn-success px-5 rounded-pill fw-bold"
                onClick={handleSubmit}
              >
                Submit Quiz
              </button>
            ) : (
              <button
                className="btn btn-primary px-5 rounded-pill"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
