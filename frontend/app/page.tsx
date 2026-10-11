"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/Preloader";
import { CinematicHero } from "@/components/CinematicHero";
import { ScrollFrameSequence } from "@/components/ScrollFrameSequence";
import { LivePredictionDashboard } from "@/components/LivePredictionDashboard";
import { PriceChart } from "@/components/PriceChart";
import { MarketContextCards } from "@/components/MarketContextCards";
import { TechnicalIndicatorsGrid } from "@/components/TechnicalIndicatorsGrid";
import { ModelArchitectureSection } from "@/components/ModelArchitectureSection";
import { ModelPerformanceSection } from "@/components/ModelPerformanceSection";
import { TechStackSection } from "@/components/TechStackSection";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import { fetchPrediction, fetchHistory, fetchModelInfo, fetchHealth } from "@/lib/api";
import { PredictionResponse, PriceHistoryPoint, ModelInfoResponse } from "@/types/api";

export default function Home() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [historyPoints, setHistoryPoints] = useState<PriceHistoryPoint[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [systemStatus, setSystemStatus] = useState<"online" | "loading" | "error">("loading");

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setSystemStatus("loading");

        // Concurrent fetching for rapid initialization
        const [predRes, histRes, infoRes] = await Promise.allSettled([
          fetchPrediction(false),
          fetchHistory(365),
          fetchModelInfo()
        ]);

        if (!isMounted) return;

        if (predRes.status === "fulfilled") {
          setPrediction(predRes.value);
          setSystemStatus("online");
        } else {
          console.warn("Could not reach backend for prediction:", predRes.reason);
          setSystemStatus("error");
        }

        if (histRes.status === "fulfilled") {
          setHistoryPoints(histRes.value.points);
        }

        if (infoRes.status === "fulfilled") {
          setModelInfo(infoRes.value);
        }
      } catch (err) {
        console.error("Failed to load initial data from API:", err);
        if (isMounted) setSystemStatus("error");
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#02040a] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Preloader */}
      <Preloader />

      {/* 2. Global Navbar */}
      <Navbar systemStatus={systemStatus} />

      {/* 3. Cinematic 3D Hero */}
      <CinematicHero />

      {/* 4. Pinned Scroll-Driven Cinematic Sequence */}
      <ScrollFrameSequence />

      {/* 5. Main Prediction Dashboard */}
      <div className="relative z-20 bg-[#02040a]">
        <LivePredictionDashboard
          initialPrediction={prediction}
          onPredictionUpdated={(newPred) => setPrediction(newPred)}
        />

        {/* 6. AAPL Price Trajectory Chart */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <PriceChart historyPoints={historyPoints} prediction={prediction} />
        </section>

        {/* 7. Macro Market Context Cards */}
        <MarketContextCards marketContext={prediction?.market_context || null} />

        {/* 8. Technical Indicators Grid */}
        <TechnicalIndicatorsGrid indicators={prediction?.technical_indicators || null} />

        {/* 9. Model Architecture & 25-Feature Catalog */}
        <ModelArchitectureSection modelInfo={modelInfo} />

        {/* 10. Authentic Performance & Evaluation */}
        <ModelPerformanceSection modelInfo={modelInfo} />

        {/* 11. Technology Stack Badges */}
        <TechStackSection />

        {/* 12. Disclaimer & Footer */}
        <DisclaimerFooter />
      </div>
    </div>
  );
}
