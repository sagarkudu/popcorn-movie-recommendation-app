import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import recommendationRoutes from "./routes/recommendation.routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "PopChoice API is running",
  });
});

// Routes
app.use("/api", recommendationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`PopChoice API running on http://localhost:${PORT}`);
});
