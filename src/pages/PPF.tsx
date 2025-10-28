import React, { useMemo, useState } from "react";
import { ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend, Label, ReferenceLine } from "recharts";
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

// Color mapping for organizations - all very distinct
const orgColors = {
  "OpenAI": "#10a37f",      // Green
  "Anthropic": "#dc2626",   // Red
  "Google": "#3b82f6",      // Blue
  "xAI": "#8b5cf6",         // Purple
  "Meta": "#06b6d4",        // Cyan
  "Deepseek": "#f59e0b",    // Orange
  "Alibaba": "#fbbf24",     // Yellow
  "Mistral": "#ec4899",     // Pink
  "ARC Prize 2024": "#84cc16", // Lime Green
  "Human": "#6b7280"        // Gray
};

// Country flag mapping for organizations
const orgFlags = {
  "OpenAI": "🇺🇸",
  "Anthropic": "🇺🇸", 
  "Google": "🇺🇸",
  "xAI": "🇺🇸",
  "Meta": "🇺🇸",
  "Deepseek": "🇨🇳",
  "Alibaba": "🇨🇳",
  "Mistral": "🇫🇷",
  "ARC Prize 2024": "🌍",
  "Human": "🌍"
};

// Custom shape components for different model types
const CustomShape = (props: any) => {
  const { cx, cy, type, fill, org } = props;
  const flag = orgFlags[org] || "🌍";
  
  if (type === "square") {
    return (
      <g>
        <rect
          x={cx - 6}
          y={cy - 6}
          width={12}
          height={12}
          fill={fill}
          opacity={0.9}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="16" fill="hsl(var(--foreground))" fontWeight="bold">{flag}</text>
      </g>
    );
  } else if (type === "triangle") {
    return (
      <g>
        <polygon
          points={`${cx},${cy - 6} ${cx - 6},${cy + 6} ${cx + 6},${cy + 6}`}
          fill={fill}
          opacity={0.9}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="16" fill="hsl(var(--foreground))" fontWeight="bold">{flag}</text>
      </g>
    );
  } else if (type === "diamond") {
    return (
      <g>
        <polygon
          points={`${cx},${cy - 6} ${cx - 6},${cy} ${cx},${cy + 6} ${cx + 6},${cy}`}
          fill={fill}
          opacity={0.9}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="16" fill="hsl(var(--foreground))" fontWeight="bold">{flag}</text>
      </g>
    );
  } else if (type === "cross") {
    return (
      <g>
        <line x1={cx - 6} y1={cy - 6} x2={cx + 6} y2={cy + 6} stroke={fill} strokeWidth={2} opacity={0.9} />
        <line x1={cx - 6} y1={cy + 6} x2={cx + 6} y2={cy - 6} stroke={fill} strokeWidth={2} opacity={0.9} />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="16" fill="hsl(var(--foreground))" fontWeight="bold">{flag}</text>
      </g>
    );
  } else {
    // circle (default)
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={fill}
          opacity={0.9}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="16" fill="hsl(var(--foreground))" fontWeight="bold">{flag}</text>
      </g>
    );
  }
};

// Shape mapping for model types
const typeShapes = {
  "Base LLM": "circle",
  "CoT": "square", 
  "CoT + Synthesis": "triangle",
  "Custom": "diamond",
  "N/A": "cross"
};

