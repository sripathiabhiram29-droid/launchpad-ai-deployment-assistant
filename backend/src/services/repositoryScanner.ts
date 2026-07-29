import {
  GitHubRateLimitError,
  githubClient,
  isGitHubRateLimitError,
} from "./githubService";

const FRONTEND_TECHNOLOGIES = ["React", "Next.js", "Angular", "Vue"] as const;
const BACKEND_TECHNOLOGIES = [
  "Node.js Express",
  "FastAPI",
  "Django",
  "Spring Boot",
] as const;
const DATABASE_TECHNOLOGIES = [
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "DynamoDB",
] as const;

export type FrontendTechnology = (typeof FRONTEND_TECHNOLOGIES)[number];
export type BackendTechnology = (typeof BACKEND_TECHNOLOGIES)[number];
export type DatabaseTechnology = (typeof DATABASE_TECHNOLOGIES)[number];

export interface TechnologyStack {
  frontend: FrontendTechnology[];
  backend: BackendTechnology[];
  database: DatabaseTechnology[];
  containerized: boolean;
  infrastructure: string[];
  cicd: string[];
}

export interface DeploymentRecommendation {
  platform: string;
  services: string[];
  strategy: string;
}

export interface RepositoryScanResult {
  technologyStack: TechnologyStack;
  deploymentRecommendation: DeploymentRecommendation;
}

type FileKind =
  | "packageJson"
  | "requirements"
  | "spring"
  | "dockerfile"
  | "compose"
  | "workflow"
  | "terraform"
  | "kubernetes";

interface RepositoryFileMetadata {
  path: string;
  sha: string;
  size: number;
  kind: FileKind;
}

interface RepositoryFile extends RepositoryFileMetadata {
  content: string;
}

interface DetectionState {
  frontend: Set<FrontendTechnology>;
  backend: Set<BackendTechnology>;
  database: Set<DatabaseTechnology>;
  containerized: boolean;
  infrastructure: Set<string>;
  cicd: Set<string>;
}

const MAX_FILE_SIZE_BYTES = 1_000_000;
const FILE_FETCH_CONCURRENCY = 6;
const FILE_LIMITS: Record<FileKind, number> = {
  packageJson: 6,
  requirements: 4,
  spring: 4,
  dockerfile: 4,
  compose: 3,
  workflow: 6,
  terraform: 6,
  kubernetes: 6,
};

export async function scanRepository(
  owner: string,
  repository: string,
): Promise<RepositoryScanResult> {
  const normalizedOwner = owner.trim();
  const normalizedRepository = repository.trim();

  if (!normalizedOwner || !normalizedRepository) {
    throw new Error("GitHub owner and repository name are required");
  }

  try {
    const { data: repositoryMetadata } = await githubClient.repos.get({
      owner: normalizedOwner,
      repo: normalizedRepository,
    });
    const { data: repositoryTree } = await githubClient.git.getTree({
      owner: normalizedOwner,
      repo: normalizedRepository,
      tree_sha: repositoryMetadata.default_branch,
      recursive: "true",
    });

    if (repositoryTree.truncated) {
      console.warn(
        `GitHub returned a truncated repository tree for ${normalizedOwner}/${normalizedRepository}`,
      );
    }

    const state = createDetectionState();
    const treeFiles = repositoryTree.tree
      .filter(
        (entry): entry is typeof entry & { path: string; sha: string } =>
          entry.type === "blob" && Boolean(entry.path) && Boolean(entry.sha),
      )
      .map((entry) => ({
        path: entry.path,
        sha: entry.sha,
        size: entry.size ?? 0,
      }));

    for (const file of treeFiles) {
      applyMetadataSignals(file.path, state);
    }

    const relevantFiles = selectRelevantFiles(treeFiles);
    const fileResults = await fetchRepositoryFiles(
      normalizedOwner,
      normalizedRepository,
      relevantFiles,
    );

    for (const result of fileResults) {
      if (result.status === "fulfilled") {
        analyzeFile(result.value, state);
      } else {
        if (isGitHubRateLimitError(result.reason)) {
          throw new GitHubRateLimitError();
        }

        console.warn(
          `A repository file could not be analyzed: ${getErrorMessage(result.reason)}`,
        );
      }
    }

    const technologyStack = buildTechnologyStack(state);

    return {
      technologyStack,
      deploymentRecommendation: buildDeploymentRecommendation(technologyStack),
    };
  } catch (error) {
    if (isGitHubRateLimitError(error)) {
      throw new GitHubRateLimitError();
    }

    throw new Error(
      `Unable to scan GitHub repository ${normalizedOwner}/${normalizedRepository}: ${getErrorMessage(error)}`,
    );
  }
}

