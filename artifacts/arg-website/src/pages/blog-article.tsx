import { Shell } from '@/components/layout/Shell';
import { EditorialImage } from '@/components/EditorialImage';
import { Link, useRoute } from 'wouter';
import NotFound from '@/pages/not-found';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const articleData: Record<string, {
  title: string;
  description: string;
  date: string;
  author?: string;
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
    author: "Manny Yosipov, CEO",
    coverImage: "/images/dr-trip.jpg",
    content: `
      <p>As CEO of ARG, I'm thrilled to share some exciting news with all of you. We at ARG have always believed in the power of compassion and the change that collective efforts can bring about. Today, I feel immensely proud and humbled to announce our collaboration with FMSC. Together, we are embarking on a service trip to the Dominican Republic (DR) to participate in community service at their medical facilities and kitchens.</p>

      <p>Ever since ARG's inception, our vision has been more than just profit and growth. We've wanted to be a company with a heart, a company that doesn't shy away from its responsibility towards the larger community. And what better way to exemplify this spirit than by having our leadership be at the forefront of our charitable initiatives?</p>

      <p>This service trip isn't just about showing up; it's about immersing ourselves in the needs of the community, understanding the challenges they face, and putting our skills and resources to best use. As I prepare for this journey, I can't help but reflect upon a philosophy that I've held close to my heart: those blessed with more should be the guiding light for those in need. This isn't merely a duty; it's a privilege.</p>

      <p>The excitement and pride I feel about this journey is not just because of our company's involvement. I must take a moment to express my profound gratitude to Shawn Smith of Dedicated Financial. Without his unwavering support and expertise in arranging this trip, this wouldn't have been possible. Shawn, your generosity and commitment to making a difference are truly commendable, and we are grateful to have you as a partner on this journey.</p>

      <p>As I stand on the cusp of this transformative experience, I want to be more than a mere participant. I want to witness firsthand the difference we're making in the lives of children. I yearn to see the spark in their eyes, the hope in their smiles, and the resilience in their spirits. Every child deserves a fair chance at life, and if ARG can be a small beacon of hope, then every effort, every hour, every resource expended would be worth it.</p>

      <p>However, this isn't just my journey. It's our collective journey as a company, as a community, and as human beings. While I might be representing ARG in the DR, it's the collective spirit of every ARG employee, stakeholder, and supporter that I carry with me. Together, we represent a force for good, a force that believes in the power of community service to transform lives.</p>

      <p>There's a special kind of fulfillment that comes from giving back. From witnessing the immediate impact of our actions on the lives of people. This is not about charity; this is about empowerment. We aim to leave behind more than just resources and assistance; we want to foster a spirit of self-reliance, dignity, and hope.</p>

      <p>It's easy to get lost in the daily hustle and bustle of our lives, to be consumed by deadlines, meetings, and targets. But when we pause and take a moment to look beyond ourselves, to reach out and touch the life of another, it provides a sense of purpose and fulfillment that's unparalleled.</p>

      <p>In conclusion, this service trip is a testament to ARG's commitment to make a positive difference in the world. But beyond corporate objectives and missions, this is a deeply personal journey for me. It's a reminder of the values I hold dear and the kind of legacy I want to leave behind.</p>

      <p>As I head to the DR, I promise to soak in every moment, to learn, to share, and to give my all in service. I'm not just going there to extend a helping hand but to truly witness and be part of the change that we, as a collective, can bring about.</p>

      <p>Thank you for being a part of this journey. Let's keep the spirit of giving alive, today and always!</p>
    `
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
        <meta property="og:url" content={`https://advancedrecoverygroup.com/blog/${slug}/`} />
        {article.coverImage && (
          <meta property="og:image" content={`https://advancedrecoverygroup.com${article.coverImage}`} />
        )}
        {article.coverImage && (
          <meta name="twitter:image" content={`https://advancedrecoverygroup.com${article.coverImage}`} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <ReadingProgress />

      <article className="pb-24">
        {/* Header */}
        <header className="pt-32 pb-16 md:pt-48 md:pb-24 bg-mist border-b border-rule">
          <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
            <Link href="/blog/" className="inline-flex items-center gap-2 font-mono text-sm text-slate hover:text-recovered transition-colors mb-8 group uppercase tracking-widest">
              ← Back to Insights
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-ink mb-8 leading-tight">
              {article.title}
            </h1>
            <time className="font-mono text-sm text-slate tabular-nums block">
              {article.date}
            </time>
            {article.author && (
              <p className="font-mono text-xs text-slate/60 mt-2 uppercase tracking-widest">
                By {article.author}
              </p>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="max-w-5xl mx-auto px-6 md:px-8 -mt-8 md:-mt-12 relative z-10 mb-16 md:mb-24">
            <EditorialImage
              src={article.coverImage}
              alt={article.title}
              aspectClassName="aspect-video md:aspect-[21/9]"
              width={1200}
              height={514}
              loading="eager"
            />
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
