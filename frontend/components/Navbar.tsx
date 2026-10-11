"use client";

import React, { useState, useEffect } from "react";
import { Activity, Menu, X, ArrowUpRight, Sparkles } from "lucide-react";

interface NavbarProps {
  onRunPrediction?: () => void;
  systemStatus?: "online" | "loading" | "error";
}

export const Navbar: React.FC<NavbarProps> = ({ onRunPrediction, systemStatus = "online" }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Dashboard", target: "prediction-dashboard" },
    { label: "Market Analysis", target: "market-context" },
    { label: "Technical Signals", target: "technical-indicators" },
    { label: "Model Insights", target: "model-architecture" },
    { label: "Performance", target: "model-performance" },
    { label: "About", target: "about-disclaimer" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? "bg-[#02040a]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 cursor-pointer group select-none"
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
              AI-Powered Market Analysis
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm text-slate-300 font-medium">
          {navLinks.map((item) => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className="hover:text-emerald-400 transition-colors cursor-pointer text-xs uppercase tracking-wider font-mono py-1"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action: Status Pill & Run Prediction */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-beacon absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  systemStatus === "online" ? "bg-emerald-400" : systemStatus === "error" ? "bg-rose-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  systemStatus === "online" ? "bg-emerald-500" : systemStatus === "error" ? "bg-rose-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="text-slate-300">AAPL · XGBoost</span>
          </div>

          <button
            onClick={() => {
              scrollTo("prediction-dashboard");
              if (onRunPrediction) onRunPrediction();
            }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <span>Predict Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#02040a]/95 border-b border-white/10 px-6 py-6 mt-3 space-y-4 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 font-mono text-sm">
            {navLinks.map((item) => (
              <button
                key={item.target}
                onClick={() => scrollTo(item.target)}
                className="text-left py-2 text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-wider text-xs border-b border-white/5"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                scrollTo("prediction-dashboard");
                if (onRunPrediction) onRunPrediction();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2"
            >
              <span>Explore Dashboard</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
