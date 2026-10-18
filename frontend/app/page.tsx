"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/Preloader";
import { CinematicHero } from "@/components/CinematicHero";
import { LivePredictionDashboard } from "@/components/LivePredictionDashboard";
import { PriceChart } from "@/components/PriceChart";
import { MarketContextCards } from "@/components/MarketContextCards";
import { TechnicalIndicatorsGrid } from "@/components/TechnicalIndicatorsGrid";
import { ModelArchitectureSection } from "@/components/ModelArchitectureSection";
import { ModelPerformanceSection } from "@/components/ModelPerformanceSection";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import { fetchPrediction, fetchHistory, fetchModelInfo, fetchOnlineStatus } from "@/lib/api";
import { PredictionResponse, PriceHistoryPoint, ModelInfoResponse, OnlineLearningStatusResponse } from "@/types/api";

export default function Home() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [historyPoints, setHistoryPoints] = useState<PriceHistoryPoint[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<OnlineLearningStatusResponse | null>(null);
  const [systemStatus, setSystemStatus] = useState<"online" | "loading" | "error">("loading");

  const handleModelSynced = useCallback(async () => {
    try {
      const [predRes, histRes, infoRes, onlineRes] = await Promise.allSettled([
        fetchPrediction(false),
        fetchHistory(365),
        fetchModelInfo(),
        fetchOnlineStatus()
      ]);

      if (predRes.status === "fulfilled") setPrediction(predRes.value);
      if (histRes.status === "fulfilled") setHistoryPoints(histRes.value.points);
      if (infoRes.status === "fulfilled") setModelInfo(infoRes.value);
      if (onlineRes.status === "fulfilled") setOnlineStatus(onlineRes.value);
    } catch (err) {
      console.error("Failed to refresh synced data:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeDashboard() {
      try {
        const [predRes, histRes, infoRes, onlineRes] = await Promise.allSettled([
          fetchPrediction(false),
          fetchHistory(365),
          fetchModelInfo(),
          fetchOnlineStatus()
        ]);

        if (!isMounted) return;

        if (predRes.status === "fulfilled") {
          setPrediction(predRes.value);
          setSystemStatus("online");
        } else {
          setSystemStatus("error");
        }

        if (histRes.status === "fulfilled") {
          setHistoryPoints(histRes.value.points);
        }

        if (infoRes.status === "fulfilled") {
          setModelInfo(infoRes.value);
        }

        if (onlineRes.status === "fulfilled") {
          setOnlineStatus(onlineRes.value);
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

        {/* Model Architecture & 25-Feature Catalog */}
        <ModelArchitectureSection modelInfo={modelInfo} />

        {/* Online Learning & Daily Autonomous Retraining */}
        <ModelPerformanceSection 
          modelInfo={modelInfo} 
          onlineStatus={onlineStatus}
          onModelSynced={handleModelSynced}
        />

        {/* Disclaimer & Footer */}
        <DisclaimerFooter />
      </div>
    </div>
  );
}
