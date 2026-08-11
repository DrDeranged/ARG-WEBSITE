import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface EditorialImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  aspectClassName?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  /**
   * depth — enables a subtle scroll-parallax effect on the image.
   * The inner <img> translates ±6 % of the container height as the
   * element passes through the viewport (image is over-sized to 112 %
   * so the extra room absorbs the travel without showing gaps).
   * Applied to charity photos and the contact dog.
   * Ignored on mobile and when prefers-reduced-motion is active.
   */
  depth?: boolean;
}

/**
 * Unified editorial image treatment:
 * - Default: full color with a 12% ink duotone overlay (multiply blend)
 * - Hover (pointer devices): overlay fades to 0 revealing full vibrancy
 * - Touch devices: always full color, no overlay
 * - 2px rule border + mono caption slot
 * - depth?: optional scroll parallax (see above)
 */
export function EditorialImage({
  src,
  alt,
  caption,
  className = '',
  aspectClassName = 'aspect-square',
  width,
  height,
  loading = 'lazy',
  depth = false,
}: EditorialImageProps) {
  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }, []);

  // ── Parallax depth effect ───────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!depth) return;

    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return;

    const isMobile = window.innerWidth < 1024;
    if (isMobile) return;

    const container = wrapperRef.current;
    const img       = imgRef.current;
    if (!container || !img) return;

    // Over-size the image so the 12 % parallax travel has room without gaps.
    //   Container height: H
    //   Image height: H + 2×shift  (where shift = 6 % of H)
    //   GSAP animates y: 0 → -(2×shift) across the full viewport window.
    //
    //   At y=0:          image top is flush with container top; upper content visible.
    //   At y=-(2×shift): image shifted up; lower content visible.
    //   Overflow hidden on the container clips both edges cleanly.

    const H     = container.offsetHeight;
    const shift = Math.round(H * 0.06);

    img.style.position = 'absolute';
    img.style.top      = '0';
    img.style.left     = '0';
    img.style.width    = '100%';
    img.style.height   = `${H + shift * 2}px`;
    img.style.objectFit = 'cover';

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { y: 0 },
        {
          y: -(shift * 2),
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [depth]);

  return (
    <figure className={`flex flex-col gap-2 ${className}`}>
      <div
        ref={wrapperRef}
        className={`relative overflow-hidden border-2 border-rule ${aspectClassName}`}
        onMouseEnter={() => !isTouch && setHovered(true)}
        onMouseLeave={() => !isTouch && setHovered(false)}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          className="w-full h-full object-cover"
          style={{
            filter: 'brightness(1.02) contrast(1.04) saturate(1.06)',
          }}
        />
        {/* Ink duotone overlay */}
        {!isTouch && (
          <div
            className="absolute inset-0 bg-ink mix-blend-multiply pointer-events-none"
            style={{
              opacity: hovered ? 0 : 0.12,
              transition: 'opacity 400ms ease',
            }}
          />
        )}
      </div>
      {caption && (
        <figcaption className="font-mono text-xs text-slate/60 uppercase tracking-widest">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
