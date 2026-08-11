/**
 * usePinnedScene — ScrollTrigger pin + scrub wrapper.
 *
 * Usage:
 *   const heroRef = useRef<HTMLElement>(null);
 *   usePinnedScene(heroRef, { end: '+=200%' });
 *
 * Guardrails:
 *   • reducedMotion → no pin, no scrub (native scroll, end state visible).
 *   • Trigger is killed on unmount.
 */
import { type RefObject, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from './MotionProvider';

export interface PinnedSceneOpts {
  /** ScrollTrigger start string (default: "top top") */
  start?: string;
  /** ScrollTrigger end string (default: "+=100%") */
  end?: string;
  /** Scrub value (default: 0.6) */
  scrub?: number | boolean;
  /** Whether to pin the element (default: true) */
  pin?: boolean;
  /** Whether to reserve space for the pinned element (default: true) */
  pinSpacing?: boolean;
  /** Anticipate pin to prevent flash (default: true) */
  anticipatePin?: number;
  /** Markers for debugging */
  markers?: boolean;
}

export function usePinnedScene(
  ref: RefObject<Element | null>,
  opts: PinnedSceneOpts = {},
) {
  const { reducedMotion } = useMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const st = ScrollTrigger.create({
      trigger: el,
      pin: opts.pin ?? true,
      scrub: opts.scrub ?? 0.6,
      start: opts.start ?? 'top top',
      end: opts.end ?? '+=100%',
      pinSpacing: opts.pinSpacing ?? true,
      anticipatePin: opts.anticipatePin ?? 1,
      markers: opts.markers ?? false,
    });

    return () => st.kill();
  }, [
    reducedMotion,
    opts.start,
    opts.end,
    opts.scrub,
    opts.pin,
    opts.pinSpacing,
    opts.anticipatePin,
  ]);
}
