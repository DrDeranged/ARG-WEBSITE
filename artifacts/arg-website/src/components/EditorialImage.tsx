import { useState } from 'react';

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
 * Every photo on the site uses this component.
 * Default: greyscale + ink-tinted overlay + 2px rule border.
 * Hover: colour fades back in over 400ms.
 * Caption rendered in mono type below if provided.
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

  return (
    <figure className={`flex flex-col gap-2 ${className}`}>
      <div
        className={`relative overflow-hidden border-2 border-rule ${aspectClassName}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          className="w-full h-full object-cover"
          style={{
            filter: hovered ? 'grayscale(0%) contrast(1.02)' : 'grayscale(100%) contrast(1.05)',
            transition: 'filter 400ms ease',
          }}
        />
        {/* Ink-tinted overlay that dissolves on hover */}
        <div
          className="absolute inset-0 bg-ink mix-blend-multiply pointer-events-none"
          style={{
            opacity: hovered ? 0 : 0.15,
            transition: 'opacity 400ms ease',
          }}
        />
      </div>
      {caption && (
        <figcaption className="font-mono text-xs text-slate/60 uppercase tracking-widest">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
