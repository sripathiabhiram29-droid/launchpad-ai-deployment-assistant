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

type RepositoryAnalysis = {
  framework: string;
  backend: string;
  database: string;
  deployment: string;
};

type AnalyzeRepositoryResponse = {
  analysis?: {
    language?: string;
    architecture?: {
      applicationType?: string;
      recommendation?: string;
    };
  };
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

      const response = await analyzeRepository(repositoryUrl) as AnalyzeRepositoryResponse;

      setAnalysis({
        framework: response.analysis?.language || "Unknown",
        backend: response.analysis?.architecture?.applicationType || "Unknown",
        database: "Not detected",
        deployment: response.analysis?.architecture?.recommendation || "Unknown",
      });
    } catch (error) {
      console.error("Repository analysis failed:", error);
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

        {analysis && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left shadow-xl shadow-blue-950/20">
            <h2 className="text-xl font-semibold">Repository Analysis</h2>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <AnalysisResult label="Framework" value={analysis.framework} />
              <AnalysisResult label="Backend" value={analysis.backend} />
              <AnalysisResult label="Database" value={analysis.database} />
              <AnalysisResult label="Deployment" value={analysis.deployment} />
            </dl>
          </div>
        )}

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


function AnalysisResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <dt className="text-sm font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-white">{value}</dd>
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
