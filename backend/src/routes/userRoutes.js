const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/* ===========================
   ADMIN ONLY ROUTES
=========================== */

// Get all users
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  userController.getAllUsers
);

// Get user by ID
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  userController.getUserById
);

// Update user
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  userController.updateUser
);

// Delete user
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  userController.deleteUser
);

module.exports = router;
