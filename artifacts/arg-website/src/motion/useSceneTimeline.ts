/**
 * useSceneTimeline — ScrollTrigger-bound GSAP timeline scoped to a section.
 *
 * Usage:
 *   const sectionRef = useRef<HTMLElement>(null);
 *   useSceneTimeline(sectionRef, (tl, el) => {
 *     tl.from(el.querySelector('.headline'), { opacity: 0, y: 40 });
 *   });
 *
 * Guardrails:
 *   • Animates transform/opacity only (caller's responsibility).
 *   • will-change is added on enter and removed on leave.
 *   • reducedMotion → end state rendered immediately, no ScrollTrigger.
 *   • All triggers are killed on unmount.
 */
import { type DependencyList, type RefObject, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from './MotionProvider';

type BuildFn = (tl: gsap.core.Timeline, el: Element) => void;

interface SceneTimelineOpts {
  /** ScrollTrigger start string (default: "top 85%") */
  start?: string;
  /** ScrollTrigger end string (default: "bottom 15%") */
  end?: string;
  /** Scrub value; false = play-once (default: 0.6) */
  scrub?: number | boolean;
  /** Markers for debugging (development only) */
  markers?: boolean;
}

export function useSceneTimeline(
  ref: RefObject<Element | null>,
  buildFn: BuildFn,
  opts: SceneTimelineOpts = {},
  deps: DependencyList = [],
) {
  const { reducedMotion } = useMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced-motion: jump straight to end state, skip all triggers
    if (reducedMotion) {
      const tl = gsap.timeline();
      buildFn(tl, el);
      tl.progress(1).kill();
      return;
    }

    const elStyle = (el as HTMLElement).style;
    let willChangeActive = false;

    const setWillChange = (on: boolean) => {
      if (on === willChangeActive) return;
      elStyle.willChange = on ? 'transform, opacity' : '';
      willChangeActive = on;
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: opts.start ?? 'top 85%',
        end: opts.end ?? 'bottom 15%',
        scrub: opts.scrub ?? 0.6,
        markers: opts.markers ?? false,
        onEnter: () => setWillChange(true),
        onLeave: () => setWillChange(false),
        onEnterBack: () => setWillChange(true),
        onLeaveBack: () => setWillChange(false),
      },
    });

    buildFn(tl, el);

    return () => {
      tl.kill();
      setWillChange(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, opts.start, opts.end, opts.scrub, ...deps]);
}

/**
 * Convenience: play-once timeline (fires when trigger enters viewport).
 * scrub is false; timeline plays forward once and stays at end state.
 */
export function useRevealTimeline(
  ref: RefObject<Element | null>,
  buildFn: BuildFn,
  opts: Omit<SceneTimelineOpts, 'scrub'> = {},
  deps: DependencyList = [],
) {
  const { reducedMotion } = useMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      const tl = gsap.timeline();
      buildFn(tl, el);
      tl.progress(1).kill();
      return;
    }

    const elStyle = (el as HTMLElement).style;

    const tl = gsap.timeline({
      paused: true,
      onStart: () => { elStyle.willChange = 'transform, opacity'; },
      onComplete: () => { elStyle.willChange = ''; },
    });

    buildFn(tl, el);

    const st = ScrollTrigger.create({
      trigger: el,
      start: opts.start ?? 'top 85%',
      markers: opts.markers ?? false,
      onEnter: () => tl.play(),
    });

    return () => {
      tl.kill();
      st.kill();
      elStyle.willChange = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, opts.start, ...deps]);
}
