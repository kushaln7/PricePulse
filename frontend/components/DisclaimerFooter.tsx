"use client";

import React from "react";
import { Activity, ShieldCheck, Terminal } from "lucide-react";

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#010206] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Main Disclaimer Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                REGULATORY & RESEARCH DISCLAIMER
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 font-light mt-1.5 leading-relaxed">
                PricePulse provides machine-learning-based estimates for educational and research purposes only. It is not financial advice, investment counsel, or an endorsement to buy or sell securities. Financial markets carry substantial risk of loss, and past model evaluation does not guarantee future market performance.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation & Brand Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold font-mono text-white tracking-wider">
              PRICE<span className="text-emerald-400">PULSE</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              · Portfolio ML Engineering Project
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
            <span>AAPL · ^GSPC · ^IXIC · ^VIX · XLK</span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="text-emerald-400">FastAPI + Next.js</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <p>© {new Date().getFullYear()} PricePulse — Machine Learning Market Intelligence System.</p>
          <p className="text-slate-400">Engineered with XGBoost, Python, and Creative WebGL.</p>
        </div>
      </div>
    </footer>
  );
};
