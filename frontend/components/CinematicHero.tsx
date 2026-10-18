"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Sparkles } from "lucide-react";

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

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
      const radius = 2.4 + (seededRandom(i * 3 + 1) - 0.5) * 0.8;
      const theta = seededRandom(i * 3 + 2) * Math.PI * 2;
      const phi = Math.acos(2 * seededRandom(i * 3 + 3) - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      tempPositions.push(new THREE.Vector3(x, y, z));

      // Color gradient based on latitude
      const mixRatio = (y + 2.5) / 5.0;
      const particleColor = color1.clone().lerp(color2, mixRatio).lerp(color3, seededRandom(i * 5 + 4) * 0.3);
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
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        setHasWebGL(Boolean(gl));
      } catch {
        setHasWebGL(false);
      }
    }, 0);
    return () => clearTimeout(timer);
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

      {/* 3D Canvas Background with WebGL fallback */}
      <div className="absolute inset-0 pointer-events-none opacity-80 z-0">
        {mounted && hasWebGL ? (
          <Canvas
            camera={{ position: [0, 0, 7.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.5} />
            <MarketDataCore />
          </Canvas>
        ) : (
          <div className="w-full h-full bg-grid-pattern opacity-20" />
        )}
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-8 backdrop-blur-md shadow-lg shadow-emerald-950/40">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="tracking-wide">QUANTITATIVE MACHINE LEARNING PLATFORM</span>
        </div>

        {/* Hero Title - Exact Phase 3 Section B requirement */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mb-6 leading-[1.12]">
          PricePulse —{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            AI-Powered Market Analysis
          </span>
        </h1>

        {/* Supporting Message - Exact Phase 3 Section B requirement */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-light">
          Explore historical market behavior, technical indicators, and experimental machine-learning estimates for the next trading session.
        </p>

        {/* Call to Actions - Exact Phase 3 Section B requirement */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            onClick={() => scrollTo("prediction-dashboard")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm tracking-wide uppercase shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            Explore Dashboard
          </button>
        </div>

      </div>
    </section>
  );
};
