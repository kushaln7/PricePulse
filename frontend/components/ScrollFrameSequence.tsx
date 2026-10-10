"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Database, Layers, GitBranch, Target, Eye } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface ScrollFrameSequenceProps {
  desktopFrameCount?: number;
  mobileFrameCount?: number;
  desktopPath?: string;
  mobilePath?: string;
}

const STORY_STAGES = [
  {
    step: "01",
    title: "THE MARKET MOVES.",
    subtitle: "RAW FINANCIAL DATA PARTICLES",
    description: "Every trading session emits millions of noisy transactions. Raw prices drift in stochastic Brownian motion, obscuring true underlying momentum.",
    icon: Database,
    badgeColor: "border-sky-500/30 text-sky-400 bg-sky-500/10",
    range: [0.0, 0.22]
  },
  {
    step: "02",
    title: "DATA CREATES SIGNAL.",
    subtitle: "MATHEMATICAL STRUCTURE EMERGES",
    description: "Multi-period moving averages (MA7, MA14, MA30, SMA20, SMA50), MACD divergence, Bollinger Band positions, and RSI(14) isolate trend from stochastic market noise.",
    icon: Layers,
    badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    range: [0.22, 0.44]
  },
  {
    step: "03",
    title: "CONTEXT CHANGES THE PICTURE.",
    subtitle: "MULTI-ASSET MACRO CORRELATION",
    description: "Apple does not exist in a vacuum. Broader market regimes from S&P 500 (^GSPC), NASDAQ (^IXIC), VIX volatility, and Tech ETF (XLK) provide essential macroeconomic perspective.",
    icon: GitBranch,
    badgeColor: "border-violet-500/30 text-violet-400 bg-violet-500/10",
    range: [0.44, 0.68]
  },
  {
    step: "04",
    title: "THE MODEL FINDS THE PATTERN.",
    subtitle: "GRADIENT BOOSTED DECISION LATTICE",
    description: "Our trained 200-estimator XGBoost Regressor interrogates all 25 features concurrently, capturing non-linear interactions without lookahead bias.",
    icon: Sparkles,
    badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    range: [0.68, 0.88]
  },
  {
    step: "05",
    title: "PRICEPULSE MAKES A PREDICTION.",
    subtitle: "CONVERGED RETURN ESTIMATE",
    description: "The tree ensemble evaluates current conditions to predict the next trading day's AAPL return and compute the projected next closing price.",
    icon: Target,
    badgeColor: "border-emerald-400/40 text-emerald-300 bg-emerald-400/15",
    range: [0.88, 1.0]
  }
];

