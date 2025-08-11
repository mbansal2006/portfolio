import React, { useMemo, useState } from "react";
import { ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend, Label } from "recharts";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// --- Raw leaderboard data ---
// Minimal fields needed for the viz; you can add more as needed.
const RAW = [
  { system: "Human Panel", org: "Human", type: "N/A", agi1: 98.0, agi2: 100.0, cost: 17.0 },
  { system: "Grok 4 (Thinking)", org: "xAI", type: "CoT", agi1: 66.7, agi2: 16.0, cost: 2.17 },
  { system: "GPT-5 (High)", org: "OpenAI", type: "CoT", agi1: 65.7, agi2: 9.9, cost: 0.730 },
  { system: "Claude Opus 4 (Thinking 16K)", org: "Anthropic", type: "CoT", agi1: 35.7, agi2: 8.6, cost: 1.93 },
  { system: "GPT-5 (Medium)", org: "OpenAI", type: "CoT", agi1: 56.2, agi2: 7.5, cost: 0.449 },
  { system: "o3 (High)", org: "OpenAI", type: "CoT", agi1: 60.8, agi2: 6.5, cost: 0.834 },
  { system: "o4-mini (High)", org: "OpenAI", type: "CoT", agi1: 58.7, agi2: 6.1, cost: 0.856 },
  { system: "Claude Sonnet 4 (Thinking 16K)", org: "Anthropic", type: "CoT", agi1: 40.0, agi2: 5.9, cost: 0.486 },
  { system: "o3-Pro (High)", org: "OpenAI", type: "CoT + Synthesis", agi1: 59.3, agi2: 4.9, cost: 7.55 },
  { system: "Gemini 2.5 Pro (Thinking 32K)", org: "Google", type: "CoT", agi1: 37.0, agi2: 4.9, cost: 0.757 },
  { system: "Claude Opus 4 (Thinking 8K)", org: "Anthropic", type: "CoT", agi1: 30.7, agi2: 4.5, cost: 1.16 },
  { system: "GPT-5 Mini (High)", org: "OpenAI", type: "CoT", agi1: 54.3, agi2: 4.4, cost: 0.198 },
  { system: "Gemini 2.5 Pro (Thinking 16K)", org: "Google", type: "CoT", agi1: 41.0, agi2: 4.0, cost: 0.715 },
  { system: "GPT-5 Mini (Medium)", org: "OpenAI", type: "CoT", agi1: 37.3, agi2: 4.0, cost: 0.063 },
  { system: "o3-preview (Low)", org: "OpenAI", type: "CoT + Synthesis", agi1: 75.7, agi2: 4.0, cost: 200.0 },
  { system: "Gemini 2.5 Pro (Preview)", org: "Google", type: "CoT", agi1: 33.0, agi2: 3.8, cost: 0.813 },
  { system: "Gemini 2.5 Pro (Preview, Thinking 1K)", org: "Google", type: "CoT", agi1: 31.3, agi2: 3.4, cost: 0.804 },
  { system: "o3-mini (High)", org: "OpenAI", type: "CoT", agi1: 34.5, agi2: 3.0, cost: 0.547 },
  { system: "o3 (Medium)", org: "OpenAI", type: "CoT", agi1: 53.8, agi2: 3.0, cost: 0.479 },
  { system: "Gemini 2.5 Pro (Thinking 8K)", org: "Google", type: "CoT", agi1: 29.5, agi2: 2.9, cost: 0.444 },
  { system: "GPT-5 Nano (High)", org: "OpenAI", type: "CoT", agi1: 16.7, agi2: 2.6, cost: 0.029 },
  { system: "Gemini 2.5 Flash (Preview) (Thinking 24K)", org: "Google", type: "CoT", agi1: 32.3, agi2: 2.5, cost: 0.319 },
  { system: "ARChitects", org: "ARC Prize 2024", type: "Custom", agi1: 56.0, agi2: 2.5, cost: 0.200 },
  { system: "o4-mini (Medium)", org: "OpenAI", type: "CoT", agi1: 41.8, agi2: 2.4, cost: 0.231 },
  { system: "Gemini 2.5 Flash (Preview) (Thinking 1K)", org: "Google", type: "CoT", agi1: 16.0, agi2: 2.2, cost: 0.030 },
  { system: "Gemini 2.5 Flash (Preview) (Thinking 8K)", org: "Google", type: "CoT", agi1: 25.8, agi2: 2.1, cost: 0.199 },
  { system: "Claude Sonnet 4 (Thinking 8K)", org: "Anthropic", type: "CoT", agi1: 29.0, agi2: 2.1, cost: 0.265 },
  { system: "o3-mini (Medium)", org: "OpenAI", type: "CoT", agi1: 22.3, agi2: 2.1, cost: 0.284 },
  { system: "o3-Pro (Low)", org: "OpenAI", type: "CoT + Synthesis", agi1: 44.3, agi2: 2.1, cost: 2.23 },
  { system: "o3 (Low)", org: "OpenAI", type: "CoT", agi1: 41.5, agi2: 2.0, cost: 0.234 },
  { system: "Gemini 2.5 Flash (Preview) (Thinking 16K)", org: "Google", type: "CoT", agi1: 33.3, agi2: 2.0, cost: 0.317 },
  { system: "o3-Pro (Medium)", org: "OpenAI", type: "CoT + Synthesis", agi1: 57.0, agi2: 1.9, cost: 4.74 },
  { system: "GPT-5 (Low)", org: "OpenAI", type: "CoT", agi1: 44.0, agi2: 1.9, cost: 0.190 },
  { system: "Gemini 2.5 Flash (Preview)", org: "Google", type: "CoT", agi1: 33.3, agi2: 1.7, cost: 0.057 },
  { system: "o4-mini (Low)", org: "OpenAI", type: "CoT", agi1: 21.3, agi2: 1.7, cost: 0.050 },
  { system: "GPT-5 Mini (Minimal)", org: "OpenAI", type: "CoT", agi1: 5.3, agi2: 1.7, cost: 0.009 },
  { system: "Icecuber", org: "ARC Prize 2024", type: "Custom", agi1: 17.0, agi2: 1.6, cost: 0.130 },
  { system: "Gemini 2.0 Flash", org: "Google", type: "Base LLM", agi1: undefined, agi2: 1.3, cost: 0.004 },
  { system: "Deepseek R1", org: "Deepseek", type: "CoT", agi1: 15.8, agi2: 1.3, cost: 0.080 },
  { system: "Codex Mini (Latest)", org: "OpenAI", type: "CoT", agi1: 27.3, agi2: 1.3, cost: 0.230 },
  { system: "Claude Sonnet 4", org: "Anthropic", type: "Base LLM", agi1: 23.8, agi2: 1.3, cost: 0.127 },
  { system: "Claude Opus 4", org: "Anthropic", type: "CoT", agi1: 22.5, agi2: 1.3, cost: 0.639 },
  { system: "o1 (Medium)", org: "OpenAI", type: "CoT", agi1: 30.7, agi2: 1.3, cost: 2.61 },
  { system: "Qwen3-235b-a22b Instruct (25/07)", org: "Alibaba", type: "Base LLM", agi1: 11.0, agi2: 1.3, cost: 0.004 },
  { system: "Deepseek R1 (05/28)", org: "Deepseek", type: "CoT", agi1: 21.2, agi2: 1.1, cost: 0.053 },
  { system: "o1-pro (Low)", org: "OpenAI", type: "CoT + Synthesis", agi1: 23.3, agi2: 0.9, cost: 13.95 },
  { system: "Claude 3.7 (8K)", org: "Anthropic", type: "CoT", agi1: 21.2, agi2: 0.9, cost: 0.360 },
  { system: "GPT-5 Nano (Medium)", org: "OpenAI", type: "CoT", agi1: 20.7, agi2: 0.9, cost: 0.014 },
  { system: "Claude Sonnet 4 (Thinking 1K)", org: "Anthropic", type: "CoT", agi1: 28.0, agi2: 0.9, cost: 0.142 },
  { system: "o1-mini", org: "OpenAI", type: "CoT", agi1: 14.0, agi2: 0.8, cost: 0.191 },
  { system: "o1 (Low)", org: "OpenAI", type: "CoT", agi1: 27.2, agi2: 0.8, cost: 1.47 },
  { system: "GPT-5 Mini (Low)", org: "OpenAI", type: "CoT", agi1: 26.3, agi2: 0.8, cost: 0.019 },
  { system: "Gemini 1.5 Pro", org: "Google", type: "Base LLM", agi1: undefined, agi2: 0.8, cost: 0.040 },
  { system: "GPT-4.5", org: "OpenAI", type: "Base LLM", agi1: 10.3, agi2: 0.8, cost: 2.10 },
  { system: "Claude 3.7 (16K)", org: "Anthropic", type: "CoT", agi1: 28.6, agi2: 0.7, cost: 0.510 },
  { system: "GPT-4.1", org: "OpenAI", type: "Base LLM", agi1: 5.5, agi2: 0.4, cost: 0.069 },
  { system: "Grok 3 Mini (Low)", org: "xAI", type: "CoT", agi1: 16.5, agi2: 0.4, cost: 0.013 },
  { system: "Claude 3.7 (1K)", org: "Anthropic", type: "CoT", agi1: 11.6, agi2: 0.4, cost: 0.140 },
  { system: "Claude 3.7", org: "Anthropic", type: "Base LLM", agi1: 13.6, agi2: 0.0, cost: 0.120 },
  { system: "GPT-4o", org: "OpenAI", type: "Base LLM", agi1: 4.5, agi2: 0.0, cost: 0.080 },
  { system: "GPT-4o-mini", org: "OpenAI", type: "Base LLM", agi1: undefined, agi2: 0.0, cost: 0.010 },
  { system: "Llama 4 Maverick", org: "Meta", type: "Base LLM", agi1: 4.4, agi2: 0.0, cost: 0.012 },
  { system: "Llama 4 Scout", org: "Meta", type: "Base LLM", agi1: 0.5, agi2: 0.0, cost: 0.006 },
  { system: "GPT-4.1-Nano", org: "OpenAI", type: "Base LLM", agi1: 0.0, agi2: 0.0, cost: 0.004 },
  { system: "GPT-4.1-Mini", org: "OpenAI", type: "Base LLM", agi1: 3.5, agi2: 0.0, cost: 0.014 },
  { system: "o3-mini (Low)", org: "OpenAI", type: "CoT", agi1: 14.5, agi2: 0.0, cost: 0.062 },
  { system: "o1-preview", org: "OpenAI", type: "CoT", agi1: 18.0, agi2: undefined, cost: 1.64 },
  { system: "Claude Opus 4 (Thinking 1K)", org: "Anthropic", type: "CoT", agi1: 27.0, agi2: 0.0, cost: 0.750 },
  { system: "Grok 3", org: "xAI", type: "Base LLM", agi1: 5.5, agi2: 0.0, cost: 0.142 },
  { system: "Magistral Small", org: "Mistral", type: "CoT", agi1: 5.0, agi2: 0.0, cost: 0.049 },
  { system: "Magistral Medium", org: "Mistral", type: "CoT", agi1: 5.9, agi2: 0.0, cost: 0.108 },
  { system: "Magistral Medium (Thinking)", org: "Mistral", type: "CoT", agi1: 6.1, agi2: 0.0, cost: 0.123 },
  { system: "Gemini 2.5 Pro (Thinking 1K)", org: "Google", type: "CoT", agi1: 16.0, agi2: 0.0, cost: 0.088 },
  { system: "GPT-5 (Minimal)", org: "OpenAI", type: "Base LLM", agi1: 6.0, agi2: 0.0, cost: 0.056 },
  { system: "GPT-5 Nano (Low)", org: "OpenAI", type: "CoT", agi1: 4.0, agi2: 0.0, cost: 0.003 },
  { system: "GPT-5 Nano (Minimal)", org: "OpenAI", type: "CoT", agi1: 1.5, agi2: 0.0, cost: 0.003 },
];

