export interface ArchitectureTechnologyStack {
  frontend: readonly string[];
  backend: readonly string[];
  database: readonly string[];
  containerized: boolean;
  infrastructure: readonly string[];
  cicd: readonly string[];
}

export interface ArchitectureRecommendation {
  applicationArchitecture: {
    type: string;
    components: string[];
  };
  railwayDeploymentPlan: {
    platform: string;
    services: string[];
    environmentVariables: string[];
    deploymentStrategy: string;
  };
  scalingRecommendations: string[];
  securityRecommendations: string[];
}

interface NormalizedTechnologyStack {
  frontend: string[];
  backend: string[];
  database: string[];
  containerized: boolean;
  infrastructure: string[];
  cicd: string[];
}

const FRONTEND_MARKERS = ["react", "next.js", "nextjs", "vue", "angular"];
const BACKEND_MARKERS = [
  "node.js",
  "nodejs",
  "express",
  "python",
  "fastapi",
  "django",
  "java",
  "spring boot",
];
const DATABASE_MARKERS = [
  "postgresql",
  "postgres",
  "mysql",
  "mongodb",
  "mongo",
  "dynamodb",
];

export function generateArchitectureRecommendation(
  technologyStack: ArchitectureTechnologyStack,
): ArchitectureRecommendation {
  try {
    const stack = normalizeTechnologyStack(technologyStack);
    const frontends = selectDetected(stack.frontend, FRONTEND_MARKERS);
    const effectiveFrontends = removeRedundantReactDetection(frontends);
    const backends = selectDetected(stack.backend, BACKEND_MARKERS);
    const databases = selectDetected(stack.database, DATABASE_MARKERS);
    const githubActionsDetected = includesTechnology(stack.cicd, [
      "github actions",
    ]);
    const terraformDetected = includesTechnology(stack.infrastructure, [
      "terraform",
    ]);

    return {
      applicationArchitecture: {
        type: determineArchitectureType(
          effectiveFrontends,
          backends,
          stack.containerized,
        ),
        components: buildArchitectureComponents({
          frontends: effectiveFrontends,
          backends,
          databases,
          containerized: stack.containerized,
          githubActionsDetected,
          terraformDetected,
        }),
      },
      railwayDeploymentPlan: {
        platform: determineRailwayPlatform(effectiveFrontends, backends),
        services: buildRailwayServices(
          effectiveFrontends,
          backends,
          databases,
          stack.containerized,
          githubActionsDetected,
        ),
        environmentVariables: buildEnvironmentVariables(
          effectiveFrontends,
          backends,
          databases,
        ),
        deploymentStrategy: buildDeploymentStrategy({
          frontends: effectiveFrontends,
          backends,
          databases,
          containerized: stack.containerized,
          githubActionsDetected,
          terraformDetected,
        }),
      },
      scalingRecommendations: buildScalingRecommendations(
        effectiveFrontends,
        backends,
        databases,
        stack.containerized,
      ),
      securityRecommendations: buildSecurityRecommendations({
        hasPublicFrontend: effectiveFrontends.length > 0,
        hasBackend: backends.length > 0,
        hasDatabase: databases.length > 0,
        containerized: stack.containerized,
        githubActionsDetected,
        terraformDetected,
      }),
    };
  } catch (error) {
    throw new Error(
      `Unable to generate an architecture recommendation: ${getErrorMessage(error)}`,
    );
  }
}

function normalizeTechnologyStack(
  technologyStack: ArchitectureTechnologyStack,
): NormalizedTechnologyStack {
  if (!technologyStack || typeof technologyStack !== "object") {
    throw new TypeError("A technology stack is required");
  }

  return {
    frontend: normalizeTechnologyList(technologyStack.frontend, "frontend"),
    backend: normalizeTechnologyList(technologyStack.backend, "backend"),
    database: normalizeTechnologyList(technologyStack.database, "database"),
    containerized: Boolean(technologyStack.containerized),
    infrastructure: normalizeTechnologyList(
      technologyStack.infrastructure,
      "infrastructure",
    ),
    cicd: normalizeTechnologyList(technologyStack.cicd, "cicd"),
  };
}

