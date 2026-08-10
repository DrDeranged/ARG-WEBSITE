import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Wraps a child element with a gentle magnetic attraction toward the cursor
 * within a configurable radius. Desktop pointer-fine devices only.
 * Respects prefers-reduced-motion.
 */
export function MagneticWrapper({
  children,
  className = '',
  radius = 50,
  strength = 0.12,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = ref.current;
    if (!el) return;

    const MAX_PX = 3;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const factor = (1 - dist / radius) * strength;
        const mx = Math.max(-MAX_PX, Math.min(MAX_PX, dx * factor));
        const my = Math.max(-MAX_PX, Math.min(MAX_PX, dy * factor));
        el.style.transform = `translate(${mx}px, ${my}px)`;
        el.style.transition = 'transform 80ms linear';
      } else {
        el.style.transform = '';
        el.style.transition = 'transform 500ms cubic-bezier(.22,1,.36,1)';
      }
    };

    const onLeave = () => {
      el.style.transform = '';
      el.style.transition = 'transform 500ms cubic-bezier(.22,1,.36,1)';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [radius, strength]);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
