/**
 * PageHeader — page-opening header section in two variants.
 *
 * variant="light"
 *   Paper-background section with eyebrow + serif headline.
 *   Used by: Careers, Blog, any paper-bg page.
 *
 * variant="cinema"
 *   Ink-background section with AmbientVideo behind a gradient overlay.
 *   Entrance animation (film fade → eyebrow → headline rise → subline → footer)
 *   is managed internally via useMotion() — no animation refs needed in the page.
 *   Used by: Contact Us.
 *
 * Usage — light:
 *   <PageHeader variant="light" headline="Join the Team" eyebrow="Careers" />
 *
 * Usage — cinema:
 *   <PageHeader
 *     variant="cinema"
 *     mp4="/videos/office-floor.mp4"
 *     webm="/videos/office-floor.webm"
 *     poster="/videos/office-floor-poster.jpg"
 *     eyebrow="Contact — Fairfield, NJ"
 *     headline="Let's talk."
 *     subline="Tell us what you're owed."
 *     footer={<OfficeStatusDot />}
 *   />
 */
import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { AmbientVideo } from '@/components/AmbientVideo';
import { useMotion } from '@/motion/MotionProvider';
import type { ReactNode } from 'react';

/* ── Shared types ──────────────────────────────────────────────────── */

interface PageHeaderLightProps {
  variant: 'light';
  headline: string;
  eyebrow?: string;
  /** aria-label for the <section>. Defaults to the headline text. */
  ariaLabel?: string;
}

interface PageHeaderCinemaProps {
  variant: 'cinema';
  mp4: string;
  webm?: string;
  poster: string;
  eyebrow?: string;
  headline: string;
  /** Supporting sentence below the headline */
  subline?: string;
  /** Status dot, timestamp, or any footer badge — animated in last */
  footer?: ReactNode;
  /** aria-label for the <section>. Defaults to "Page header". */
  ariaLabel?: string;
}

export type PageHeaderProps = PageHeaderLightProps | PageHeaderCinemaProps;

/* ── Light variant ─────────────────────────────────────────────────── */

function LightHeader({ headline, eyebrow, ariaLabel }: PageHeaderLightProps) {
  return (
    <section
      className="pt-32 pb-10 md:pt-48 md:pb-10 bg-paper"
      aria-label={ariaLabel ?? headline}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate mb-5">
            {eyebrow}
          </p>
        )}
        <h1
          className="font-serif text-ink"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', lineHeight: 1.05 }}
        >
          {headline}
        </h1>
      </div>
    </section>
  );
}

/* ── Cinema variant ────────────────────────────────────────────────── */

function CinemaHeader({
  mp4,
  webm,
  poster,
  eyebrow,
  headline,
  subline,
  footer,
  ariaLabel,
}: PageHeaderCinemaProps) {
  const { reducedMotion, ready } = useMotion();

  const filmRef     = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef  = useRef<HTMLParagraphElement>(null);
  const footerRef   = useRef<HTMLDivElement>(null);

  /* Entrance animation — film fades in, then text rises into place.
     Total ≈ 1.2 s. Mirrors the timing from the original contact page. */
  useLayoutEffect(() => {
    if (!ready) return;

    const els = [filmRef, eyebrowRef, headlineRef, sublineRef, footerRef]
      .map(r => r.current)
      .filter(Boolean);

    if (reducedMotion) {
      gsap.set(els, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(filmRef.current,     { opacity: 0 });
      gsap.set(eyebrowRef.current,  { opacity: 0 });
      gsap.set(headlineRef.current, { opacity: 0, y: 24 });
      gsap.set(sublineRef.current,  { opacity: 0 });
      gsap.set(footerRef.current,   { opacity: 0 });

      const tl = gsap.timeline({ delay: 0.1 });
      // Beat 1 — film fades in
      tl.to(filmRef.current,     { opacity: 1, duration: 0.6,  ease: 'power2.out' }, 0);
      // Beat 2 — eyebrow + headline rise (overlapping with film)
      tl.to(eyebrowRef.current,  { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.30);
      tl.to(headlineRef.current, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.35);
      // Beat 3 — subline + footer
      tl.to(sublineRef.current,  { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0.65);
      tl.to(footerRef.current,   { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.80);
    });

    return () => ctx.revert();
  }, [ready, reducedMotion]);

  return (
    <section
      className="relative bg-ink border-b border-ink/20 overflow-hidden min-h-[40vh] md:min-h-[52vh] flex flex-col justify-end"
      aria-label={ariaLabel ?? 'Page header'}
    >
      {/* Ambient video + gradient overlay */}
      <div ref={filmRef} className="absolute inset-0 z-0" aria-hidden="true">
        <AmbientVideo
          mp4={mp4}
          webm={webm}
          poster={poster}
          overlayOpacity={0}
          aspectClassName=""
          className="w-full h-full"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom,' +
              ' rgba(16,31,48,0.55) 0%,' +
              ' rgba(16,31,48,0.45) 50%,' +
              ' rgba(16,31,48,0.55) 100%)',
          }}
        />
      </div>

      {/* Content — anchored to bottom of band */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 md:px-8 pt-32 pb-12 md:pt-40 md:pb-14">
        {eyebrow && (
          <p
            ref={eyebrowRef}
            className="font-mono text-recovered tracking-widest text-xs font-semibold mb-5 uppercase"
          >
            {eyebrow}
          </p>
        )}
        <h1
          ref={headlineRef}
          className="text-5xl md:text-7xl lg:text-8xl font-serif text-paper tracking-tight mb-6 leading-none"
        >
          {headline}
        </h1>
        {subline && (
          <p
            ref={sublineRef}
            className="text-lg md:text-xl text-paper/80 font-sans max-w-2xl leading-relaxed mb-6"
          >
            {subline}
          </p>
        )}
        {footer && (
          <div ref={footerRef}>
            {footer}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Public export ─────────────────────────────────────────────────── */

export function PageHeader(props: PageHeaderProps) {
  if (props.variant === 'light') return <LightHeader {...props} />;
  return <CinemaHeader {...props} />;
}
