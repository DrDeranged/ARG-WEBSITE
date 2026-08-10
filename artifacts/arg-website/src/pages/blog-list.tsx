import { Shell } from '@/components/layout/Shell';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';

export const articles = [
  {
    slug: "when-is-the-right-time-to-partner-with-a-commercial-collections-firm",
    title: "When Is the Right Time to Partner with a Commercial Collections Firm?",
    date: "Nov 9, 2023",
    excerpt: "As defaults slip from 30 to 60 to 90 days overdue, the likelihood of collecting diminishes. Here's how to know when to bring in a commercial collections firm."
  },
  {
    slug: "a-journey-of-compassion-my-service-trip-to-the-dr",
    title: "A Journey of Compassion: My Service Trip to the DR",
    date: "Aug 15, 2023",
    excerpt: "A personal account of ARG's mission trip to the Dominican Republic — feeding families, building connections, and living out our values."
  }
];

export default function BlogListPage() {
  return (
    <Shell>
      <Helmet>
        <title>Insights & Updates | Advanced Recovery Group</title>
        <meta name="description" content="Expertise in commercial collections, corporate finance, and agency news from Advanced Recovery Group." />
        <meta property="og:url" content="https://advancedrecoverygroup.com/blog/" />
      </Helmet>

      <section className="pt-32 pb-24 md:pt-48 md:pb-24 bg-mist border-b border-rule">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">Insights</p>
          <h1 className="font-serif text-ink mb-6" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', lineHeight: 1.05 }}>
            Insights &amp; Updates
          </h1>
          <p className="text-xl text-slate max-w-prose">
            Expertise in commercial collections, corporate finance, and agency news.
          </p>
        </div>
      </section>

      <section className="bg-paper py-24 min-h-[50vh]">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="flex flex-col">
            {articles.map((article) => (
              /* list-row for left accent bar; group for title shift via row-title */
              <div
                key={article.slug}
                className="list-row group relative border-t border-rule py-12 md:py-16 first:border-t-0 first:pt-0 pl-4 md:pl-6 hover:bg-mist/30 transition-colors"
              >
                <span className="font-mono text-sm text-slate tabular-nums block mb-4">{article.date}</span>
                <Link href={`/blog/${article.slug}/`} className="block">
                  <h2
                    className="row-title font-serif text-ink mb-6 group-hover:text-recovered transition-colors leading-tight"
                    style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1.2 }}
                  >
                    {article.title}
                  </h2>
                </Link>
                <p className="text-lg text-slate mb-8 max-w-prose leading-relaxed">
                  {article.excerpt}
                </p>
                <Link
                  href={`/blog/${article.slug}/`}
                  className="link-draw font-mono text-sm text-ink group-hover:text-recovered transition-colors"
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
