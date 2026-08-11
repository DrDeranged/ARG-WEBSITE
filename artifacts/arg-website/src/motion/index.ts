/**
 * Motion infrastructure — Phase 0
 * Barrel export for all motion primitives.
 */
export { MotionProvider, useMotion } from './MotionProvider';
export type { MotionContextValue } from './MotionProvider';

export { useSceneTimeline, useRevealTimeline } from './useSceneTimeline';
export { usePinnedScene } from './usePinnedScene';
export type { PinnedSceneOpts } from './usePinnedScene';
export { useSplitLines } from './useSplitLines';
