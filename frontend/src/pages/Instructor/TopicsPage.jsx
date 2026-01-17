import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import TopicForm from "../../components/TopicForm";
import TopicTable from "../../components/TopicTable";
// ✅ IMPORT ADDED: MaterialUpload component
import MaterialUpload from "../../components/MaterialUpload";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from "@mui/material";

const TopicsPage = () => {
  const { topicId } = useParams(); // Gets the ID from the URL when you click a topic
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchInitialData = useCallback(async () => {
    const role = localStorage.getItem("role");
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
      setErrorMsg("Access Denied: You do not have Instructor privileges.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const [courseRes, topicRes] = await Promise.all([
        api.get("/courses"),
        api.get("/topics"),
      ]);
      setCourses(courseRes.data);
      setTopics(topicRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setErrorMsg("Server error: Could not load topics or courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get("/topics");
      setTopics(res.data);
    } catch (err) {
      setErrorMsg("Failed to refresh topics.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      await api.delete(`/topics/${id}`);
      fetchTopics();
    } catch (err) {
      setErrorMsg(
        "Failed to delete topic. Ensure it has no materials attached."
      );
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="800"
        sx={{ color: "#1e293b" }}
      >
        Topics Management
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {errorMsg && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setErrorMsg("")}
        >
          {errorMsg}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: 4,
        }}
      >
        {/* Left Column: Create Topic Form */}
        <Box>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "700" }}>
              New Topic
            </Typography>
            <TopicForm courses={courses} onTopicAdded={fetchTopics} />
          </Paper>
        </Box>

        {/* Right Column: List and Material Upload */}
        <Box>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", mb: 3 }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "700" }}>
              Current Topics List
            </Typography>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : topics.length > 0 ? (
              <TopicTable
                topics={topics}
                onDelete={handleDelete}
                activeTopicId={topicId}
              />
            ) : (
              <Typography color="text.secondary" align="center" py={4}>
                No topics found.
              </Typography>
            )}
          </Paper>

          {/* ✅ IMPLEMENTED: Conditional Material Upload */}
          {topicId ? (
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: "700", color: "#2563eb" }}
              >
                Topic Resources Management
              </Typography>
              <MaterialUpload topicId={topicId} onUploadSuccess={fetchTopics} />
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                borderStyle: "dashed",
                bgcolor: "#f8fafc",
              }}
            >
              <Typography color="text.secondary">
                Select a topic from the table above to upload PDF, Video, or
                Link materials.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TopicsPage;