// Color mapping for organizations
const orgColors = {
  "OpenAI": "#10a37f",
  "Anthropic": "#d97706", 
  "Google": "#dc2626",
  "xAI": "#7c3aed",
  "Meta": "#0891b2",
  "Deepseek": "#059669",
  "Alibaba": "#ea580c",
  "Mistral": "#be185d",
  "ARC Prize 2024": "#f59e0b",
  "Human": "#6b7280"
};

// Shape mapping for model types
const typeShapes = {
  "Base LLM": "circle",
  "CoT": "square", 
  "CoT + Synthesis": "triangle",
  "Custom": "diamond",
  "N/A": "circle"
};

function computePareto(data, metricKey) {
  // Keep only points that have both cost and the chosen metric
  const clean = data
    .filter(d => typeof d.cost === "number" && typeof d[metricKey] === "number")
    .sort((a, b) => a.cost - b.cost);
  
  const frontier = [];
  let best = -Infinity;
  
  for (const pt of clean) {
    if (pt[metricKey] > best) {
      frontier.push(pt);
      best = pt[metricKey];
    }
  }
  
  // Sort frontier by cost for proper line connection
  frontier.sort((a, b) => a.cost - b.cost);
  
  return frontier;
}

function downloadCSV(rows) {
  const header = ["system","org","type","agi1","agi2","cost"]; 
  const lines = [header.join(",")].concat(
    rows.map(r => header.map(h => r[h] ?? "").join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "arc_leaderboard.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const numberFmt = (n) =>
  typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 3 }) : "—";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{data.system}</p>
        <p className="text-muted-foreground text-sm">Organization: {data.org}</p>
        <p className="text-muted-foreground text-sm">Type: {data.type}</p>
        <p className="text-muted-foreground text-sm">Cost: ${numberFmt(data.cost)}</p>
        <p className="text-muted-foreground text-sm">ARC-AGI-1: {numberFmt(data.agi1)}%</p>
        <p className="text-muted-foreground text-sm">ARC-AGI-2: {numberFmt(data.agi2)}%</p>
      </div>
    );
  }
  return null;
};

