// src/pages/Instructor/InstructorPage.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import CoursesPage from "./CoursesPage";
import SubjectsPage from "./SubjectsPage";
import TopicsPage from "./TopicsPage";
import QuizPage from "./QuizPage";

const InstructorPage = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Routes>
          <Route index element={<Navigate to="courses" replace />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="quizzes" element={<QuizPage />} />
          <Route path="topic/:topicId" element={<TopicsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default InstructorPage;
