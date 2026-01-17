// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();

// ✅ Import controller functions from src/controllers/authController.js
const {
  register,
  login,
  studentDashboard,
  instructorDashboard,
  adminDashboard,
} = require("../controllers/authController");


// ✅ Import middleware from src/middleware/authMiddleware.js
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// -------------------- Public Routes --------------------
router.post("/register", register);
router.post("/login", login);

// -------------------- Protected Routes --------------------
router.get(
  "/dashboard/student",
  verifyToken,
  checkRole("STUDENT"),
  studentDashboard
);

router.get(
  "/dashboard/instructor",
  verifyToken,
  checkRole("INSTRUCTOR"),
  instructorDashboard
);

router.get(
  "/dashboard/admin",
  verifyToken,
  checkRole("ADMIN"),
  adminDashboard
);

module.exports = router;
