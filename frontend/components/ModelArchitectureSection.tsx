"use client";

import React, { useState } from "react";
import { 
  GitCommit, 
  Cpu, 
  Database, 
  Layers, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  SlidersHorizontal 
} from "lucide-react";
import { ModelInfoResponse } from "@/types/api";

interface ArchitectureProps {
  modelInfo: ModelInfoResponse | null;
}

const FEATURE_CATEGORIES = [
  {
    category: "AAPL PRICE ACTION & LAGS",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    features: [
      { name: "Lag_1", desc: "AAPL Closing price 1 session prior (t-1)" },
      { name: "Lag_2", desc: "AAPL Closing price 2 sessions prior (t-2)" },
      { name: "Lag_3", desc: "AAPL Closing price 3 sessions prior (t-3)" },
      { name: "Lag_7", desc: "AAPL Closing price 7 sessions prior (t-7)" },
      { name: "Return", desc: "Daily percentage return of AAPL close" },
      { name: "Volatility_7", desc: "7-day rolling standard deviation of daily return" }
    ]
  },
  {
    category: "TREND & MOVING-AVERAGE RATIOS",
    badge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    features: [
      { name: "MA7_Ratio", desc: "Close / 7-day Simple Moving Average (shift=1)" },
      { name: "MA14_Ratio", desc: "Close / 14-day Simple Moving Average (shift=1)" },
      { name: "MA30_Ratio", desc: "Close / 30-day Simple Moving Average (shift=1)" },
      { name: "SMA20_Ratio", desc: "Close / 20-day Simple Moving Average (shift=1)" },
      { name: "SMA50_Ratio", desc: "Close / 50-day Simple Moving Average (shift=1)" }
    ]
  },
  {
    category: "OSCILLATORS & MOMENTUM SIGNALS",
    badge: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    features: [
      { name: "MACD", desc: "EMA 12 - EMA 26 difference of Apple close" },
      { name: "BB_Position", desc: "Position within 20-day Bollinger 2-std envelopes" },
      { name: "RSI_14", desc: "14-period Relative Strength Index" }
    ]
  },
  {
    category: "MACROECONOMIC CONTEXT & RELATIVE ALPHA",
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    features: [
      { name: "SP500_Return", desc: "Daily return of S&P 500 (^GSPC)" },
      { name: "NASDAQ_Return", desc: "Daily return of NASDAQ Composite (^IXIC)" },
      { name: "VIX_Return", desc: "Daily return of CBOE Volatility Index (^VIX)" },
      { name: "XLK_Return", desc: "Daily return of Technology Select Sector ETF" },
      { name: "AAPL_vs_SP500", desc: "AAPL daily return spread minus S&P 500 return" },
      { name: "AAPL_vs_NASDAQ", desc: "AAPL daily return spread minus NASDAQ return" },
      { name: "AAPL_vs_XLK", desc: "AAPL daily return spread minus Tech ETF return" },
      { name: "SP500_Momentum_5", desc: "5-day cumulative percentage change of S&P 500" },
      { name: "NASDAQ_Momentum_5", desc: "5-day cumulative percentage change of NASDAQ" },
      { name: "XLK_Momentum_5", desc: "5-day cumulative percentage change of XLK" },
      { name: "VIX_Level", desc: "Absolute spot level of the CBOE Volatility Index" }
    ]
  }
];

