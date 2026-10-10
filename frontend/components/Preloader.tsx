"use client";

import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, Database, Zap } from "lucide-react";

export const Preloader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING PRICEPULSE CORE...");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisible(false);
      if (onComplete) onComplete();
      return;
    }

    const intervals = [
      { p: 25, text: "SYNCING MARKET DATA (AAPL, ^GSPC, ^IXIC, ^VIX, XLK)..." },
      { p: 55, text: "CALCULATING 25 TECHNICAL & CONTEXT FEATURES..." },
      { p: 85, text: "LOADING XGBOOST REGRESSION ARTIFACTS..." },
      { p: 100, text: "SYSTEM READY." },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < intervals.length) {
        setProgress(intervals[currentStep].p);
        setStatusText(intervals[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
          if (onComplete) onComplete();
        }, 300);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02040a] transition-opacity duration-500">
      {/* Background glow */}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/40">
          <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-lg animate-ping opacity-25" />
        </div>

        {/* System Title */}
        <h1 className="text-2xl font-bold font-mono tracking-wider text-white mb-2">
          PRICE<span className="text-emerald-400">PULSE</span>
        </h1>
        <p className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-6">
          SHORT-TERM MARKET PREDICTION SYSTEM
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Line */}
        <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-400">
          <span className="truncate pr-2">{statusText}</span>
          <span className="text-emerald-400 font-semibold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
