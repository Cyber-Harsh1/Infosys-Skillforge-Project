import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import api from "../../services/api";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

// ✅ Import PDF libraries
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReportsPage = () => {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get("/quizzes/attempts");
        setAttempts(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchAttempts();
  }, []);

  // --- ✅ PDF GENERATION LOGIC ---
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add Title to PDF
    doc.setFontSize(18);
    doc.text("SkillForge - Quiz Performance Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Prepare Table Data
    const tableColumn = [
      "Student ID",
      "Quiz ID",
      "Score",
      "Percentage",
      "Date",
      "Status",
    ];
    const tableRows = [];

    attempts.forEach((attempt) => {
      const percentage = Math.round(
        (attempt.score / (attempt.totalQuestions || 1)) * 100
      );
      const attemptData = [
        `User #${attempt.userId}`,
        `QZ-${attempt.quizId}`,
        `${attempt.score} / ${attempt.totalQuestions}`,
        `${percentage}%`,
        new Date(attempt.completedAt).toLocaleDateString(),
        percentage >= 50 ? "Passed" : "Failed",
      ];
      tableRows.push(attemptData);
    });

    // Generate Table in PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] }, // Blue color matching your UI
    });

    // Save the PDF
    doc.save(`Quiz_Report_${new Date().getTime()}.pdf`);
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "error";
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AssessmentIcon sx={{ fontSize: 40, color: "#2563eb" }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Quiz Reports
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor student performance
            </Typography>
          </Box>
        </Box>

        {/* ✅ NEW DOWNLOAD BUTTON */}
        <Button
          variant="contained"
          color="error"
          startIcon={<PictureAsPdfIcon />}
          onClick={downloadPDF}
          disabled={attempts.length === 0}
          sx={{ fontWeight: "bold", borderRadius: 2 }}
        >
          Download PDF
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f1f5f9" }}>
            <TableRow>
              <TableCell>
                <b>Student ID</b>
              </TableCell>
              <TableCell>
                <b>Quiz ID</b>
              </TableCell>
              <TableCell>
                <b>Score</b>
              </TableCell>
              <TableCell>
                <b>Percentage</b>
              </TableCell>
              <TableCell>
                <b>Completed Date</b>
              </TableCell>
              <TableCell>
                <b>Status</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attempts.map((attempt) => {
              const percentage = Math.round(
                (attempt.score / (attempt.totalQuestions || 1)) * 100
              );
              return (
                <TableRow key={attempt.id} hover>
                  <TableCell>User #{attempt.userId}</TableCell>
                  <TableCell>QZ-{attempt.quizId}</TableCell>
                  <TableCell>
                    {attempt.score} / {attempt.totalQuestions}
                  </TableCell>
                  <TableCell>{percentage}%</TableCell>
                  <TableCell>
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={percentage >= 50 ? "Passed" : "Failed"}
                      color={getScoreColor(
                        attempt.score,
                        attempt.totalQuestions
                      )}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReportsPage;