export const ScrollFrameSequence: React.FC<ScrollFrameSequenceProps> = ({
  desktopFrameCount = 100,
  mobileFrameCount = 50,
  desktopPath = "/sequence/desktop/frame_",
  mobilePath = "/sequence/mobile/frame_"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [loadedRatio, setLoadedRatio] = useState(0);

  // In-memory frame image cache
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameIndexRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Determine mobile vs desktop
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
      setIsReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const totalFrames = isMobile ? mobileFrameCount : desktopFrameCount;
  const basePath = isMobile ? mobilePath : desktopPath;

  // Draw current frame on canvas
  const renderFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Cover drawing logic
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const hRatio = cw / iw;
    const vRatio = ch / ih;
    const ratio = Math.max(hRatio, vRatio);

    const nw = iw * ratio;
    const nh = ih * ratio;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
  }, []);

  // Preload frames
  useEffect(() => {
    if (isReducedMotion) return;

    imagesRef.current = [];
    let loadedCount = 0;
    const newImages: HTMLImageElement[] = [];

    // Preload all frames sequentially
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const numStr = i.toString().padStart(4, "0");
      img.src = `${basePath}${numStr}.webp`;

      img.onload = () => {
        loadedCount++;
        setLoadedRatio(Math.min(1, loadedCount / totalFrames));
        // Draw first frame as soon as it arrives
        if (i === 1 && currentFrameIndexRef.current === 0) {
          renderFrame(0);
        }
      };

      newImages.push(img);
    }

    imagesRef.current = newImages;

    return () => {
      newImages.forEach((img) => {
        img.onload = null;
      });
    };
  }, [basePath, totalFrames, isReducedMotion, renderFrame]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderFrame(currentFrameIndexRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame]);

  // GSAP ScrollTrigger Scrubbing
  useEffect(() => {
    if (isReducedMotion) return;

    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=3200", // Smooth scroll distance
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          setCurrentProgress(progress);

          // Update active story stage
          const stageIdx = STORY_STAGES.findIndex(
            (s) => progress >= s.range[0] && progress <= s.range[1]
          );
          if (stageIdx !== -1) {
            setActiveStageIndex(stageIdx);
          }

          // Compute target frame
          const targetFrame = Math.min(
            totalFrames - 1,
            Math.max(0, Math.floor(progress * (totalFrames - 1)))
          );

          if (targetFrame !== currentFrameIndexRef.current) {
            currentFrameIndexRef.current = targetFrame;
            if (animationFrameIdRef.current) {
              cancelAnimationFrame(animationFrameIdRef.current);
            }
            animationFrameIdRef.current = requestAnimationFrame(() => {
              renderFrame(targetFrame);
            });
          }
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [totalFrames, isReducedMotion, renderFrame]);

  const activeStage = STORY_STAGES[activeStageIndex];
  const IconComponent = activeStage.icon;

  if (isReducedMotion) {
    return (
      <section id="cinematic-story" className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400">
            PRICEPULSE STORYLINE (STATIC MODE)
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            The Machine Learning Progression
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORY_STAGES.map((s, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/10">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                STAGE {s.step}
              </span>
              <h3 className="text-xl font-bold text-white mt-3">{s.title}</h3>
              <p className="text-xs font-mono text-emerald-400 mb-2">{s.subtitle}</p>
              <p className="text-sm text-slate-300 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div id="cinematic-story" ref={containerRef} className="relative w-full h-screen bg-[#02040a] overflow-hidden">
      {/* 2D Canvas rendering the scrubbed WebP frame */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Vignette Overlay for cinematic contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-[#02040a]/80 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#02040a]/85 via-transparent to-[#02040a]/85 pointer-events-none z-10" />

      {/* Story Overlay Layer */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-12 pointer-events-none">
        {/* Top Header Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-slate-900/90 border border-white/10 text-slate-300 backdrop-blur-md">
              SCROLL-DRIVEN PIPELINE
            </span>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-500">
              FRAME {currentFrameIndexRef.current + 1} / {totalFrames}
            </span>
          </div>

          {/* Timeline stage tracker dots */}
          <div className="flex items-center gap-2">
            {STORY_STAGES.map((stage, idx) => (
              <div
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  activeStageIndex === idx
                    ? "w-8 h-2 bg-emerald-400 shadow-md shadow-emerald-400/40"
                    : "w-2 h-2 bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center / Bottom Cinematic Story Card */}
        <div className="max-w-xl transition-all duration-500">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
            {/* Stage Indicator Pill */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono uppercase border ${activeStage.badgeColor}`}>
                <IconComponent className="w-3.5 h-3.5" />
                <span>STAGE {activeStage.step} OF 05</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {activeStage.subtitle}
              </span>
            </div>

            {/* Dynamic Stage Title */}
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              {activeStage.title}
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light mb-6">
              {activeStage.description}
            </p>

            {/* Micro Progress Bar */}
            <div className="w-full bg-slate-900/80 rounded-full h-1 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-150"
                style={{ width: `${Math.round(currentProgress * 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2">
              <span>PROGRESSION</span>
              <span className="text-emerald-400 font-semibold">{Math.round(currentProgress * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="hidden sm:inline">CONTROLLED VIA SCROLL SCRUBBING</span>
          <span className="text-emerald-400">NEXT: LIVE PREDICTION ENGINE →</span>
        </div>
      </div>
    </div>
  );
};
