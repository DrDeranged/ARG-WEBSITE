import { useEffect, useRef, useState } from 'react';

const DIGITS = '0123456789';

/**
 * Renders text that scrambles through random digits on first scroll-into-view,
 * then resolves to the final value. Non-digit characters are never scrambled.
 * Respects prefers-reduced-motion.
 */
export function ScrambleText({
  text,
  className = '',
  duration = 400,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (fired) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const el = spanRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setFired(true);

        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          if (progress >= 1) { setDisplay(text); return; }

          // Characters resolve left-to-right as progress increases
          const resolved = Math.floor(progress * text.length);
          let out = '';
          for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (i < resolved || !/[0-9]/.test(c)) {
              out += c;
            } else {
              out += DIGITS[Math.floor(Math.random() * DIGITS.length)];
            }
          }
          setDisplay(out);
          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [text, duration, fired]);

  return (
    <span ref={spanRef} className={className} aria-label={text}>
      {display}
    </span>
  );
}
