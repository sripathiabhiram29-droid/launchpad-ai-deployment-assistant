import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "LaunchPad AI",
    status: "running",
    service: "backend",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "launchpad-ai-backend",
  });
});

app.use("/api/analyze", analyzeRoute);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
