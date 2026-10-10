"use client";

import React, { useState, useEffect } from "react";
import { Activity, Cpu, ArrowUpRight, ShieldCheck } from "lucide-react";

interface NavbarProps {
  onRunPrediction?: () => void;
  systemStatus?: "online" | "loading" | "error";
}

export const Navbar: React.FC<NavbarProps> = ({ onRunPrediction, systemStatus = "online" }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#02040a]/85 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/30 group-hover:border-emerald-400 transition-colors">
            <Activity className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                PRICE<span className="text-emerald-400">PULSE</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                v1.0 ML
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Short-Term Market Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <button
            onClick={() => scrollTo("cinematic-story")}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Storyline
          </button>
          <button
            onClick={() => scrollTo("prediction-dashboard")}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Prediction Engine
          </button>
          <button
            onClick={() => scrollTo("market-context")}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Market Context
          </button>
          <button
            onClick={() => scrollTo("technical-indicators")}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Indicators
          </button>
          <button
            onClick={() => scrollTo("model-architecture")}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            ML Pipeline
          </button>
          <button
            onClick={() => scrollTo("model-performance")}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Evaluation
          </button>
        </nav>

        {/* Right Action: Status Pill & Run Prediction */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-beacon absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">AAPL · XGBoost</span>
          </div>

          <button
            onClick={() => {
              scrollTo("prediction-dashboard");
              if (onRunPrediction) onRunPrediction();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs tracking-wide uppercase transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <span>Predict Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
