import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
} from "@mui/icons-material";

const TopicTable = ({ topics, onDelete }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case "PDF":
        return "error";
      case "VIDEO":
        return "primary";
      case "LINK":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell>
              <strong>Topic Name</strong>
            </TableCell>
            <TableCell>
              <strong>Type</strong>
            </TableCell>
            <TableCell>
              <strong>Subject</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id} hover>
              <TableCell>{topic.name}</TableCell>
              <TableCell>
                <Chip
                  label={topic.type}
                  size="small"
                  color={getTypeColor(topic.type)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{topic.subjectName || "Unassigned"}</TableCell>
              <TableCell align="right">
                <IconButton color="error" onClick={() => onDelete(topic.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TopicTable;
