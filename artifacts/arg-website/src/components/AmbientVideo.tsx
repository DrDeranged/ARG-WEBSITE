/**
 * AmbientVideo — Reusable ambient b-roll component.
 * Observer-driven play/pause with hysteresis (play at 35%, pause at 20%).
 * No Lenis/GSAP imports.
 *
 * Pass aspectClassName="" to use cover mode (fills parent sizing).
 * In cover mode no border is rendered — caller controls container sizing.
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
  /** Mono caption rendered below the frame, matching EditorialImage style */
  label?: string;
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

/* ── Component ──────────────────────────────────────────────────────── */
export function AmbientVideo({
  mp4,
  webm,
  poster,
  className = '',
  aspectClassName = 'aspect-video',
  overlayOpacity = 0.5,
  label,
}: AmbientVideoProps) {
  const wrapperRef       = useRef<HTMLDivElement>(null);
  const videoRef         = useRef<HTMLVideoElement>(null);
  const intersectingRef  = useRef(false);
  const playingRef       = useRef(false);

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

    // Hysteresis: play at ≥35% visible, pause at <20% visible
    // Two thresholds let us check both levels in one observer.
    const PLAY_THRESHOLD  = 0.35;
    const PAUSE_THRESHOLD = 0.20;

    const io = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        intersectingRef.current = entry.isIntersecting;

        if (ratio >= PLAY_THRESHOLD && !playingRef.current) {
          playingRef.current = true;
          video.play().catch(() => {
            playingRef.current = false;
            // Low-power mode or policy block — degrade to poster silently
          });
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
        video.play().catch(() => { playingRef.current = false; });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
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

  /* ── Handlers ───────────────────────────────────────────────────── */
  const handleVideoError = () => setState('poster');
  const handlePosterError = () => setPosterErr(true);

  /* ── Cover mode vs aspect mode ───────────────────────────────────
     aspectClassName="" → no border, no aspect ratio class, fills parent
  ─────────────────────────────────────────────────────────────────*/
  const isCoverMode = aspectClassName === '';

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
            preload="none"
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
          className="absolute inset-0 bg-ink pointer-events-none"
          style={{ opacity: overlayOpacity }}
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
