import { Shell } from '@/components/layout/Shell';
import { EditorialImage } from '@/components/EditorialImage';
import { ScrambleText } from '@/components/ScrambleText';
import { SectionRule } from '@/components/SectionRule';
import { MagneticWrapper } from '@/components/MagneticWrapper';
import { Link } from 'wouter';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

/* ─────────────────────────────────────────────────────────
   SCROLL-REVEAL HOOK
───────────────────────────────────────────────────────── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : true;
  const [revealed, setRevealed] = useState(prefersReduced);

  useEffect(() => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced, threshold]);

  return { ref, revealed };
}

function Reveal({
  children, delay = 0, className = '',
}: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, revealed } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SECTION FOLIO with scramble
───────────────────────────────────────────────────────── */
function SectionFolio({ n, total = 7 }: { n: number; total?: number }) {
  const label = `${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  return (
    <span className="absolute top-4 right-4 md:top-8 md:right-8 font-mono text-[10px] text-recovered/50 tabular-nums select-none pointer-events-none">
      <ScrambleText text={label} />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   ANIMATED LEDGER CARD
───────────────────────────────────────────────────────── */
const FILE_TYPES = ['MCA DEFAULT', 'EQUIPMENT LEASE', 'COMMERCIAL LOAN', 'JUDGMENT MATTER'];
const LIFECYCLE_STEPS = [
  { label: 'FILE PLACED',          final: false, middle: false },
  { label: 'SKIP TRACE COMPLETE',  final: false, middle: true  },
  { label: 'DEBTOR CONTACTED',     final: false, middle: true  },
  { label: 'PAYMENT PLAN SECURED', final: false, middle: true  },
  { label: 'FILE RECOVERED ✓',     final: true,  middle: false },
];

function AnimatedLedgerCard({ borderColor }: { borderColor?: string }) {
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const [fileIdx, setFileIdx] = useState(0);
  const [visibleRows, setVisible] = useState(prefersReduced ? LIFECYCLE_STEPS.length : 0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (prefersReduced) return;
    const ids: ReturnType<typeof setTimeout>[] = [];
    let fi = 0;

    function startCycle() {
      fi = fi % FILE_TYPES.length;
      setFileIdx(fi);
      setVisible(0);
      setFading(false);
      for (let row = 1; row <= LIFECYCLE_STEPS.length; row++) {
        ids.push(setTimeout(() => setVisible(row), row * 1200));
      }
      const holdAt = LIFECYCLE_STEPS.length * 1200 + 3000;
      ids.push(setTimeout(() => {
        setFading(true);
        ids.push(setTimeout(() => { fi = (fi + 1) % FILE_TYPES.length; startCycle(); }, 600));
      }, holdAt));
    }
    startCycle();
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();

  return (
    <div
      className="bg-paper font-mono text-sm md:text-xs"
      style={{
        border: `1px solid ${borderColor ?? 'var(--color-rule, #d5dae4)'}`,
        opacity: fading ? 0 : 1,
        transition: `opacity 600ms ease, border-color 200ms ease`,
      }}
      aria-hidden="true"
    >
      <div className="border-b border-rule px-4 py-3 flex justify-between items-center bg-mist">
        <span className="text-slate tracking-widest uppercase">Recovery File</span>
        <span className="text-slate/60 tabular-nums">{dateStr}</span>
      </div>
      <div className="border-b border-rule px-4 py-3">
        <span className="text-ink font-medium tracking-wider">{FILE_TYPES[fileIdx]}</span>
      </div>
      <div className="divide-y divide-rule">
        {LIFECYCLE_STEPS.map((step, i) => (
          <div
            key={step.label}
            className={`px-4 py-3 flex justify-between items-center ${step.final ? 'bg-recovered/[0.08]' : ''}`}
            style={{ opacity: i < visibleRows ? 1 : 0, transition: 'opacity 300ms ease' }}
          >
            <span className={step.final ? 'text-recovered font-medium' : 'text-ink'}>{step.label}</span>
            {i < visibleRows && (
              <span
                className="tabular-nums"
                style={{
                  color: step.final
                    ? 'var(--color-recovered)'
                    : step.middle
                    ? 'var(--color-signal)'
                    : 'hsl(213 19.5% 36.1% / 0.5)',
                }}
              >
                {step.final ? '●' : '○'}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-rule px-4 py-2 text-slate/40">
        Representative recovery lifecycle.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   HERO HEADLINE stagger
───────────────────────────────────────────────────────── */
const HERO_LINES = ['We recover', "what you\u2019re owed."];

function HeroHeadline() {
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRevealed(true), 50); return () => clearTimeout(t); }, []);

  if (prefersReduced) {
    return <h1 className="text-hero font-serif text-ink tracking-tight mb-8">{HERO_LINES.join(' ')}</h1>;
  }
  return (
    <h1 className="text-hero font-serif text-ink tracking-tight mb-8 overflow-hidden">
      {HERO_LINES.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <span
            className="block"
            style={{
              transform: revealed ? 'translateY(0)' : 'translateY(110%)',
              opacity: revealed ? 1 : 0,
              transition: `transform 700ms cubic-bezier(.22,1,.36,1) ${i * 130 + 80}ms, opacity 700ms ease ${i * 130 + 80}ms`,
            }}
          >{line}</span>
        </span>
      ))}
    </h1>
  );
}

/* ─────────────────────────────────────────────────────────
   VERTICALS TICKER
───────────────────────────────────────────────────────── */
const TICKER_PARTS = [
  'MERCHANT CASH ADVANCE', 'FACTORING', 'EQUIPMENT LEASING',
  'COMMERCIAL LOANS', 'FINTECH LENDING', 'JUDGMENT ENFORCEMENT',
];

function TickerSegment() {
  return (
    <span className="inline-flex items-center gap-0 font-mono text-xs text-slate/70 tracking-widest whitespace-nowrap shrink-0 pr-0">
      {TICKER_PARTS.map((part, i) => (
        <span key={i}>
          {part}
          &nbsp;<span className="text-recovered">·</span>&nbsp;
        </span>
      ))}
    </span>
  );
}

function VerticalsTicker() {
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  if (prefersReduced) {
    return (
      <div className="border-t border-b border-rule py-3 bg-paper overflow-x-hidden">
        <p className="font-mono text-xs text-slate tracking-widest text-center flex-wrap px-4">
          {TICKER_PARTS.map((p, i) => (
            <span key={i}>{p}{i < TICKER_PARTS.length - 1 && <span className="text-recovered mx-2">·</span>}</span>
          ))}
        </p>
      </div>
    );
  }
  return (
    <div className="border-t border-b border-rule py-3 bg-paper overflow-x-hidden">
      <div className="flex whitespace-nowrap ticker-animate" aria-hidden="true">
        <TickerSegment /><TickerSegment /><TickerSegment /><TickerSegment />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FEATURE ROW (Why ARG)
───────────────────────────────────────────────────────── */
function FeatureRow({ num, title, desc }: { num: string; title: string; desc: string }) {
  const { ref, revealed } = useScrollReveal(0.2);
  return (
    <div
      ref={ref}
      className="border-t border-rule last:border-b py-8 md:py-10 flex flex-col md:flex-row md:items-start gap-4 md:gap-16"
      style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 500ms ease, transform 500ms ease' }}
    >
      <span className="font-mono text-sm text-slate/40 mt-0.5 tabular-nums flex-shrink-0 w-8">{num}</span>
      <div className="flex-1 max-w-3xl">
        <h3 className="text-xl font-serif text-ink mb-2">{title}</h3>
        <p className="text-slate leading-relaxed font-sans max-w-prose">{desc}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PROCESS SECTION
───────────────────────────────────────────────────────── */
const PROCESS_STEPS = [
  { step: '01', title: 'Submit Placement', desc: 'Provide account details, invoices, and supporting documentation through our secure client portal.' },
  { step: '02', title: 'Dedicated Recovery', desc: 'Our specialized team immediately pursues collection using proven, compliant communication and negotiation strategies.' },
  { step: '03', title: 'You Get Paid', desc: 'We remit collected funds directly to you. We only retain our contingency fee upon successful collection.' },
];

function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : true;
  const [ruleH, setRuleH]     = useState(prefersReduced ? 100 : 0);
  const [stepActive, setActive] = useState(prefersReduced ? [true, true, true] : [false, false, false]);

  useEffect(() => {
    if (prefersReduced) return;
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const wh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (-top + wh * 0.6) / (height * 0.75)));
      setRuleH(progress * 100);
      setActive([progress > 0.1, progress > 0.42, progress > 0.72]);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReduced]);

  return (
    <section ref={sectionRef} id="process" className="relative bg-paper py-24 md:py-32 border-b border-rule scroll-m-20">
      <SectionFolio n={3} />
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionRule />
        <Reveal delay={100}>
          <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">Our Process</p>
          <h2 className="text-h2 font-serif text-ink mb-16 md:mb-24">From placement to recovery</h2>
        </Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="flex flex-col gap-12 relative">
            <div className="hidden lg:block absolute left-[11px] top-4 bottom-12 w-[1px] bg-rule z-0" />
            <div
              className="hidden lg:block absolute left-[11px] top-4 w-[1px] bg-ink z-0"
              style={{ height: `${ruleH}%`, maxHeight: 'calc(100% - 3rem)', transition: prefersReduced ? 'none' : 'height 120ms linear' }}
            />
            {PROCESS_STEPS.map((p, i) => (
              <div key={p.step} className="relative z-10 flex gap-6 md:gap-8"
                style={{ opacity: stepActive[i] ? 1 : 0.35, transition: 'opacity 400ms ease' }}>
                <div className="bg-paper w-6 h-6 flex-shrink-0 mt-1 flex items-center justify-center">
                  <span className="font-mono text-sm tabular-nums font-bold transition-colors duration-400"
                    style={{ color: stepActive[i] ? 'hsl(212 50% 12.5%)' : 'hsl(210 24.1% 87.8%)' }}>
                    {p.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-serif text-ink mb-2">{p.title}</h3>
                  <p className="text-slate leading-relaxed max-w-prose">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Reveal delay={150} className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px]">
            <EditorialImage src="/images/collectors.jpg" alt="ARG collections team at work" caption="THE ARG TEAM — FAIRFIELD, NJ" aspectClassName="h-full" width={800} height={600} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   RECOVERY ESTIMATOR with micro-physics
───────────────────────────────────────────────────────── */
type DScore = 'Strong' | 'Moderate' | 'Challenging';

function computeOutlook(balance: number, months: number, status: string) {
  let pts = 0;
  if (balance < 100_000) pts += 3;
  else if (balance < 500_000) pts += 2;
  else if (balance < 1_500_000) pts += 1;
  if (months <= 3) pts += 3;
  else if (months <= 9) pts += 2;
  else if (months <= 15) pts += 1;
  if (status === 'operating') pts += 3;
  else if (status === 'reduced') pts += 1;

  const lines: string[] = [];
  if (months <= 3) lines.push('Recent default — early intervention is the single biggest recovery advantage.');
  else if (months <= 9) lines.push('Moderate age. Recovery prospects remain viable with professional escalation.');
  else lines.push('Debt is aging. Each additional month narrows the window — prompt placement matters.');
  if (status === 'operating') lines.push('An operating debtor has income to negotiate against — that meaningfully improves outcomes.');
  else if (status === 'reduced') lines.push('A debtor with reduced operations may still be reachable; our investigators establish status on placement.');
  else lines.push('Unknown debtor status introduces uncertainty — our investigators establish operating condition on placement.');
  if (balance >= 1_000_000) lines.push('At this balance, litigation-backed escalation through affiliated counsel may be the most effective path.');

  let score: DScore;
  let pct: number;
  if (pts >= 7) { score = 'Strong'; pct = 78; }
  else if (pts >= 4) { score = 'Moderate'; pct = 50; }
  else { score = 'Challenging'; pct = 24; }
  return { score, pct, lines: lines.slice(0, 3) };
}

const BAND_COLORS: Record<DScore, string> = { Strong: 'bg-recovered', Moderate: 'bg-amber-600', Challenging: 'bg-slate' };
const BAND_TEXT: Record<DScore, string>   = { Strong: 'text-recovered', Moderate: 'text-amber-700', Challenging: 'text-slate' };
const SCRAMBLE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ!@#$%';

function RecoveryEstimator() {
  const [balance, setBalance] = useState(500_000);
  const [months, setMonths]   = useState(6);
  const [status, setStatus]   = useState('operating');
  const [animPct, setAnimPct] = useState(0);
  const rafRef = useRef<number | null>(null);

  const { score, pct, lines } = computeOutlook(balance, months, status);

  // ── Band label scramble ──
  const [displayScore, setDisplayScore] = useState<string>(score);
  const prevScore = useRef(score);
  useEffect(() => {
    if (score === prevScore.current) return;
    const prevS = prevScore.current;
    prevScore.current = score;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setDisplayScore(score); return; }
    let frame = 0;
    const tick = () => {
      frame++;
      if (frame >= 6) { setDisplayScore(score); return; }
      setDisplayScore(Array.from({ length: Math.max(score.length, prevS.length) }, () =>
        SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
      ).join('').slice(0, score.length));
      setTimeout(tick, 50);
    };
    tick();
  }, [score]);

  // ── Sentence stagger ──
  const linesStr = lines.join('|');
  const prevLinesStr = useRef(linesStr);
  const [lineKey, setLineKey] = useState(0);
  useEffect(() => {
    if (linesStr !== prevLinesStr.current) {
      prevLinesStr.current = linesStr;
      setLineKey(k => k + 1);
    }
  }, [linesStr]);

  // ── Bar animation ──
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setAnimPct(pct); return; }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    let start: number | null = null;
    const from = animPct;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 400, 1);
      setAnimPct(from + (pct - from) * p);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  const fmt = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M` : `$${(v / 1_000).toFixed(0)}k`;

  return (
    <section className="relative bg-mist ledger-grid py-24 md:py-32 border-b border-rule">
      <SectionFolio n={4} />
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <SectionRule />
        <Reveal delay={100}>
          <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">Recovery Estimator</p>
          <h2 className="text-h2 font-serif text-ink mb-4">What's still recoverable?</h2>
          <p className="text-slate max-w-prose mb-12">Adjust the inputs to see a qualitative outlook. Every file is assessed individually.</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="flex flex-col gap-10">
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor="est-balance" className="font-mono text-xs uppercase tracking-widest text-slate">Outstanding Balance</label>
                <span className="font-mono text-2xl text-ink tabular-nums">{fmt(balance)}</span>
              </div>
              <input id="est-balance" type="range" min={10_000} max={5_000_000} step={10_000} value={balance}
                onChange={e => setBalance(Number(e.target.value))}
                className="w-full h-[2px] bg-rule accent-recovered cursor-pointer" />
              <div className="flex justify-between font-mono text-xs text-slate/50 mt-1"><span>$10k</span><span>$5M</span></div>
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor="est-months" className="font-mono text-xs uppercase tracking-widest text-slate">Months Since Default</label>
                <span className="font-mono text-2xl text-ink tabular-nums">{months} mo</span>
              </div>
              <input id="est-months" type="range" min={0} max={24} step={1} value={months}
                onChange={e => setMonths(Number(e.target.value))}
                className="w-full h-[2px] bg-rule accent-recovered cursor-pointer" />
              <div className="flex justify-between font-mono text-xs text-slate/50 mt-1"><span>0</span><span>24 mo</span></div>
            </div>
            <div>
              <label htmlFor="est-status" className="font-mono text-xs uppercase tracking-widest text-slate block mb-3">Debtor Status</label>
              <select id="est-status" value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border border-rule bg-paper text-ink font-mono text-sm px-4 py-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-recovered">
                <option value="operating">Operating</option>
                <option value="reduced">Reduced operations</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="border border-rule p-8 rounded-sm flex flex-col gap-8 bg-paper">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-slate mb-2">Recoverability Outlook</p>
              {/* Band label scramble */}
              <p className={`text-3xl font-serif font-semibold font-mono tracking-wider ${BAND_TEXT[score]}`}>
                {displayScore}
              </p>
            </div>
            <div>
              <div className="h-3 w-full bg-rule rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${BAND_COLORS[score]}`} style={{ width: `${animPct}%` }} />
              </div>
              <div className="flex justify-between font-mono text-xs text-slate/50 mt-1"><span>Challenging</span><span>Strong</span></div>
            </div>
            {/* Sentences stagger in on change */}
            <ul className="flex flex-col gap-3 min-h-[160px]">
              {lines.map((l, i) => (
                <li
                  key={`${lineKey}-${i}`}
                  className="text-sm text-slate leading-relaxed flex gap-3"
                  style={{ animation: `fade-up-in 300ms ease ${i * 80}ms both` }}
                >
                  <span className="w-4 h-[1px] bg-recovered block mt-[0.6em] flex-shrink-0" />
                  {l}
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-rule flex flex-col gap-4">
              <p className="font-mono text-xs text-slate/50 italic">Illustrative outlook, not a guarantee. Every file is assessed individually.</p>
              <MagneticWrapper>
                <Link href="/contact-us/"
                  className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 text-sm font-medium rounded-sm hover:bg-ink/90 transition-colors w-fit">
                  Get a real assessment →
                </Link>
              </MagneticWrapper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   HERO — with scroll-linked ledger card depth
───────────────────────────────────────────────────────── */
function lerpColor(t: number): string {
  // rule ≈ rgb(213,218,228) → recovered ≈ rgb(22,163,74)
  const r = Math.round(213 + (22  - 213) * t);
  const g = Math.round(218 + (163 - 218) * t);
  const b = Math.round(228 + (74  - 228) * t);
  return `rgb(${r},${g},${b})`;
}

function HeroSection() {
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : true;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [prefersReduced]);

  // Card lags behind page scroll by 15% → apparent depth
  const cardParallaxY = prefersReduced ? 0 : scrollY * 0.15;
  const borderProgress = Math.min(1, scrollY / 300);
  const borderColor = lerpColor(borderProgress);

  return (
    <section className="relative bg-paper border-b border-rule min-h-[85vh] flex items-center">
      <SectionFolio n={1} />
      <div className="w-full">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-32 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-16 lg:gap-20 items-center">

            {/* Left 60% */}
            <div>
              <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-6 uppercase">
                Commercial Collections — Fairfield, NJ
              </p>
              <HeroHeadline />
              <p className="text-lg md:text-xl text-slate font-sans max-w-prose leading-relaxed mb-10">
                Advanced Recovery Group specializes exclusively in B2B debt recovery. Operating on a strict contingency basis, we deploy professional, firm, and proven strategies to restore your cash flow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticWrapper>
                  <Link href="/contact-us/"
                    className="bg-ink text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-ink/90 transition-colors text-center inline-block">
                    Get a Free Consultation
                  </Link>
                </MagneticWrapper>
                <a href="#process"
                  className="link-draw border border-ink text-ink px-8 py-4 text-sm font-medium rounded-sm hover:bg-mist transition-colors text-center">
                  See How It Works
                </a>
              </div>
            </div>

            {/* Right 40% — animated ledger card; visible on mobile (stacks below headline) */}
            <div
              className="mt-8 lg:mt-0"
              style={{
                transform: `translateY(${cardParallaxY}px)`,
                willChange: prefersReduced ? undefined : 'transform',
              }}
            >
              <AnimatedLedgerCard borderColor={borderColor} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <Shell>
      <Helmet>
        <title>Advanced Recovery Group | Commercial Collections Agency</title>
        <meta name="description" content="Advanced Recovery Group specializes exclusively in B2B commercial debt recovery. Operating on a strict contingency basis — no recovery, no fee." />
        <meta property="og:url" content="https://advancedrecoverygroup.com/" />
      </Helmet>

      {/* 01 / 07  HERO */}
      <HeroSection />

      {/* TICKER */}
      <VerticalsTicker />

      {/* 02 / 07  WHY ARG */}
      <section className="relative bg-mist py-24 md:py-32 border-b border-rule">
        <SectionFolio n={2} />
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <SectionRule />
          <Reveal delay={100}>
            <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">Why Advanced Recovery Group</p>
            <h2 className="text-h2 font-serif text-ink mb-4">A precise, results-driven approach to commercial debt.</h2>
            <p className="font-mono text-xs text-slate/60 tracking-widest uppercase mb-16">
              100% Contingency &nbsp;·&nbsp; B2B Commercial Only &nbsp;·&nbsp; 24/7 Client Portal
            </p>
          </Reveal>
          <div className="flex flex-col">
            {[
              { num: '01', title: 'Contingency-Based Recovery', desc: 'You only pay when we collect. Zero upfront fees, zero risk. Our incentives are perfectly aligned with your success.' },
              { num: '02', title: 'B2B Specialists', desc: 'We handle commercial debt exclusively — business-to-business, not consumer. We understand corporate structures, contracts, and negotiation.' },
              { num: '03', title: 'Litigation-Ready', desc: "When negotiation isn\u2019t enough, we escalate through affiliated counsel — liens, judgments, and enforcement, pursued properly." },
              { num: '04', title: 'Relationship-Preserving', desc: 'We operate with a level of professionalism that protects your reputation and, when possible, preserves your client relationships.' },
            ].map(f => <FeatureRow key={f.num} {...f} />)}
          </div>
        </div>
      </section>

      {/* 03 / 07  PROCESS */}
      <ProcessSection />

      {/* 04 / 07  RECOVERY ESTIMATOR */}
      <RecoveryEstimator />

      {/* 05 / 07  INDUSTRIES + PULL QUOTE */}
      <section className="relative bg-paper py-24 md:py-32 border-b border-rule">
        <SectionFolio n={5} />
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <SectionRule />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <Reveal delay={100}>
                <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">Trusted Partners</p>
                <h2 className="text-h2 font-serif text-ink mb-8">Industries we serve</h2>
              </Reveal>
              <ul className="flex flex-col gap-4 font-mono text-sm text-slate">
                {['Merchant Cash Advance','Factoring','Equipment Leasing','Commercial Loans','Fintech Lending','Law Firms & Judgment Holders'].map((industry, i) => (
                  <Reveal key={industry} delay={100 + i * 60}>
                    <li className="flex items-center gap-4">
                      <span className="w-4 h-[1px] bg-recovered block flex-shrink-0" />{industry}
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-rule pt-12 lg:pt-0 lg:pl-16">
              <Reveal delay={150}>
                <blockquote className="font-serif text-ink leading-snug"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: 1.25 }}>
                  Effective collections keep credit flowing. We give creditors the confidence that when things go wrong, their losses can be recovered.
                </blockquote>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 06 / 07  GIVING BACK */}
      <section className="relative bg-ink text-paper py-24 md:py-32 border-b border-ink">
        <SectionFolio n={6} />
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Reveal>
                <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">Giving Back</p>
                <h2 className="text-h2 font-serif text-paper mb-8">Feeding hope, building community</h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-paper/80 leading-relaxed mb-6 max-w-prose">
                  At Advanced Recovery Group, our mission extends beyond the ledger. We believe in leveraging our success to create tangible impact globally.
                </p>
                <p className="text-paper/80 leading-relaxed mb-10 max-w-prose">
                  Through our ongoing partnership with Feed My Starving Children, our team has packed thousands of meals. Recently, members of our staff traveled to the Dominican Republic to distribute food, build relationships, and witness firsthand the power of community service.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Link href="/blog/a-journey-of-compassion-my-service-trip-to-the-dr/"
                    className="link-draw text-recovered hover:text-paper transition-colors font-mono text-sm uppercase tracking-widest">
                    Read the Mission Story →
                  </Link>
                  <img src="/images/fmsc-logo.jpg" alt="Feed My Starving Children" className="h-12 w-auto mix-blend-screen opacity-80" loading="lazy" />
                </div>
              </Reveal>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Reveal delay={150} className="mt-12">
                <EditorialImage src="/images/manny-kids.jpg" alt="ARG team member with children in the Dominican Republic" caption="DR MISSION TRIP" aspectClassName="aspect-square" width={400} height={400} />
              </Reveal>
              <Reveal delay={220}>
                <EditorialImage src="/images/meals.jpg" alt="Packing FMSC meal packages at the warehouse" caption="FMSC PARTNERSHIP" aspectClassName="aspect-square" width={400} height={400} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG TEASER (unnumbered) */}
      <section className="bg-mist py-24 md:py-32 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div>
                <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">Insights</p>
                <h2 className="text-h2 font-serif text-ink">From the blog</h2>
              </div>
              <Link href="/blog/" className="link-draw font-mono text-sm text-ink hover:text-recovered transition-colors">
                View All Articles →
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { title: 'When Is the Right Time to Partner with a Commercial Collections Firm?', date: 'Nov 9, 2023', excerpt: 'As defaults slip from 30 to 60 to 90 days overdue, the likelihood of collecting diminishes.', link: '/blog/when-is-the-right-time-to-partner-with-a-commercial-collections-firm/' },
              { title: 'A Journey of Compassion: My Service Trip to the DR', date: 'Aug 15, 2023', excerpt: "A personal account of ARG\u2019s mission trip to the Dominican Republic — feeding families, building connections.", link: '/blog/a-journey-of-compassion-my-service-trip-to-the-dr/' },
            ].map((article, i) => (
              <Reveal key={article.title} delay={i * 100}>
                <Link href={article.link} className="group block list-row relative border-t border-rule pt-6 pl-4 hover:bg-mist/30 transition-colors">
                  <span className="font-mono text-xs text-slate tabular-nums block mb-4">{article.date}</span>
                  <h3 className="row-title text-2xl font-serif text-ink mb-4 group-hover:text-recovered transition-colors">{article.title}</h3>
                  <p className="text-slate mb-6 line-clamp-3 max-w-prose">{article.excerpt}</p>
                  <span className="link-draw font-mono text-sm text-ink group-hover:text-recovered transition-colors">Read More →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 07 / 07  CLOSING CTA */}
      <section className="relative bg-ink text-paper py-24 md:py-32 border-t border-recovered">
        <SectionFolio n={7} />
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center flex flex-col items-center">
          <Reveal>
            <h2 className="text-h2 font-serif text-paper mb-6">Ready to recover what you&rsquo;re owed?</h2>
            <p className="text-lg md:text-xl text-paper/80 mb-10 font-sans max-w-prose mx-auto">
              Contingency-based — no recovery, no fee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticWrapper>
                <Link href="/contact-us/"
                  className="inline-block bg-recovered hover:bg-recovered-bright text-paper px-10 py-4 text-sm font-medium rounded-sm transition-colors">
                  Start a recovery
                </Link>
              </MagneticWrapper>
              <a href="tel:8774648470"
                className="inline-block border border-paper/30 text-paper/70 hover:text-paper hover:border-paper/50 px-10 py-4 text-sm font-medium rounded-sm transition-colors">
                Call (877) 464-8470
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}
