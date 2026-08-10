import { Shell } from '@/components/layout/Shell';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';

function FeatureRow({ num, title, desc }: { num: string; title: string; desc: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group border-t border-rule last:border-b py-8 md:py-12 flex flex-col md:flex-row md:items-start gap-4 md:gap-16 hover:bg-paper/50 transition-colors -mx-6 px-6 md:mx-0 md:px-0"
    >
      <span
        className={`font-mono text-sm tabular-nums mt-1 transition-colors duration-300 ${visible ? 'text-recovered' : 'text-slate/40'}`}
      >
        {num}
      </span>
      <div className="flex-1 max-w-3xl">
        <h3 className="text-2xl font-serif text-ink mb-3">{title}</h3>
        <p className="text-slate leading-relaxed font-sans">{desc}</p>
      </div>
    </div>
  );
}

/* ── Recovery Estimator ─────────────────────────────────── */
type DScore = 'Strong' | 'Moderate' | 'Challenging';

function computeOutlook(balance: number, months: number, status: string): {
  score: DScore;
  pct: number;
  lines: string[];
} {
  let pts = 0;

  // Balance (larger = harder)
  if (balance < 100_000) pts += 3;
  else if (balance < 500_000) pts += 2;
  else if (balance < 1_500_000) pts += 1;

  // Age (older = harder)
  if (months <= 3) pts += 3;
  else if (months <= 9) pts += 2;
  else if (months <= 15) pts += 1;

  // Status
  if (status === 'operating') pts += 3;
  else if (status === 'reduced') pts += 1;

  const lines: string[] = [];

  if (months <= 3) lines.push('Recent default — early intervention is the single biggest recovery advantage.');
  else if (months <= 9) lines.push('Moderate age. Recovery prospects remain viable with professional escalation.');
  else lines.push('Debt is aging. Each additional month narrows the window — prompt placement matters.');

  if (status === 'operating') lines.push('An operating debtor has income to negotiate against. That meaningfully improves outcomes.');
  else if (status === 'reduced') lines.push('A debtor with reduced operations may still be reachable; the picture becomes clearer in early contact.');
  else lines.push('Unknown debtor status introduces uncertainty — our investigators establish operating condition on placement.');

  if (balance >= 1_000_000) lines.push('At this balance, litigation-backed escalation through affiliated counsel may be the most effective path.');

  // Map pts (0–9)
  let score: DScore;
  let pct: number;
  if (pts >= 7) { score = 'Strong'; pct = 78; }
  else if (pts >= 4) { score = 'Moderate'; pct = 50; }
  else { score = 'Challenging'; pct = 24; }

  return { score, pct, lines: lines.slice(0, 3) };
}

const BAND_COLORS: Record<DScore, string> = {
  Strong: 'bg-recovered',
  Moderate: 'bg-amber-600',
  Challenging: 'bg-slate',
};

const BAND_TEXT: Record<DScore, string> = {
  Strong: 'text-recovered',
  Moderate: 'text-amber-700',
  Challenging: 'text-slate',
};

