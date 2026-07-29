import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

export const GITHUB_RATE_LIMIT_ERROR_MESSAGE =
  "GitHub API rate limit exceeded. Configure GITHUB_TOKEN.";

export class GitHubRateLimitError extends Error {
  constructor() {
    super(GITHUB_RATE_LIMIT_ERROR_MESSAGE);
    this.name = "GitHubRateLimitError";
  }
}

const githubToken = process.env.GITHUB_TOKEN?.trim();

if (!githubToken) {
  console.warn(
    "GITHUB_TOKEN is not configured. GitHub API requests will be unauthenticated and subject to lower rate limits.",
  );
}

export const githubClient = new Octokit({
  auth: githubToken || undefined,
});

export async function getRepositoryInfo(repositoryUrl: string) {
  const parts = repositoryUrl.replace("https://github.com/", "").split("/");
  const owner = parts[0];
  const repo = parts[1];

  try {
    const response = await githubClient.repos.get({
      owner,
      repo,
    });

    return response.data;
  } catch (error) {
    throw normalizeGitHubApiError(error);
  }
}

export function isGitHubRateLimitError(error: unknown): boolean {
  if (error instanceof GitHubRateLimitError) {
    return true;
  }

  if (!isRecord(error)) {
    return false;
  }

  const status = error.status;
  const message =
    typeof error.message === "string" ? error.message.toLowerCase() : "";
  const response = isRecord(error.response) ? error.response : undefined;
  const headers =
    response && isRecord(response.headers) ? response.headers : undefined;
  const remainingRequests = headers?.["x-ratelimit-remaining"];

  return (
    status === 429 ||
    (status === 403 &&
      (String(remainingRequests) === "0" || message.includes("rate limit")))
  );
}

export function normalizeGitHubApiError(error: unknown): Error {
  if (isGitHubRateLimitError(error)) {
    return new GitHubRateLimitError();
  }

  return error instanceof Error
    ? error
    : new Error("An unknown GitHub API error occurred");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
