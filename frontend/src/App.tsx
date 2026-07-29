import { useEffect, useState } from "react";
import { analyzeRepository } from "./services/api";
import { ArchitectureDiagram } from "./components/ArchitectureDiagram";
import {
  Cloud,
  Sparkles,
  Server,
  Database,
  GitBranch,
  ArrowRight,
} from "lucide-react";

type RepositoryMetadata = {
  owner?: string;
  name?: string;
  fullName?: string;
  description?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  openIssues?: number;
  defaultBranch?: string;
  url?: string;
};

type TechnologyStack = {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  containerized?: boolean;
  infrastructure?: string[];
  cicd?: string[];
};

type DeploymentRecommendation = {
  platform?: string;
  services?: string[];
  strategy?: string;
};

type ArchitectureRecommendation = {
  applicationArchitecture?: {
    type?: string;
    components?: string[];
  };
  railwayDeploymentPlan?: {
    platform?: string;
    services?: string[];
    environmentVariables?: string[];
    deploymentStrategy?: string;
  };
  scalingRecommendations?: string[];
  securityRecommendations?: string[];
};

type ReadinessScore = {
  score?: number;
  grade?: string;
  improvements?: string[];
};

type DeploymentChecklist = {
  checklist?: string[];
};

type RepositoryAnalysis = {
  name?: string;
  description?: string | null;
  language?: string | null;
  stars?: number;
  repositoryMetadata?: RepositoryMetadata;
  technologyStack?: TechnologyStack;
  deploymentRecommendation?: DeploymentRecommendation;
  architectureRecommendation?: ArchitectureRecommendation;
  readinessScore?: ReadinessScore;
  deploymentChecklist?: DeploymentChecklist;
};

type AnalyzeRepositoryResponse = {
  analysis?: RepositoryAnalysis;
};

function App() {
  const [repository, setRepository] = useState("");
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingStep((currentStep) => Math.min(currentStep + 1, 3));
    }, 900);

    return () => window.clearInterval(interval);
  }, [loading]);

  async function handleAnalyze() {
    const repositoryUrl = repository.trim();

    if (!repositoryUrl) {
      return;
    }

    try {
      setError(null);
      setAnalysis(null);
      setLoadingStep(0);
      setLoading(true);
      console.log("Analyzing repository:", repositoryUrl);

      const response = (await analyzeRepository(
        repositoryUrl,
      )) as AnalyzeRepositoryResponse;

      if (!response.analysis) {
        throw new Error("Repository analysis response is missing analysis data");
      }

      setAnalysis(response.analysis);
    } catch (error) {
      console.error("Repository analysis failed:", error);
      setAnalysis(null);
      setError(
        "Repository analysis could not be completed. Verify the GitHub URL and backend connection, then try again.",
      );
    } finally {
      setLoadingStep(0);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-800">

        <div className="flex items-center gap-3">
          <Sparkles className="text-blue-400" />
          <span className="text-xl font-bold">
            LaunchPad AI
          </span>
        </div>

        <div className="hidden md:flex gap-8 text-slate-300">
          <span>Features</span>
          <span>Architecture</span>
          <span>Docs</span>
          <span>GitHub</span>
        </div>

      </nav>


      {/* Hero */}
      <section className="px-8 py-24 text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-blue-300">
          <Sparkles size={18}/>
          AI Cloud Architecture Assistant
        </div>


        <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight">

          From Code

          <span className="text-blue-400">
            {" "}to Cloud
          </span>

          <br />

          with AI Guidance

        </h1>


        <p className="mx-auto mt-8 max-w-3xl text-xl text-slate-400">

          Analyze your application, generate production-ready cloud
          architectures, and accelerate deployment with an AI-powered
          cloud assistant.

        </p>


        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row">
          <input
            type="url"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            placeholder="https://github.com/owner/repository"
            aria-label="GitHub repository URL"
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !repository.trim()}
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span
                aria-hidden="true"
                className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
            )}
            {loading ? "Analyzing..." : "Generate Architecture Plan"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </div>

        {loading && <AnalysisLoadingState currentStep={loadingStep} />}

        {error && (
          <div
            role="alert"
            className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-left text-red-200"
          >
            {error}
          </div>
        )}

        {analysis && <AnalysisDashboard analysis={analysis} />}

      </section>



      {/* AI Workflow */}
      <section className="mx-auto max-w-6xl px-8 py-16">

        <h2 className="text-center text-3xl font-bold">
          How LaunchPad AI Works
        </h2>


        <div className="mt-12 grid md:grid-cols-4 gap-6">


          <Workflow
            icon={<GitBranch />}
            title="Analyze"
            text="Understand your repository and technology stack."
          />


          <Workflow
            icon={<Sparkles />}
            title="Reason"
            text="Generate cloud architecture recommendations."
          />


          <Workflow
            icon={<Cloud />}
            title="Design"
            text="Create production deployment plans."
          />


          <Workflow
            icon={<Server />}
            title="Deploy"
            text="Prepare your application for modern platforms."
          />


        </div>

      </section>



      {/* Architecture */}
      <section className="mx-auto max-w-5xl px-8 py-16">


        <h2 className="text-3xl font-bold text-center">
          AI Recommended Architecture
        </h2>


        <div className="mt-10 grid md:grid-cols-3 gap-6">


          <Card
            icon={<Cloud />}
            title="Frontend Service"
            value="React Application"
          />


          <Card
            icon={<Server />}
            title="Backend Service"
            value="Node.js API"
          />


          <Card
            icon={<Database />}
            title="Database"
            value="PostgreSQL"
          />


        </div>


      </section>


    </div>
  );
}


