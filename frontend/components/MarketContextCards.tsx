"use client";

import React from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Globe2, Shield, Activity } from "lucide-react";
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
          <span>MACROECONOMIC ENVIRONMENT</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Broader Market Context
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
          Apple does not trade in an isolated vacuum. The XGBoost model incorporates macroeconomic benchmarks, tech sector leadership, and systemic volatility metrics.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(INDEX_CONFIG).map(([key, config]) => {
          const item = marketContext ? marketContext[key] : null;
          const isPositive = item ? item.daily_return >= 0 : true;

          return (
            <div
              key={key}
              className="glass-panel glass-panel-hover p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {config.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{config.symbol}</span>
                </div>

                {/* Index Title */}
                <h3 className="text-xl font-bold text-white tracking-tight">{config.label}</h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{config.description}</p>

                {/* Live Value Display */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {item ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "---.--"}
                    </span>
                  </div>
                  {item && (
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
                  )}
                </div>

                {/* 5-day Momentum */}
                {item && item.momentum_5_percent !== undefined && (
                  <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>5-Day Momentum:</span>
                    <span
                      className={
                        item.momentum_5_percent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }
                    >
                      {item.momentum_5_percent >= 0 ? "+" : ""}
                      {item.momentum_5_percent.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Model Rationale Section */}
              <div className="mt-6 pt-4 border-t border-white/5 bg-white/[0.01] -mx-6 -mb-6 p-4 rounded-b-3xl">
                <p className="text-[11px] text-slate-300/90 leading-relaxed font-light">
                  <span className="font-semibold text-slate-200">ML Purpose: </span>
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
