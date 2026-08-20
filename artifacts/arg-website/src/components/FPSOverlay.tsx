/**
 * FPSOverlay — Mobile-friendly debug panel, gated by ?debugfps=1.
 *
 * Renders a fixed bottom-left mono panel (paper bg, rule border, 10px,
 * z-[95]) showing:
 *   • fps (rolling 30-frame avg) | active ScrollTrigger count
 *   • pins: N (red on mobile if > 0) | lenis: on/off
 *   • viewport: WxH | svh support
 *   • reduced-motion | saveData
 *   • Per-AmbientVideo: name, readyState, paused/playing, src, err
 *     (err=NotAllowedError → "autoplay-blocked" annotation)
 *
 * Also runs the one-shot duplicate ScrollTrigger ID assertion (2s after
 * mount) and logs to the console for devtools users.
 *
 * Usage — always mount; the component reads the flag internally:
 *   <FPSOverlay />
 */
import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from '@/motion';
import { getVideoDebugEntries, type VideoDebugEntry } from '@/components/AmbientVideo';

const WINDOW_FRAMES = 30;

/* ── Colour tokens (matching design-system, inline so no Tailwind needed) */
const C = {
  paper:     '#f9f7f2',
  ink:       '#101f30',
  rule:      '#d4cfc9',
  slate:     '#6b7280',
  recovered: '#1d8a6b',
  amber:     '#f59e0b',
  red:       '#ef4444',
  green:     '#22c55e',
} as const;

export function FPSOverlay() {
  /* ── Flag is stable for the lifetime of the page ── */
  const active = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('debugfps');

  /* ── Motion context — must be called unconditionally (hooks rule) ── */
  const { lenis } = useMotion();

  /* ── Rolling FPS state ── */
  const [fps,    setFps]    = useState(0);
  /* ── ScrollTrigger counts ── */
  const [stCnt,  setStCnt]  = useState(0);
  const [pinCnt, setPinCnt] = useState(0);
  /* ── Viewport ── */
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);
  /* ── Per-video entries ── */
  const [videos, setVideos] = useState<VideoDebugEntry[]>([]);

  const frameRef = useRef<number | null>(null);
  const timesRef = useRef<number[]>([]);

  /* ── Static checks — computed once at first render ── */
  const svhOk = typeof CSS !== 'undefined' && CSS.supports('height', '1svh');
  const rm    = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sd    = typeof navigator !== 'undefined'
    && ((navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData === true);

  /* ── One-shot duplicate-trigger ID assertion ── */
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      const triggers = ScrollTrigger.getAll();
      const ids = triggers
        .map(t => t.vars.id as string | undefined)
        .filter((id): id is string => Boolean(id));
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      console.log(
        `[debugfps] ST triggers: ${triggers.length}, named: ${ids.length}` +
        (dupes.length ? `, ⚠️ DUPES: ${dupes.join(', ')}` : ', ✓ no duplicates'),
      );
      if (dupes.length) console.error('[debugfps] Duplicate trigger IDs:', dupes);
    }, 2000);
    return () => clearTimeout(timer);
  }, [active]);

  /* ── rAF polling loop ── */
  useEffect(() => {
    if (!active) return;

    const tick = (now: number) => {
      /* FPS rolling average */
      timesRef.current.push(now);
      if (timesRef.current.length > WINDOW_FRAMES) timesRef.current.shift();
      if (timesRef.current.length > 1) {
        const span = timesRef.current.at(-1)! - timesRef.current[0];
        setFps(Math.round((timesRef.current.length - 1) / (span / 1000)));
      }

      /* ScrollTrigger snapshot */
      const allST = ScrollTrigger.getAll();
      setStCnt(allST.length);
      setPinCnt(allST.filter(t => t.vars.pin).length);

      /* Viewport */
      setVw(window.innerWidth);
      setVh(window.innerHeight);

      /* Video registry */
      setVideos(getVideoDebugEntries());

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); };
  }, [active]);

  if (!active) return null;

  /* ── Derived colours ── */
  const fpsColor  = fps >= 55 ? C.green : fps >= 40 ? C.amber : C.red;
  const pinsColor = pinCnt > 0 && vw < 768 ? C.red : C.ink;

  /* ── Helpers ── */
  const dim = (text: string) => (
    <span style={{ color: C.slate }}>{text}</span>
  );
  const val = (text: string | number, color: string = C.ink) => (
    <span style={{ color }}>{text}</span>
  );

  return (
    <div
      aria-hidden="true"
      style={{
        position:    'fixed',
        bottom:      8,
        left:        8,
        zIndex:      95,
        background:  C.paper,
        color:       C.ink,
        fontFamily:  '"Roboto Mono", "IBM Plex Mono", ui-monospace, monospace',
        fontSize:    10,
        lineHeight:  1.6,
        padding:     '5px 8px',
        borderRadius: 3,
        border:      `1px solid ${C.rule}`,
        pointerEvents: 'none',
        userSelect:  'none',
        maxWidth:    300,
        whiteSpace:  'pre',
      }}
    >
      {/* ── Row 1: fps | ST | pins | lenis ── */}
      <div>
        <span style={{ color: fpsColor, fontWeight: 700 }}>{String(fps).padStart(3, ' ')} fps</span>
        {dim('  ST:')}
        {val(stCnt)}
        {dim('  pins:')}
        {val(pinCnt, pinsColor)}
        {dim('  lenis:')}
        {val(lenis ? 'on' : 'off', lenis ? C.recovered : C.slate)}
      </div>

      {/* ── Row 2: viewport | svh ── */}
      <div>
        {dim('vp:')}
        {val(`${vw}×${vh}`)}
        {dim('  svh:')}
        {val(svhOk ? 'yes' : 'no', svhOk ? C.recovered : C.red)}
      </div>

      {/* ── Row 3: reduced-motion | saveData ── */}
      <div>
        {dim('rm:')}
        {val(rm ? 'Y' : 'N', rm ? C.amber : C.ink)}
        {dim('  saveData:')}
        {val(sd ? 'Y' : 'N', sd ? C.amber : C.ink)}
      </div>

      {/* ── Per-video rows ── */}
      {videos.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: 3, paddingTop: 3 }}>
          {videos.map((v, i) => (
            <div key={i}>
              {/* name (12 chars) */}
              <span style={{ color: C.ink, fontWeight: 600 }}>
                {v.name.padEnd(12, ' ')}
              </span>
              {dim(' rs:')}
              {val(v.readyState < 0 ? '—' : String(v.readyState))}
              {dim(' ')}
              {val(v.paused ? 'paused ' : 'playing', v.paused ? C.slate : C.recovered)}
              {dim(' ')}
              {val(v.src.padEnd(11, ' '))}
              {/* Error annotation — only when something failed */}
              {v.err !== 'none' && (
                <>
                  {dim('err:')}
                  <span style={{ color: C.red }}>
                    {v.err}
                    {v.autoplayBlocked ? ' ⚡autoplay-blocked' : ''}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