const ANALYSIS_STEPS = [
  "Fetching repository information",
  "Detecting technology stack",
  "Generating cloud architecture",
  "Creating deployment plan",
];

function AnalysisLoadingState({ currentStep }: { currentStep: number }) {
  return (
    <div
      className="mx-auto mt-8 max-w-3xl rounded-2xl border border-blue-500/20 bg-slate-900/90 p-6 text-left shadow-xl shadow-blue-950/20"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">Analyzing repository</p>
          <p className="mt-1 text-sm text-slate-400">
            LaunchPad AI is building your deployment intelligence.
          </p>
        </div>
        <span className="text-sm font-medium text-blue-300">
          Step {currentStep + 1} of {ANALYSIS_STEPS.length}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {ANALYSIS_STEPS.map((step, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                active
                  ? "border-blue-500/50 bg-blue-500/10"
                  : completed
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-slate-800 bg-slate-950/50"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  active
                    ? "animate-pulse bg-blue-500 text-white"
                    : completed
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                {completed ? "✓" : index + 1}
              </span>
              <span className={active ? "text-white" : "text-slate-400"}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function AnalysisDashboard({ analysis }: { analysis: RepositoryAnalysis }) {
  const metadata = analysis.repositoryMetadata;
  const technologyStack = analysis.technologyStack;
  const deploymentRecommendation = analysis.deploymentRecommendation;
  const architectureRecommendation = analysis.architectureRecommendation;
  const railwayPlan = architectureRecommendation?.railwayDeploymentPlan;
  const railwayServices = railwayPlan?.services?.length
    ? railwayPlan.services
    : deploymentRecommendation?.services;
  const deploymentStrategy =
    railwayPlan?.deploymentStrategy || deploymentRecommendation?.strategy;
  const stars = metadata?.stars ?? analysis.stars;
  const reportDownload = createArchitectureReportDownload(analysis);

  return (
    <section className="mx-auto mt-12 max-w-6xl" aria-labelledby="analysis-title">
      <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            Repository Intelligence
          </p>
          <h2 id="analysis-title" className="mt-3 text-3xl font-bold">
            Cloud Architecture Dashboard
          </h2>
          <p className="mt-2 text-slate-400">
            Deployment guidance generated from the detected repository stack.
          </p>
        </div>

        <a
          href={reportDownload.href}
          download={reportDownload.fileName}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-5 py-3 font-semibold text-blue-200 transition-colors hover:bg-blue-500/20"
        >
          <span aria-hidden="true">↓</span>
          Export Architecture Report
        </a>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AnalysisCard icon={<GitBranch />} title="Repository Overview">
          <dl className="grid gap-4 sm:grid-cols-2">
            <StackItem
              label="Repository name"
              value={metadata?.name || analysis.name}
            />
            <StackItem
              label="Programming language"
              value={metadata?.language || analysis.language}
            />
            <StackItem
              label="Stars"
              value={stars === undefined ? undefined : stars.toLocaleString()}
            />
            <StackItem
              label="Default branch"
              value={metadata?.defaultBranch}
            />
            <StackItem
              label="Description"
              value={metadata?.description || analysis.description}
              wide
            />
          </dl>
        </AnalysisCard>

        <AnalysisCard icon={<Cloud />} title="Cloud Readiness Score">
          <ReadinessScorePanel readinessScore={analysis.readinessScore} />
        </AnalysisCard>

        <AnalysisCard
          icon={<Server />}
          title="Technology Stack"
          className="lg:col-span-2"
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            <StackItem label="Frontend" value={technologyStack?.frontend} />
            <StackItem label="Backend" value={technologyStack?.backend} />
            <StackItem label="Database" value={technologyStack?.database} />
            <StackItem
              label="Containerization"
              value={
                technologyStack?.containerized
                  ? "Docker enabled"
                  : "Not detected"
              }
            />
            <StackItem
              label="Infrastructure"
              value={technologyStack?.infrastructure}
            />
            <StackItem label="CI/CD" value={technologyStack?.cicd} />
          </dl>
        </AnalysisCard>

        <AnalysisCard
          icon={<Cloud />}
          title="Architecture Diagram"
          className="lg:col-span-2"
        >
          <ArchitectureDiagram
            technologyStack={technologyStack}
            architectureRecommendation={architectureRecommendation}
            deploymentRecommendation={deploymentRecommendation}
          />

          <div className="mt-6">
            <RecommendationList
              title="Generated architecture components"
              items={
                architectureRecommendation?.applicationArchitecture?.components
              }
            />
          </div>
        </AnalysisCard>

        <AnalysisCard icon={<Cloud />} title="Railway Deployment Blueprint">
          <div className="space-y-6">
            <StackItem
              label="Recommended platform"
              value={railwayPlan?.platform || deploymentRecommendation?.platform}
            />
            <RecommendationList title="Services" items={railwayServices} />
            <RecommendationList
              title="Environment variables"
              items={railwayPlan?.environmentVariables}
            />
            <div>
              <h4 className="text-sm font-medium text-slate-400">
                Deployment strategy
              </h4>
              <p className="mt-2 leading-7 text-slate-200">
                {deploymentStrategy || "Not detected"}
              </p>
            </div>
          </div>
        </AnalysisCard>

        <AnalysisCard icon={<GitBranch />} title="Deployment Checklist">
          <RecommendationList
            title="Pre-deployment actions"
            items={analysis.deploymentChecklist?.checklist}
            numbered
          />
        </AnalysisCard>

        <AnalysisCard icon={<Sparkles />} title="Security Recommendations">
          <RecommendationList
            title="Security controls"
            items={architectureRecommendation?.securityRecommendations}
          />
        </AnalysisCard>

        <AnalysisCard icon={<Server />} title="Scaling Recommendations">
          <RecommendationList
            title="Performance and resilience"
            items={architectureRecommendation?.scalingRecommendations}
          />
        </AnalysisCard>
      </div>
    </section>
  );
}


function ReadinessScorePanel({
  readinessScore,
}: {
  readinessScore?: ReadinessScore;
}) {
  const hasScore = typeof readinessScore?.score === "number";
  const score = hasScore
    ? Math.min(100, Math.max(0, Math.round(readinessScore.score ?? 0)))
    : 0;

  return (
    <div>
      <div className="flex items-center gap-5">
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-4 border-blue-500/50 bg-blue-500/10">
          <span className="text-3xl font-bold text-white">
            {hasScore ? score : "—"}
          </span>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            out of 100
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-400">Readiness grade</p>
          <p className="mt-1 text-2xl font-semibold text-blue-300">
            {readinessScore?.grade || "Not scored"}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <RecommendationList
          title="Readiness improvements"
          items={readinessScore?.improvements}
        />
      </div>
    </div>
  );
}


function AnalysisCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left shadow-xl shadow-blue-950/20 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      <div className="mt-6">{children}</div>
    </article>
  );
}


function StackItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value?: string | string[] | null;
  wide?: boolean;
}) {
  const values = Array.isArray(value) ? value.filter(Boolean) : [];

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/60 p-4 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <dt className="text-sm font-medium text-slate-400">{label}</dt>
      <dd className="mt-2">
        {Array.isArray(value) ? (
          values.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {values.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-200"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-300">Not detected</span>
          )
        ) : (
          <span className="leading-6 text-slate-200">
            {value || "Not detected"}
          </span>
        )}
      </dd>
    </div>
  );
}


