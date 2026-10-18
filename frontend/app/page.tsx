"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/Preloader";
import { CinematicHero } from "@/components/CinematicHero";
import { LivePredictionDashboard } from "@/components/LivePredictionDashboard";
import { PriceChart } from "@/components/PriceChart";
import { MarketContextCards } from "@/components/MarketContextCards";
import { TechnicalIndicatorsGrid } from "@/components/TechnicalIndicatorsGrid";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import { fetchPrediction, fetchHistory } from "@/lib/api";
import { PredictionResponse, PriceHistoryPoint } from "@/types/api";

export default function Home() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [historyPoints, setHistoryPoints] = useState<PriceHistoryPoint[]>([]);
  const [systemStatus, setSystemStatus] = useState<"online" | "loading" | "error">("loading");
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeDashboard() {
      try {
        const [predRes, histRes] = await Promise.allSettled([
          fetchPrediction(false),
          fetchHistory(365)
        ]);

        if (!isMounted) return;

        const failures = [predRes, histRes].filter(
          (result): result is PromiseRejectedResult => result.status === "rejected"
        );

        if (predRes.status === "fulfilled") {
          setPrediction(predRes.value);
        }

        if (histRes.status === "fulfilled") {
          setHistoryPoints(histRes.value.points);
        }

        if (failures.length === 0) {
          setSystemStatus("online");
        } else {
          setSystemStatus(predRes.status === "fulfilled" ? "online" : "error");
          const firstFailure = failures[0].reason;
          setBackendError(
            firstFailure instanceof Error
              ? firstFailure.message
              : "The market data backend could not be reached."
          );
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        if (isMounted) setSystemStatus("error");
      }
    }

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#02040a] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Preloader (Streamlined, authentic dismiss on load) */}
      <Preloader isLoading={systemStatus === "loading"} />

      {/* 2. Global Navbar */}
      <Navbar systemStatus={systemStatus} />

      {/* 3. Cinematic 3D Hero */}
      <CinematicHero />

      {/* 4. Main Prediction & Analysis Interface */}
      <div className="relative z-20 bg-[#02040a]">
        {backendError && (
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              <p className="font-semibold">Market data backend unavailable</p>
              <p className="mt-1 text-amber-200/80">
                Connect the frontend to the FastAPI service by setting <code className="font-mono">NEXT_PUBLIC_API_URL</code> to the deployed backend URL. The dashboard will remain blank until the API responds.
              </p>
              <p className="mt-2 font-mono text-xs text-amber-300/70">{backendError}</p>
            </div>
          </div>
        )}

        {/* Prediction Dashboard */}
        <LivePredictionDashboard
          initialPrediction={prediction}
          onPredictionUpdated={(newPred) => setPrediction(newPred)}
        />

        {/* AAPL Price Trajectory Chart */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <PriceChart historyPoints={historyPoints} prediction={prediction} />
        </section>

        {/* Macro Market Context Cards */}
        <MarketContextCards marketContext={prediction?.market_context || null} />

        {/* Technical Indicators Grid */}
        <TechnicalIndicatorsGrid indicators={prediction?.technical_indicators || null} />

        {/* Disclaimer & Footer */}
        <DisclaimerFooter />
      </div>
    </div>
  );
}
