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
 *
 * Usage inside a section's gsap.context() callback:
 *
 *   import { createReveal, createPinScrub } from '@/motion';
 *
 *   // Reveal:
 *   createReveal(rowEl, { onEnter: () => tl.play() });
 *
 *   // Pinned scrub:
 *   const scrubTl = createPinScrub(sectionEl, { end: '+=120%' });
 *   scrubTl.to(el, { y: -40 });
 *
 * Because the calls happen inside gsap.context(), ctx.revert() handles
 * cleanup automatically — no additional teardown needed.
 *
 * Homepage pin budget: exactly 2.
 *   #1 — HeroSection     (120vh pin, scrub)
 *   #2 — IndustriesSection  (120vh cinema pin, scrub)
 * All other sections: reveal only.
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
