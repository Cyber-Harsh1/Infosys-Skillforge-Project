const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const authorizeRole = require("../middleware/authorizeRole");

// Instructor Dashboard
router.get("/dashboard",
  verifyToken,
  authorizeRole("INSTRUCTOR"),
  (req, res) => {
    res.json({
      message: "Instructor Dashboard Accessed",
      instructor: req.user
    });
  }
);

module.exports = router;