async function fetchRepositoryFiles(
  owner: string,
  repository: string,
  files: RepositoryFileMetadata[],
): Promise<Array<PromiseSettledResult<RepositoryFile>>> {
  const results: Array<PromiseSettledResult<RepositoryFile>> = [];

  for (let index = 0; index < files.length; index += FILE_FETCH_CONCURRENCY) {
    const batch = files.slice(index, index + FILE_FETCH_CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map((file) => fetchRepositoryFile(owner, repository, file)),
    );

    results.push(...batchResults);
  }

  return results;
}

function createDetectionState(): DetectionState {
  return {
    frontend: new Set<FrontendTechnology>(),
    backend: new Set<BackendTechnology>(),
    database: new Set<DatabaseTechnology>(),
    containerized: false,
    infrastructure: new Set<string>(),
    cicd: new Set<string>(),
  };
}

function selectRelevantFiles(
  files: Array<{ path: string; sha: string; size: number }>,
): RepositoryFileMetadata[] {
  const counts = new Map<FileKind, number>();

  return files
    .slice()
    .sort((first, second) => {
      const depthDifference = pathDepth(first.path) - pathDepth(second.path);
      return depthDifference || first.path.localeCompare(second.path);
    })
    .flatMap((file) => {
      const kind = classifyFile(file.path);

      if (!kind || file.size > MAX_FILE_SIZE_BYTES) {
        return [];
      }

      const count = counts.get(kind) ?? 0;

      if (count >= FILE_LIMITS[kind]) {
        return [];
      }

      counts.set(kind, count + 1);
      return [{ ...file, kind }];
    });
}

async function fetchRepositoryFile(
  owner: string,
  repository: string,
  file: RepositoryFileMetadata,
): Promise<RepositoryFile> {
  const { data } = await githubClient.git.getBlob({
    owner,
    repo: repository,
    file_sha: file.sha,
  });
  const content =
    data.encoding === "base64"
      ? Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8")
      : data.content;

  return { ...file, content };
}

function classifyFile(path: string): FileKind | null {
  const normalizedPath = path.toLowerCase();
  const fileName = normalizedPath.split("/").at(-1) ?? normalizedPath;

  if (fileName === "package.json") {
    return "packageJson";
  }

  if (fileName === "requirements.txt") {
    return "requirements";
  }

  if (["pom.xml", "build.gradle", "build.gradle.kts"].includes(fileName)) {
    return "spring";
  }

  if (fileName === "dockerfile" || fileName.startsWith("dockerfile.")) {
    return "dockerfile";
  }

  if (
    [
      "docker-compose.yml",
      "docker-compose.yaml",
      "compose.yml",
      "compose.yaml",
    ].includes(fileName)
  ) {
    return "compose";
  }

  if (
    normalizedPath.startsWith(".github/workflows/") &&
    /\.ya?ml$/.test(fileName)
  ) {
    return "workflow";
  }

  if (fileName.endsWith(".tf")) {
    return "terraform";
  }

  if (isKubernetesManifest(normalizedPath)) {
    return "kubernetes";
  }

  return null;
}

function applyMetadataSignals(path: string, state: DetectionState): void {
  const kind = classifyFile(path);

  if (kind === "dockerfile" || kind === "compose") {
    state.containerized = true;
  }

  if (kind === "terraform") {
    state.infrastructure.add("Terraform");
  }

  if (kind === "kubernetes") {
    state.infrastructure.add("Kubernetes");
  }

  if (kind === "workflow") {
    state.cicd.add("GitHub Actions");
  }
}

