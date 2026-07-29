import type {
  ArchitectureRecommendation,
  ArchitectureTechnologyStack,
} from "./architectureEngine";

export interface ReadinessScore {
  score: number;
  grade: string;
  improvements: string[];
}

export function generateReadinessScore(
  technologyStack: ArchitectureTechnologyStack,
  architectureRecommendation: ArchitectureRecommendation,
): ReadinessScore {
  try {
    validateTechnologyStack(technologyStack);

    let score = 0;
    const improvements: string[] = [];
    const hasCicd = hasTechnology(technologyStack.cicd, ["github actions"]);
    const hasDatabase = hasValues(technologyStack.database);
    const hasInfrastructureAsCode = hasTechnology(
      technologyStack.infrastructure,
      ["terraform", "pulumi", "cloudformation", "bicep"],
    );
    const hasSecurityRecommendations =
      architectureRecommendation.securityRecommendations.length > 0;
    const serviceTierCount = [
      technologyStack.frontend,
      technologyStack.backend,
      technologyStack.database,
    ].filter(hasValues).length;

    if (hasCicd) {
      score += 20;
    } else {
      improvements.push(
        "Add an automated CI/CD pipeline with build validation and protected deployment workflows.",
      );
    }

    if (technologyStack.containerized) {
      score += 20;
    } else {
      improvements.push(
        "Add containerization to make application builds reproducible across environments.",
      );
    }

    if (hasDatabase) {
      score += 20;
    } else {
      improvements.push(
        "Configure a managed database service when the application requires persistent state.",
      );
    }

    if (hasInfrastructureAsCode) {
      score += 15;
    } else {
      improvements.push(
        "Manage infrastructure and environment topology with Infrastructure as Code.",
      );
    }

    if (hasSecurityRecommendations) {
      score += 15;
    } else {
      improvements.push(
        "Document security controls for secrets, network access, dependencies, and data protection.",
      );
    }

    if (serviceTierCount >= 2) {
      score += 10;
    } else {
      improvements.push(
        "Define independently deployable service boundaries as the application architecture grows.",
      );
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      grade: getReadinessGrade(score),
      improvements,
    };
  } catch (error) {
    throw new Error(
      `Unable to calculate cloud readiness: ${getErrorMessage(error)}`,
    );
  }
}

function validateTechnologyStack(
  technologyStack: ArchitectureTechnologyStack,
): void {
  if (!technologyStack || typeof technologyStack !== "object") {
    throw new TypeError("A technology stack is required");
  }

  const listFields = [
    technologyStack.frontend,
    technologyStack.backend,
    technologyStack.database,
    technologyStack.infrastructure,
    technologyStack.cicd,
  ];

  if (listFields.some((field) => !Array.isArray(field))) {
    throw new TypeError("Technology stack fields must be arrays");
  }
}

function hasValues(values: readonly string[]): boolean {
  return Array.isArray(values) && values.some((value) => value.trim());
}

function hasTechnology(values: readonly string[], markers: string[]): boolean {
  return values.some((value) =>
    markers.some((marker) => value.toLowerCase().includes(marker)),
  );
}

function getReadinessGrade(score: number): string {
  if (score >= 85) return "Production Ready";
  if (score >= 70) return "Cloud Ready";
  if (score >= 50) return "Deployment Ready";
  if (score >= 30) return "Foundation Stage";
  return "Needs Improvement";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
