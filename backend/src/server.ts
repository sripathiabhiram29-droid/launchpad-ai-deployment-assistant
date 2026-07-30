import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze";

dotenv.config();

const app = express();

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

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

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("Unhandled Express error:", {
    message,
    stack: stack ?? "Stack trace unavailable",
  });

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