export const ModelArchitectureSection: React.FC<ArchitectureProps> = ({ modelInfo }) => {
  const [activeTab, setActiveTab] = useState<"features" | "hyperparams" | "pipeline">("pipeline");

  return (
    <section id="model-architecture" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>PRODUCTION ML ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How PricePulse Operates
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
          A rigorous 5-stage transformation converts volatile ticks into stationary relative signals, feeding a non-linear gradient-boosted decision ensemble.
        </p>
      </div>

      {/* 5-Stage Interactive Pipeline Flow */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 mb-10 overflow-x-auto">
        <div className="min-w-[700px] flex items-center justify-between gap-4">
          {/* Step 1 */}
          <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative">
            <span className="text-[10px] font-mono text-slate-500 uppercase">STEP 01</span>
            <div className="flex items-center gap-2 mt-1">
              <Database className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">Market Feed</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-light">
              yfinance downloads AAPL, ^GSPC, ^IXIC, ^VIX, XLK historical quotes.
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

          {/* Step 2 */}
          <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative">
            <span className="text-[10px] font-mono text-slate-500 uppercase">STEP 02</span>
            <div className="flex items-center gap-2 mt-1">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-sm text-white">Features (25)</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Lags, moving averages, MACD, Bollinger Bands, and relative alpha spreads.
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

          {/* Step 3 */}
          <div className="flex-1 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 relative">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">STEP 03</span>
            <div className="flex items-center gap-2 mt-1">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">XGBoost Regressor</h4>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-light">
              200 trees evaluate non-linear split boundaries on latest feature vector.
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

          {/* Step 4 */}
          <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative">
            <span className="text-[10px] font-mono text-slate-500 uppercase">STEP 04</span>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-sm text-white">Next Return</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Outputs continuous predicted percentage return: next_day_return.
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />

          {/* Step 5 */}
          <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative">
            <span className="text-[10px] font-mono text-slate-500 uppercase">STEP 05</span>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <h4 className="font-bold text-sm text-white">Target Close</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-light">
              current_price * (1 + return) produces projected dollar next close.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === "pipeline"
              ? "bg-emerald-500 text-slate-950 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Pipeline Foundations</span>
        </button>

        <button
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === "features"
              ? "bg-emerald-500 text-slate-950 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Complete 25 Features</span>
        </button>

        <button
          onClick={() => setActiveTab("hyperparams")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === "hyperparams"
              ? "bg-emerald-500 text-slate-950 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Model Hyperparameters</span>
        </button>
      </div>

      {/* Tab 1: Pipeline Foundations */}
      {activeTab === "pipeline" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h4 className="font-bold text-base text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Target Stationarity
            </h4>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Raw asset prices suffer from non-stationarity—Apple traded at $43 in 2018 and over $300 in 2026. A regression model predicting dollar prices overfits to nominal levels. By predicting percentage return:
            </p>
            <code className="block my-3 p-2 rounded-lg bg-black/40 text-[11px] font-mono text-emerald-400 border border-white/5">
              Target_Return = (Close[t+1] / Close[t]) - 1
            </code>
            <p className="text-xs text-slate-400 font-light">
              The distribution remains mean-stationary across bull and bear regimes.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h4 className="font-bold text-base text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Zero Lookahead Bias
            </h4>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Every moving average, rolling volatility, and technical oscillator is calculated using strictly historical information with explicit shift operations:
            </p>
            <code className="block my-3 p-2 rounded-lg bg-black/40 text-[11px] font-mono text-cyan-300 border border-white/5">
              MA_7 = close[&quot;AAPL&quot;].shift(1).rolling(7).mean()
            </code>
            <p className="text-xs text-slate-400 font-light">
              This guarantees that today&apos;s close is not leaked into the baseline statistics used to formulate the feature ratios.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h4 className="font-bold text-base text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              Multi-Asset Correlation
            </h4>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Single-ticker models fail during systemic macro shocks. PricePulse augments technical features with cross-asset signals:
            </p>
            <code className="block my-3 p-2 rounded-lg bg-black/40 text-[11px] font-mono text-violet-300 border border-white/5">
              AAPL_vs_XLK = Return - XLK_Return
            </code>
            <p className="text-xs text-slate-400 font-light">
              This allows the model to distinguish broad tech sector movement from Apple&apos;s true idiosyncratic momentum.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Feature Catalog */}
      {activeTab === "features" && (
        <div className="space-y-6">
          {FEATURE_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-mono uppercase px-3 py-1 rounded-full border ${cat.badge}`}>
                  {cat.category}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {cat.features.length} FEATURES
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.features.map((feat) => (
                  <div
                    key={feat.name}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-colors"
                  >
                    <p className="font-mono font-bold text-sm text-white">{feat.name}</p>
                    <p className="text-xs text-slate-400 font-light mt-1">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Model Hyperparameters */}
      {activeTab === "hyperparams" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg text-white">XGBoost Regressor Parameters</h4>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Exact hyperparameter dictionary extracted from pricepulse_metadata.json
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              FINAL MODEL CONFIGURATION
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400">N_ESTIMATORS</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">200</p>
              <span className="text-[10px] text-slate-500">Sequential boosting trees</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400">LEARNING_RATE</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">0.03</p>
              <span className="text-[10px] text-slate-500">Conservative shrinkage step</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400">MAX_DEPTH</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">3</p>
              <span className="text-[10px] text-slate-500">Shallow trees prevent overfit</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400">SUBSAMPLE</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">0.80</p>
              <span className="text-[10px] text-slate-500">80% stochastic row sample</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400">COLSAMPLE_BYTREE</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">0.80</p>
              <span className="text-[10px] text-slate-500">80% stochastic feature sample</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400">RANDOM_STATE</span>
              <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">42</p>
              <span className="text-[10px] text-slate-500">Deterministic seed</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
