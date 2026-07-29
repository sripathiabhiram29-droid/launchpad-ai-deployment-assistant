import {
  Cloud,
  Database,
  GitBranch,
  Server,
  Sparkles,
} from "lucide-react";

type DiagramTechnologyStack = {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  cicd?: string[];
};

type DiagramArchitectureRecommendation = {
  applicationArchitecture?: {
    type?: string;
  };
  railwayDeploymentPlan?: {
    platform?: string;
  };
  scalingRecommendations?: string[];
  securityRecommendations?: string[];
};

type DiagramDeploymentRecommendation = {
  platform?: string;
};

export function ArchitectureDiagram({
  technologyStack,
  architectureRecommendation,
  deploymentRecommendation,
}: {
  technologyStack?: DiagramTechnologyStack;
  architectureRecommendation?: DiagramArchitectureRecommendation;
  deploymentRecommendation?: DiagramDeploymentRecommendation;
}) {
  const frontend = formatTechnologies(technologyStack?.frontend);
  const backend = formatTechnologies(technologyStack?.backend);
  const database = formatTechnologies(technologyStack?.database);
  const hasBackend = Boolean(technologyStack?.backend?.length);
  const hasDatabase = Boolean(technologyStack?.database?.length);
  const hasGithubActions =
    technologyStack?.cicd?.some((technology) =>
      technology.toLowerCase().includes("github actions"),
    ) ?? false;
  const platform =
    architectureRecommendation?.railwayDeploymentPlan?.platform ||
    deploymentRecommendation?.platform ||
    "Railway Platform";
  const applicationType =
    architectureRecommendation?.applicationArchitecture?.type ||
    "Managed application architecture";
  const serviceCount = 1 + Number(hasBackend) + Number(hasDatabase);
  const serviceGridClass =
    serviceCount === 3
      ? "sm:grid-cols-3"
      : serviceCount === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-1";

  return (
    <div
      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-8"
      aria-label="Generated cloud architecture diagram"
    >
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <DiagramNode
          icon={<GitBranch size={20} />}
          label="GitHub Repository"
          detail="Source and application configuration"
        />
        <FlowArrow />
        <DiagramNode
          icon={<Sparkles size={20} />}
          label="GitHub Actions CI/CD"
          detail={
            hasGithubActions
              ? "Automated validation and delivery"
              : "Recommended delivery capability"
          }
          muted={!hasGithubActions}
        />
        <FlowArrow />
        <DiagramNode
          icon={<Cloud size={20} />}
          label="Railway Platform"
          detail={platform}
          featured
        />
      </div>

      <div className="mx-auto h-8 w-px bg-blue-500/40" />

      <div
        className={`grid gap-4 border-t border-blue-500/30 pt-6 ${serviceGridClass}`}
      >
        <ConnectedNode>
          <DiagramNode
            icon={<Cloud size={20} />}
            label="Frontend Service"
            detail={frontend || "Application entry point"}
          />
        </ConnectedNode>

        {hasBackend && (
          <ConnectedNode>
            <DiagramNode
              icon={<Server size={20} />}
              label="Backend Service"
              detail={backend}
            />
          </ConnectedNode>
        )}

        {hasDatabase && (
          <ConnectedNode>
            <DiagramNode
              icon={<Database size={20} />}
              label="Database Service"
              detail={database}
            />
          </ConnectedNode>
        )}
      </div>

      <div className="mx-auto h-8 w-px bg-blue-500/40" />

      <div className="grid gap-4 border-t border-blue-500/30 pt-6 sm:grid-cols-2">
        <ConnectedNode>
          <DiagramNode
            icon={<Sparkles size={20} />}
            label="Security Layer"
            detail={formatRecommendationCount(
              architectureRecommendation?.securityRecommendations,
              "Baseline security controls",
            )}
          />
        </ConnectedNode>
        <ConnectedNode>
          <DiagramNode
            icon={<Cloud size={20} />}
            label="Scaling Layer"
            detail={formatRecommendationCount(
              architectureRecommendation?.scalingRecommendations,
              "Baseline scaling guidance",
            )}
          />
        </ConnectedNode>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        {applicationType}
      </p>
    </div>
  );
}

function DiagramNode({
  icon,
  label,
  detail,
  featured = false,
  muted = false,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  featured?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`h-full rounded-xl border p-4 text-center transition-colors ${
        featured
          ? "border-blue-500/60 bg-blue-500/15 shadow-lg shadow-blue-950/30"
          : muted
            ? "border-dashed border-slate-700 bg-slate-900/50"
            : "border-slate-700 bg-slate-900"
      }`}
    >
      <div
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg ${
          featured ? "bg-blue-500 text-white" : "bg-blue-500/10 text-blue-400"
        }`}
      >
        {icon}
      </div>
      <h4 className="mt-3 font-semibold text-white">{label}</h4>
      <p className="mt-1 text-sm leading-5 text-slate-400">{detail}</p>
    </div>
  );
}

function ConnectedNode({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pt-1 before:absolute before:-top-6 before:left-1/2 before:h-6 before:w-px before:bg-blue-500/40">
      {children}
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="text-center text-xl font-semibold text-blue-400" aria-hidden>
      <span className="md:hidden">↓</span>
      <span className="hidden md:inline">→</span>
    </div>
  );
}

function formatTechnologies(technologies?: string[]): string {
  return technologies?.filter(Boolean).join(", ") ?? "";
}

function formatRecommendationCount(
  recommendations: string[] | undefined,
  fallback: string,
): string {
  const count = recommendations?.filter(Boolean).length ?? 0;
  return count > 0
    ? `${count} recommendation${count === 1 ? "" : "s"} generated`
    : fallback;
}
