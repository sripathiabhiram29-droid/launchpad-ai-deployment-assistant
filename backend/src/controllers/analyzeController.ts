import type { Request, Response } from "express";
import { analyzeRepository as analyzeRepo } from "../services/githubAnalyzer";
import {
  GITHUB_RATE_LIMIT_ERROR_MESSAGE,
  isGitHubRateLimitError,
} from "../services/githubService";

export async function analyzeRepository(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const repository = req.body?.repository;

    console.log(
      "Repository URL received:",
      typeof repository === "string" ? repository : (repository ?? "(missing)"),
    );

    if (!repository) {
      res.status(400).json({
        error: "Repository URL required",
      });
      return;
    }

    const analysis = await analyzeRepo(repository);

    res.json({
      repository,
      analysis,
    });
  } catch (error) {
    logAnalysisError(error);

    if (isGitHubRateLimitError(error)) {
      res.status(429).json({
        error: GITHUB_RATE_LIMIT_ERROR_MESSAGE,
      });
      return;
    }

    res.status(500).json({
      error: "Repository analysis failed",
    });
  }
}

function logAnalysisError(error: unknown): void {
  if (isGitHubApiError(error)) {
    logErrorDetails("GitHub API error", error);
    return;
  }

  if (isArchitectureEngineError(error)) {
    logErrorDetails("Architecture engine error", error);
    return;
  }

  logErrorDetails("Unexpected repository analysis exception", error);
}

function isGitHubApiError(error: unknown): boolean {
  if (isGitHubRateLimitError(error)) {
    return true;
  }

  if (!isRecord(error)) {
    return false;
  }

  const status = error.status;
  const name = typeof error.name === "string" ? error.name.toLowerCase() : "";
  const message = getErrorMessage(error).toLowerCase();

  return (
    (typeof status === "number" && status >= 400) ||
    name.includes("requesterror") ||
    message.includes("github") ||
    message.includes("octokit")
  );
}

function isArchitectureEngineError(error: unknown): boolean {
  return getErrorMessage(error)
    .toLowerCase()
    .includes("architecture recommendation");
}

function logErrorDetails(category: string, error: unknown): void {
  const message = getErrorMessage(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[Analyze Controller] ${category}: ${message}`);
  console.error(stack ?? "Stack trace unavailable");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  return String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
