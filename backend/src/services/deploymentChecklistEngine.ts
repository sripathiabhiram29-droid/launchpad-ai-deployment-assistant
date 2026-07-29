import type {
  ArchitectureRecommendation,
  ArchitectureTechnologyStack,
} from "./architectureEngine";

export interface DeploymentChecklist {
  checklist: string[];
}

export function generateDeploymentChecklist(
  technologyStack: ArchitectureTechnologyStack,
  architectureRecommendation: ArchitectureRecommendation,
): DeploymentChecklist {
  try {
    if (!technologyStack || typeof technologyStack !== "object") {
      throw new TypeError("A technology stack is required");
    }

    const checklist = new Set<string>();
    const hasFrontend = technologyStack.frontend.length > 0;
    const hasBackend = technologyStack.backend.length > 0;
    const hasDatabase = technologyStack.database.length > 0;
    const hasCicd = technologyStack.cicd.some((technology) =>
      technology.toLowerCase().includes("github actions"),
    );
    const hasInfrastructureAsCode = technologyStack.infrastructure.some(
      (technology) =>
        ["terraform", "pulumi", "cloudformation", "bicep"].some((marker) =>
          technology.toLowerCase().includes(marker),
        ),
    );

    checklist.add(
      architectureRecommendation.railwayDeploymentPlan.environmentVariables
        .length > 0
        ? "Configure environment variables and service references for each deployment environment."
        : "Review application configuration and define required environment variables.",
    );
    checklist.add(
      hasCicd
        ? "Validate the GitHub Actions CI/CD pipeline, quality gates, and protected deployment workflow."
        : "Enable CI/CD deployment with automated build and validation checks.",
    );

    if (hasFrontend) {
      checklist.add(
        "Configure the frontend domain, TLS, CDN caching, and static asset cache headers.",
      );
    }
    if (hasBackend || technologyStack.containerized) {
      checklist.add(
        "Configure readiness and liveness health checks for application services.",
      );
    }
    if (hasBackend && (hasFrontend || hasDatabase)) {
      checklist.add(
        "Validate private service networking, public API routing, and restrictive CORS policies.",
      );
    }
    if (hasDatabase) {
      checklist.add(
        "Provision the managed database, configure connection pooling, and test the backup and restore strategy.",
      );
    }
    if (technologyStack.containerized) {
      checklist.add(
        "Validate the production container image, non-root runtime, resource limits, and vulnerability scan results.",
      );
    }
    if (hasInfrastructureAsCode) {
      checklist.add(
        "Review the Infrastructure as Code plan, remote state controls, and environment-specific variables before apply.",
      );
    }

    checklist.add(
      "Review security settings, secrets management, least-privilege access, and dependency scanning.",
    );

    return { checklist: [...checklist] };
  } catch (error) {
    throw new Error(
      `Unable to generate the deployment checklist: ${getErrorMessage(error)}`,
    );
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
