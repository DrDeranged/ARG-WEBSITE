/**
 * AmbientVideo — Reusable ambient b-roll component.
 * Observer-driven play/pause with hysteresis (play at 35%, pause at 20%).
 * No Lenis/GSAP imports.
 *
 * Pass aspectClassName="" to use cover mode (fills parent sizing).
 * In cover mode no border is rendered — caller controls container sizing.
 *
 * overlayVariant="gradient" renders a vertical vignette: ink at full opacity
 * at top/bottom edges, ~12 percentage points lighter in the centre so films
 * glow through while text zones stay protected.
 *
 * eager=true — use on the first-visible (hero) AmbientVideo only.
 *   preload="metadata"  → browser buffers enough to start playing at mount.
 *   All other instances keep preload="none" (lazy, bandwidth-friendly).
 */
import { useEffect, useRef, useState } from 'react';

/* ── Types ─────────────────────────────────────────────────────────── */
interface AmbientVideoProps {
  mp4: string;
  webm?: string;
  poster: string;
  /** Extra classes applied to the outermost wrapper */
  className?: string;
  /**
   * Tailwind aspect-ratio class(es). Default: 'aspect-video'.
   * Pass "" for cover mode — wrapper fills parent, no border.
   */
  aspectClassName?: string;
  /** Ink overlay opacity, 0–1. Default: 0.5 */
  overlayOpacity?: number;
  /**
   * 'flat'     — flat bg-ink at overlayOpacity (default)
   * 'gradient' — vertical vignette: full ink at edges, ~−12 points at centre
   */
  overlayVariant?: 'flat' | 'gradient';
  /** Mono caption rendered below the frame, matching EditorialImage style */
  label?: string;
  /**
   * When true: preload="metadata" so the video is ready to play at mount.
   * Use ONLY on the first-visible (hero) AmbientVideo per page.
   * All other instances keep preload="none" for performance.
   * Default: false
   */
  eager?: boolean;
}

type VideoState = 'video' | 'poster' | 'blank';

/* ── Navigator with optional connection ────────────────────────────── */
type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

/* ── Ledger baseline fill (ultimate fallback) ───────────────────────
   Mist-coloured div with repeating 1px rule lines — used when both
   video AND poster are unavailable, so layout never collapses.
─────────────────────────────────────────────────────────────────────*/
function LedgerFill() {
  return (
    <div
      className="absolute inset-0 bg-mist"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent 0px, transparent 23px, var(--color-rule, #d4cfc9) 23px, var(--color-rule, #d4cfc9) 24px)',
      }}
    />
  );
}

// Ink colour approximated from hsl(212 50% 12.5%) → rgb(16,31,48)
const INK_R = 16, INK_G = 31, INK_B = 48;

/** Build the gradient background string for overlayVariant='gradient'.
 *  Edges stay at full RGB opacity; centre drops to ~76 % of full,
 *  so when the div's own opacity equals overlayOpacity the effective
 *  centre opacity is ≈ overlayOpacity × 0.76 (≈ −12 pts for typical values). */
function buildGradient(): string {
  const full = `rgba(${INK_R},${INK_G},${INK_B},1)`;
  const mid  = `rgba(${INK_R},${INK_G},${INK_B},0.76)`;
  return [
    `linear-gradient(to bottom,`,
    `  ${full} 0%,`,
    `  ${full} 8%,`,
    `  ${mid}  50%,`,
    `  ${full} 92%,`,
    `  ${full} 100%`,
    `)`,
  ].join(' ');
}

const GRADIENT_BG = buildGradient();

/* ── Debug registry ──────────────────────────────────────────────────
   Module-level so FPSOverlay can poll it from outside the React tree.
   Each AmbientVideo registers a getter on mount and removes on unmount.
   getVideoDebugEntries() is called every rAF frame by FPSOverlay.
   Zero cost when ?debugfps=1 is absent — registration never happens.
─────────────────────────────────────────────────────────────────────*/
export interface VideoDebugEntry {
  /** Truncated mp4 filename (max 12 chars), e.g. "hero-film" */
  name: string;
  /** HTMLMediaElement.readyState (0–4), or -1 if no video element */
  readyState: number;
  paused: boolean;
  /** DOMException.name from last play() rejection, or 'none' */
  err: string;
  /** 'mp4' | 'webm' | 'loading' | 'poster-only' */
  src: string;
  /** True when err === 'NotAllowedError' (iOS autoplay / Low Power Mode) */
  autoplayBlocked: boolean;
}
let _debugIdCtr = 0;
const _debugRegistry = new Map<string, () => VideoDebugEntry>();
/** Poll this from FPSOverlay on every rAF tick to get live video state. */
export function getVideoDebugEntries(): VideoDebugEntry[] {
  return [..._debugRegistry.values()].map(fn => fn());
}

