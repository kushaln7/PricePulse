"use client";

import React from "react";
import { Code, Terminal, Layers, Cpu, Server, Monitor, Sparkles } from "lucide-react";

const TECH_ITEMS = [
  { name: "Python 3.12+", role: "Core ML Runtime & Data Pipelines", category: "Machine Learning" },
  { name: "XGBoost Regressor", role: "Gradient-Boosted Decision Trees", category: "Machine Learning" },
  { name: "Scikit-Learn", role: "Metrics, Splits & Ensembles", category: "Machine Learning" },
  { name: "Pandas & NumPy", role: "Time-Series Vectorized Engineering", category: "Data Science" },
  { name: "yfinance", role: "Real-Time Market Data Feeds", category: "Data Science" },
  { name: "FastAPI", role: "High-Performance Async REST API", category: "Backend" },
  { name: "Uvicorn", role: "ASGI Production Server", category: "Backend" },
  { name: "Next.js 16 (App Router)", role: "React Server & Client Framework", category: "Frontend" },
  { name: "TypeScript", role: "End-to-End Type Safety", category: "Frontend" },
  { name: "Tailwind CSS v4", role: "Modern Design System & Glassmorphism", category: "Styling" },
  { name: "Three.js / R3F", role: "Interactive 3D Constellation Visuals", category: "Creative WebGL" },
  { name: "GSAP ScrollTrigger", role: "Frame-Scrubbed Cinematic Animation", category: "Creative WebGL" },
  { name: "Recharts", role: "Interactive Trajectory & Moving Averages", category: "Visualization" }
];

export const TechStackSection: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono mb-3 border border-slate-700">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>PRODUCTION ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Engineered With Modern Tooling
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
          A full-stack machine learning architecture spanning quantitative data science, asynchronous inference microservices, and WebGL creative engineering.
        </p>
      </div>

      {/* Grid of Tech Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {TECH_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                {item.category}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white mt-1 font-mono">
                {item.name}
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-light mt-3">{item.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
