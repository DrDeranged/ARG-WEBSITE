import { Shell } from '@/components/layout/Shell';
import { ArrowLeft } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import NotFound from '@/pages/not-found';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const articleData: Record<string, {
  title: string;
  description: string;
  date: string;
  coverImage: string;
  content: string;
  placeholder?: boolean;
}> = {
  "when-is-the-right-time-to-partner-with-a-commercial-collections-firm": {
    title: "When Is the Right Time to Partner with a Commercial Collections Firm?",
    description: "As defaults slip from 30 to 60 to 90 days overdue, the likelihood of collecting diminishes. Here's how to know when to bring in a commercial collections firm.",
    date: "November 9, 2023",
    coverImage: "/images/dr-cover.png",
    content: `
      <p>Cash flow hiccups due to default can disrupt even the most resilient businesses. As defaults slip from 30 to 60 to 90 days overdue, the likelihood of collecting on those debts without assistance diminishes. This is where a commercial collections firm comes in, providing the expertise to pursue outstanding debts while allowing businesses to maintain focus on their daily operations.</p>
      
      <h2>Understanding Commercial Collections Firms</h2>
      <p>A commercial collections firm is a specialized agency that assists businesses in recovering funds from customers who have not paid their debts. Unlike consumer collections, commercial collections focus strictly on debts owed by businesses. These firms employ trained professionals who understand the nuances of business law, contracts, and negotiation strategies tailored for corporate debt recovery.</p>

      <h2>Early Signs You Might Need a Collection Firm</h2>
      <p><strong>Aging Accounts Receivable:</strong> If your aging report shows an increasing number of accounts going past the 90-day mark, this is a red flag. <br/><br/><strong>High Outstanding Balances:</strong> When the amount owed by delinquent accounts begins to represent a significant percentage of your revenue, it's time to consider reinforcements. <br/><br/><strong>Ineffective Internal Collection Efforts:</strong> If your in-house efforts are consistently failing to recover debts, professional intervention might be needed. <br/><br/><strong>Cash Flow Interruptions:</strong> A healthy business requires a steady cash flow. If unpaid debts are causing disruptions in your operations, it's a clear sign to seek help. <br/><br/><strong>Lack of Expertise:</strong> Collecting commercial debt often requires specialized legal knowledge. <br/><br/><strong>Customer Relationship Management:</strong> Sometimes, preserving a good relationship with the debtor while attempting to collect can be challenging.</p>

      <h2>Strategic Timing for Partnering with a Collection Firm</h2>
      <p><strong>After Internal Efforts Have Failed:</strong> Once you've exhausted your internal resources and efforts to collect the debt without success, it's a prudent move to bring in a collection firm. <br/><br/><strong>Before the Debt Becomes Statute-Barred:</strong> Every debt has a statute of limitations — act before the debt becomes too old to be legally enforceable. <br/><br/><strong>During a Financial Audit:</strong> If an audit reveals a large amount of uncollected debt, it might be time to partner with a collection firm. <br/><br/><strong>When Entering a Growth Phase:</strong> As your business grows, outsource debt collection to experts. <br/><br/><strong>Before Legal Action Becomes Necessary:</strong> Often more cost-effective than litigation.</p>

      <h2>The Advantages</h2>
      <p><strong>Expertise in Debt Recovery:</strong> These firms bring expertise and proven strategies, significantly increasing the chances of recovery. <br/><br/><strong>Legal Protection:</strong> Collection agencies are well-versed in the laws governing debt recovery. <br/><br/><strong>Focused Resources:</strong> Collection agencies have resources solely dedicated to collecting your unpaid debts. <br/><br/><strong>Documentation and Reporting:</strong> Detailed documentation is provided, crucial if the case escalates to legal proceedings. <br/><br/><strong>Preserving Business Relationships:</strong> A collections firm can diplomatically handle debt recovery.</p>

      <h2>Selecting the Right Commercial Collections Firm</h2>
      <p>Look for experience in your specific industry. Check their success rate in recovering debts. Ensure their techniques align with your company's values. Review their fee structure — contingency-based is preferred. And finally, assess their reputation — always check references and reviews.</p>

      <h2>Conclusion</h2>
      <p>Partnering with a commercial collections firm can be a game-changer for businesses grappling with unpaid debts. The right time to engage one is when internal processes falter, cash flow is threatened, and before debts age out of enforceability. Advanced Recovery Group offers substantial benefits — a full-service collection agency approach with results-based compensation. This ensures our goals are directly tied to the success of our clients.</p>
    `
  },
  "a-journey-of-compassion-my-service-trip-to-the-dr": {
    title: "A Journey of Compassion: My Service Trip to the DR",
    description: "A personal account of ARG's mission trip to the Dominican Republic — feeding families, building connections, and living out our values.",
    date: "August 15, 2023",
    coverImage: "/images/dr-trip.jpg",
    placeholder: true,
    content: ``
  }
};

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleScroll = () => {
      const article = document.querySelector('article');
      if (!article) return;
      const { top, height } = article.getBoundingClientRect();
      const windowH = window.innerHeight;
      const scrolled = Math.max(0, -top);
      const total = height - windowH;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-rule/30">
      <div
        className="h-full bg-recovered transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function BlogArticlePage() {
  const [match, params] = useRoute('/blog/:slug');
  const slug = params?.slug;

  if (!slug || !articleData[slug]) {
    return <NotFound />;
  }

  const article = articleData[slug];

  return (
    <Shell>
      <Helmet>
        <title>{article.title} | Advanced Recovery Group</title>
        <meta name="description" content={article.description} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        {article.coverImage && <meta property="og:image" content={article.coverImage} />}
      </Helmet>

      <ReadingProgress />

      <article className="pb-24">
        {/* Header */}
        <header className="pt-32 pb-16 md:pt-48 md:pb-24 bg-mist border-b border-rule">
          <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
            <Link href="/blog/" className="inline-flex items-center gap-2 font-mono text-sm text-slate hover:text-recovered transition-colors mb-8 group uppercase tracking-widest">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Insights
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-ink mb-8 leading-tight">
              {article.title}
            </h1>
            <time className="font-mono text-sm text-slate tabular-nums block">
              {article.date}
            </time>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="max-w-5xl mx-auto px-6 md:px-8 -mt-8 md:-mt-12 relative z-10 mb-16 md:mb-24">
            <div className="w-full aspect-video md:aspect-[21/9] bg-paper overflow-hidden rounded-sm border border-rule/50">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
                width="1200"
                height="514"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          {article.placeholder ? (
            <p className="text-2xl text-slate italic font-serif text-center py-16">
              Full article being migrated — check back soon.
            </p>
          ) : (
            <div
              className="prose prose-slate prose-lg max-w-none font-sans
                prose-headings:font-serif prose-headings:text-ink prose-headings:font-normal
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-rule prose-h2:pb-4
                prose-p:text-slate prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-ink prose-strong:font-medium
                prose-img:rounded-sm prose-img:border prose-img:border-rule"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}

          <div className="mt-16 pt-8 border-t border-rule flex justify-between items-center">
            <p className="font-mono text-xs text-slate uppercase tracking-widest">Share this article</p>
            <div className="flex gap-4">
              <a
                href={`https://www.linkedin.com/shareArticle?url=https://advancedrecoverygroup.com/blog/${slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate hover:text-ink transition-colors font-mono text-xs"
              >
                LinkedIn
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(article.title)}&body=https://advancedrecoverygroup.com/blog/${slug}/`}
                className="text-slate hover:text-ink transition-colors font-mono text-xs"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </article>
    </Shell>
  );
}
