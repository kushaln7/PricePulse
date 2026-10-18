"use client";

import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";

interface PreloaderProps {
  isLoading?: boolean;
  onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ isLoading = false, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // If not loading, dismiss immediately with a smooth fade
    if (!isLoading) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onComplete]);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02040a] transition-opacity duration-300 ${!isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
      {/* Background glow */}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/40">
          <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-lg animate-ping opacity-25" />
        </div>

        {/* Brand Name */}
        <h2 className="text-xl font-bold tracking-tight text-white font-mono mb-2">
          PRICE<span className="text-emerald-400">PULSE</span>
        </h2>

        {/* Real Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>CONNECTING TO MARKET FEEDS...</span>
        </div>
      </div>
    </div>
  );
};