/* ── Component ──────────────────────────────────────────────────────── */
export function AmbientVideo({
  mp4,
  webm,
  poster,
  className = '',
  aspectClassName = 'aspect-video',
  overlayOpacity = 0.5,
  overlayVariant = 'flat',
  label,
  eager = false,
}: AmbientVideoProps) {
  const wrapperRef       = useRef<HTMLDivElement>(null);
  const videoRef         = useRef<HTMLVideoElement>(null);
  const intersectingRef  = useRef(false);
  const playingRef       = useRef(false);
  /** Cleanup for any pending one-shot retry listeners */
  const retryCleanupRef  = useRef<(() => void) | null>(null);
  /** Cumulative play() failures for this instance — stops retrying permanently at 2 */
  const failCountRef     = useRef(0);
  /** Last play() rejection name — read synchronously by the debug getter */
  const lastErrRef       = useRef<string>('none');
  /** Mirror of `state` readable synchronously from the debug registry getter */
  const stateRef         = useRef<VideoState>('poster');
  /** Stable debug-mode flag — set once at first render, never changes */
  const debugMode = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('debugfps');

  // 'video' | 'poster' | 'blank'
  // 'blank' = poster also errored; render ledger fill
  const [state, setState] = useState<VideoState>('poster');
  const [posterErr, setPosterErr] = useState(false);

  /* ── Decide video vs poster at mount ─────────────────────────────
     Runs client-side only. SSR renders 'poster' (the initial state).
  ─────────────────────────────────────────────────────────────────*/
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData =
      (navigator as NavigatorWithConnection).connection?.saveData === true;

    if (!prefersReduced && !saveData) {
      setState('video');
    }
    // else: keep 'poster'
  }, []);

  /* ── muted property + IntersectionObserver + visibilitychange ──── */
  useEffect(() => {
    if (state !== 'video') return;

    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    // iOS Safari requires the *property* set in addition to the attribute
    video.muted = true;

    /* ── attemptPlay(video) ─────────────────────────────────────────
       Resilient play helper called by both the IntersectionObserver
       and visibilitychange paths.

       a. readyState === 0 → call load(), then play on 'loadedmetadata'.
       b. play() rejects → handleReject records the error and, if
          failCountRef.current < 2, attaches ONE-TIME retry triggers:
          'canplay' on the video AND pointerdown/touchstart/keydown on
          window. Whichever fires first calls attemptPlay again and
          removes the others. At 2 total failures, stop permanently.
    ─────────────────────────────────────────────────────────────── */
    const attemptPlay = (v: HTMLVideoElement) => {
      // Cancel any lingering retry listeners from a previous call
      retryCleanupRef.current?.();
      retryCleanupRef.current = null;

      const handleReject = (err?: unknown) => {
        // Record error name for the debug overlay
        if (err instanceof Error) lastErrRef.current = err.name;
        failCountRef.current++;
        if (failCountRef.current >= 2) {
          // Two total failures — stop permanently; poster stands
          playingRef.current = false;
          return;
        }

        // Retry on whichever arrives first: canplay | user gesture
        let resolved = false;
        const cleanup = () => {
          resolved = true;
          v.removeEventListener('canplay',       retry);
          window.removeEventListener('pointerdown', retry);
          window.removeEventListener('touchstart',  retry);
          window.removeEventListener('keydown',     retry);
          retryCleanupRef.current = null;
        };

        const retry = () => {
          if (resolved) return; // another trigger already fired
          cleanup();
          attemptPlay(v);
        };

        v.addEventListener('canplay',       retry, { once: true });
        window.addEventListener('pointerdown', retry, { once: true, passive: true });
        window.addEventListener('touchstart',  retry, { once: true, passive: true });
        window.addEventListener('keydown',     retry, { once: true, passive: true });
        retryCleanupRef.current = cleanup;
      };

      if (v.readyState === 0) {
        // No data buffered yet — load first, then play on loadedmetadata
        v.load();
        v.addEventListener('loadedmetadata', () => {
          v.play().catch(handleReject);
        }, { once: true });
      } else {
        v.play().catch(handleReject);
      }
    };

    // Hysteresis: play at ≥35% visible, pause at <20% visible
    const PLAY_THRESHOLD  = 0.35;
    const PAUSE_THRESHOLD = 0.20;

    const io = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        intersectingRef.current = entry.isIntersecting;

        if (ratio >= PLAY_THRESHOLD && !playingRef.current) {
          playingRef.current = true;
          attemptPlay(video);
        } else if (ratio < PAUSE_THRESHOLD && playingRef.current) {
          playingRef.current = false;
          video.pause();
        }
      },
      { threshold: [0, PAUSE_THRESHOLD, PLAY_THRESHOLD, 1.0] },
    );
    io.observe(wrapper);

    const onVisibility = () => {
      if (document.hidden) {
        if (playingRef.current) {
          playingRef.current = false;
          video.pause();
        }
      } else if (intersectingRef.current && !playingRef.current) {
        playingRef.current = true;
        attemptPlay(video);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      // Clean up any pending retry listeners to prevent post-unmount play calls
      retryCleanupRef.current?.();
      retryCleanupRef.current = null;
    };
  }, [state]);

  /* ── Dispatch arg:video-ready when first frame is available ──── */
  useEffect(() => {
    if (state !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      window.dispatchEvent(new CustomEvent('arg:video-ready'));
    };
    video.addEventListener('loadeddata', onLoaded, { once: true });
    return () => video.removeEventListener('loadeddata', onLoaded);
  }, [state]);

  /* ── Mirror state into ref (synchronous read in debug getter) ── */
  useEffect(() => { stateRef.current = state; }, [state]);

  /* ── Debug registry — register/unregister when ?debugfps=1 ──────
     Zero cost when the flag is absent — the effect returns early.
  ─────────────────────────────────────────────────────────────────*/
  useEffect(() => {
    if (!debugMode) return;
    const id = String(_debugIdCtr++);
    const name = mp4.split('/').pop()?.replace(/\.[^.]+$/, '').slice(0, 12) ?? '?';
    _debugRegistry.set(id, () => {
      const video = videoRef.current;
      const cs    = video?.currentSrc ?? '';
      let src: string;
      if (stateRef.current !== 'video') {
        src = 'poster-only';
      } else if (cs.includes('.webm')) {
        src = 'webm';
      } else if (cs.includes('.mp4')) {
        src = 'mp4';
      } else {
        src = 'loading';
      }
      const err = lastErrRef.current;
      return {
        name,
        readyState: video?.readyState ?? -1,
        paused:     video?.paused ?? true,
        err,
        src,
        autoplayBlocked: err === 'NotAllowedError',
      };
    });
    return () => { _debugRegistry.delete(id); };
  }, [debugMode, mp4]);

  /* ── Handlers ───────────────────────────────────────────────────── */
  const handleVideoError = () => setState('poster');
  const handlePosterError = () => setPosterErr(true);

  /* ── Cover mode vs aspect mode ───────────────────────────────────
     aspectClassName="" → no border, no aspect ratio class, fills parent
  ─────────────────────────────────────────────────────────────────*/
  const isCoverMode = aspectClassName === '';

  /* ── Overlay styles ─────────────────────────────────────────────── */
  const overlayStyle: React.CSSProperties =
    overlayVariant === 'gradient'
      ? { background: GRADIENT_BG, opacity: overlayOpacity }
      : { opacity: overlayOpacity };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <figure className={isCoverMode ? 'block w-full h-full' : 'block'}>
      {/* Wrapper governs aspect ratio + clips media */}
      <div
        ref={wrapperRef}
        aria-hidden="true"
        className={[
          'relative overflow-hidden',
          isCoverMode ? 'w-full h-full' : 'border-2 border-rule',
          isCoverMode ? '' : aspectClassName,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* ── Ledger fill (always behind everything — ultimate fallback) ── */}
        <LedgerFill />

        {/* ── Media layer ─────────────────────────────────────────────── */}
        {state === 'video' ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload={eager ? 'metadata' : 'none'}
            disablePictureInPicture
            controlsList="nodownload"
            poster={poster}
            onError={handleVideoError}
            className="absolute inset-0 w-full h-full object-cover"
          >
            {/* webm first — Chrome picks the better codec */}
            {webm && <source src={webm} type="video/webm" />}
            <source src={mp4} type="video/mp4" />
          </video>
        ) : !posterErr ? (
          <img
            src={poster}
            alt=""
            onError={handlePosterError}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null /* poster failed → LedgerFill shows through */}

        {/* ── Ink overlay ─────────────────────────────────────────────── */}
        <div
          className={overlayVariant === 'gradient' ? 'absolute inset-0 pointer-events-none' : 'absolute inset-0 bg-ink pointer-events-none'}
          style={overlayStyle}
        />
      </div>

      {/* ── Caption (matches EditorialImage style) ───────────────────── */}
      {label && (
        <figcaption className="font-mono text-xs text-slate/60 uppercase tracking-widest mt-2">
          {label}
        </figcaption>
      )}
    </figure>
  );
}
