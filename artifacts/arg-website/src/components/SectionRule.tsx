import { useEffect, useRef, useState } from 'react';

/**
 * A 1px horizontal rule that draws left-to-right when the section enters the
 * viewport. Render it as the first child of a section content block.
 * The rule leads; content Reveal components should add a 100ms delay so the
 * rule visually precedes the content appearing.
 */
export function SectionRule({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setDrawn(true); return; }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setDrawn(true); io.disconnect(); }
      },
      { threshold: 0.05, rootMargin: '-40px 0px 0px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`h-[1px] bg-rule w-full mb-12 ${className}`}
      style={{
        transform: drawn ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: drawn ? 'transform 600ms ease-out' : 'none',
      }}
    />
  );
}
