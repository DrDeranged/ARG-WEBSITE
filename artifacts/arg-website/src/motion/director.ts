/**
 * src/motion/director.ts — Motion Architecture V2
 *
 * Single source of truth for every ScrollTrigger created on the homepage.
 * All scene-creating code calls through this module so defaults are
 * guaranteed consistent and the page has a clean mental model:
 *
 *   • reveal       — enter-once, no scrub, no pin
 *   • pin-scrub    — pinned timeline, scrub 0.8 (hero, process if needed)
 *   • cinema       — pinned cinema break, scrub 0.8 (industries)
 *   • safeRefresh  — position-preserving ST refresh (resize / route-change only)
 *
 * Usage inside a section's gsap.context() callback:
 *
 *   import { createReveal, createPinScrub } from '@/motion';
 *
 *   // Reveal:
 *   createReveal(rowEl, { id: 'my-reveal', onEnter: () => tl.play() });
 *
 *   // Pinned scrub:
 *   const scrubTl = createPinScrub(sectionEl, { id: 'hero-pin', end: '+=120%' });
 *   scrubTl.to(el, { y: -40 });
 *
 * Because the calls happen inside gsap.context(), ctx.revert() handles
 * cleanup automatically — no additional teardown needed.
 *
 * Homepage pin budget: exactly 2.
 *   #1 — HeroSection       id='hero-pin'    (150vh pin, scrub)
 *   #2 — IndustriesSection id='cinema-pin'  (120vh cinema pin, scrub)
 * All other sections: reveal only (id='<section>-reveal' or '<section>-<role>').
 *
 * Rule: ALL pins are created during the director's init pass (useLayoutEffect
 * fires synchronously). No pin may be created after init. This keeps document
 * height stable so late-scroll does not snap the page.
 * The only refresh that may fire after init is safeRefresh(), which preserves
 * scroll position — route all post-init refreshes through it.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* ── Shared defaults ─────────────────────────────────────────────────────── */

export const SCENE_DEFAULTS = {
  scrub: 0.8,
  anticipatePin: 1,
  invalidateOnRefresh: true,
} as const;

/* ── createReveal ────────────────────────────────────────────────────────── */

/**
 * Enter-once reveal: fires onEnter when the trigger crosses `start`,
 * then disconnects. No scrub, no pin.
 *
 * Call inside gsap.context() — ctx.revert() kills it automatically.
 */
export function createReveal(
  trigger: Element | null,
  options: Omit<ScrollTrigger.Vars, 'trigger' | 'once'>,
): ScrollTrigger | null {
  if (!trigger) return null;
  return ScrollTrigger.create({
    trigger,
    start: 'top 82%',
    once: true,
    ...options,
  });
}

/* ── createPinScrub ──────────────────────────────────────────────────────── */

/**
 * Pinned scrub scene. Returns a gsap.Timeline whose scrollTrigger drives it.
 * Add tweens to the returned timeline; scrub progress drives playback.
 *
 * Defaults: scrub 0.8, anticipatePin 1, invalidateOnRefresh true.
 * Call inside gsap.context() — ctx.revert() kills the ST automatically.
 */
export function createPinScrub(
  trigger: Element | null,
  options: Partial<ScrollTrigger.Vars> = {},
): gsap.core.Timeline {
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      pin: true,
      pinSpacing: true,
      start: 'top top',
      end: '+=120%',
      ...SCENE_DEFAULTS,
      ...options,
    },
  });
}

/* ── createCinema ────────────────────────────────────────────────────────── */

/**
 * Cinema pin — identical to createPinScrub but semantically distinct so grep
 * can confirm the 2-pin budget at a glance.
 */
export const createCinema = createPinScrub;

/* ── safeRefresh ─────────────────────────────────────────────────────────── */

/**
 * Position-preserving ScrollTrigger.refresh().
 *
 * Captures the element at the viewport center as an anchor, calls
 * ScrollTrigger.refresh(), then immediately corrects scroll so the same
 * content stays under the viewport. Drift ≤1px is ignored.
 *
 * This is the ONLY permitted post-init refresh path. Route all resize and
 * route-change refreshes through here. Never call ScrollTrigger.refresh()
 * directly outside of the initial ready effect.
 */
export function safeRefresh(): void {
  const cx = Math.round(window.innerWidth / 2);
  const cy = Math.round(window.innerHeight / 2);
  const anchor = document.elementFromPoint(cx, cy) as Element | null;
  const before = anchor ? anchor.getBoundingClientRect().top : null;

  ScrollTrigger.refresh();

  if (anchor && before !== null) {
    const after = anchor.getBoundingClientRect().top;
    const drift = after - before;
    if (Math.abs(drift) > 1) {
      window.scrollBy(0, drift);
    }
  }
}
