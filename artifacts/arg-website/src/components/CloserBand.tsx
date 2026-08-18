/**
 * CloserBand — ink CTA band with optional ambient video background.
 *
 * Place at the bottom of a page before the Shell footer. Accepts a headline
 * and a children slot for CTA buttons.
 *
 * Usage:
 *   <CloserBand
 *     headline="Have documents ready to send?"
 *     mp4="/videos/hands-ledger.mp4"
 *     poster="/videos/hands-ledger-poster.jpg"
 *   >
 *     <a href="mailto:..." className="...">Email the file</a>
 *     <a href="https://app.simplicitycollect.com/Login.aspx" ...>Client Portal</a>
 *   </CloserBand>
 *
 * Without video (plain ink bg):
 *   <CloserBand headline="Ready to start?">
 *     <a href="/contact-us/" className="...">Contact us</a>
 *   </CloserBand>
 */
import { AmbientVideo } from '@/components/AmbientVideo';
import type { ReactNode } from 'react';

export interface CloserBandProps {
  headline: string;
  /** mp4 source for the ambient background video */
  mp4?: string;
  /** Optional WebM source for browsers that prefer it */
  webm?: string;
  /** Required when mp4 is provided. Must resolve to an existing file. */
  poster?: string;
  /** Ink overlay opacity 0–1. Default: 0.6 */
  overlayOpacity?: number;
  /** CTA buttons or any inline action elements */
  children: ReactNode;
}

export function CloserBand({
  headline,
  mp4,
  webm,
  poster,
  overlayOpacity = 0.6,
  children,
}: CloserBandProps) {
  return (
    <section className="relative bg-ink overflow-hidden py-14 md:py-16">
      {mp4 && poster && (
        <div className="absolute inset-0 z-0">
          <AmbientVideo
            mp4={mp4}
            webm={webm}
            poster={poster}
            overlayOpacity={overlayOpacity}
            overlayVariant="gradient"
            aspectClassName=""
            className="w-full h-full"
          />
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <h2 className="text-2xl md:text-3xl font-serif text-paper leading-snug">
          {headline}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          {children}
        </div>
      </div>
    </section>
  );
}
