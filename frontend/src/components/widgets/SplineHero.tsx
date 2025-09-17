"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";

// Dynamically import Spline to avoid SSR issues
const Spline = dynamic(() => import("@splinetool/react-spline").then(m => m.default), { ssr: false });

type SplineHeroProps = {
  sceneUrl?: string;
  className?: string;
};

/**
 * Full-viewport hero background embedding a Spline scene.
 * - Expects the Spline file to contain animated 3D waves (4-5s loop, ease-out), glassy materials, and subtle lights.
 * - Adds lightweight hover-based parallax at the container level to keep perf smooth.
 * - Reads default URL from NEXT_PUBLIC_SPLINE_WAVE_URL if prop not provided.
 */
export default function SplineHero({ sceneUrl, className }: SplineHeroProps) {
  const url = useMemo(() => {
    const candidate = sceneUrl || process.env.NEXT_PUBLIC_SPLINE_WAVE_URL || "";
    return candidate.includes(".splinecode") ? candidate : "";
  }, [sceneUrl]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Optional static setup (no hover parallax). Keep effect for future hooks if needed.
  useEffect(() => {}, []);

  return (
    <div
      ref={containerRef}
      className={
        "absolute inset-0 overflow-hidden [perspective:1000px]" +
        (className ? ` ${className}` : "")
      }
      style={{ contain: "layout paint size" }}
      aria-hidden
    >
      {/* Dark backdrop for contrast; keep transparent to allow layout background to tint */}
      <div className="absolute inset-0 bg-[#030a0e]/85 dark:bg-[#030a0e]/85" />

      {/* Static transform wrapper. Full-bleed coverage without overscan to reduce GPU load */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: "scale(1)",
          transformOrigin: "center",
        }}
      >
        {url ? (
          <Spline scene={url} className="absolute inset-0 w-full h-full" />
        ) : (
          // Fallback gradient if no scene URL is provided
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(13,148,136,0.45),_transparent_55%),_radial-gradient(ellipse_at_top,_rgba(56,189,248,0.35),_transparent_35%)]" />
        )}
      </div>

      {/* Subtle vignette and shimmer for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.35),_transparent_60%)] mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 water-shimmer" />
    </div>
  );
}


