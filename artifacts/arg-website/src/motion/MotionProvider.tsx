/**
 * MotionProvider — Phase 0: motion infrastructure
 *
 * • Initialises Lenis (smooth scroll) and wires it to GSAP's ticker.
 * • Registers ScrollTrigger with GSAP defaults.
 * • Exposes { reducedMotion, lenis } via useMotion().
 * • When prefers-reduced-motion is set: Lenis is NOT created and every
 *   timeline built through our helpers snaps to its end state.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register once at module evaluation (safe to call multiple times)
gsap.registerPlugin(ScrollTrigger);

// ── Context ──────────────────────────────────────────────────────────────────

export interface MotionContextValue {
  /** True when prefers-reduced-motion media query matches */
  reducedMotion: boolean;
  /** Live Lenis instance, or null when reducedMotion is active */
  lenis: Lenis | null;
}

const MotionContext = createContext<MotionContextValue>({
  reducedMotion: false,
  lenis: null,
});

export const useMotion = (): MotionContextValue => useContext(MotionContext);

// ── Provider ─────────────────────────────────────────────────────────────────

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const l = new Lenis({
      duration: 1.1,
      // easeOutExpo: smooth deceleration without overshoot
      easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    });

    // Sync Lenis virtual scroll to GSAP's RAF loop
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0); // prevents large jumps after tab-switch

    // Global ScrollTrigger defaults — scrub 0.8 across all pinned scenes
    ScrollTrigger.defaults({ scrub: 0.8 });

    setLenis(l);

    // Refresh ScrollTrigger once fonts are ready (catches baseline shifts)
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    // Refresh after any ambient video loads its first frame
    const onVideoReady = () => ScrollTrigger.refresh();
    window.addEventListener('arg:video-ready', onVideoReady);

    // Refresh after route changes (dispatched by Shell)
    const onRouteChange = () => {
      // Slight delay lets React finish rendering the new page
      setTimeout(() => ScrollTrigger.refresh(), 80);
    };
    window.addEventListener('arg:route-change', onRouteChange);

    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      setLenis(null);
      window.removeEventListener('arg:video-ready', onVideoReady);
      window.removeEventListener('arg:route-change', onRouteChange);
    };
  }, [reducedMotion]);

  return (
    <MotionContext.Provider value={{ reducedMotion, lenis }}>
      {children}
    </MotionContext.Provider>
  );
}
