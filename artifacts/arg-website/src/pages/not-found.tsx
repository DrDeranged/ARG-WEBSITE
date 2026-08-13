import { Shell } from '@/components/layout/Shell';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

/* ── 404 page ──────────────────────────────────────────────────────────
   Dark ink treatment — hero poster only (static image, no video on
   an error page). The bw-skyline poster matches the home hero so the
   brand feels intentional even at a dead end.
──────────────────────────────────────────────────────────────────────── */
export default function NotFound() {
  return (
    <Shell>
      <Helmet>
        <title>Page Not Found | Advanced Recovery Group</title>
        <meta name="description" content="The page you're looking for doesn't exist or may have moved. Return to the Advanced Recovery Group homepage." />
      </Helmet>

      <section
        className="relative bg-ink overflow-hidden flex flex-col justify-end"
        style={{ minHeight: '100svh' }}
        aria-label="404 — page not found"
      >
        {/* Static poster background — no video on error pages */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img
            src="/videos/bw-skyline-poster.jpg"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          {/* Ink gradient overlay — heavier so text is always AA-readable */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom,' +
                ' rgba(16,31,48,0.70) 0%,' +
                ' rgba(16,31,48,0.55) 45%,' +
                ' rgba(16,31,48,0.80) 100%)',
            }}
          />
        </div>

        {/* Content — anchored toward bottom of viewport */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 pt-32 pb-20 md:pt-40 md:pb-28">
          <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-5 uppercase">
            Error 404
          </p>
          <h1
            className="font-serif text-paper mb-8"
            style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: 1.05 }}
          >
            This file isn&rsquo;t in our ledger.
          </h1>
          <p className="text-lg text-paper/70 max-w-prose leading-relaxed mb-12">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved. If you followed a link from another site, the URL may be outdated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="bg-paper text-ink px-8 py-4 text-sm font-mono uppercase tracking-widest rounded-sm hover:bg-paper/90 transition-colors text-center inline-block min-h-[44px] flex items-center justify-center"
            >
              Go to Homepage
            </Link>
            <Link
              href="/contact-us/"
              className="border border-paper/30 text-paper px-8 py-4 text-sm font-mono uppercase tracking-widest rounded-sm hover:bg-paper/10 transition-colors text-center min-h-[44px] flex items-center justify-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
