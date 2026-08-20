/**
 * ─────────────────────────────────────────────────────────────────────
 * PAGE SCAFFOLD TEMPLATE
 * ─────────────────────────────────────────────────────────────────────
 * HOW TO USE:
 *   1. Copy this file to src/pages/my-page.tsx.
 *   2. Register a route in src/routes.ts + src/App.tsx.
 *   3. Replace every TODO and delete scaffolding comments.
 *   4. Follow DESIGN-SYSTEM.md and the README audit checklist.
 *
 * This file is intentionally NOT registered in App.tsx — it is a template
 * only. The underscore prefix (_template) signals "not a live route".
 * ─────────────────────────────────────────────────────────────────────
 */
import { useRef, useLayoutEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { Shell } from '@/components/layout/Shell';
import { PageHeader } from '@/components/PageHeader';
import { MiniLedgerList } from '@/components/MiniLedgerList';
import { CinemaBand } from '@/components/CinemaBand';
import { CloserBand } from '@/components/CloserBand';
import { AmbientVideo } from '@/components/AmbientVideo';
import { createReveal } from '@/motion/director';
import { useMotion } from '@/motion/MotionProvider';
import { ROUTES, SITE_ORIGIN } from '@/routes';

/* ── Route config reference ────────────────────────────────────────── */
// After registering your route in routes.ts, reference it here for og:url.
// const MY_ROUTE = ROUTES.find(r => r.path === '/my-page/')!;

/* ── Constants ─────────────────────────────────────────────────────── */

// TODO: Replace with real step data (no invented facts — see DESIGN-SYSTEM.md §6)
const STEPS = [
  { n: '01', text: 'First step description here' },
  { n: '02', text: 'Second step description here' },
  { n: '03', text: 'Third step description here' },
] satisfies import('@/components/MiniLedgerList').MiniStep[];

/* ── Page component ────────────────────────────────────────────────── */

export default function TemplatePage() {
  const { reducedMotion, ready } = useMotion();

  // Refs for scroll reveals — one per animated block
  const sectionARef = useRef<HTMLDivElement>(null);

  /* ── Scroll reveals ────────────────────────────────────────────────
     Register reveals in a single useLayoutEffect. Use createReveal()
     from the ScrollDirector — never use ScrollTrigger directly.
     All pins must be in gsap.matchMedia('(min-width: 768px)').
  ──────────────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    if (!ready || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Example reveal: fade + rise
      if (sectionARef.current) {
        gsap.set(sectionARef.current, { opacity: 0, y: 18 });
        createReveal(sectionARef.current, {
          id: 'template-section-a', // Must be unique across the page — check ?debugfps=1
          onEnter: () =>
            gsap.to(sectionARef.current, {
              opacity: 1, y: 0, duration: 0.55, ease: 'power2.out',
            }),
        });
      }

      // Example desktop-only pin (uncomment if needed — justify in a comment):
      // Pins are limited to 2 per page. See DESIGN-SYSTEM.md §4.
      //
      // const mm = gsap.matchMedia();
      // mm.add('(min-width: 768px)', () => {
      //   createPinScrub(pinRef.current, { id: 'template-pin', end: '+=100%' });
      //   return () => {};
      // });
    });

    return () => ctx.revert();
  }, [ready, reducedMotion]);

  return (
    <Shell>
      {/* ── SEO / Open Graph ─────────────────────────────────────────
          Fill in all fields. og:url must match the canonical path
          registered in routes.ts. Never invent a URL — see DESIGN-SYSTEM.md §6.
      ──────────────────────────────────────────────────────────────── */}
      <Helmet>
        <title>TODO Page Title | Advanced Recovery Group</title>
        <meta name="description" content="TODO: ≤160 char description." />
        <meta property="og:title"       content="TODO Page Title | Advanced Recovery Group" />
        <meta property="og:description" content="TODO: ≤160 char description." />
        {/* Replace /my-page/ with the canonical path from routes.ts */}
        <meta property="og:url" content={`${SITE_ORIGIN}/my-page/`} />
      </Helmet>

      {/* ── PAGE HEADER ────────────────────────────────────────────────
          Choose ONE variant and delete the other.
      ──────────────────────────────────────────────────────────────── */}

      {/* OPTION A — Light header (glass content over the shared L0 backdrop) */}
      <PageHeader
        variant="light"
        eyebrow="Section — Location"     // e.g. "Careers" or omit
        headline="Your page headline."   // Sentence case. No Title Case.
      />

      {/*
      OPTION B — Cinema header (ink background, ambient video)
      Delete Option A above and uncomment this block.

      <PageHeader
        variant="cinema"
        mp4="/videos/your-video.mp4"
        webm="/videos/your-video.webm"   // omit if no webm
        poster="/videos/your-video-poster.jpg"  // Must exist in public/videos/
        eyebrow="Contact — Fairfield, NJ"
        headline="Let's talk."
        subline="Supporting sentence that explains the page purpose."
        footer={
          // Status badge, timestamp, or any short inline element
          <p className="font-mono text-xs text-paper/70">Office open now</p>
        }
        ariaLabel="My page header"
      />
      */}

      {/* ── CINEMA BAND (full-bleed video section) ─────────────────────
          Honesty rule: label must truthfully describe the footage.
          Delete this section if the page doesn't need a video band.
      ──────────────────────────────────────────────────────────────── */}
      <CinemaBand
        mp4="/videos/your-video.mp4"
        webm="/videos/your-video.webm"
        poster="/videos/your-video-poster.jpg"
        label="COLLECTIONS IN MOTION"
        aspectClassName="aspect-[4/3] md:aspect-video"
      >
        {/* Overlay content — bottom-left, pointer-events-none */}
        <p className="font-mono text-paper/60 text-[9px] tracking-[0.22em] uppercase mb-2">
          Eyebrow label
        </p>
        <p
          className="font-serif text-paper leading-snug max-w-xl"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
        >
          Intro sentence. Keep to one or two lines.
        </p>
      </CinemaBand>

      {/* ── STANDARD SECTION ───────────────────────────────────────────
          Keep the section transparent and use one .glass-paper plane for
          all its content. Always border-b border-rule between sections.
          Section padding scale: py-24 md:py-32 (tall), py-16 md:py-20 (std).
      ──────────────────────────────────────────────────────────────── */}
      <section className="bg-transparent py-16 md:py-20 border-b border-rule">
        <div className="glass-paper max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-10">
          {/* Eyebrow */}
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate mb-5">
            Section label
          </p>

          {/* Body content — scroll-reveal ref wraps the animated block */}
          <div ref={sectionARef}>
            <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6">
              Section headline.
            </h2>
            <p className="text-slate leading-relaxed max-w-prose">
              Body copy. Keep paragraphs short — one idea per paragraph.
            </p>
          </div>
        </div>
      </section>

      {/* ── MINI LEDGER LIST ───────────────────────────────────────────
          Numbered what-happens-next / step pattern with draw animation.
          Delete if the page doesn't need a steps list.
      ──────────────────────────────────────────────────────────────── */}
      <section className="bg-transparent py-16 md:py-20 border-b border-rule">
        <div className="glass-paper max-w-xl mx-auto px-6 md:px-8 py-8 md:py-10">
          <MiniLedgerList
            steps={STEPS}
            label="What happens next"
            revealIdPrefix="template-steps"
          />
        </div>
      </section>

      {/* ── CLOSER BAND ────────────────────────────────────────────────
          Ink CTA band — always the last section before the Shell footer.
          Use mp4 + poster for a video bg, or omit both for plain ink.
          No webm prop on hands-ledger (corrupt file — mp4 + poster only).
      ──────────────────────────────────────────────────────────────── */}
      <CloserBand
        headline="Ready to recover what you're owed?"
        mp4="/videos/hands-ledger.mp4"
        poster="/videos/hands-ledger-poster.jpg"
      >
        <a
          href="/contact-us/"
          className="inline-flex items-center justify-center bg-recovered text-paper font-mono text-xs uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-recovered/90 transition-colors min-h-[44px]"
        >
          Start a recovery
        </a>
        <a
          href="https://app.simplicitycollect.com/Login.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest px-6 py-4 rounded-sm border border-paper/30 text-paper hover:bg-paper/10 transition-colors min-h-[44px]"
        >
          Client Portal
        </a>
      </CloserBand>
    </Shell>
  );
}
