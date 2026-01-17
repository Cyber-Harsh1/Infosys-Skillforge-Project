import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import SubjectForm from "../../components/SubjectForm";
import SubjectTable from "../../components/SubjectTable";
import { useNavigate } from "react-router-dom";

import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Divider,
} from "@mui/material";

const SubjectPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]); // ✅ MISSING STATE
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ===============================
  // FETCH COURSES (FOR DROPDOWN)
  // ===============================
  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get("/courses");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch courses error:", err);
      setCourses([]);
    }
  }, []);

  // ===============================
  // FETCH SUBJECTS
  // ===============================
  const fetchSubjects = useCallback(async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setErrorMsg("You are not logged in. Please sign in to view subjects.");
      return;
    }

    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
      setErrorMsg("Access Denied: You do not have Instructor privileges.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.get("/subjects");
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      const status = err.response?.status;
      if (status === 401) {
        setErrorMsg("Your session has expired. Please log in again.");
      } else if (status === 403) {
        setErrorMsg("Access Denied: Permission error.");
      } else {
        setErrorMsg("Server error: Could not connect to backend.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ===============================
  // DELETE SUBJECT
  // ===============================
  const handleDelete = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject?"))
      return;

    try {
      await api.delete(`/subjects/${subjectId}`);
      fetchSubjects();
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg("Failed to delete subject.");
    }
  };

  // ===============================
  // ON LOAD
  // ===============================
  useEffect(() => {
    fetchCourses(); // ✅ IMPORTANT
    fetchSubjects();
  }, [fetchCourses, fetchSubjects]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" fontWeight="800" gutterBottom>
        Subject Management
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Define specific subjects and modules for your courses.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {errorMsg && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mb: 3 }}
          onClose={() => setErrorMsg("")}
          action={
            (errorMsg.includes("session") ||
              errorMsg.includes("logged in")) && (
              <Button
                color="inherit"
                size="small"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            )
          }
        >
          {errorMsg}
        </Alert>
      )}

      <Box
        sx={{ display: "grid", gridTemplateColumns: { md: "1fr 2fr" }, gap: 4 }}
      >
        {/* LEFT: FORM */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
            Add New Subject
          </Typography>

          {/* ✅ PASS COURSES */}
          <SubjectForm courses={courses} onSubjectAdded={fetchSubjects} />
        </Paper>

        {/* RIGHT: TABLE */}
        <Box>
          <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
            Subject List
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading subjects...
              </Typography>
            </Box>
          ) : subjects.length > 0 ? (
            <SubjectTable subjects={subjects} onDelete={handleDelete} />
          ) : (
            <Paper sx={{ p: 6, textAlign: "center", borderStyle: "dashed" }}>
              <Typography color="text.secondary">
                No subjects found. Use the form to add some!
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SubjectPage;