function RecoveryEstimator() {
  const [balance, setBalance] = useState(500_000);
  const [months, setMonths] = useState(6);
  const [status, setStatus] = useState('operating');
  const [animPct, setAnimPct] = useState(0);

  const { score, pct, lines } = computeOutlook(balance, months, status);

  // Animate bar on change
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setAnimPct(pct); return; }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    let start: number | null = null;
    const from = animPct;
    const to = pct;
    const duration = 400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setAnimPct(from + (to - from) * p);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  const fmt = (v: number) =>
    v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
      : `$${(v / 1_000).toFixed(0)}k`;

  return (
    <section className="bg-paper py-24 md:py-32 border-b border-rule">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="mb-12">
          <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
            Recovery Estimator
          </p>
          <h2 className="text-4xl md:text-5xl font-serif text-ink leading-tight mb-4">
            What's still recoverable?
          </h2>
          <p className="text-slate max-w-xl">
            Adjust the inputs to see a qualitative outlook. Every file is assessed individually by our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Inputs */}
          <div className="flex flex-col gap-10">
            {/* Balance */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor="est-balance" className="font-mono text-xs uppercase tracking-widest text-slate">
                  Outstanding Balance
                </label>
                <span className="font-mono text-2xl text-ink tabular-nums">{fmt(balance)}</span>
              </div>
              <input
                id="est-balance"
                type="range"
                min={10_000}
                max={5_000_000}
                step={10_000}
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full h-[2px] bg-rule accent-recovered cursor-pointer"
              />
              <div className="flex justify-between font-mono text-xs text-slate/50 mt-1">
                <span>$10k</span><span>$5M</span>
              </div>
            </div>

            {/* Months since default */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor="est-months" className="font-mono text-xs uppercase tracking-widest text-slate">
                  Months Since Default
                </label>
                <span className="font-mono text-2xl text-ink tabular-nums">{months} mo</span>
              </div>
              <input
                id="est-months"
                type="range"
                min={0}
                max={24}
                step={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full h-[2px] bg-rule accent-recovered cursor-pointer"
              />
              <div className="flex justify-between font-mono text-xs text-slate/50 mt-1">
                <span>0</span><span>24 mo</span>
              </div>
            </div>

            {/* Debtor status */}
            <div>
              <label htmlFor="est-status" className="font-mono text-xs uppercase tracking-widest text-slate block mb-3">
                Debtor Status
              </label>
              <select
                id="est-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-rule bg-paper text-ink font-mono text-sm px-4 py-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-recovered"
              >
                <option value="operating">Operating</option>
                <option value="reduced">Reduced operations</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          {/* Output */}
          <div className="border border-rule p-8 rounded-sm flex flex-col gap-8 bg-mist/40">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-slate mb-2">Recoverability Outlook</p>
              <p className={`text-3xl font-serif font-semibold ${BAND_TEXT[score]}`}>{score}</p>
            </div>

            {/* Ledger bar */}
            <div>
              <div className="h-3 w-full bg-rule rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${BAND_COLORS[score]}`}
                  style={{ width: `${animPct}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-xs text-slate/50 mt-1">
                <span>Challenging</span><span>Strong</span>
              </div>
            </div>

            {/* Dynamic sentences */}
            <ul className="flex flex-col gap-3">
              {lines.map((l, i) => (
                <li key={i} className="text-sm text-slate leading-relaxed flex gap-3">
                  <span className="w-4 h-[1px] bg-recovered block mt-[0.6em] flex-shrink-0" />
                  {l}
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-rule flex flex-col gap-4">
              <p className="font-mono text-xs text-slate/50 italic">
                Illustrative outlook, not a guarantee. Every file is assessed individually.
              </p>
              <Link
                href="/contact-us/"
                className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 text-sm font-medium rounded-sm hover:bg-ink/90 transition-colors w-fit group"
              >
                Get a real assessment
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Hero headline stagger ──────────────────────────────── */
const HERO_LINES = ["We Recover", "What You\u2019re Owed."];

function HeroHeadline() {
  const [revealed, setRevealed] = useState(false);
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (prefersReduced) {
    return (
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-paper leading-[1.05] tracking-tight max-w-4xl mb-8">
        {HERO_LINES.join('\n')}
      </h1>
    );
  }

  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-paper leading-[1.05] tracking-tight max-w-4xl mb-8 overflow-hidden">
      {HERO_LINES.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <span
            className="block transition-all duration-700 ease-out"
            style={{
              transform: revealed ? 'translateY(0)' : 'translateY(110%)',
              opacity: revealed ? 1 : 0,
              transitionDelay: `${i * 120 + 100}ms`,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </h1>
  );
}

export default function HomePage() {
  return (
    <Shell>
      <Helmet>
        <title>Advanced Recovery Group | Commercial Collections Agency</title>
        <meta name="description" content="Advanced Recovery Group specializes exclusively in B2B commercial debt recovery. Operating on a strict contingency basis — no recovery, no fee." />
      </Helmet>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center justify-center min-h-[85vh] border-b border-rule overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-team.jpg"
            alt="Advanced Recovery Group team"
            className="w-full h-full object-cover"
            fetchPriority="high"
            width="1920"
            height="1080"
          />
          <div className="absolute inset-0 bg-ink/75 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-ink/40"></div>
        </div>

        <div className="max-w-6xl w-full mx-auto px-6 md:px-8 relative z-10 flex flex-col items-start mt-8 md:mt-16">
          <p className="font-mono text-recovered tracking-widest text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            COMMERCIAL COLLECTIONS
          </p>
          <HeroHeadline />
          <p className="text-lg md:text-xl text-paper/80 font-sans max-w-2xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
            Advanced Recovery Group specializes exclusively in B2B debt recovery. Operating on a strict contingency basis, we deploy professional, firm, and proven strategies to restore your cash flow.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both w-full sm:w-auto">
            <Link
              href="/contact-us/"
              className="bg-recovered text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-recovered/90 transition-colors w-full sm:w-auto text-center"
            >
              Get a Free Consultation
            </Link>
            <a
              href="#process"
              className="border border-paper/30 text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-paper/10 transition-colors w-full sm:w-auto text-center"
            >
              Learn How It Works
            </a>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-paper border-b border-rule relative z-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-rule">
            <div className="flex flex-col gap-2 pt-6 md:pt-0 md:pr-8 first:pt-0">
              <span className="font-mono text-3xl text-recovered">100%</span>
              <span className="text-slate text-sm font-medium">Contingency — no recovery, no fee</span>
            </div>
            <div className="flex flex-col gap-2 pt-6 md:pt-0 md:px-8">
              <span className="font-mono text-3xl text-recovered">B2B</span>
              <span className="text-slate text-sm font-medium">Commercial debt exclusively</span>
            </div>
            <div className="flex flex-col gap-2 pt-6 md:pt-0 md:pl-8">
              <span className="font-mono text-3xl text-recovered">24/7</span>
              <span className="text-slate text-sm font-medium">Client portal with live claim status</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ARG */}
      <section className="bg-mist py-24 md:py-32 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-16 md:mb-24 max-w-2xl">
            <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
              Why Advanced Recovery Group
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-ink leading-tight">
              A precise, results-driven approach to commercial debt.
            </h2>
          </div>

          <div className="flex flex-col">
            {[
              {
                num: "01",
                title: "Contingency-Based Recovery",
                desc: "You only pay when we collect. Zero upfront fees, zero risk. Our incentives are perfectly aligned with your success."
              },
              {
                num: "02",
                title: "B2B Specialists",
                desc: "We handle commercial debt exclusively — business-to-business, not consumer. We understand corporate structures, contracts, and negotiation."
              },
              {
                num: "03",
                title: "Litigation-Ready",
                desc: "When negotiation isn't enough, we escalate through affiliated counsel — liens, judgments, and enforcement, pursued properly."
              },
              {
                num: "04",
                title: "Relationship-Preserving",
                desc: "We operate with a level of professionalism that protects your reputation and, when possible, preserves your client relationships."
              }
            ].map((feature) => (
              <FeatureRow key={feature.num} num={feature.num} title={feature.title} desc={feature.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="process" className="bg-paper py-24 md:py-32 border-b border-rule scroll-m-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-16 md:mb-24">
            <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
              Our Process
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-ink leading-tight">
              From Placement to Recovery
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="flex flex-col gap-12 relative">
              <div className="hidden lg:block absolute left-[11px] top-4 bottom-12 w-[1px] bg-rule z-0" />

              {[
                {
                  step: "01",
                  title: "Submit Placement",
                  desc: "Provide account details, invoices, and supporting documentation through our secure client portal."
                },
                {
                  step: "02",
                  title: "Dedicated Recovery",
                  desc: "Our specialized team immediately pursues collection using proven, compliant communication and negotiation strategies."
                },
                {
                  step: "03",
                  title: "You Get Paid",
                  desc: "We remit collected funds directly to you. We only retain our contingency fee upon successful collection."
                }
              ].map((process) => (
                <div key={process.step} className="relative z-10 flex gap-6 md:gap-8">
                  <div className="bg-paper w-6 h-6 flex-shrink-0 mt-1 flex items-center justify-center">
                    <span className="font-mono text-sm text-ink font-bold tabular-nums">{process.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-ink mb-2">{process.title}</h3>
                    <p className="text-slate leading-relaxed">{process.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px] overflow-hidden rounded-sm bg-mist">
              <img
                src="/images/collectors.jpg"
                alt="ARG collections team at work"
                className="w-full h-full object-cover grayscale mix-blend-multiply contrast-125 opacity-90"
                loading="lazy"
                width="800"
                height="600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* RECOVERY ESTIMATOR — between Process and Industries */}
      <RecoveryEstimator />

      {/* INDUSTRIES & PULL QUOTE */}
      <section className="bg-mist py-24 md:py-32 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
                Trusted Partners
              </p>
              <h2 className="text-4xl font-serif text-ink leading-tight mb-8">
                Industries We Serve
              </h2>
              <ul className="flex flex-col gap-4 font-mono text-sm text-slate">
                {[
                  "Merchant Cash Advance",
                  "Factoring",
                  "Equipment Leasing",
                  "Commercial Loans",
                  "Fintech Lending",
                  "Law Firms & Judgment Holders"
                ].map((industry) => (
                  <li key={industry} className="flex items-center gap-4">
                    <span className="w-4 h-[1px] bg-recovered block flex-shrink-0"></span>
                    {industry}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-rule pt-12 lg:pt-0 lg:pl-16">
              <blockquote className="text-2xl md:text-3xl font-serif text-ink leading-snug">
                Effective collections keep credit flowing. We give creditors the confidence that when things go wrong, their losses can be recovered.
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CHARITY / GIVEBACK */}
      <section className="bg-ink text-paper py-24 md:py-32 border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">
                Giving Back
              </p>
              <h2 className="text-4xl md:text-5xl font-serif text-paper leading-tight mb-8">
                Feeding Hope, Building Community
              </h2>
              <p className="text-paper/80 leading-relaxed mb-6">
                At Advanced Recovery Group, our mission extends beyond the ledger. We believe in leveraging our success to create tangible impact globally.
              </p>
              <p className="text-paper/80 leading-relaxed mb-10">
                Through our ongoing partnership with Feed My Starving Children, our team has packed thousands of meals. Recently, members of our staff traveled to the Dominican Republic to distribute food, build relationships, and witness firsthand the power of community service.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link href="/blog/a-journey-of-compassion-my-service-trip-to-the-dr/" className="flex items-center gap-2 text-recovered hover:text-paper transition-colors font-mono text-sm uppercase tracking-widest group">
                  Read the Mission Story
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <img
                  src="/images/fmsc-logo.jpg"
                  alt="Feed My Starving Children"
                  className="h-12 w-auto mix-blend-screen opacity-80"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mt-12">
                <img
                  src="/images/manny-kids.jpg"
                  alt="ARG team member with children in the Dominican Republic"
                  className="w-full aspect-square object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                  width="400"
                  height="400"
                />
              </div>
              <div>
                <img
                  src="/images/meals.jpg"
                  alt="Packing FMSC meal packages at the warehouse"
                  className="w-full aspect-square object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                  width="400"
                  height="400"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG INSIGHTS */}
      <section className="bg-mist py-24 md:py-32 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
                Insights
              </p>
              <h2 className="text-4xl font-serif text-ink">
                From the Blog
              </h2>
            </div>
            <Link href="/blog/" className="font-mono text-sm text-ink hover:text-recovered transition-colors flex items-center gap-2 group">
              View All Articles <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: "When Is the Right Time to Partner with a Commercial Collections Firm?",
                date: "Nov 9, 2023",
                excerpt: "As defaults slip from 30 to 60 to 90 days overdue, the likelihood of collecting diminishes. Here's how to know when to bring in a commercial collections firm.",
                link: "/blog/when-is-the-right-time-to-partner-with-a-commercial-collections-firm/"
              },
              {
                title: "A Journey of Compassion: My Service Trip to the DR",
                date: "Aug 15, 2023",
                excerpt: "A personal account of ARG's mission trip to the Dominican Republic — feeding families, building connections, and living out our values.",
                link: "/blog/a-journey-of-compassion-my-service-trip-to-the-dr/"
              }
            ].map((article) => (
              <Link key={article.title} href={article.link} className="group block border-t border-rule pt-6">
                <span className="font-mono text-xs text-slate tabular-nums block mb-4">{article.date}</span>
                <h3 className="text-2xl font-serif text-ink mb-4 group-hover:text-recovered transition-colors">{article.title}</h3>
                <p className="text-slate mb-6 line-clamp-3">{article.excerpt}</p>
                <span className="font-mono text-sm text-ink group-hover:text-recovered flex items-center gap-2">
                  Read More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-recovered text-paper py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            Ready to Recover What You're Owed?
          </h2>
          <p className="text-lg md:text-xl text-paper/90 mb-10 font-sans">
            No upfront fees. Contingency-only. Get started today.
          </p>
          <Link
            href="/contact-us/"
            className="bg-paper text-ink px-10 py-4 text-sm font-medium rounded-sm hover:bg-paper/90 transition-colors inline-block"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </Shell>
  );
}
