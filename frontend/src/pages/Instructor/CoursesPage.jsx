import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import CourseForm from "../../components/CourseForm";
import CourseTable from "../../components/CourseTable";
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

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ===============================
  // FETCH COURSES
  // ===============================
  const fetchCourses = useCallback(async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setErrorMsg("You are not logged in. Please sign in to view courses.");
      return;
    }

    // Client-side role check before even making the request
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
      setErrorMsg("Access Denied: You do not have Instructor privileges.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // ✅ Interceptor in api.jsx attaches Token automatically
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);

      const status = err.response?.status;
      if (status === 401) {
        setErrorMsg("Your session has expired. Please log in again.");
      } else if (status === 403) {
        setErrorMsg(
          "Access Denied: Your account does not have permission to view courses."
        );
      } else {
        setErrorMsg("Server error: Could not connect to the backend.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ===============================
  // DELETE COURSE
  // ===============================
  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await api.delete(`/courses/${courseId}`);
      // Refresh the list after deletion
      fetchCourses();
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg("Failed to delete course. You might not have permission.");
    }
  };

  const handleEdit = (course) => {
    console.log("Edit course triggered for:", course);
    // Logic for editing (e.g., navigate(`/edit-course/${course.id}`))
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="800"
        sx={{ color: "#0f172a", letterSpacing: "-0.5px" }}
      >
        Instructor Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Manage your curriculum and student materials.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {errorMsg && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mb: 3, borderRadius: 2 }}
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
        {/* Left Column: Form */}
        <Box>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "700" }}>
              Create Course
            </Typography>
            <CourseForm onCourseAdded={fetchCourses} />
          </Paper>
        </Box>

        {/* Right Column: Table */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "700" }}>
            Your Catalog
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 8,
              }}
            >
              <CircularProgress size={32} />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading courses...
              </Typography>
            </Box>
          ) : courses.length > 0 ? (
            <CourseTable
              courses={courses}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 3,
                borderStyle: "dashed",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {errorMsg
                  ? "Data unavailable"
                  : "No courses found. Start by creating one!"}
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CoursesPage;
