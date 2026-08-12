/**
 * Motion infrastructure — Architecture V2
 * Barrel export for all motion primitives.
 */
export { MotionProvider, useMotion } from './MotionProvider';
export type { MotionContextValue } from './MotionProvider';

export { useSceneTimeline, useRevealTimeline } from './useSceneTimeline';
export { usePinnedScene } from './usePinnedScene';
export type { PinnedSceneOpts } from './usePinnedScene';
export { useSplitLines } from './useSplitLines';

// V2 director — single source of truth for homepage ScrollTrigger creation
export { createReveal, createPinScrub, createCinema, safeRefresh, SCENE_DEFAULTS } from './director';
