/**
 * LEDGER DUST — Phase 3: connective motion tissue
 *
 * A sparse, drifting layer of ledger glyphs rendered on a fixed canvas
 * behind all page content (z-5). Particles respond to Lenis scroll velocity
 * (faster scroll = slight downward streak). Fades to 0 whenever a dark
 * (bg-ink) section crosses the viewport centre. Disabled on mobile
 * and when prefers-reduced-motion is active.
 *
 * Optimisations:
 *  • rAF is paused while the tab is hidden (visibilitychange).
 *  • rAF is paused after 3 seconds of scroll inactivity (idle guard).
 *  • Canvas is sized once and re-sized only on window resize (debounced).
 */

import { useEffect, useRef } from 'react';
import { useMotion } from '@/motion';

// ── Glyph set ──────────────────────────────────────────────────────────────
const GLYPHS = ['№', '$', '✓', '·', '—',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// ── Particle ───────────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vy: number; // base downward drift (px / frame)
  vx: number; // gentle lateral drift
  glyph: string;
  alpha: number; // 0.03 – 0.07
  size: number;  // px
}

const MAX = 40; // maximum live particles

function makeParticle(w: number, startY?: number): Particle {
  return {
    x: Math.random() * w,
    y: startY ?? -16,
    vy: 0.14 + Math.random() * 0.24,
    vx: (Math.random() - 0.5) * 0.08,
    glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    alpha: 0.03 + Math.random() * 0.04,
    size: 8 + Math.floor(Math.random() * 8),
  };
}

// ── Component ──────────────────────────────────────────────────────────────
export function LedgerDust() {
  const { reducedMotion, lenis } = useMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only on desktop, only when motion is OK
    if (reducedMotion) return;
    if (window.innerWidth < 1024) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── State ────────────────────────────────────────────────────────────
    let rafId = 0;
    let tabHidden  = false;
    let idlePaused = false;
    let lastScrollMs = Date.now();
    let canvasAlpha = 1;    // 0-1, smoothly interpolated
    let darkInView  = false; // true when a bg-ink section is centred in vp

    // ── Size ─────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    let resizeTimer = 0;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); };
    window.addEventListener('resize', onResize, { passive: true });

    // ── Spawn initial spread across the viewport ──────────────────────────
    const particles: Particle[] = [];
    for (let i = 0; i < MAX; i++) {
      particles.push(makeParticle(canvas.width, Math.random() * canvas.height));
    }

    // ── Dark-section detection ────────────────────────────────────────────
    // Observed once; updated on scroll.
    const darkEls = Array.from(document.querySelectorAll<HTMLElement>('.bg-ink'));
    const checkDark = () => {
      const mid = window.innerHeight * 0.5;
      darkInView = darkEls.some(el => {
        const r = el.getBoundingClientRect();
        return r.top < mid && r.bottom > mid;
      });
    };

    // ── Scroll tracking (idle + dark check) ──────────────────────────────
    const onScroll = () => {
      lastScrollMs = Date.now();
      checkDark();
      if (idlePaused) { idlePaused = false; schedule(); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Visibility ───────────────────────────────────────────────────────
    const onVisibility = () => {
      tabHidden = document.hidden;
      if (!tabHidden && !idlePaused) schedule();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // ── Draw loop ─────────────────────────────────────────────────────────
    const draw = () => {
      if (tabHidden || idlePaused) return;

      // Idle guard: pause after 3 s of no scroll
      if (Date.now() - lastScrollMs > 3000) {
        idlePaused = true;
        return;
      }

      // Smooth canvas alpha toward target (dark sections → 0, light → 1)
      const target = darkInView ? 0 : 1;
      canvasAlpha += (target - canvasAlpha) * 0.035;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (canvasAlpha < 0.01) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      // Lenis velocity → streak bonus
      // velocity is in px/s in Lenis; divide by ~60fps for per-frame bonus
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const velPxPerFrame = Math.abs(((lenis as any)?.velocity ?? 0) / 60);
      const streak = Math.min(velPxPerFrame * 0.35, 2.8);

      // Draw each particle
      particles.forEach(p => {
        p.y += p.vy + streak;
        p.x += p.vx;

        // Recycle when below canvas
        if (p.y > canvas.height + 20) {
          const fresh = makeParticle(canvas.width);
          Object.assign(p, fresh);
        }
        // Lateral wrap
        if (p.x < -20)                p.x = canvas.width + 10;
        if (p.x > canvas.width + 20)  p.x = -10;

        ctx.font = `${p.size}px "IBM Plex Mono", monospace`;
        // Rule-gray (#a0b4c3 ≈ hsl(210 24% 70%)) at particle alpha × canvasAlpha
        const a = p.alpha * canvasAlpha;
        ctx.fillStyle = `rgba(160,180,195,${a.toFixed(3)})`;
        ctx.fillText(p.glyph, p.x, p.y);
      });

      rafId = requestAnimationFrame(draw);
    };

    const schedule = () => {
      if (!tabHidden && !idlePaused) rafId = requestAnimationFrame(draw);
    };

    // Defer first dark check until page has rendered
    setTimeout(checkDark, 150);
    schedule();

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion, lenis]);

  // Mobile / reducedMotion: render nothing
  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none select-none"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    />
  );
}
