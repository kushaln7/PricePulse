"use client";

import React from "react";
import { Sliders, Gauge, Activity, Waves } from "lucide-react";
import { TechnicalIndicators } from "@/types/api";

interface TechnicalProps {
  indicators: TechnicalIndicators | null;
}

export const TechnicalIndicatorsGrid: React.FC<TechnicalProps> = ({ indicators }) => {
  const hasData = indicators !== null && indicators !== undefined;
  const rsi = hasData ? indicators.rsi_14 : null;
  const macd = hasData ? indicators.macd : null;
  const bbPos = hasData ? indicators.bb_position : null;
  const vol7 = hasData && indicators.volatility_7 !== undefined ? (indicators.volatility_7 * 100).toFixed(2) : null;

  // Determine RSI state
  let rsiState = "Pending Data";
  let rsiColor = "text-slate-400 bg-slate-800/80 border-slate-700";
  if (rsi !== null) {
    if (rsi > 70) {
      rsiState = "Overbought (>70)";
      rsiColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (rsi < 30) {
      rsiState = "Oversold (<30)";
      rsiColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    } else {
      rsiState = "Neutral (30-70)";
      rsiColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    }
  }

  // Determine Bollinger Band state
  let bbState = "Pending Data";
  let bbColor = "text-slate-400 bg-slate-800/80 border-slate-700";
  if (bbPos !== null) {
    bbColor = "border-violet-500/20 text-violet-300 bg-violet-500/10";
    if (bbPos > 0.8) bbState = "Near Upper Band (Resistance)";
    else if (bbPos < 0.2) bbState = "Near Lower Band (Support)";
    else bbState = "Mid Band Range";
  }

  return (
    <section id="technical-indicators" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
          <Sliders className="w-3.5 h-3.5" />
          <span>TECHNICAL FEATURE ENGINE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Calculated Technical Signals
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
          Real values derived from latest price action and passed to the XGBoost inference model. All indicators are strictly lagged by 1 step to eliminate lookahead bias.
        </p>
      </div>

      {/* Primary Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Gauge 1: RSI 14 */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" />
                RSI (14-DAY)
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${rsiColor}`}>
                {rsiState}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                {rsi !== null ? rsi.toFixed(1) : "---.-"}
              </span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
            </div>

            {/* Slider bar */}
            <div className="mt-5 w-full bg-slate-900 rounded-full h-2 relative overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-500 transition-all duration-500 rounded-full"
                style={{ width: rsi !== null ? `${Math.min(100, Math.max(0, rsi))}%` : "0%" }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
              <span>0 (Oversold)</span>
              <span>50 (Equilibrium)</span>
              <span>100 (Overbought)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-light mt-6 pt-3 border-t border-white/5">
            Computes the ratio of smoothed positive vs negative daily price changes over 14 sessions.
          </p>
        </div>

        {/* Gauge 2: MACD */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400" />
                MACD (EMA 12 - 26)
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  macd !== null
                    ? macd >= 0
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                    : "text-slate-400 bg-slate-800/80 border-slate-700"
                }`}
              >
                {macd !== null
                  ? macd >= 0
                    ? "Bullish Momentum"
                    : "Bearish Divergence"
                  : "Pending Data"}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                className={`text-4xl sm:text-5xl font-black font-mono ${
                  macd !== null
                    ? macd >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                    : "text-slate-500"
                }`}
              >
                {macd !== null ? `${macd >= 0 ? "+" : ""}${macd.toFixed(3)}` : "---.---"}
              </span>
              <span className="text-xs font-mono text-slate-500">SPREAD</span>
            </div>

            {/* Zero-centered bar indicator */}
            <div className="mt-5 w-full bg-slate-900 rounded-full h-2 relative flex items-center border border-white/5">
              <div className="w-0.5 h-3 bg-slate-500 absolute left-1/2 -translate-x-1/2" />
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  macd !== null && macd >= 0 ? "bg-emerald-400 ml-[50%]" : macd !== null ? "bg-rose-400 mr-[50%]" : "w-0"
                }`}
                style={{
                  width: macd !== null ? `${Math.min(50, Math.abs(macd) * 12)}%` : "0%"
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
              <span>-Divergence</span>
              <span>Center Line</span>
              <span>+Convergence</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-light mt-6 pt-3 border-t border-white/5">
            Difference between 12-day and 26-day exponential moving averages, signaling shifts in trend velocity.
          </p>
        </div>

        {/* Gauge 3: Bollinger Band Position */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-violet-400" />
                BOLLINGER BAND POSITION
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${bbColor}`}>
                {bbState}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                {bbPos !== null ? `${(bbPos * 100).toFixed(1)}%` : "--.-%"}
              </span>
              <span className="text-xs font-mono text-slate-500">POS</span>
            </div>

            {/* Range bar */}
            <div className="mt-5 w-full bg-slate-900 rounded-full h-2 relative overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: bbPos !== null ? `${Math.min(100, Math.max(0, bbPos * 100))}%` : "0%" }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
              <span>Lower (0.0)</span>
              <span>Mean (0.5)</span>
              <span>Upper (1.0)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-light mt-6 pt-3 border-t border-white/5">
            Normalizes price within 20-day 2-standard-deviation envelopes, measuring volatility expansion and mean reversion.
          </p>
        </div>
      </div>

      {/* Secondary Moving Average Ratios Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">MA-7 RATIO</span>
          <p className="text-lg font-bold font-mono text-white mt-1">
            {indicators ? indicators.ma7_ratio.toFixed(4) : "---.----"}
          </p>
          <span className="text-[9px] font-mono text-slate-500">Price / 7D MA</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">MA-14 RATIO</span>
          <p className="text-lg font-bold font-mono text-white mt-1">
            {indicators ? indicators.ma14_ratio.toFixed(4) : "---.----"}
          </p>
          <span className="text-[9px] font-mono text-slate-500">Price / 14D MA</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">MA-30 RATIO</span>
          <p className="text-lg font-bold font-mono text-white mt-1">
            {indicators ? indicators.ma30_ratio.toFixed(4) : "---.----"}
          </p>
          <span className="text-[9px] font-mono text-slate-500">Price / 30D MA</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">SMA-20 RATIO</span>
          <p className="text-lg font-bold font-mono text-white mt-1">
            {indicators ? indicators.sma20_ratio.toFixed(4) : "---.----"}
          </p>
          <span className="text-[9px] font-mono text-slate-500">Price / 20D SMA</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">SMA-50 RATIO</span>
          <p className="text-lg font-bold font-mono text-white mt-1">
            {indicators ? indicators.sma50_ratio.toFixed(4) : "---.----"}
          </p>
          <span className="text-[9px] font-mono text-slate-500">Price / 50D SMA</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">7D VOLATILITY</span>
          <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {vol7 !== null ? `${vol7}%` : "--.--%"}
          </p>
          <span className="text-[9px] font-mono text-slate-500">Rolling Std Return</span>
        </div>
      </div>
    </section>
  );
};
