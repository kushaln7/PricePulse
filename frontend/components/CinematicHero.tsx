"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ArrowDown, Cpu, Sparkles, TrendingUp, BarChart2 } from "lucide-react";

// Live 3D Financial Intelligence Sphere
function MarketDataCore() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const ringRef = useRef<THREE.Group>(null);

  // Generate particle constellation
  const { positions, colors, linePositions } = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tempPositions: THREE.Vector3[] = [];

    const color1 = new THREE.Color("#10b981"); // emerald
    const color2 = new THREE.Color("#06b6d4"); // cyan
    const color3 = new THREE.Color("#3b82f6"); // blue

    for (let i = 0; i < count; i++) {
      const radius = 2.4 + (Math.random() - 0.5) * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      tempPositions.push(new THREE.Vector3(x, y, z));

      // Color gradient based on latitude
      const mixRatio = (y + 2.5) / 5.0;
      const particleColor = color1.clone().lerp(color2, mixRatio).lerp(color3, Math.random() * 0.3);
      col[i * 3] = particleColor.r;
      col[i * 3 + 1] = particleColor.g;
      col[i * 3 + 2] = particleColor.b;
    }

    // Connect proximate particles with subtle lines
    const lineCoords: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = tempPositions[i].distanceTo(tempPositions[j]);
        if (dist < 0.65) {
          lineCoords.push(
            tempPositions[i].x, tempPositions[i].y, tempPositions[i].z,
            tempPositions[j].x, tempPositions[j].y, tempPositions[j].z
          );
        }
      }
    }

    return {
      positions: pos,
      colors: col,
      linePositions: new Float32Array(lineCoords)
    };
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = elapsed * 0.12;
      pointsRef.current.rotation.x = Math.sin(elapsed * 0.08) * 0.15;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = elapsed * 0.12;
      linesRef.current.rotation.x = Math.sin(elapsed * 0.08) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -elapsed * 0.15;
      ringRef.current.rotation.x = 1.2 + Math.sin(elapsed * 0.1) * 0.1;
    }
  });

  return (
    <group scale={1.2}>
      {/* Particle Constellation */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Network Filament Lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Equatorial Orbital Ring */}
      <group ref={ringRef}>
        <mesh>
          <ringGeometry args={[3.2, 3.23, 64]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[3.45, 3.47, 64]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Inner Glowing Core */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#022c22" transparent opacity={0.5} wireframe />
      </mesh>
    </group>
  );
}

export const CinematicHero: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 bg-gradient-to-b from-[#02040a] via-[#040814] to-[#02040a]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 3D Canvas Background */}
      <div className="absolute inset-0 pointer-events-none opacity-80 z-0">
        {mounted && (
          <Canvas
            camera={{ position: [0, 0, 7.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.5} />
            <MarketDataCore />
          </Canvas>
        )}
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-8 backdrop-blur-md shadow-lg shadow-emerald-950/40">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="tracking-wide">AI-POWERED SHORT-TERM MARKET PREDICTION</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mb-6 leading-[1.12]">
          Predicting tomorrow&apos;s market,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            using today&apos;s data.
          </span>
        </h1>

        {/* Supporting Message */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-light">
          PricePulse analyzes historical price action, technical signals, and broader market context
          to estimate the next trading day&apos;s AAPL movement with a trained XGBoost Regressor.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            onClick={() => scrollTo("prediction-dashboard")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm tracking-wide uppercase shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            Launch Prediction Dashboard
          </button>
          <button
            onClick={() => scrollTo("cinematic-story")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-sm transition-all cursor-pointer backdrop-blur-md"
          >
            Experience Cinematic Pipeline
          </button>
        </div>

        {/* Pipeline Value Stream Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">INPUT STAGE</span>
            <p className="text-xs font-bold text-slate-200 mt-1">Multi-Asset Data</p>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">FEATURE LAYER</span>
            <p className="text-xs font-bold text-slate-200 mt-1">25 Verified Signals</p>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">INFERENCE ENGINE</span>
            <p className="text-xs font-bold text-slate-200 mt-1">XGBoost Regressor</p>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">OUTPUT TARGET</span>
            <p className="text-xs font-bold text-emerald-400 mt-1">Next-Day Return</p>
          </div>
        </div>

        {/* Scroll Prompt */}
        <button
          onClick={() => scrollTo("cinematic-story")}
          className="mt-14 flex flex-col items-center text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer group"
          aria-label="Scroll to cinematic story"
        >
          <span className="text-[11px] font-mono uppercase tracking-widest mb-1.5 group-hover:translate-y-0.5 transition-transform">
            SCROLL TO EXPLORE
          </span>
          <ArrowDown className="w-4 h-4 animate-bounce text-slate-400 group-hover:text-emerald-400" />
        </button>
      </div>
    </section>
  );
};
