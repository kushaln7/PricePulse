"use client";

import React from "react";
import { ShieldCheck, BarChart2, Scale, AlertTriangle, CheckCircle, TrendingUp, Info, Table } from "lucide-react";
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

  const splitInfo = modelInfo?.evaluation?.evaluation_split || {
    method: "Chronological (80% train, 20% test)",
    train_period: "2018-03-15 to 2024-10-22",
    test_period: "2024-10-23 to 2026-09-03",
    train_observations: 1663,
    test_observations: 416,
    total_observations: 2079
  };

  const comparisonRows = [
    {
      model: "Naive Zero-Return Baseline",
      features: "0 (Predicts 0% Return)",
      mae: "0.011789 (1.18%)",
      rmse: "0.018039 (1.80%)",
      r2: "-0.0026",
      dirAcc: "50.00% (Neutral)",
      note: "Better MAE/RMSE than ML models due to zero-mean return clustering"
    },
    {
      model: "Initial XGBoost Model",
      features: "15 Technical Features",
      mae: "0.012770 (1.28%)",
      rmse: "0.019645 (1.96%)",
      r2: "-0.0826",
      dirAcc: "52.26%",
      note: "Initial baseline with AAPL volume and technical indicators"
    },
    {
      model: "Improved XGBoost (Active)",
      features: "25 Signals (Macro + Alpha)",
      mae: "0.012117 (1.21%)",
      rmse: "0.018730 (1.87%)",
      r2: "-0.0809",
      dirAcc: "51.92%",
      note: "5.1% MAE improvement over 15-feat model; macro features improve stability",
      active: true
    }
  ];

  return (
    <section id="model-performance" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AUTHENTIC ML EVALUATION & COMPARISON</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Model Performance & Reality
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
          We report unembellished, honest test-set metrics directly verified from <code className="text-emerald-400 font-mono">pricepulse_metadata.json</code> and the training notebook. We do not manufacture synthetic accuracy figures.
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
            Exact: <span className="font-mono text-slate-200">{evalMetrics.mae.toFixed(6)}</span>. On average, predictions deviate by ~1.21% from next-day actual returns.
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
            <span className="text-xs font-mono text-slate-500">VOLATILITY PENALTY</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 font-light">
            Exact: <span className="font-mono text-slate-200">{evalMetrics.rmse.toFixed(6)}</span>. Penalizes outlier volatility spikes during sudden market shock sessions.
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
            Correctly classifies sign on 216 out of 416 unseen test sessions. Not proof of profitable trading.
          </div>
        </div>

        {/* Metric 4: R² Coefficient */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            R² COEFFICIENT
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-slate-300">
              {evalMetrics.r2.toFixed(4)}
            </span>
            <span className="text-xs font-mono text-rose-400">NEGATIVE R²</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 font-light">
            Standard in daily financial returns; predicting mean return yields lower sum-of-squares than tree splits.
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Model Benchmark & Baseline Comparison
            </h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Verified evaluation on the identical chronological test set (Oct 23, 2024 to Sep 3, 2026 · 416 observations).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <th className="py-3 pr-4">Model Candidate</th>
                <th className="py-3 px-4">Feature Set</th>
                <th className="py-3 px-4">Test MAE</th>
                <th className="py-3 px-4">Test RMSE</th>
                <th className="py-3 px-4">Test R²</th>
                <th className="py-3 px-4">Directional Acc.</th>
                <th className="py-3 pl-4">Authentic Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className={row.active ? "bg-emerald-500/[0.06] text-white font-medium" : "hover:bg-white/[0.01]"}>
                  <td className="py-3.5 pr-4 font-bold flex items-center gap-2">
                    {row.active && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    <span>{row.model}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{row.features}</td>
                  <td className="py-3.5 px-4">{row.mae}</td>
                  <td className="py-3.5 px-4">{row.rmse}</td>
                  <td className={`py-3.5 px-4 ${row.r2.startsWith("-") ? "text-slate-400" : "text-emerald-400"}`}>{row.r2}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{row.dirAcc}</td>
                  <td className="py-3.5 pl-4 text-slate-400 text-[11px] font-sans">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Test-Set Period & Observation Audit Pill Strip */}
        <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            <span>Test Period: </span>
            <strong className="text-slate-200">{splitInfo.test_period}</strong>
            <span className="text-slate-600 mx-2">|</span>
            <span>Test Observations: </span>
            <strong className="text-emerald-400">{splitInfo.test_observations} trading sessions</strong>
          </div>
          <div>
            <span>Split Protocol: </span>
            <strong className="text-slate-200">{splitInfo.method}</strong>
            <span className="text-slate-600 mx-2">|</span>
            <span>Total Dataset: </span>
            <strong className="text-slate-200">{splitInfo.total_observations} rows</strong>
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
              Understanding Negative R² & The Naive Baseline
            </h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span>
                <strong>Why the Naive Baseline Wins on MAE:</strong> Daily asset returns cluster tightly around 0.00%. A naive strategy predicting 0.0% every session naturally incurs very low absolute error (~1.18%), which is difficult for any non-linear model to beat.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span>
                <strong>Why R² is Negative (-0.0809):</strong> Under the standard formula (1 - SS_res / SS_tot), negative R² demonstrates that individual daily tree return predictions have larger residual variance than simply predicting the test-set mean. This is typical in financial time series where stochastic noise heavily exceeds deterministic signal.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span>
                <strong>No Guaranteed Profit Claim:</strong> A directional accuracy of ~51.92% on out-of-sample data is an encouraging statistical signal over random 50%, but does NOT guarantee trading profitability once bid-ask spreads, transaction commissions, and slippage are factored in.
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
                <strong>Strict Chronological Split:</strong> 80% train / 20% test split ordered purely chronologically. No K-Fold random shuffling was permitted, preventing future temporal data leakage into the training set.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>
                <strong>Zero Lookahead Filtering:</strong> All rolling and moving averages were shifted by 1 period so that target day price action never contaminates predictor features.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>
                <strong>Three Distinct Domains:</strong> We clearly distinguish historical backtest results (the 416-day evaluation set), current live model outputs (latest session estimates), and actual forward market performance.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
