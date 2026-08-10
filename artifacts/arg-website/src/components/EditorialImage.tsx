import { useState, useEffect } from 'react';

interface EditorialImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  aspectClassName?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

/**
 * Unified editorial image treatment:
 * - Default: full color with a 12% ink duotone overlay (multiply blend) for editorial consistency
 * - Hover (pointer devices): overlay fades to 0 revealing full vibrancy
 * - Touch devices: always full color, no overlay
 * - 2px rule border + mono caption slot
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
}: EditorialImageProps) {
  const [hovered, setHovered] = useState(false);
  // Detect touch: on coarse/no-hover devices, always show full color without overlay
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }, []);

  return (
    <figure className={`flex flex-col gap-2 ${className}`}>
      <div
        className={`relative overflow-hidden border-2 border-rule ${aspectClassName}`}
        onMouseEnter={() => !isTouch && setHovered(true)}
        onMouseLeave={() => !isTouch && setHovered(false)}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          className="w-full h-full object-cover"
          style={{
            // Subtle warmth/lift for editorial consistency across photos
            filter: 'brightness(1.02) contrast(1.04) saturate(1.06)',
          }}
        />
        {/* Ink duotone overlay — 12% multiply at rest, fades to 0 on hover, absent on touch */}
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
