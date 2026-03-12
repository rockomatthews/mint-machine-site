"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(!!mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function Scene({ printing, reducedMotion }: { printing: boolean; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const paper = useRef<THREE.Mesh>(null);
  const t0 = useRef<number>(0);

  const colors = useMemo(
    () => ({
      metal: new THREE.Color("#8a8f98"),
      base: new THREE.Color("#1b1e22"),
      accent: new THREE.Color("#2f8f57"),
      paper: new THREE.Color("#e7f2e8"),
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // idle motion
    if (group.current && !reducedMotion) {
      group.current.rotation.y = Math.sin(t * 0.35) * 0.25;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.05;
    }

    // printing animation: paper slides out + slight wobble
    if (paper.current) {
      if (printing && !reducedMotion) {
        if (t0.current === 0) t0.current = t;
        const dt = t - t0.current;
        const slide = Math.min(1, dt / 1.2);
        const y = THREE.MathUtils.lerp(0.02, 0.02, slide);
        const z = THREE.MathUtils.lerp(0.05, 0.85, slide);
        paper.current.position.set(0, y, z);
        paper.current.rotation.x = -Math.PI / 2 + Math.sin(dt * 18) * 0.03;
      } else {
        t0.current = 0;
        paper.current.position.set(0, 0.02, 0.05);
        paper.current.rotation.x = -Math.PI / 2;
      }
    }
  });

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      {/* Base */}
      <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.22, 1.2]} />
        <meshStandardMaterial color={colors.base} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.7, 0.95]} />
        <meshStandardMaterial color={colors.metal} roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Front slot */}
      <mesh position={[0, 0.02, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.16, 0.1]} />
        <meshStandardMaterial color={colors.base} roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Rollers */}
      <mesh position={[-0.35, 0.02, 0.42]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 1.0, 28]} />
        <meshStandardMaterial color={colors.accent} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0.35, 0.02, 0.42]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 1.0, 28]} />
        <meshStandardMaterial color={colors.accent} roughness={0.35} metalness={0.3} />
      </mesh>

      {/* Paper */}
      <mesh ref={paper} position={[0, 0.02, 0.05]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.15, 0.7]} />
        <meshStandardMaterial color={colors.paper} roughness={0.8} metalness={0.0} />
      </mesh>

      {/* Top knob */}
      <mesh position={[0.72, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.18, 22]} />
        <meshStandardMaterial color={colors.base} roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Light */}
      <pointLight position={[0.5, 1.2, 1.2]} intensity={printing ? 14 : 9} color={printing ? "#63ff9d" : "#bfffd9"} />
    </group>
  );
}

export function MintMachine3D({
  printing,
  height = 260,
}: {
  printing?: boolean;
  height?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(supportsWebGL());
  }, []);

  if (!ok) {
    // classy fallback
    return (
      <div
        className="card"
        style={{
          height,
          display: "grid",
          placeItems: "center",
          opacity: 0.9,
          background: "radial-gradient(100% 140% at 50% 20%, rgba(34, 197, 94, 0.18) 0%, rgba(0,0,0,0) 70%)",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 520 }}>
          <div style={{ fontWeight: 800, letterSpacing: -0.3, fontSize: 18 }}>Mint machine</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            3D preview disabled on this device. Mining still works normally.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, borderRadius: 16, overflow: "hidden" }}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 1.15, 2.85], fov: 45 }}
      >
        <color attach="background" args={["#0b0f0c"]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[-2, 3, 2]}
          intensity={1.35}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Scene printing={!!printing} reducedMotion={reducedMotion} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
