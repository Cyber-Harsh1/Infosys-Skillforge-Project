const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

// ✅ Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ✅ Routes
const authRoutes = require("./src/routes/authRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const subjectRoutes = require("./src/routes/subjectRoutes");
const topicRoutes = require("./src/routes/topicRoutes");
const userRoutes = require("./src/routes/userRoutes"); // optional if you add user CRUD
const instructorRoutes = require("./src/routes/instructorRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/users", userRoutes);
app.use("/api/instructor",instructorRoutes);

// ✅ MySQL connection
async function start() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    app.set("db", connection);
    console.log("✅ MySQL connected");

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1);
  }
}

start();
