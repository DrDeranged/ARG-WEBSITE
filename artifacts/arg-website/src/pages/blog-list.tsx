import { Shell } from '@/components/layout/Shell';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { createReveal } from '@/motion/director';
import { useMotion } from '@/motion';
import { PageHeader } from '@/components/PageHeader';
import { SITE_ORIGIN } from '@/routes';

/* ── Article data ─────────────────────────────────────────────────────
   readTime is derived from word count at ~200 wpm.
   Sync with articleData in blog-article.tsx if articles are added.
──────────────────────────────────────────────────────────────────────── */
export const articles = [
  {
    slug: "when-is-the-right-time-to-partner-with-a-commercial-collections-firm",
    title: "When Is the Right Time to Partner with a Commercial Collections Firm?",
    date: "Nov 9, 2023",
    readTime: "5 min read",
    excerpt: "As defaults slip from 30 to 60 to 90 days overdue, the likelihood of collecting diminishes. Here's how to know when to bring in a commercial collections firm.",
  },
  {
    slug: "a-journey-of-compassion-my-service-trip-to-the-dr",
    title: "A Journey of Compassion: My Service Trip to the DR",
    date: "Aug 15, 2023",
    readTime: "4 min read",
    excerpt: "A personal account of ARG's mission trip to the Dominican Republic — feeding families, building connections, and living out our values.",
  },
];

/* ── Page ─────────────────────────────────────────────────────────── */
export default function BlogListPage() {
  const { ready, reducedMotion } = useMotion();

  /* Article row refs — one per entry, staggered reveal */
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Staggered scroll-in for article rows */
  useLayoutEffect(() => {
    if (!ready) return;

    const ctx = gsap.context(() => {
      rowRefs.current.forEach((el, i) => {
        if (!el) return;

        if (reducedMotion) {
          gsap.set(el, { opacity: 1, y: 0 });
          return;
        }

        gsap.set(el, { opacity: 0, y: 18 });
        createReveal(el, {
          start: 'top 90%',
          onEnter: () => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.45,
              ease: 'power2.out',
              delay: i * 0.09,
            });
          },
        });
      });
    });

    return () => ctx.revert();
  }, [ready, reducedMotion]);

  return (
    <Shell>
      <Helmet>
        <title>Insights &amp; Updates | Advanced Recovery Group</title>
        <meta name="description" content="Expertise in commercial collections, corporate finance, and agency news from Advanced Recovery Group." />
        <meta property="og:title" content="Insights &amp; Updates | Advanced Recovery Group" />
        <meta property="og:description" content="Expertise in commercial collections, corporate finance, and agency news from Advanced Recovery Group." />
        <meta property="og:url" content={`${SITE_ORIGIN}/blog/`} />
      </Helmet>

      {/* ── CINEMATIC HEADER ─────────────────────────────────────────
          hands-ledger: mp4 + poster only — no webm (corrupt file).
          Writing-hands footage is the thematic match for editorial.
      ─────────────────────────────────────────────────────────────── */}
      <PageHeader
        variant="cinema"
        mp4="/videos/hands-ledger.mp4"
        poster="/videos/hands-ledger-poster.jpg"
        eyebrow="Insights"
        headline="Insights &amp; updates."
        subline="Expertise in commercial collections, corporate finance, and agency news."
        ariaLabel="Blog insights listing header"
      />

      {/* ── ARTICLE LEDGER ROWS ──────────────────────────────────────
          Full-width rule-separated rows — no card background.
          Recovered appears only as: left accent bar + Read More arrow.
          Title is always ink — never recovered on hover.
      ─────────────────────────────────────────────────────────────── */}
      <section className="bg-paper py-16 md:py-24 min-h-[50svh]">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="flex flex-col">
            {articles.map((article, i) => (
              <div
                key={article.slug}
                ref={el => { rowRefs.current[i] = el; }}
                className="group relative border-t border-rule py-10 md:py-12 first:border-t-0 first:pt-0"
              >
                {/* Recovered left accent bar — visible on hover only */}
                <span
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm bg-recovered opacity-0 group-hover:opacity-100"
                  style={{ transition: 'opacity 150ms ease' }}
                  aria-hidden="true"
                />

                {/* Meta: date · read time */}
                <span className="font-mono text-[10px] text-slate/60 uppercase tracking-[0.18em] tabular-nums block mb-4 pl-4">
                  {article.date} · {article.readTime}
                </span>

                {/* Title — ink always; translate on hover to reinforce the accent bar */}
                <Link href={`/blog/${article.slug}/`} className="block pl-4">
                  <h2
                    className="font-serif text-ink mb-4 leading-snug group-hover:translate-x-[5px] transition-transform duration-200"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: 1.2 }}
                  >
                    {article.title}
                  </h2>
                </Link>

                {/* Excerpt */}
                <p className="text-base text-slate mb-6 max-w-prose leading-relaxed pl-4">
                  {article.excerpt}
                </p>

                {/* CTA — recovered arrow only; no title color change */}
                <Link
                  href={`/blog/${article.slug}/`}
                  className="pl-4 font-mono text-xs text-recovered uppercase tracking-widest hover:text-recovered/70 transition-colors"
                >
                  Read More →
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-16 border-t border-rule text-center">
            <p className="font-mono text-sm text-slate/60 italic">More articles coming soon.</p>
          </div>
        </div>
      </section>
    </Shell>
  );
}
