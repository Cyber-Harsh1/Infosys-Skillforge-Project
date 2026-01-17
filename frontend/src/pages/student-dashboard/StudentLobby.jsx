import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentLobby = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get("/quizzes/all");
        setQuizzes(res.data);
        setFilteredQuizzes(res.data);

        // ✅ Extract unique topics/categories from the quiz data
        // We assume your Quiz object has a 'topicName' or 'topicId'
        const uniqueCategories = [
          "All",
          ...new Set(
            res.data.map((q) => q.topic?.name || `Topic ${q.topicId}`)
          ),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching quizzes", err);
      }
    };
    fetchQuizzes();
  }, []);

  // ✅ Trigger filtering whenever search term or category changes
  useEffect(() => {
    let result = quizzes;

    if (selectedCategory !== "All") {
      result = result.filter(
        (q) => (q.topic?.name || `Topic ${q.topicId}`) === selectedCategory
      );
    }

    if (searchTerm) {
      result = result.filter((q) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuizzes(result);
  }, [searchTerm, selectedCategory, quizzes]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quiz Lobby</h2>
        <span className="badge bg-primary rounded-pill">
          {filteredQuizzes.length} Quizzes Found
        </span>
      </div>

      {/* --- SEARCH & FILTER SECTION --- */}
      <div className="row g-3 mb-5">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-md-8">
          <div className="d-flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm rounded-pill px-3 shadow-sm ${
                  selectedCategory === cat
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- QUIZ GRID --- */}
      <div className="row g-4">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div className="col-md-6 col-lg-4" key={quiz.id}>
              <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-light text-primary border me-2">
                      {quiz.topic?.name || `Topic ${quiz.topicId}`}
                    </span>
                    <small className="text-muted">{quiz.displayId}</small>
                  </div>
                  <h5 className="card-title fw-bold mb-3">{quiz.title}</h5>
                  <div className="mt-auto">
                    <button
                      className="btn btn-primary w-100 rounded-3 fw-bold"
                      onClick={() =>
                        navigate(`/student/take-quiz/${quiz.displayId}`)
                      }
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <p className="text-muted fs-5">
              No quizzes found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLobby;
