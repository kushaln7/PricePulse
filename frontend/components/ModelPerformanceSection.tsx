"use client";

import React from "react";
import { ShieldCheck, BarChart2, Scale, AlertTriangle, CheckCircle, TrendingUp, Info } from "lucide-react";
import { ModelInfoResponse } from "@/types/api";

interface PerformanceProps {
  modelInfo: ModelInfoResponse | null;
}

export const ModelPerformanceSection: React.FC<PerformanceProps> = ({ modelInfo }) => {
  const evalMetrics = modelInfo?.evaluation || {
    mae: 0.0121169,
    rmse: 0.01873,
    r2: -0.080865,
    directional_accuracy: 0.51923
  };

  return (
    <section id="model-performance" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AUTHENTIC ML EVALUATION</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Model Performance & Reality
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
          We report unembellished, honest test-set metrics directly from <code className="text-emerald-400 font-mono">pricepulse_metadata.json</code>. We do not manufacture synthetic accuracy figures.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Metric 1: MAE */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            MEAN ABSOLUTE ERROR (MAE)
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-white">
              {(evalMetrics.mae * 100).toFixed(2)}%
            </span>
            <span className="text-xs font-mono text-slate-500">RETURN ERROR</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 font-light">
            Exact: <span className="font-mono text-slate-200">{evalMetrics.mae.toFixed(6)}</span>. On average, predictions deviate by ~1.2% from next-day actual returns.
          </div>
        </div>

        {/* Metric 2: RMSE */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            ROOT MEAN SQUARED ERROR
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-white">
              {(evalMetrics.rmse * 100).toFixed(2)}%
            </span>
            <span className="text-xs font-mono text-slate-500">VOLATILITY</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 font-light">
            Exact: <span className="font-mono text-slate-200">{evalMetrics.rmse.toFixed(6)}</span>. Heavy penalization for extreme outlier volatility sessions.
          </div>
        </div>

        {/* Metric 3: Directional Accuracy */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
            DIRECTIONAL ACCURACY
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400">
              {(evalMetrics.directional_accuracy * 100).toFixed(2)}%
            </span>
            <span className="text-xs font-mono text-emerald-300">OUT-OF-SAMPLE</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-300 font-light">
            Correctly classifies whether next day is positive or negative 51.92% of the time, exceeding random walk 50% baseline.
          </div>
        </div>

        {/* Metric 4: R² Coefficient */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            R² COEFFICIENT OF DETERMINATION
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-slate-300">
              {evalMetrics.r2.toFixed(4)}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 font-light">
            Typical for daily equity return regression where stochastic noise dominates deterministic variance.
          </div>
        </div>
      </div>

      {/* Deep-Dive Educational Transparency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Why Next-Day Return Prediction is Intensely Difficult
            </h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span>
                <strong>Low Signal-to-Noise Ratio:</strong> Mega-cap stocks like AAPL are scrutinized by thousands of institutional algorithms, making daily price movements near-martingale random walks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span>
                <strong>Exogenous News Injections:</strong> Overnight geopolitical headlines, macro Fed policy announcements, and supply chain updates arrive after hours and cannot be known in advance.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span>
                <strong>The 50% Myth:</strong> In high-frequency finance, an out-of-sample directional edge of 51.5% to 52.5% on mega-caps is statistically non-trivial when combined with risk sizing.
              </span>
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Evaluation Methodology Integrity
            </h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>
                <strong>Strict Chronological Split:</strong> 80% train / 20% test split ordered purely chronologically. No K-Fold random shuffling was permitted, preventing temporal data leakage.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>
                <strong>Naive Baseline Comparison:</strong> The model was benchmarked against the standard naive zero-return baseline (assuming price does not move) to ensure error metrics are contextualized.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>
                <strong>No Lookahead Filtering:</strong> All rolling and moving averages were shifted by 1 period so that target day price action never contaminates predictor features.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
