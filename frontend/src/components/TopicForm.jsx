import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";
import api from "../services/api";

const TopicForm = ({ courses, onTopicAdded }) => {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("TEXT");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name || !selectedSubjectId) {
      setError("Name and Subject are required");
      return;
    }

    if ((type === "TEXT" || type === "LINK") && !content) {
      setError(`${type === "TEXT" ? "Content" : "URL"} is required`);
      return;
    }

    if (type !== "TEXT" && type !== "LINK" && !file) {
      setError(`${type} file is required`);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("subjectId", selectedSubjectId);

    if (type === "TEXT" || type === "LINK") {
      formData.append("content", content);
    } else if (file) {
      formData.append("file", file);
    }

    try {
      setLoading(true);
      // Don't manually set Content-Type - let the interceptor handle it
      const response = await api.post("/topics/upload", formData);

      console.log("✅ Topic created successfully:", response.data);

      // Reset Form
      setName("");
      setContent("");
      setType("TEXT");
      setSelectedSubjectId("");
      setFile(null);
      onTopicAdded();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error adding topic";
      setError(errorMessage);
      console.error("❌ Error adding topic:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Topic Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

        <TextField
          select
          label="Topic Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
        >
          <MenuItem value="TEXT">Text Content</MenuItem>
          <MenuItem value="PDF">PDF Document</MenuItem>
          <MenuItem value="VIDEO">Video Lecture</MenuItem>
          <MenuItem value="LINK">External Link</MenuItem>
        </TextField>

        <TextField
          select
          label="Assign to Subject"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          required
          fullWidth
        >
          {courses
            .flatMap((c) => c.subjects || [])
            .map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
        </TextField>

        {/* ✅ CONDITIONAL INPUT: Text/Link vs File Upload */}
        {type === "TEXT" || type === "LINK" ? (
          <TextField
            label={type === "TEXT" ? "Content" : "URL Link"}
            multiline
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            placeholder={
              type === "LINK" ? "https://example.com" : "Enter topic content"
            }
          />
        ) : (
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            sx={{ py: 1.5 }}
          >
            {file ? file.name : `Select ${type} File`}
            <input
              type="file"
              hidden
              accept={type === "PDF" ? ".pdf" : "video/*"}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Button>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ py: 1.5 }}
          disabled={loading}
        >
          {loading ? "Creating Topic..." : "Create Topic"}
        </Button>
      </Stack>
    </Box>
  );
};

export default TopicForm;