function RecommendationList({
  title,
  items,
  numbered = false,
}: {
  title: string;
  items?: string[];
  numbered?: boolean;
}) {
  const recommendations = items?.filter(Boolean) ?? [];

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-400">{title}</h4>

      {recommendations.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {recommendations.map((item, index) => (
            <li key={item} className="flex gap-3 leading-6 text-slate-200">
              <span
                aria-hidden="true"
                className={
                  numbered
                    ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-semibold text-blue-300"
                    : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"
                }
              >
                {numbered ? index + 1 : null}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-slate-300">Not detected</p>
      )}
    </div>
  );
}


function createArchitectureReportDownload(analysis: RepositoryAnalysis) {
  const report = buildArchitectureReport(analysis);
  const repositoryName =
    analysis.repositoryMetadata?.name || analysis.name || "repository";
  const safeRepositoryName = repositoryName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    href: `data:text/markdown;charset=utf-8,${encodeURIComponent(report)}`,
    fileName: `${safeRepositoryName || "repository"}-architecture-report.md`,
  };
}

function buildArchitectureReport(analysis: RepositoryAnalysis): string {
  const metadata = analysis.repositoryMetadata;
  const technologyStack = analysis.technologyStack;
  const deploymentRecommendation = analysis.deploymentRecommendation;
  const architectureRecommendation = analysis.architectureRecommendation;
  const railwayPlan = architectureRecommendation?.railwayDeploymentPlan;
  const readinessScore = analysis.readinessScore;
  const repositoryName = metadata?.fullName || metadata?.name || analysis.name;
  const railwayServices = railwayPlan?.services?.length
    ? railwayPlan.services
    : deploymentRecommendation?.services;

  return `# LaunchPad AI Architecture Report

Generated: ${new Date().toLocaleString()}

## Repository Information

- **Repository:** ${repositoryName || "Not detected"}
- **Description:** ${metadata?.description || analysis.description || "Not detected"}
- **Primary language:** ${metadata?.language || analysis.language || "Not detected"}
- **Stars:** ${metadata?.stars ?? analysis.stars ?? "Not detected"}
- **Default branch:** ${metadata?.defaultBranch || "Not detected"}
- **Repository URL:** ${metadata?.url || "Not detected"}

## Technology Stack

- **Frontend:** ${formatInlineList(technologyStack?.frontend)}
- **Backend:** ${formatInlineList(technologyStack?.backend)}
- **Database:** ${formatInlineList(technologyStack?.database)}
- **Containerized:** ${technologyStack?.containerized ? "Yes" : "Not detected"}
- **Infrastructure:** ${formatInlineList(technologyStack?.infrastructure)}
- **CI/CD:** ${formatInlineList(technologyStack?.cicd)}

## Architecture Recommendation

**Type:** ${architectureRecommendation?.applicationArchitecture?.type || "Not detected"}

${formatMarkdownList(architectureRecommendation?.applicationArchitecture?.components)}

## Railway Deployment Plan

- **Platform:** ${railwayPlan?.platform || deploymentRecommendation?.platform || "Not detected"}

### Services

${formatMarkdownList(railwayServices)}

### Environment Variables

${formatMarkdownList(railwayPlan?.environmentVariables)}

### Deployment Strategy

${railwayPlan?.deploymentStrategy || deploymentRecommendation?.strategy || "Not detected"}

## Cloud Readiness Score

- **Score:** ${readinessScore?.score ?? "Not scored"}/100
- **Grade:** ${readinessScore?.grade || "Not scored"}

### Improvements

${formatMarkdownList(readinessScore?.improvements)}

## Deployment Checklist

${formatMarkdownList(analysis.deploymentChecklist?.checklist, true)}

## Security Recommendations

${formatMarkdownList(architectureRecommendation?.securityRecommendations)}

## Scaling Recommendations

${formatMarkdownList(architectureRecommendation?.scalingRecommendations)}
`;
}

function formatInlineList(items?: string[]): string {
  const values = items?.filter(Boolean) ?? [];
  return values.length > 0 ? values.join(", ") : "Not detected";
}

function formatMarkdownList(items?: string[], numbered = false): string {
  const values = items?.filter(Boolean) ?? [];

  if (values.length === 0) {
    return "- Not detected";
  }

  return values
    .map((item, index) => `${numbered ? `${index + 1}.` : "-"} ${item}`)
    .join("\n");
}



function Workflow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {

  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="text-blue-400">
        {icon}
      </div>

      <h3 className="mt-4 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-slate-400">
        {text}
      </p>

    </div>

  );
}



function Card({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {

  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="text-blue-400">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-slate-400">
        {value}
      </p>

    </div>

  );
}


export default App;
