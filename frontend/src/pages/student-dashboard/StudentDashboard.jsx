import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure bootstrap is imported

const StudentDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Suggested item data matching your screenshot
  const suggestion = {
    topicId: 16,
    difficulty: "EASY",
    lastScore: 0,
    status: "Not yet completed",
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await api.get(`/quizzes/user-attempts/${userId}`);
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching progress", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Matching color logic to your screenshot
  const getAlertClass = (score) => {
    if (score < 50) return "alert-danger"; // Red for low scores
    if (score < 80) return "alert-warning"; // Yellow for medium
    return "alert-success"; // Green for high
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Student Dashboard</h2>

      {/* --- Suggested Learning (Grey Box) --- */}
      <div className="p-4 bg-light border rounded-3 mb-5">
        <h5 className="fw-bold mb-3">Next Suggested Learning</h5>
        <div className="ps-3">
          <p className="mb-1">
            <strong>Topic ID:</strong> {suggestion.topicId}
          </p>
          <p className="mb-1">
            <strong>Difficulty:</strong> {suggestion.difficulty}
          </p>
          <p className="mb-2">
            <strong>Last Quiz Score:</strong> {suggestion.lastScore}
          </p>
          <p className="text-muted small">
            <i className="bi bi-journal-text me-2"></i>
            {suggestion.status}
          </p>
        </div>
      </div>

      {/* --- Your Progress (Color-coded list) --- */}
      <h5 className="fw-bold mb-3">Your Progress</h5>
      <div className="row g-3">
        {history.length > 0 ? (
          history.map((item) => (
            <div key={item.id} className="col-12">
              <div
                className={`alert ${getAlertClass(
                  item.score
                )} border-0 shadow-sm py-3 px-4`}
              >
                <p className="mb-1 small text-dark">
                  <strong>Topic ID:</strong> {item.quizId}
                </p>
                <h4 className="fw-bold mb-1 text-dark">Score: {item.score}</h4>
                <p className="mb-0 small text-dark">
                  Next Difficulty: {item.score >= 80 ? "MEDIUM" : "EASY"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center text-muted py-4">
            No progress recorded yet. Start a quiz to see your scores!
          </div>
        )}
      </div>

      {/* Action Button to go to Lobby */}
      <div className="mt-4">
        <button
          className="btn btn-primary btn-lg rounded-pill px-4"
          onClick={() => (window.location.href = "/student/lobby")}
        >
          Explore All Quizzes
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
