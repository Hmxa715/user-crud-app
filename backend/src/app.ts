import express from "express";
import cors from "cors";
import userRoutes from "./routes/users.routes";
import path from "path";
import { initDB } from "./db";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/users", userRoutes);

// Init DB safely
initDB()
  .then(() => console.log("Database initialized"))
  .catch(err => console.error("DB init failed:", err));

export default app;
