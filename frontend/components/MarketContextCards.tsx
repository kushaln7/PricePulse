"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Globe2 } from "lucide-react";
import { MarketContextItem } from "@/types/api";

interface MarketContextProps {
  marketContext: Record<string, MarketContextItem> | null;
}

const INDEX_CONFIG: Record<
  string,
  {
    symbol: string;
    label: string;
    category: string;
    description: string;
    rationale: string;
  }
> = {
  AAPL: {
    symbol: "AAPL",
    label: "Apple Inc.",
    category: "PRIMARY FORECAST ASSET",
    description: "Target Equity Instrument for Next-Session Machine Learning Inference",
    rationale: "The primary prediction target. All technical indicators, volatility envelopes, and relative spreads isolate this equity."
  },
  GSPC: {
    symbol: "^GSPC",
    label: "S&P 500",
    category: "BROAD MARKET BENCHMARK",
    description: "Standard & Poor's 500 Large-Cap Equity Index",
    rationale: "Captures systemic macroeconomic sentiment and broad risk-on/risk-off capital rotations that influence Apple."
  },
  IXIC: {
    symbol: "^IXIC",
    label: "NASDAQ Composite",
    category: "TECH & GROWTH MOMENTUM",
    description: "Tech-Heavy Composite Index of Over 3,000 Equities",
    rationale: "Reflects mega-cap tech valuation multiples and Nasdaq liquidity dynamics directly governing tech sector beta."
  },
  VIX: {
    symbol: "^VIX",
    label: "CBOE Volatility Index",
    category: "MARKET FEAR GAUGE",
    description: "30-Day Forward Implied Volatility Index from S&P 500 Options",
    rationale: "Spikes in VIX trigger programmatic risk parity de-leveraging and algorithmic equity selloffs."
  },
  XLK: {
    symbol: "XLK",
    label: "Tech Sector ETF",
    category: "SECTOR PEER BASKET",
    description: "Technology Select Sector SPDR Fund",
    rationale: "The AAPL_vs_XLK spread isolates Apple's idiosyncratic performance from broader hardware/software sector tides."
  }
};

export const MarketContextCards: React.FC<MarketContextProps> = ({ marketContext }) => {
  return (
    <section id="market-context" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3">
          <Globe2 className="w-3.5 h-3.5" />
          <span>MARKET OVERVIEW & MACRO BENCHMARKS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Market Overview & Context
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
          Apple does not trade in an isolated vacuum. The XGBoost model incorporates macroeconomic benchmarks, tech sector leadership, and systemic volatility metrics.
        </p>
      </div>

      {/* Cards Grid - 5 Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {Object.entries(INDEX_CONFIG).map(([key, config]) => {
          const item = marketContext ? marketContext[key] : null;
          const isPositive = item ? item.daily_return >= 0 : true;

          return (
            <div
              key={key}
              className={`glass-panel glass-panel-hover p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between ${
                key === "AAPL" ? "border-emerald-500/30 ring-1 ring-emerald-500/20" : "border-white/10"
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    key === "AAPL"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                  }`}>
                    {config.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{config.symbol}</span>
                </div>

                {/* Index Title */}
                <h3 className="text-lg font-bold text-white tracking-tight">{config.label}</h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{config.description}</p>

                {/* Live Value Display */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-baseline justify-between">
                  <div>
                    <span className={`font-black font-mono ${item ? "text-2xl text-white" : "text-base text-slate-500"}`}>
                      {item ? `$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Price unavailable"}
                    </span>
                  </div>
                  {item ? (
                    <div
                      className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                        isPositive
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                          : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isPositive ? "+" : ""}
                        {item.daily_return_percent.toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                      Change pending
                    </span>
                  )}
                </div>

                {/* 5-day Momentum */}
                <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>5D Momentum:</span>
                  {item && item.momentum_5_percent !== undefined ? (
                    <span
                      className={
                        item.momentum_5_percent >= 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"
                      }
                    >
                      {item.momentum_5_percent >= 0 ? "+" : ""}
                      {item.momentum_5_percent.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-slate-500">Unavailable</span>
                  )}
                </div>

                {/* Timestamp & Freshness Status */}
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>As of: {item?.as_of_date || "Pending feed"}</span>
                  {item ? (
                    <span className="text-emerald-400/80">● Feed Active</span>
                  ) : (
                    <span className="text-rose-400/80">○ Data Unavailable</span>
                  )}
                </div>
              </div>

              {/* Model Rationale Section */}
              <div className="mt-5 pt-3 border-t border-white/5 bg-white/[0.01] -mx-5 -mb-5 p-3 rounded-b-3xl">
                <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                  <span className="font-semibold text-slate-300">ML Feature Role: </span>
                  {config.rationale}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