function computePareto(data, metricKey) {
  // Keep only points that have both cost and the chosen metric
  const clean = data
    .filter(d => typeof d.cost === "number" && typeof d[metricKey] === "number");
  
  const frontier = [];
  
  // For each point, check if it's dominated by any other point
  for (const pt of clean) {
    let isDominated = false;
    
    for (const other of clean) {
      // A point is dominated if there's another point with:
      // 1. Lower or equal cost AND higher performance, OR
      // 2. Lower cost AND equal or higher performance
      if (other !== pt && 
          other.cost <= pt.cost && 
          other[metricKey] > pt[metricKey]) {
        isDominated = true;
        break;
      }
    }
    
    if (!isDominated) {
      frontier.push(pt);
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
  const [countryFilter, setCountryFilter] = useState("All");
  const [showParetoOnly, setShowParetoOnly] = useState(false);

  const orgs = useMemo(() => ["All", ...Array.from(new Set(RAW.map(d => d.org)))], []);
  const types = useMemo(() => ["All", ...Array.from(new Set(RAW.map(d => d.type)))], []);
  const countries = useMemo(() => ["All", "🇺🇸 United States", "🇨🇳 China", "🇫🇷 France", "🌍 International"], []);

  const data = useMemo(() => {
    const filtered = RAW.filter(d => (showHumans ? true : d.org !== "Human"))
      .filter(d => (orgFilter === "All" ? true : d.org === orgFilter))
      .filter(d => (typeFilter === "All" ? true : d.type === typeFilter))
      .filter(d => {
        if (countryFilter === "All") return true;
        if (d.org === "Human") return true; // Always include humans regardless of country filter
        const orgFlag = orgFlags[d.org] || "🌍";
        const countryName = countryFilter.split(" ").slice(1).join(" "); // Extract country name from "🇺🇸 United States"
        if (countryName === "United States") return orgFlag === "🇺🇸";
        if (countryName === "China") return orgFlag === "🇨🇳";
        if (countryName === "France") return orgFlag === "🇫🇷";
        if (countryName === "International") return orgFlag === "🌍";
        return true;
      });
    
    const clamped = filtered.map(d => ({
      ...d,
      [metric]: typeof d[metric] === 'number' ? Math.min(d[metric], 100) : d[metric]
    }));
    
    return clamped;
  }, [showHumans, orgFilter, typeFilter, countryFilter, metric]);

  const frontier = useMemo(() => computePareto(data, metric), [data, metric]);

  // Apply Pareto filter after computing frontier
  const finalData = useMemo(() => {
    if (!showParetoOnly) return data;
    return data.filter(d => frontier.some(f => f.system === d.system));
  }, [data, frontier, showParetoOnly]);
  

  
  const yLabel = metric === "agi1" ? "ARC-AGI-1 (%)" : "ARC-AGI-2 (%)";

  // Group data by organization for different colors
  const groupedData = useMemo(() => {
    const groups = {};
    finalData.forEach(d => {
      if (!groups[d.org]) {
        groups[d.org] = [];
      }
      groups[d.org].push(d);
    });
    return groups;
  }, [finalData]);

  return (
    <div className="min-h-screen bg-black text-yellow-400 font-mono">
      {/* Navigation Bar */}
      <div className="bg-yellow-900 border-b-2 border-yellow-400 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">MAHIR BANSAL</h1>
          <div className="text-right">
            <div className="text-sm">AI Frontier</div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="px-4 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-colors border border-yellow-400 rounded"
          >
            🏠 Home
          </Link>
          <a
            href="https://mahirbansal.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-yellow-600 text-white font-bold hover:bg-yellow-700 transition-colors border border-yellow-400 rounded"
          >
            📝 Writings
          </a>
          <div className="px-4 py-2 bg-orange-600 text-white font-bold border border-orange-400 rounded opacity-50">
            🤖 AI Frontier
          </div>
          <a
            href="https://www.linkedin.com/in/mahirbansal/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors border border-blue-400 rounded"
          >
            💼 LinkedIn
          </a>
          <a
            href="mailto:mb@mahirbansal.com"
            className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border border-red-400 rounded"
          >
            📧 Email
          </a>
          <a
            href="https://github.com/mbansal2006"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-600 text-white font-bold hover:bg-gray-700 transition-colors border border-gray-400 rounded"
          >
            💻 GitHub
          </a>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-5xl font-bold text-yellow-300 mb-4">AI Frontier</h1>
          <p className="text-xl text-white leading-relaxed mb-6">
            A Production Possibilities Frontier (PPF) visualization of AI performance vs. cost using data from the <a href="https://arcprize.org/leaderboard" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2">ARC Prize leaderboard</a>.
          </p>
          
          {/* PPF Explanation */}
          <div className="space-y-6 mb-8">
            <div className="space-y-4 text-white leading-relaxed">
              <h2 className="text-3xl font-semibold text-yellow-300 mb-6">What is a Production Possibilities Frontier?</h2>
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
            <div className="space-y-4 text-white leading-relaxed">
              <h2 className="text-3xl font-semibold text-yellow-300 mb-6">About the ARC Prize Data</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="space-y-2">
            <label className="block text-sm text-yellow-300">Metric</label>
            <div className="flex gap-2">
              <button
                className={`px-3 py-2 rounded-md text-sm transition-colors ${metric === "agi1" ? "bg-yellow-600 text-black" : "bg-yellow-900 text-yellow-300 hover:bg-yellow-800"}`}
                onClick={() => setMetric("agi1")}
              >ARC‑AGI‑1</button>
              <button
                className={`px-3 py-2 rounded-md text-sm transition-colors ${metric === "agi2" ? "bg-yellow-600 text-black" : "bg-yellow-900 text-yellow-300 hover:bg-yellow-800"}`}
                onClick={() => setMetric("agi2")}
              >ARC‑AGI‑2</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-yellow-300">Organization</label>
            <select
              className="w-full bg-yellow-900 text-yellow-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-600"
              value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
            >
              {orgs.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-yellow-300">System Type</label>
            <select
              className="w-full bg-yellow-900 text-yellow-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-600"
              value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            >
              {types.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-yellow-300">Country</label>
            <select
              className="w-full bg-yellow-900 text-yellow-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-600"
              value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
            >
              {countries.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-yellow-300">Options</label>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-yellow-300">
                <input
                  type="checkbox" className="accent-yellow-400"
                  checked={showHumans} onChange={(e) => setShowHumans(e.target.checked)}
                /> Include humans
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-yellow-300">
                <input
                  type="checkbox" className="accent-yellow-400"
                  checked={showParetoOnly} onChange={(e) => setShowParetoOnly(e.target.checked)}
                /> Pareto-efficient only
              </label>
              <button
                onClick={() => downloadCSV(finalData)}
                className="px-3 py-2 rounded-md bg-yellow-600 text-black text-sm hover:bg-yellow-700 transition-colors"
              >Download CSV</button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-yellow-300 mb-2">PPF: {yLabel} vs Cost</h2>
              <p className="text-white">X axis uses a log scale. Points on the red curve are Pareto‑efficient for the chosen metric.</p>
            </div>
          </div>

          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }} data={finalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <ReferenceLine y={100} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="cost"
                  name="Cost"
                  scale="log"
                  domain={[0.01, 100]}
                  tickFormatter={(v) => `$${v}`}
                  stroke="hsl(var(--muted-foreground))"
                  ticks={[0.01, 0.1, 1, 10, 100]}
                  allowDataOverflow={false}
                >
                  <Label value="Cost per task (USD, log scale)" offset={-10} position="insideBottom" fill="hsl(var(--muted-foreground))" />
                </XAxis>
                <YAxis
                  type="number"
                  dataKey={metric}
                  name={yLabel}
                  domain={[0, 100]}
                  allowDataOverflow={false}
                  stroke="hsl(var(--muted-foreground))"
                  tickCount={5}
                >
                  <Label value={yLabel} angle={-90} position="insideLeft" offset={-10} style={{ textAnchor: "middle" }} fill="hsl(var(--muted-foreground))" />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                
                {/* Frontier line - draw first (underneath) */}
                {frontier.length > 0 && (
                  <Line
                    type="monotone"
                    data={frontier}
                    dataKey={metric}
                    name="PPF"
                    stroke="hsl(var(--destructive))"
                    dot={false}
                    strokeWidth={3}
                    connectNulls={false}
                  />
                )}
                
                {/* Render scatter plots for each organization and model type combination - draw last (on top) */}
                {Object.entries(groupedData).map(([org, orgData]) => {
                  // Group by model type within each organization
                  const typeGroups: any = {};
                  (orgData as any[]).forEach(d => {
                    if (!typeGroups[d.type]) {
                      typeGroups[d.type] = [];
                    }
                    typeGroups[d.type].push(d);
                  });
                  
                  return Object.entries(typeGroups).map(([type, typeData]) => (
                    <Scatter 
                      key={`${org}-${type}`}
                      data={typeData as any[]} 
                      name={`${org} (${type})`}
                      fill={orgColors[org] || "#6b7280"}
                      opacity={0.7}
                      shape={(props: any) => <CustomShape {...props} type={typeShapes[type] || "circle"} org={org} />}
                    />
                  ));
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-3">Organizations (Colors & Flags)</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(orgColors).map(([org, color]) => (
                  <div key={org} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-white">{orgFlags[org] || "🌍"} {org}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-3">Model Types (Shapes)</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(typeShapes).map(([type, shape]) => (
                  <div key={type} className="flex items-center gap-2">
                    {shape === "circle" && (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fbbf24" }}></div>
                    )}
                    {shape === "square" && (
                      <div className="w-3 h-3" style={{ backgroundColor: "#fbbf24" }}></div>
                    )}
                    {shape === "triangle" && (
                      <div className="w-3 h-3" style={{ 
                        backgroundColor: "#fbbf24",
                        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
                      }}></div>
                    )}
                    {shape === "diamond" && (
                      <div className="w-3 h-3" style={{ 
                        backgroundColor: "#fbbf24",
                        transform: "rotate(45deg)"
                      }}></div>
                    )}
                    {shape === "cross" && (
                      <div className="w-3 h-3 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-0.5" style={{ backgroundColor: "#fbbf24" }}></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-0.5 h-3" style={{ backgroundColor: "#fbbf24" }}></div>
                        </div>
                      </div>
                    )}
                    <span className="text-white">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-yellow-900 border border-yellow-400 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-yellow-300 mb-4">Data (sorted by cost)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white border-b border-yellow-600">
                  <th className="text-left font-medium p-3">System</th>
                  <th className="text-left font-medium p-3">Org</th>
                  <th className="text-left font-medium p-3">Country</th>
                  <th className="text-left font-medium p-3">Type</th>
                  <th className="text-right font-medium p-3">Cost</th>
                  <th className="text-right font-medium p-3">ARC‑AGI‑1</th>
                  <th className="text-right font-medium p-3">ARC‑AGI‑2</th>
                  <th className="text-right font-medium p-3">Pareto-efficient</th>
                </tr>
              </thead>
              <tbody>
                {[...finalData].sort((a, b) => a.cost - b.cost).map((d) => {
                  const onFrontier = !!frontier.find(f => f.system === d.system);
                  const countryFlag = orgFlags[d.org] || "🌍";
                  return (
                    <tr key={d.system} className="border-b border-yellow-600 hover:bg-yellow-800 transition-colors">
                      <td className="p-3 whitespace-nowrap text-white">{d.system}</td>
                      <td className="p-3 whitespace-nowrap text-white">{d.org}</td>
                      <td className="p-3 whitespace-nowrap text-white">{countryFlag}</td>
                      <td className="p-3 whitespace-nowrap text-white">{d.type}</td>
                      <td className="p-3 text-right text-white">${numberFmt(d.cost)}</td>
                      <td className="p-3 text-right text-white">{numberFmt(d.agi1)}</td>
                      <td className="p-3 text-right text-white">{numberFmt(d.agi2)}</td>
                      <td className="p-3 text-right">
                        {onFrontier ? <span className="text-yellow-400 font-semibold">✓</span> : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="text-white text-sm mt-8 pt-8 border-t border-yellow-400">
          <p>Tip: Switch to ARC‑AGI‑2 to see how the frontier shifts for robustness under stricter evaluations. You can also include or exclude humans from the plot.</p>
          <p className="mt-2">Data source: <a href="https://arcprize.org/leaderboard" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2">ARC Prize Leaderboard</a></p>
        </footer>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-yellow-400 p-4 text-center text-yellow-300">
        <p className="font-bold">THANK YOU</p>
        <p className="text-sm mt-1">Technology • Government • Markets</p>
      </div>
    </div>
  );
}