import { useState } from "react";
import { analyzeRepository } from "./services/api";
import {
  Cloud,
  Sparkles,
  Server,
  Database,
  GitBranch,
  ArrowRight,
} from "lucide-react";

type RepositoryMetadata = {
  name?: string;
  description?: string | null;
  language?: string | null;
  stars?: number;
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
    services?: string[];
    environmentVariables?: string[];
    deploymentStrategy?: string;
  };
  scalingRecommendations?: string[];
  securityRecommendations?: string[];
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
};

type AnalyzeRepositoryResponse = {
  analysis?: RepositoryAnalysis;
};

function App() {
  const [repository, setRepository] = useState("");
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    const repositoryUrl = repository.trim();

    if (!repositoryUrl) {
      return;
    }

    try {
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
    } finally {
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
            {loading ? "Analyzing..." : "Generate Architecture Plan"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </div>

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

  return (
    <section className="mx-auto mt-12 max-w-6xl" aria-labelledby="analysis-title">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
          Repository Intelligence
        </p>
        <h2 id="analysis-title" className="mt-3 text-3xl font-bold">
          Cloud Architecture Dashboard
        </h2>
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
              label="Description"
              value={metadata?.description || analysis.description}
              wide
            />
          </dl>
        </AnalysisCard>

        <AnalysisCard icon={<Server />} title="Technology Stack">
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

        <AnalysisCard icon={<Cloud />} title="Railway Deployment Blueprint">
          <div className="space-y-6">
            <StackItem
              label="Recommended platform"
              value={deploymentRecommendation?.platform}
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

        <AnalysisCard icon={<Sparkles />} title="Architecture Recommendations">
          <div className="space-y-6">
            <StackItem
              label="Application architecture"
              value={
                architectureRecommendation?.applicationArchitecture?.type
              }
            />
            <RecommendationList
              title="Components"
              items={
                architectureRecommendation?.applicationArchitecture?.components
              }
            />
            <RecommendationList
              title="Scaling recommendations"
              items={architectureRecommendation?.scalingRecommendations}
            />
            <RecommendationList
              title="Security recommendations"
              items={architectureRecommendation?.securityRecommendations}
            />
          </div>
        </AnalysisCard>
      </div>
    </section>
  );
}


function AnalysisCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left shadow-xl shadow-blue-950/20">
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
}: {
  title: string;
  items?: string[];
}) {
  const recommendations = items?.filter(Boolean) ?? [];

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-400">{title}</h4>

      {recommendations.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {recommendations.map((item) => (
            <li key={item} className="flex gap-3 leading-6 text-slate-200">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"
              />
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
