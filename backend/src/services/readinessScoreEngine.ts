import type {
  ArchitectureRecommendation,
  ArchitectureTechnologyStack,
} from "./architectureEngine";

export interface ReadinessScore {
  score: number;
  grade: string;
  breakdown: ReadinessScoreBreakdown;
  reasoning: string[];
  improvements: string[];
}

export interface ReadinessScoreBreakdown {
  ciCd: number;
  containerization: number;
  infrastructure: number;
  database: number;
  security: number;
  architecture: number;
}

export function generateReadinessScore(
  technologyStack: ArchitectureTechnologyStack,
  architectureRecommendation: ArchitectureRecommendation,
): ReadinessScore {
  try {
    validateTechnologyStack(technologyStack);

    const improvements: string[] = [];
    const reasoning: string[] = [];
    const hasCicd = hasTechnology(technologyStack.cicd, [
      "github actions",
      "ci/cd",
      "cicd",
      "continuous integration",
      "continuous delivery",
      "continuous deployment",
    ]);
    const hasDatabase = hasTechnology(technologyStack.database, [
      "postgresql",
      "postgres",
      "mysql",
      "mongodb",
      "mongo",
      "dynamodb",
    ]);
    const hasInfrastructureAsCode = hasTechnology(
      technologyStack.infrastructure,
      [
        "terraform",
        "kubernetes",
        "k8s",
        "infrastructure as code",
        "iac",
        "pulumi",
        "cloudformation",
        "bicep",
      ],
    );
    const hasSecurityRecommendations =
      architectureRecommendation.securityRecommendations.length > 0;
    const serviceTierCount = [
      technologyStack.frontend,
      technologyStack.backend,
      technologyStack.database,
    ].filter(hasValues).length;
    const hasMultipleServices = serviceTierCount >= 2;
    const breakdown: ReadinessScoreBreakdown = {
      ciCd: hasCicd ? 20 : 0,
      containerization: technologyStack.containerized ? 20 : 0,
      infrastructure: hasInfrastructureAsCode ? 20 : 0,
      database: hasDatabase ? 15 : 0,
      security: hasSecurityRecommendations ? 15 : 0,
      architecture: hasMultipleServices ? 10 : 0,
    };

    if (hasCicd) {
      reasoning.push("Strong CI/CD foundation detected");
    } else {
      reasoning.push("No CI/CD pipeline detected");
      improvements.push(
        "Add an automated CI/CD pipeline with build validation and protected deployment workflows.",
      );
    }

    if (technologyStack.containerized) {
      reasoning.push("Container deployment supported");
    } else {
      reasoning.push("No containerization detected");
      improvements.push(
        "Add containerization to make application builds reproducible across environments.",
      );
    }

    if (hasDatabase) {
      reasoning.push("Managed database configuration detected");
    } else {
      reasoning.push("No managed database configuration detected");
      improvements.push(
        "Configure a managed database service when the application requires persistent state.",
      );
    }

    if (hasInfrastructureAsCode) {
      reasoning.push("Infrastructure as Code or orchestration configuration detected");
    } else {
      reasoning.push("No Infrastructure as Code detected");
      improvements.push(
        "Manage infrastructure and environment topology with Infrastructure as Code.",
      );
    }

    if (hasSecurityRecommendations) {
      reasoning.push("Security recommendations generated");
    } else {
      reasoning.push("No security recommendations generated");
      improvements.push(
        "Document security controls for secrets, network access, dependencies, and data protection.",
      );
    }

    if (hasMultipleServices) {
      reasoning.push("Multiple service architecture detected");
    } else {
      reasoning.push("Single service architecture detected");
      improvements.push(
        "Define independently deployable service boundaries as the application architecture grows.",
      );
    }

    const score = Object.values(breakdown).reduce(
      (total, categoryScore) => total + categoryScore,
      0,
    );

    return {
      score: Math.min(100, Math.max(0, score)),
      grade: getReadinessGrade(score),
      breakdown,
      reasoning,
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
