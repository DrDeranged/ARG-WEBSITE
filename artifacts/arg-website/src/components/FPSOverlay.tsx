/**
 * FPSOverlay — Motion Architecture V2 instrumentation.
 *
 * Rendered only when ?debugfps=1 is present in the URL (never in production
 * user sessions — the flag must be explicit). Displays:
 *
 *   • Rolling FPS (smoothed over 30 frames)
 *   • Active ScrollTrigger instance count
 *   • A color-coded indicator: green ≥55fps, amber 40-54, red <40
 *
 * Usage:
 *   <FPSOverlay />   (always mount; it reads the flag internally)
 */
import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const WINDOW_FRAMES = 30;

export function FPSOverlay() {
  const active = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('debugfps');

  const [fps,   setFps]   = useState(0);
  const [stCnt, setStCnt] = useState(0);
  const frameRef  = useRef<number | null>(null);
  const timesRef  = useRef<number[]>([]);

  useEffect(() => {
    if (!active) return;

    const tick = (now: number) => {
      timesRef.current.push(now);
      if (timesRef.current.length > WINDOW_FRAMES) {
        timesRef.current.shift();
      }
      if (timesRef.current.length > 1) {
        const span = timesRef.current.at(-1)! - timesRef.current[0];
        const avg  = (timesRef.current.length - 1) / (span / 1000);
        setFps(Math.round(avg));
      }
      // ScrollTrigger count — cheap: array length
      setStCnt(ScrollTrigger.getAll().length);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  if (!active) return null;

  const color =
    fps >= 55 ? '#22c55e' :
    fps >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: 9999,
        background: 'rgba(16,31,48,0.82)',
        color: '#f9f7f2',
        fontFamily: '"Roboto Mono", "IBM Plex Mono", monospace',
        fontSize: 10,
        lineHeight: 1.6,
        padding: '4px 8px',
        borderRadius: 3,
        pointerEvents: 'none',
        userSelect: 'none',
        backdropFilter: 'blur(4px)',
        borderLeft: `2px solid ${color}`,
      }}
    >
      <span style={{ color }}>
        {fps.toString().padStart(3, ' ')} fps
      </span>
      {'  '}
      <span style={{ opacity: 0.55 }}>
        ST {stCnt}
      </span>
    </div>
  );
}
