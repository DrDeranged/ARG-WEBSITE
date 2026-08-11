/**
 * useSplitLines — manual per-line split for staggered headline reveals.
 *
 * No external SplitText plugin required. Works by:
 *   1. Replacing text content with inline-block word spans.
 *   2. Grouping words by their offsetTop (= lines).
 *   3. Wrapping each line: overflow:hidden outer > animatable inner span.
 *
 * Usage:
 *   const headRef = useRef<HTMLHeadingElement>(null);
 *   const lines = useSplitLines(headRef);
 *
 *   useRevealTimeline(headRef, () => {
 *     gsap.from(lines.current, { y: '100%', opacity: 0, stagger: 0.08 });
 *   });
 *
 * Returns a stable ref whose .current is an array of the inner line spans.
 * Restores original innerHTML on unmount.
 *
 * Caveats:
 *   • Must be called after the element has been laid out (useLayoutEffect).
 *   • Re-run by changing deps[] (e.g. on font-load).
 *   • Does not handle inline elements inside the target (bold, em, etc.) —
 *     strip to plain text first if needed.
 */
import { type RefObject, useLayoutEffect, useRef } from 'react';

export function useSplitLines(
  ref: RefObject<HTMLElement | null>,
  /** Re-split when these change (e.g. window width breakpoint) */
  deps: unknown[] = [],
) {
  const linesRef = useRef<HTMLElement[]>([]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const originalHTML = el.innerHTML;
    const text = el.textContent?.trim() ?? '';
    if (!text) return;

    // 1. Replace content with one inline-block span per word
    el.innerHTML = text
      .split(/\s+/)
      .filter(Boolean)
      .map(
        (w) =>
          `<span class="arg-word" style="display:inline-block;white-space:nowrap">${w}\u00a0</span>`,
      )
      .join('');

    const wordEls = Array.from(el.children) as HTMLElement[];

    // 2. Group words by their top offset — each unique top = one line
    const topMap = new Map<number, HTMLElement[]>();
    for (const w of wordEls) {
      const top = w.offsetTop;
      if (!topMap.has(top)) topMap.set(top, []);
      topMap.get(top)!.push(w);
    }

    // 3. Rebuild DOM: overflow:hidden outer > animatable inner per line
    el.innerHTML = '';
    const lineInners: HTMLElement[] = [];

    for (const ws of topMap.values()) {
      // Outer: clips the inner during a translateY reveal
      const outer = document.createElement('span');
      outer.style.cssText = 'display:block;overflow:hidden;';

      // Inner: the element GSAP will animate (translateY / opacity)
      const inner = document.createElement('span');
      inner.className = 'arg-line';
      inner.style.cssText = 'display:block;';

      ws.forEach((w) => inner.appendChild(w));
      outer.appendChild(inner);
      el.appendChild(outer);
      lineInners.push(inner);
    }

    linesRef.current = lineInners;

    return () => {
      el.innerHTML = originalHTML;
      linesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);

  return linesRef;
}