function normalizeTechnologyList(
  values: readonly string[],
  fieldName: string,
): string[] {
  if (!Array.isArray(values)) {
    throw new TypeError(`${fieldName} must be an array`);
  }

  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function selectDetected(values: string[], markers: string[]): string[] {
  return values.filter((value) =>
    markers.some((marker) => value.toLowerCase().includes(marker)),
  );
}

function removeRedundantReactDetection(frontends: string[]): string[] {
  const hasNextJs = includesTechnology(frontends, ["next.js", "nextjs"]);

  return hasNextJs
    ? frontends.filter((frontend) => frontend.toLowerCase() !== "react")
    : frontends;
}

function determineArchitectureType(
  frontends: string[],
  backends: string[],
  containerized: boolean,
): string {
  const prefix = containerized ? "Containerized " : "";

  if (frontends.length > 0 && backends.length > 0) {
    return `${prefix}full-stack service architecture`;
  }

  if (backends.length > 0) {
    return `${prefix}API service architecture`;
  }

  if (frontends.length > 0) {
    return `${prefix}frontend web architecture`;
  }

  return containerized
    ? "Containerized application architecture"
    : "Managed application service architecture";
}

function buildArchitectureComponents(options: {
  frontends: string[];
  backends: string[];
  databases: string[];
  containerized: boolean;
  githubActionsDetected: boolean;
  terraformDetected: boolean;
}): string[] {
  const components = [
    ...options.frontends.map((frontend) =>
      isNextJs(frontend)
        ? `Frontend tier: Deploy ${frontend} as an independent Railway service with automated builds, environment-specific runtime configuration, and scalable delivery for server-rendered and static routes.`
        : `Frontend tier: Deploy ${frontend} as an independent service with automated builds, environment-specific configuration, CDN caching, and optimized static asset delivery.`,
    ),
    ...options.backends.map(
      (backend) =>
        `Application tier: Deploy ${backend} as a stateless API service with health checks, load-balanced horizontal scaling, and private managed-database connectivity.`,
    ),
    ...options.databases.map(
      (database) =>
        `Data tier: Provision ${database} as a managed database service with connection pooling, persistent storage, automated backups, and private network access.`,
    ),
  ];

  if (options.containerized) {
    components.push(
      "Container runtime: Build versioned OCI images from the repository Docker configuration for reproducible promotion across environments.",
    );
  }
  if (options.githubActionsDetected) {
    components.push(
      "Delivery pipeline: Use GitHub Actions to validate, build, and promote application revisions automatically.",
    );
  }
  if (options.terraformDetected) {
    components.push(
      "Infrastructure control plane: Keep provisioned service configuration and environment topology under Terraform management.",
    );
  }
  if (components.length === 0) {
    components.push(
      "Application tier: Deploy the repository as a managed service with health checks, centralized logs, and environment-based configuration.",
    );
  }

  return components;
}

function determineRailwayPlatform(
  frontends: string[],
  backends: string[],
): string {
  if (frontends.length > 0 && backends.length === 0) {
    return "Railway Static/Frontend Service";
  }

  return "Railway Application Platform";
}

function buildRailwayServices(
  frontends: string[],
  backends: string[],
  databases: string[],
  containerized: boolean,
  githubActionsDetected: boolean,
): string[] {
  const services: string[] = [];

  if (frontends.length > 0) {
    services.push("Frontend Service");
  }
  if (backends.length > 0) {
    services.push("Backend API Service");
  }
  if (databases.length > 0) {
    services.push("Managed Database Service");
  }
  if (
    githubActionsDetected ||
    (frontends.length > 0 && backends.length === 0)
  ) {
    services.push("CI/CD Pipeline");
  }

  if (services.length === 0) {
    services.push(
      containerized
        ? "Railway application service built from the repository Dockerfile"
        : "Railway application service built from the repository source",
    );
  }

  return services;
}

function buildEnvironmentVariables(
  frontends: string[],
  backends: string[],
  databases: string[],
): string[] {
  const environmentVariables = [
    "APPLICATION_CONFIGURATION — non-secret, environment-specific application settings",
  ];

  if (frontends.length > 0 && backends.length > 0) {
    environmentVariables.push(
      "API_BASE_URL — public backend endpoint supplied to the frontend build",
    );
  }

  if (databases.length > 0) {
    environmentVariables.push(
      "DATABASE_URL — managed database connection string supplied through a private service reference",
    );
  }

  if (backends.length > 0) {
    environmentVariables.push(
      "API_KEYS — third-party integration credentials stored as encrypted application secrets",
      "JWT_SECRET — high-entropy signing secret stored separately for each environment",
    );
  }

  return [...new Set(environmentVariables)];
}

function buildDeploymentStrategy(options: {
  frontends: string[];
  backends: string[];
  databases: string[];
  containerized: boolean;
  githubActionsDetected: boolean;
  terraformDetected: boolean;
}): string {
  const steps: string[] = [];

  if (options.frontends.length > 0 && options.backends.length > 0) {
    steps.push(
      "Deploy the frontend and backend as independent Railway services with automated builds, environment-specific configuration, and independently scalable delivery.",
    );
  } else if (options.frontends.length > 0) {
    steps.push(
      "Deploy the frontend as an independent Railway service with automated builds, environment-specific configuration, CDN-aware asset delivery, and a promotion path across environments.",
    );
  } else if (options.backends.length > 0) {
    steps.push(
      "Deploy the backend as a stateless Railway application service with health checks, load-balanced horizontal scaling, centralized logs, and private downstream connectivity.",
    );
  } else {
    steps.push(
      "Deploy the application as a managed Railway service with health checks and centralized logs.",
    );
  }

  if (options.databases.length > 0) {
    steps.push(
      "Attach managed database services over private connectivity and inject connection strings through service references rather than source-controlled configuration.",
    );
  }
  if (options.containerized) {
    steps.push(
      "Build immutable container images from the repository Docker configuration and promote the same artifacts across environments.",
    );
  }
  if (options.githubActionsDetected) {
    steps.push(
      "Use GitHub Actions for quality gates and automated deployments after protected-branch checks succeed.",
    );
  }
  if (options.terraformDetected) {
    steps.push(
      "Manage supported service configuration with Terraform and require reviewed plans before infrastructure changes are applied.",
    );
  }

  return steps.join(" ");
}

function buildScalingRecommendations(
  frontends: string[],
  backends: string[],
  databases: string[],
  containerized: boolean,
): string[] {
  const recommendations: string[] = [];

  if (frontends.length > 0) {
    recommendations.push(
      "Use CDN caching with content-hashed cache policies to reduce origin traffic and improve global frontend latency.",
      "Optimize static assets through minification, compression, responsive images, and immutable build artifacts.",
    );
  }
  if (backends.length > 0) {
    recommendations.push(
      "Keep backend services stateless and scale horizontally based on request latency, throughput, and resource saturation.",
      "Expose readiness and liveness health checks so unhealthy instances are removed from service automatically.",
      "Distribute API traffic across healthy replicas with load balancing and validate session independence before scaling out.",
    );
  }
  if (databases.length > 0) {
    recommendations.push(
      "Use bounded connection pooling and monitor connection utilization, query latency, and storage growth before increasing database capacity.",
      "Define an automated backup strategy with retention policies, point-in-time recovery where supported, and regularly tested restoration procedures.",
    );
  }
  if (containerized) {
    recommendations.push(
      "Define explicit CPU and memory limits, keep images minimal, and tune service resources from observed production utilization.",
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Establish latency, error-rate, traffic, and saturation baselines before enabling horizontal scaling policies.",
    );
  }

  return recommendations;
}

function buildSecurityRecommendations(options: {
  hasPublicFrontend: boolean;
  hasBackend: boolean;
  hasDatabase: boolean;
  containerized: boolean;
  githubActionsDetected: boolean;
  terraformDetected: boolean;
}): string[] {
  const recommendations = [
    "Store secrets in Railway environment variables, rotate credentials regularly, and never commit production values to the repository.",
    "Pin and continuously scan application dependencies as part of the build pipeline.",
  ];

  if (options.hasPublicFrontend || options.hasBackend) {
    recommendations.push(
      "Terminate TLS on every public endpoint, apply restrictive CORS and security headers, and expose only services that require internet access.",
    );
  }
  if (options.hasBackend && options.hasDatabase) {
    recommendations.push(
      "Keep database traffic on private service networking and use least-privilege application credentials separated by environment.",
    );
  }
  if (options.hasDatabase) {
    recommendations.push(
      "Enable encrypted backups, verify restoration procedures, and define retention policies appropriate to the application's recovery objectives.",
    );
  }
  if (options.containerized) {
    recommendations.push(
      "Run containers as a non-root user, scan images for vulnerabilities, and remove build tools and unused packages from runtime layers.",
    );
  }
  if (options.githubActionsDetected) {
    recommendations.push(
      "Protect deployment workflows with branch controls and least-privilege repository permissions; prefer platform integrations or short-lived identity over exposing deployment tokens to application services.",
    );
  }
  if (options.terraformDetected) {
    recommendations.push(
      "Encrypt Terraform state, restrict state access, and require reviewed plans with policy checks before infrastructure changes.",
    );
  }

  return recommendations;
}

function includesTechnology(values: string[], markers: string[]): boolean {
  return values.some((value) =>
    markers.some((marker) => value.toLowerCase().includes(marker)),
  );
}

function isNextJs(frontend: string): boolean {
  const normalizedFrontend = frontend.toLowerCase();
  return normalizedFrontend.includes("next.js") || normalizedFrontend.includes("nextjs");
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
