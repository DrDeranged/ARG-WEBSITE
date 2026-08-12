/**
 * MotionProvider — Phase 0: motion infrastructure
 *
 * • Computes `ready` — true once BOTH document.fonts.ready has resolved
 *   AND the hero/ambient video has dispatched arg:video-ready (or 1 500 ms
 *   have passed, whichever comes first). Until then the page uses native
 *   scroll and all content is visible via CSS defaults — no GSAP sets run.
 * • After `ready`: creates Lenis, syncs it to GSAP ticker, does a single
 *   ScrollTrigger.refresh(), then wires a debounced resize safeRefresh and
 *   an arg:route-change refresh listener.
 * • Exposes { reducedMotion, lenis, ready } via useMotion().
 * • prefers-reduced-motion: Lenis is NOT created, ready fires immediately,
 *   every timeline snaps to its end state.
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
import { safeRefresh } from './director';

gsap.registerPlugin(ScrollTrigger);

// ── Context ──────────────────────────────────────────────────────────────────

export interface MotionContextValue {
  /** True when prefers-reduced-motion media query matches */
  reducedMotion: boolean;
  /** Live Lenis instance, or null when reducedMotion is active or not yet ready */
  lenis: Lenis | null;
  /**
   * True once fonts + hero video are ready (or the 1 500 ms timeout fires).
   * Sections gate their GSAP useLayoutEffects on this flag so content stays
   * visible in settled CSS states during the load phase.
   */
  ready: boolean;
}

const MotionContext = createContext<MotionContextValue>({
  reducedMotion: false,
  lenis: null,
  ready: false,
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

  // ── Effect 1: Compute readiness ─────────────────────────────────────────
  // Fires setReady(true) when fonts.ready AND (arg:video-ready OR 1 500 ms).
  // reducedMotion: fires immediately (no animation, no gate needed).
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (reducedMotion) {
      setReady(true);
      return;
    }

    let done = false;
    let fontsResolved = false;
    let videoReceived = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const maybeReady = () => {
      if (done) return;
      if (fontsResolved && (videoReceived || timeout === null)) {
        done = true;
        setReady(true);
      }
    };

    // Listen for first frame from hero raw video or any AmbientVideo
    const onVideoReady = () => {
      videoReceived = true;
      if (timeout) { clearTimeout(timeout); timeout = null; }
      maybeReady();
    };
    window.addEventListener('arg:video-ready', onVideoReady, { once: true });

    document.fonts.ready.then(() => {
      fontsResolved = true;
      // Allow up to 1 500 ms for the video; if it never fires, proceed anyway
      timeout = setTimeout(() => {
        timeout = null;
        maybeReady();
      }, 1500);
      maybeReady(); // in case video already fired before fonts resolved
    });

    return () => {
      done = true;
      if (timeout) clearTimeout(timeout);
      window.removeEventListener('arg:video-ready', onVideoReady);
    };
  }, [reducedMotion]);

  // ── Effect 2: Create Lenis after ready ──────────────────────────────────
  // Native scroll is active until this effect fires. After ready, Lenis
  // takes over smooth scrolling and ScrollTrigger gets its first refresh.
  useEffect(() => {
    if (!ready || reducedMotion) return;

    const l = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.5,
    });

    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.defaults({ scrub: 0.8 });

    setLenis(l);

    // Single refresh after all scenes have mounted with the ready flag
    ScrollTrigger.refresh();

    // Re-refresh on resize — debounced 200ms, position-preserving via safeRefresh.
    // Videos and AmbientVideo wrappers have fixed heights so video-load no
    // longer needs a refresh; only resize and route-change do.
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => safeRefresh(), 200);
    };
    window.addEventListener('resize', onResize);

    // Re-refresh after route changes (Shell dispatches arg:route-change)
    const onRouteChange = () => {
      setTimeout(() => ScrollTrigger.refresh(), 80);
    };
    window.addEventListener('arg:route-change', onRouteChange);

    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      setLenis(null);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('arg:route-change', onRouteChange);
    };
  }, [ready, reducedMotion]);

  return (
    <MotionContext.Provider value={{ reducedMotion, lenis, ready }}>
      {children}
    </MotionContext.Provider>
  );
}