export default function ArcPPFDashboard() {
  const [metric, setMetric] = useState("agi1"); // "agi1" | "agi2"
  const [showHumans, setShowHumans] = useState(true); // Changed to true by default
  const [orgFilter, setOrgFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const orgs = useMemo(() => ["All", ...Array.from(new Set(RAW.map(d => d.org)))], []);
  const types = useMemo(() => ["All", ...Array.from(new Set(RAW.map(d => d.type)))], []);

  const data = useMemo(() => {
    return RAW.filter(d => (showHumans ? true : d.org !== "Human"))
      .filter(d => (orgFilter === "All" ? true : d.org === orgFilter))
      .filter(d => (typeFilter === "All" ? true : d.type === typeFilter));
  }, [showHumans, orgFilter, typeFilter]);

  const frontier = useMemo(() => computePareto(data, metric), [data, metric]);
  
  const yLabel = metric === "agi1" ? "ARC-AGI-1 (%)" : "ARC-AGI-2 (%)";

  // Group data by organization for different colors
  const groupedData = useMemo(() => {
    const groups = {};
    data.forEach(d => {
      if (!groups[d.org]) {
        groups[d.org] = [];
      }
      groups[d.org].push(d);
    });
    return groups;
  }, [data]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Navigation */}
        <nav className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">AI Intelligence Frontier</h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-6">
            A Production Possibilities Frontier (PPF) visualization of AI performance vs. cost using data from the <a href="https://arcprize.org/leaderboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-2">ARC Prize leaderboard</a>.
          </p>
          
          {/* PPF Explanation */}
          <div className="space-y-6 mb-8">
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <h2 className="text-3xl font-semibold text-foreground mb-6">What is a Production Possibilities Frontier?</h2>
              <p>
                A Production Possibilities Frontier (PPF) is an economic concept that shows the maximum possible combinations of two goods or services that can be produced with given resources and technology. In this case, we're mapping <strong>AI performance</strong> against <strong>computational cost</strong>.
              </p>
              <p>
                <strong>Key insights from this PPF:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Efficient allocations:</strong> Combinations on the PPF (red line) represent efficient allocations of resources - the economy is producing the maximum possible output given its resources and technology</li>
                <li><strong>Trade-offs:</strong> Moving along the curve means producing more of one good requires producing less of the other (opportunity cost)</li>
                <li><strong>Inefficient points:</strong> Systems below the frontier are inefficient - they could achieve better performance for the same cost</li>
                <li><strong>Impossible combinations:</strong> Points above the frontier are currently impossible with existing technology</li>
              </ul>
              <p>
                <strong>Why this matters for AI:</strong> The ARC Prize measures "intelligence efficiency" - not just how well AI systems solve problems, but how efficiently they do so with minimal computational resources. This frontier helps us understand the current state of AI capabilities and identify opportunities for improvement.
              </p>
            </div>

            {/* ARC Prize Context */}
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <h2 className="text-3xl font-semibold text-foreground mb-6">About the ARC Prize Data</h2>
              <p>
                The ARC Prize evaluates AI systems on two key benchmarks:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>ARC-AGI-1:</strong> Measures basic fluid intelligence - the ability to solve novel problems without prior training</li>
                <li><strong>ARC-AGI-2:</strong> Challenges systems to demonstrate both high adaptability and high efficiency under stricter evaluation criteria</li>
              </ul>
              <p>
                The scatter plot visualizes the critical relationship between cost-per-task and performance - a key measure of intelligence efficiency. True intelligence isn't just about solving problems, but solving them efficiently with minimal resources.
              </p>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="space-y-2">
            <label className="block text-sm text-muted-foreground">Metric</label>
            <div className="flex gap-2">
              <button
                className={`px-3 py-2 rounded-md text-sm transition-colors ${metric === "agi1" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
                onClick={() => setMetric("agi1")}
              >ARC‑AGI‑1</button>
              <button
                className={`px-3 py-2 rounded-md text-sm transition-colors ${metric === "agi2" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
                onClick={() => setMetric("agi2")}
              >ARC‑AGI‑2</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-muted-foreground">Organization</label>
            <select
              className="w-full bg-secondary text-secondary-foreground rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
            >
              {orgs.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-muted-foreground">System Type</label>
            <select
              className="w-full bg-secondary text-secondary-foreground rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            >
              {types.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-muted-foreground">Options</label>
            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox" className="accent-primary"
                  checked={showHumans} onChange={(e) => setShowHumans(e.target.checked)}
                /> Include humans
              </label>
              <button
                onClick={() => downloadCSV(data)}
                className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >Download CSV</button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">PPF: {yLabel} vs Cost</h2>
              <p className="text-muted-foreground">X axis uses a log scale. Points on the red curve are Pareto‑efficient for the chosen metric.</p>
            </div>
          </div>

          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  dataKey="cost"
                  name="Cost"
                  scale="log"
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => `$${v}`}
                  stroke="hsl(var(--muted-foreground))"
                >
                  <Label value="Cost per task (USD, log scale)" offset={-5} position="insideBottom" fill="hsl(var(--muted-foreground))" />
                </XAxis>
                <YAxis
                  type="number"
                  dataKey={metric}
                  name={yLabel}
                  domain={[0, "auto"]}
                  stroke="hsl(var(--muted-foreground))"
                >
                  <Label value={yLabel} angle={-90} position="insideLeft" style={{ textAnchor: "middle" }} fill="hsl(var(--muted-foreground))" />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                
                {/* Render scatter plots for each organization */}
                {Object.entries(groupedData).map(([org, orgData]) => (
                  <Scatter 
                    key={org}
                    data={orgData as any[]} 
                    name={org}
                    fill={orgColors[org] || "#6b7280"}
                    opacity={0.7}
                  />
                ))}
                
                {/* Frontier line */}
                {frontier.length > 0 && (
                  <Line
                    type="monotone"
                    data={frontier}
                    dataKey={metric}
                    name="PPF"
                    stroke="hsl(var(--destructive))"
                    dot={{ r: 4, fill: "hsl(var(--destructive))" }}
                    strokeWidth={3}
                    connectNulls={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Organizations (Colors)</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(orgColors).map(([org, color]) => (
                  <div key={org} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-muted-foreground">{org}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Model Types (Shapes)</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(typeShapes).map(([type, shape]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ 
                      backgroundColor: "hsl(var(--primary))",
                      borderRadius: shape === "circle" ? "50%" : "0",
                      transform: shape === "triangle" ? "rotate(45deg)" : shape === "diamond" ? "rotate(45deg)" : "none"
                    }}></div>
                    <span className="text-muted-foreground">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Data (sorted by cost)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left font-medium p-3">System</th>
                  <th className="text-left font-medium p-3">Org</th>
                  <th className="text-left font-medium p-3">Type</th>
                  <th className="text-right font-medium p-3">Cost</th>
                  <th className="text-right font-medium p-3">ARC‑AGI‑1</th>
                  <th className="text-right font-medium p-3">ARC‑AGI‑2</th>
                  <th className="text-right font-medium p-3">On PPF</th>
                </tr>
              </thead>
              <tbody>
                {[...data].sort((a, b) => a.cost - b.cost).map((d) => {
                  const onFrontier = !!frontier.find(f => f.system === d.system);
                  return (
                    <tr key={d.system} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="p-3 whitespace-nowrap text-foreground">{d.system}</td>
                      <td className="p-3 whitespace-nowrap text-muted-foreground">{d.org}</td>
                      <td className="p-3 whitespace-nowrap text-muted-foreground">{d.type}</td>
                      <td className="p-3 text-right text-muted-foreground">${numberFmt(d.cost)}</td>
                      <td className="p-3 text-right text-muted-foreground">{numberFmt(d.agi1)}</td>
                      <td className="p-3 text-right text-muted-foreground">{numberFmt(d.agi2)}</td>
                      <td className="p-3 text-right">
                        {onFrontier ? <span className="text-primary font-semibold">✓</span> : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="text-muted-foreground text-sm mt-8 pt-8 border-t border-border">
          <p>Tip: Switch to ARC‑AGI‑2 to see how the frontier shifts for robustness under stricter evaluations. You can also include or exclude humans from the plot.</p>
          <p className="mt-2">Data source: <a href="https://arcprize.org/leaderboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-2">ARC Prize Leaderboard</a></p>
        </footer>
      </div>
    </div>
  );
}