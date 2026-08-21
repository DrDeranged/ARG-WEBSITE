/**
 * CinemaBand — full-bleed ambient video band with an optional overlay content slot.
 *
 * Honesty rule: the `label` prop must describe the footage truthfully
 * (e.g. "COLLECTIONS IN MOTION" for licensed b-roll — never "Our team" unless
 * the footage actually shows ARG staff).
 *
 * Usage (careers b-roll):
 *   <CinemaBand
 *     mp4="/videos/careers-broll.mp4"
 *     webm="/videos/careers-broll.webm"
 *     poster="/videos/careers-broll-poster.jpg"
 *     label="COLLECTIONS IN MOTION"
 *     aspectClassName="aspect-[4/3] md:aspect-video"
 *   >
 *     <p className="font-mono text-paper/60 text-[9px] ...">Work at ARG</p>
 *     <p className="font-serif text-paper ...">Intro text here.</p>
 *   </CinemaBand>
 */
import { AmbientVideo } from '@/components/AmbientVideo';
import type { ReactNode } from 'react';

export interface CinemaBandProps {
  mp4: string;
  webm?: string;
  poster: string;
  /** Ink overlay opacity 0–1. Default: 0.55 */
  overlayOpacity?: number;
  /**
   * Mono caption below the frame (e.g. "COLLECTIONS IN MOTION").
   * Honesty rule: must accurately describe the footage.
   */
  label?: string;
  /** Tailwind aspect-ratio classes. Default: "aspect-[4/3] md:aspect-video" */
  aspectClassName?: string;
  /** Extra classes on the AmbientVideo wrapper */
  className?: string;
  /** Bottom-anchored overlay content (e.g. eyebrow + intro text) */
  children?: ReactNode;
}

export function CinemaBand({
  mp4,
  webm,
  poster,
  overlayOpacity = 0.55,
  label,
  aspectClassName = 'aspect-[4/3] md:aspect-video',
  className = '',
  children,
}: CinemaBandProps) {
  return (
    <section data-cinema className="w-full border-b border-rule">
      <div className="relative">
        <AmbientVideo
          mp4={mp4}
          webm={webm}
          poster={poster}
          overlayOpacity={overlayOpacity}
          label={label}
          aspectClassName={aspectClassName}
          className={`border-0 md:max-h-[420px] w-full ${className}`}
        />
        {children && (
          <div
            className="absolute bottom-0 left-0 right-0 px-6 py-6 md:px-10 md:py-8 pointer-events-none"
            aria-hidden="false"
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