function analyzeFile(file: RepositoryFile, state: DetectionState): void {
  switch (file.kind) {
    case "packageJson":
      analyzePackageJson(file.content, state);
      break;
    case "requirements":
      analyzeRequirements(file.content, state);
      break;
    case "spring":
      analyzeSpringConfiguration(file.content, state);
      break;
    case "dockerfile":
      state.containerized = true;
      analyzeRuntimeContent(file.content, state);
      break;
    case "compose":
      state.containerized = true;
      analyzeRuntimeContent(file.content, state);
      break;
    case "terraform":
      state.infrastructure.add("Terraform");
      analyzeTerraform(file.content, state);
      break;
    case "kubernetes":
      state.infrastructure.add("Kubernetes");
      analyzeRuntimeContent(file.content, state);
      break;
    case "workflow":
      state.cicd.add("GitHub Actions");
      break;
  }
}

function analyzePackageJson(content: string, state: DetectionState): void {
  let packageNames = new Set<string>();

  try {
    const packageJson = JSON.parse(content) as Record<string, unknown>;
    const dependencySections = [
      packageJson.dependencies,
      packageJson.devDependencies,
      packageJson.peerDependencies,
      packageJson.optionalDependencies,
    ];

    for (const section of dependencySections) {
      if (isRecord(section)) {
        packageNames = new Set([...packageNames, ...Object.keys(section)]);
      }
    }
  } catch (error) {
    console.warn(`Unable to parse package.json: ${getErrorMessage(error)}`);
  }

  if (packageNames.has("react")) state.frontend.add("React");
  if (packageNames.has("next")) state.frontend.add("Next.js");
  if (packageNames.has("@angular/core")) state.frontend.add("Angular");
  if (packageNames.has("vue")) state.frontend.add("Vue");
  if (packageNames.has("express")) state.backend.add("Node.js Express");

  if (hasAny(packageNames, ["pg", "postgres", "@neondatabase/serverless"])) {
    state.database.add("PostgreSQL");
  }
  if (hasAny(packageNames, ["mysql", "mysql2"])) {
    state.database.add("MySQL");
  }
  if (hasAny(packageNames, ["mongodb", "mongoose"])) {
    state.database.add("MongoDB");
  }
  if (
    hasAny(packageNames, [
      "@aws-sdk/client-dynamodb",
      "@aws-sdk/lib-dynamodb",
      "dynamodb",
    ])
  ) {
    state.database.add("DynamoDB");
  }
}

function analyzeRequirements(content: string, state: DetectionState): void {
  const packages = new Set(
    content
      .split(/\r?\n/)
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split(/[<>=!~;\[\s]/, 1)[0]),
  );

  if (packages.has("fastapi")) state.backend.add("FastAPI");
  if (packages.has("django")) state.backend.add("Django");

  if (hasAny(packages, ["psycopg", "psycopg2", "asyncpg"])) {
    state.database.add("PostgreSQL");
  }
  if (hasAny(packages, ["mysqlclient", "pymysql", "mysql-connector-python"])) {
    state.database.add("MySQL");
  }
  if (hasAny(packages, ["pymongo", "motor"])) {
    state.database.add("MongoDB");
  }

  analyzeRuntimeContent(content, state);
}

function analyzeSpringConfiguration(content: string, state: DetectionState): void {
  const normalizedContent = content.toLowerCase();

  if (normalizedContent.includes("spring-boot")) {
    state.backend.add("Spring Boot");
  }

  analyzeDatabaseMarkers(normalizedContent, state);
}

function analyzeTerraform(content: string, state: DetectionState): void {
  const normalizedContent = content.toLowerCase();

  if (normalizedContent.includes("aws_dynamodb_table")) {
    state.database.add("DynamoDB");
  }

  analyzeDatabaseMarkers(normalizedContent, state);
}

function analyzeRuntimeContent(content: string, state: DetectionState): void {
  const normalizedContent = content.toLowerCase();

  if (normalizedContent.includes("fastapi") || normalizedContent.includes("uvicorn")) {
    state.backend.add("FastAPI");
  }
  if (normalizedContent.includes("django") || normalizedContent.includes("manage.py")) {
    state.backend.add("Django");
  }
  if (normalizedContent.includes("spring-boot")) {
    state.backend.add("Spring Boot");
  }

  analyzeDatabaseMarkers(normalizedContent, state);
}

