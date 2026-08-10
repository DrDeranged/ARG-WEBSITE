import { Shell } from '@/components/layout/Shell';
import { ArrowRight } from 'lucide-react';
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
      </Helmet>

      <section className="pt-32 pb-24 md:pt-48 md:pb-24 bg-mist border-b border-rule">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h1 className="text-5xl md:text-7xl font-serif text-ink mb-6">Insights & Updates</h1>
          <p className="text-xl text-slate">
            Expertise in commercial collections, corporate finance, and agency news.
          </p>
        </div>
      </section>

      <section className="bg-paper py-24 min-h-[50vh]">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="flex flex-col">
            {articles.map((article) => (
              <div key={article.slug} className="group border-t border-rule py-12 md:py-16 first:border-t-0 first:pt-0">
                <span className="font-mono text-sm text-slate tabular-nums block mb-4">{article.date}</span>
                <Link href={`/blog/${article.slug}/`} className="block">
                  <h2 className="text-3xl md:text-4xl font-serif text-ink mb-6 group-hover:text-recovered transition-colors leading-tight">
                    {article.title}
                  </h2>
                </Link>
                <p className="text-lg text-slate mb-8 max-w-3xl leading-relaxed">
                  {article.excerpt}
                </p>
                <Link
                  href={`/blog/${article.slug}/`}
                  className="font-mono text-sm text-ink group-hover:text-recovered flex items-center gap-2 w-fit"
                >
                  Read More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
