import { getRepositoryInfo } from "./githubService";
import { generateArchitectureRecommendation } from "./architectureEngine";
import { generateDeploymentChecklist } from "./deploymentChecklistEngine";
import { generateReadinessScore } from "./readinessScoreEngine";
import {
  scanRepository,
  type TechnologyStack,
} from "./repositoryScanner";


export async function analyzeRepository(repository: string) {

  const repoInfo = await getRepositoryInfo(repository);
  const repositoryIntelligence = await scanRepository(
    repoInfo.owner.login,
    repoInfo.name,
  );
  const { technologyStack, deploymentRecommendation } =
    repositoryIntelligence;
  const architectureRecommendation = generateArchitectureRecommendation(
    technologyStack,
  );
  const readinessScore = generateReadinessScore(
    technologyStack,
    architectureRecommendation,
  );
  const deploymentChecklist = generateDeploymentChecklist(
    technologyStack,
    architectureRecommendation,
  );
  const repositoryMetadata = {
    owner: repoInfo.owner.login,
    name: repoInfo.name,
    fullName: repoInfo.full_name,
    description: repoInfo.description,
    language: repoInfo.language,
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    openIssues: repoInfo.open_issues_count,
    defaultBranch: repoInfo.default_branch,
    url: repoInfo.html_url,
  };


  return {

    name: repoInfo.name,

    description: repoInfo.description,

    language: repoInfo.language,

    stars: repoInfo.stargazers_count,

    architecture: {

      applicationType: getApplicationType(
        technologyStack,
        repoInfo.language,
      ),

      recommendation: deploymentRecommendation.strategy,

    },

    repositoryMetadata,

    technologyStack,

    deploymentRecommendation,

    architectureRecommendation,

    readinessScore,

    deploymentChecklist,

  };

}

function getApplicationType(
  technologyStack: TechnologyStack,
  primaryLanguage: string | null,
): string {
  if (
    technologyStack.frontend.length > 0 &&
    technologyStack.backend.length > 0
  ) {
    return "Full-stack application";
  }

  if (technologyStack.backend.length > 0) {
    return `${technologyStack.backend.join(", ")} backend application`;
  }

  if (technologyStack.frontend.length > 0) {
    return `${technologyStack.frontend.join(", ")} frontend application`;
  }

  if (technologyStack.containerized) {
    return "Containerized application";
  }

  return primaryLanguage ? `${primaryLanguage} application` : "Application";
}