function analyzeDatabaseMarkers(
  normalizedContent: string,
  state: DetectionState,
): void {
  if (/postgres(?:ql)?|org\.postgresql|engine\s*=\s*["']postgres/.test(normalizedContent)) {
    state.database.add("PostgreSQL");
  }
  if (/mysql|mysql-connector|engine\s*=\s*["']mysql/.test(normalizedContent)) {
    state.database.add("MySQL");
  }
  if (/mongodb|mongo:|mongoose/.test(normalizedContent)) {
    state.database.add("MongoDB");
  }
  if (/dynamodb|aws_dynamodb_table/.test(normalizedContent)) {
    state.database.add("DynamoDB");
  }
}

function buildTechnologyStack(state: DetectionState): TechnologyStack {
  return {
    frontend: FRONTEND_TECHNOLOGIES.filter((technology) =>
      state.frontend.has(technology),
    ),
    backend: BACKEND_TECHNOLOGIES.filter((technology) =>
      state.backend.has(technology),
    ),
    database: DATABASE_TECHNOLOGIES.filter((technology) =>
      state.database.has(technology),
    ),
    containerized: state.containerized,
    infrastructure: [...state.infrastructure].sort(),
    cicd: [...state.cicd].sort(),
  };
}

function buildDeploymentRecommendation(
  technologyStack: TechnologyStack,
): DeploymentRecommendation {
  const services = [
    ...technologyStack.frontend.map((technology) => `${technology} frontend`),
    ...technologyStack.backend.map((technology) => `${technology} API`),
    ...technologyStack.database.map((technology) => `Managed ${technology}`),
  ];

  if (technologyStack.containerized) {
    services.push("Container registry");
  }
  if (technologyStack.cicd.includes("GitHub Actions")) {
    services.push("GitHub Actions CI/CD pipeline");
  }
  if (services.length === 0) {
    services.push("Application service");
  }

  if (technologyStack.infrastructure.includes("Kubernetes")) {
    return {
      platform: "Kubernetes",
      services,
      strategy:
        "Build immutable container images and deploy the detected services with Kubernetes manifests through the CI/CD pipeline.",
    };
  }

  if (technologyStack.infrastructure.includes("Terraform")) {
    return {
      platform: "Cloud infrastructure managed with Terraform",
      services,
      strategy:
        "Provision the detected application and data services with Terraform, then deploy changes through the CI/CD pipeline.",
    };
  }

  if (
    technologyStack.frontend.includes("Next.js") &&
    technologyStack.backend.length === 0 &&
    !technologyStack.containerized
  ) {
    return {
      platform: "Vercel",
      services,
      strategy:
        "Deploy the Next.js application as a managed web service and connect any detected managed data services through environment configuration.",
    };
  }

  if (technologyStack.containerized || technologyStack.backend.length > 0) {
    return {
      platform: "Railway",
      services,
      strategy:
        "Deploy each detected application component as an independent service and attach managed databases with environment-based configuration.",
    };
  }

  return {
    platform: technologyStack.frontend.length > 0 ? "Static web hosting" : "Railway",
    services,
    strategy:
      "Deploy the detected application as a managed service and add automated builds through the CI/CD pipeline.",
  };
}

function isKubernetesManifest(path: string): boolean {
  if (!/\.ya?ml$/.test(path)) {
    return false;
  }

  const fileName = path.split("/").at(-1) ?? path;

  return (
    /(^|\/)(k8s|kubernetes|manifests|helm|charts)(\/|$)/.test(path) ||
    /^(deployment|service|statefulset|daemonset|ingress|configmap|secret)(?:\.[^.]+)?\.ya?ml$/.test(
      fileName,
    )
  );
}

function pathDepth(path: string): number {
  return path.split("/").length;
}

function hasAny(values: Set<string>, candidates: string[]): boolean {
  return candidates.some((candidate) => values.has(candidate));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
