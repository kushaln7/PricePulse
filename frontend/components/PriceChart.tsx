"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot
} from "recharts";
import { PriceHistoryPoint, PredictionResponse } from "@/types/api";
import { TrendingUp, BarChart3, Clock } from "lucide-react";

interface PriceChartProps {
  historyPoints: PriceHistoryPoint[];
  prediction: PredictionResponse | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3.5 rounded-xl border border-white/10 text-xs shadow-2xl backdrop-blur-xl">
        <p className="font-mono font-semibold text-slate-300 mb-1.5 border-b border-white/10 pb-1">
          {label}
        </p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 font-mono py-0.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-bold text-white">${Number(item.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const PriceChart: React.FC<PriceChartProps> = ({ historyPoints, prediction }) => {
  const [timeframe, setTimeframe] = useState<30 | 90 | 180 | 365>(90);
  const [showSMA, setShowSMA] = useState(true);

  const filteredData = (historyPoints || []).slice(-timeframe);

  // Compute min and max for Y-Axis padding safely
  const closes = filteredData.map((d) => d.close).filter((c) => typeof c === "number" && !isNaN(c));
  if (prediction && typeof prediction.predicted_next_price === "number") {
    closes.push(prediction.predicted_next_price);
  }
  const minVal = closes.length ? Math.floor(Math.min(...closes) * 0.98) : 100;
  const maxVal = closes.length ? Math.ceil(Math.max(...closes) * 1.02) : 400;

  const latestPoint = filteredData[filteredData.length - 1];

  const timeRanges: Array<{ label: string; days: 30 | 90 | 180 | 365 }> = [
    { label: "1M", days: 30 },
    { label: "3M", days: 90 },
    { label: "6M", days: 180 },
    { label: "1Y", days: 365 },
  ];

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
      {/* Chart Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AAPL Price Trajectory & Forecast Projection
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              DAILY INTERVAL
            </span>
          </div>
          <p className="text-xs text-slate-400 font-light mt-1">
            Historical closing observations overlaid with 20/50-day moving averages and the model&apos;s experimental next-session forecast.
          </p>
        </div>

        {/* Filters & Toggles */}
        <div className="flex items-center gap-2">
          {/* Moving average toggle */}
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
              showSMA
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            SMA 20/50
          </button>

          {/* Timeframe buttons: 1M, 3M, 6M, 1Y */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 font-mono text-xs">
            {timeRanges.map(({ label, days }) => (
              <button
                key={label}
                onClick={() => setTimeframe(days)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeframe === days
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-80 sm:h-96">
        {filteredData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
            <Clock className="w-8 h-8 animate-pulse text-slate-600" />
            <span>Loading historical price trajectory from market service...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="predictionGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => {
                  if (!val || typeof val !== "string") return "";
                  const parts = val.split("-");
                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />

              <YAxis
                domain={[minVal, maxVal]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />

              <Tooltip content={<CustomTooltip />} />

            {/* AAPL Close Price Area */}
            <Area
              type="monotone"
              dataKey="close"
              name="Close Price"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />

            {/* 20-day Simple Moving Average */}
            {showSMA && (
              <Area
                type="monotone"
                dataKey="sma_20"
                name="20 SMA"
                stroke="#06b6d4"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
            )}

            {/* 50-day Simple Moving Average */}
            {showSMA && (
              <Area
                type="monotone"
                dataKey="sma_50"
                name="50 SMA"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                fill="none"
              />
            )}

            {/* Next Day Prediction Target Dot */}
            {prediction && latestPoint && (
              <ReferenceDot
                x={latestPoint.date}
                y={prediction.predicted_next_price}
                r={6}
                fill={prediction.direction === "UP" ? "#10b981" : "#f43f5e"}
                stroke="#ffffff"
                strokeWidth={2}
                label={{
                  value: `PRED: $${prediction.predicted_next_price.toFixed(2)}`,
                  position: "top",
                  fill: prediction.direction === "UP" ? "#34d399" : "#fb7185",
                  fontSize: 11,
                  fontFamily: "monospace",
                  fontWeight: "bold"
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Chart Sub-legend */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400" />
            <span>AAPL Close</span>
          </div>
          {showSMA && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-cyan-400 border-dashed" />
                <span>20-day SMA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-violet-400 border-dotted" />
                <span>50-day SMA</span>
              </div>
            </>
          )}
          {prediction && (
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  prediction.direction === "UP" ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
              <span className="text-white font-semibold">Predicted Next Close</span>
            </div>
          )}
        </div>

        <div className="text-slate-400">
          Source: Official yfinance Market Feed (Daily Interval)
        </div>
      </div>
    </div>
  );
};
