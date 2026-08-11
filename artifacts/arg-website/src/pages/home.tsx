import { Shell } from '@/components/layout/Shell';
import { EditorialImage } from '@/components/EditorialImage';
import { ScrambleText } from '@/components/ScrambleText';
import { SectionRule } from '@/components/SectionRule';
import { MagneticWrapper } from '@/components/MagneticWrapper';
import { Link } from 'wouter';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion, useSplitLines } from '@/motion';

/* ─────────────────────────────────────────────────────────
   SCROLL-REVEAL HOOK  (unchanged — used by non-hero sections)
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
  { label: 'FILE PLACED',           mobileLabel: 'FILE PLACED',           middle: false, amount: false, day: 'DAY 01', final: false },
  { label: 'SKIP TRACE COMPLETE',   mobileLabel: 'SKIP TRACE \u2713',     middle: true,  amount: false, day: 'DAY 03', final: false },
  { label: 'DEBTOR CONTACTED',      mobileLabel: 'DEBTOR CONTACTED',      middle: true,  amount: false, day: 'DAY 09', final: false },
  { label: 'PAYMENT PLAN SECURED',  mobileLabel: 'PLAN SECURED',          middle: true,  amount: false, day: 'DAY 21', final: false },
  { label: 'AMOUNT RECOVERED',      mobileLabel: 'AMOUNT RECOVERED',      middle: false, amount: true,  day: 'DAY 34', final: false },
  { label: 'FILE RECOVERED \u2713', mobileLabel: 'FILE RECOVERED \u2713', middle: false, amount: false, day: '',       final: true  },
];

function AnimatedLedgerCard() {
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const [fileIdx,    setFileIdx]  = useState(0);
  const [fileNumber, setFileNum]  = useState(() => 1000 + Math.floor(Math.random() * 8999));
  const [visibleRows, setVisible] = useState(prefersReduced ? LIFECYCLE_STEPS.length : 0);
  const [fading,     setFading]   = useState(false);

  useEffect(() => {
    if (prefersReduced) return;
    const ids: ReturnType<typeof setTimeout>[] = [];
    let fi = 0;

    function startCycle() {
      fi = fi % FILE_TYPES.length;
      setFileIdx(fi);
      setFileNum(1000 + Math.floor(Math.random() * 8999));
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
  const isFinal = visibleRows >= LIFECYCLE_STEPS.length;

  return (
    <div
      className="bg-paper font-mono text-[11px]"
      style={{
        border: '1px solid var(--color-rule)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 600ms ease',
      }}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="border-b border-rule px-4 py-3 flex justify-between items-center bg-ink">
        <span className="text-paper/70 tracking-widest uppercase text-[9px]">Recovery File</span>
        <span className="text-paper/40 tabular-nums text-[9px]">{dateStr}</span>
      </div>
      {/* File type + file number */}
      <div className="border-b border-rule px-4 py-3 flex justify-between items-center bg-mist">
        <span className="text-ink font-medium tracking-wider">{FILE_TYPES[fileIdx]}</span>
        <span className="text-slate/40 tabular-nums text-[9px]">FILE № 2026-{fileNumber}</span>
      </div>
      {/* Lifecycle rows */}
      <div className="divide-y divide-rule">
        {LIFECYCLE_STEPS.map((step, i) => (
          <div
            key={step.label}
            className={`px-4 flex justify-between items-center min-h-[44px] lg:min-h-[48px] ${step.final ? 'bg-recovered/[0.08]' : ''}`}
            style={{ opacity: i < visibleRows ? 1 : 0, transition: 'opacity 300ms ease' }}
          >
            <span className={
              step.final ? 'text-recovered font-medium' :
              (step.amount && isFinal) ? 'text-recovered font-medium' :
              'text-ink'
            }>
              <span className="md:hidden">{step.mobileLabel}</span>
              <span className="hidden md:inline">{step.label}</span>
            </span>

            {i < visibleRows && (
              step.amount ? (
                <span className={`tabular-nums ${isFinal ? 'text-recovered font-medium' : 'text-slate/35'}`}>
                  {isFinal ? '$ CONFIRMED' : <><span className="md:hidden">$ ————</span><span className="hidden md:inline">$ ———————</span></>}
                </span>
              ) : step.final ? (
                <span style={{ color: 'var(--color-recovered)' }}>●</span>
              ) : (
                <span className="flex items-center gap-3 text-[9px]">
                  <span style={{ color: step.middle ? 'var(--color-signal)' : 'hsl(213 19.5% 36.1% / 0.4)' }}>○</span>
                  {/* data-day-stamp: GSAP targets these during scrub to highlight reviewed rows */}
                  <span data-day-stamp className="text-slate/40 tabular-nums">{step.day}</span>
                </span>
              )
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-rule px-4 py-2 text-slate/35 text-[9px]">
        Representative recovery lifecycle.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   VERTICALS TICKER  (unchanged)
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
   FEATURE ROW (unchanged)
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
   PROCESS SECTION (unchanged)
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
  const [ruleH, setRuleH]       = useState(prefersReduced ? 100 : 0);
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
   RECOVERY ESTIMATOR  (unchanged)
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

  const linesStr = lines.join('|');
  const prevLinesStr = useRef(linesStr);
  const [lineKey, setLineKey] = useState(0);
  useEffect(() => {
    if (linesStr !== prevLinesStr.current) {
      prevLinesStr.current = linesStr;
      setLineKey(k => k + 1);
    }
  }, [linesStr]);

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
          <h2 className="text-h2 font-serif text-ink mb-4">What&rsquo;s still recoverable?</h2>
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
   HERO — office status clock
───────────────────────────────────────────────────────── */
function getHeroStatus(): { open: boolean; label: string } {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = now.getDay(), totalMin = now.getHours() * 60 + now.getMinutes();
  const OPEN = 9 * 60, CLOSE_WD = 17 * 60, CLOSE_FR = 16 * 60;
  if (day >= 1 && day <= 4 && totalMin >= OPEN && totalMin < CLOSE_WD)
    return { open: true,  label: 'Reviewing new placements — open until 5:00 PM ET' };
  if (day === 5 && totalMin >= OPEN && totalMin < CLOSE_FR)
    return { open: true,  label: 'Reviewing new placements — open until 4:00 PM ET' };
  return { open: false, label: 'Currently closed — inquiries reviewed next business day' };
}
function useHeroStatus() {
  const [st, setSt] = useState<{ open: boolean; label: string }>(getHeroStatus);
  useEffect(() => { const id = setInterval(() => setSt(getHeroStatus()), 60_000); return () => clearInterval(id); }, []);
  return st;
}

/* ─────────────────────────────────────────────────────────
   HERO — constants
───────────────────────────────────────────────────────── */
const N_BASELINES  = 20;   // number of horizontal ledger lines to render
const BASELINE_GAP = 56;   // px between lines
const EYEBROW_TEXT = 'COMMERCIAL COLLECTIONS — FAIRFIELD, NJ';
const TRIO_WORDS   = ['PLACE.', 'PURSUE.', 'RECOVER.'] as const;

/* ─────────────────────────────────────────────────────────
   HERO — main section
───────────────────────────────────────────────────────── */
function HeroSection() {
  const { reducedMotion } = useMotion();
  const heroStatus = useHeroStatus();

  /* Detect mobile once on mount (no SSR penalty — SPA only) */
  const [isMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  /* ── Refs ─────────────────────────────────────────────── */
  const sectionRef     = useRef<HTMLElement>(null);
  const baselineRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const eyebrowRef     = useRef<HTMLParagraphElement>(null);
  const headlineRef    = useRef<HTMLHeadingElement>(null);
  const trioOuterRef   = useRef<HTMLDivElement>(null);
  const trioInnerRef   = useRef<HTMLDivElement>(null);
  const subheadRef     = useRef<HTMLParagraphElement>(null);
  const desktopCtasRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const mobileCtasRef  = useRef<HTMLDivElement>(null);
  const tickerDockRef  = useRef<HTMLDivElement>(null);
  const scrollCueRef   = useRef<HTMLDivElement>(null);

  /* useSplitLines MUST be declared before the entrance useLayoutEffect
     so its own useLayoutEffect runs first and lines.current is populated. */
  const lines = useSplitLines(headlineRef);

  /* ── Kinetic trio: mobile 2-second auto-advance ─────── */
  const [trioIdx, setTrioIdx] = useState<number>(reducedMotion ? 2 : 0);
  useEffect(() => {
    if (!isMobile || reducedMotion) return;
    const id = setInterval(() => setTrioIdx(i => (i < 2 ? i + 1 : 2)), 2000);
    return () => clearInterval(id);
  }, [isMobile, reducedMotion]);

  /* ── Eyebrow typewriter ─────────────────────────────── */
  const [eyebrowText, setEyebrowText] = useState<string>(reducedMotion ? EYEBROW_TEXT : '');
  useEffect(() => {
    if (reducedMotion) return;
    let idx = 0;
    const msPerChar = (isMobile ? 400 * 0.6 : 400) / EYEBROW_TEXT.length;
    /* Start slightly after baseline draw begins */
    const startDelay = isMobile ? 190 : 320;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        idx++;
        setEyebrowText(EYEBROW_TEXT.slice(0, idx));
        if (idx >= EYEBROW_TEXT.length) clearInterval(id);
      }, msPerChar);
      return () => clearInterval(id);
    }, startDelay);
    return () => clearTimeout(t);
  }, [reducedMotion, isMobile]);

  /* ── Mobile scroll-cue (desktop handled by GSAP) ───── */
  const [scrollCueVisible, setScrollCueVisible] = useState(true);
  useEffect(() => {
    if (!isMobile || reducedMotion) return;
    const h = () => setScrollCueVisible(window.scrollY < 100);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, [isMobile, reducedMotion]);

  /* ── GSAP: entrance + desktop scrub ─────────────────── */
  useLayoutEffect(() => {
    /* Reduced-motion: every element is already in its final visible state.
       useSplitLines still ran, but no animation is needed. */
    if (reducedMotion) return;

    const speed    = isMobile ? 0.6 : 1.0;
    const baselines = baselineRefs.current.filter(Boolean) as HTMLDivElement[];
    const lineEls   = lines.current; // populated by useSplitLines's useLayoutEffect

    /* ── 1. Set initial hidden states before first paint ── */
    if (baselines.length) gsap.set(baselines, { scaleX: 0, transformOrigin: 'left' });
    if (lineEls.length)   gsap.set(lineEls, { y: '110%', opacity: 0 });
    if (eyebrowRef.current)     gsap.set(eyebrowRef.current, { opacity: 0 });
    if (trioOuterRef.current)   gsap.set(trioOuterRef.current, { opacity: 0 });
    if (subheadRef.current)     gsap.set(subheadRef.current, { opacity: 0, y: 12 });
    if (desktopCtasRef.current) gsap.set(desktopCtasRef.current, { opacity: 0, y: 8 });
    if (cardWrapperRef.current) gsap.set(cardWrapperRef.current, { x: 24, opacity: 0 });
    if (mobileCtasRef.current)  gsap.set(mobileCtasRef.current, { opacity: 0, y: 8 });
    if (tickerDockRef.current)  gsap.set(tickerDockRef.current, { y: 40, opacity: 0 });

    /* ── 2. Entrance timeline (plays once on load) ── */
    const entrance = gsap.timeline();

    /* Baselines draw left→right, staggered across 800ms */
    entrance.to(baselines, {
      scaleX: 1,
      duration: 0.8 * speed,
      stagger: 0.04 * speed,
      ease: 'power2.out',
    }, 0);

    /* Eyebrow container fades in (text filled by React typewriter in parallel) */
    if (eyebrowRef.current) {
      entrance.to(eyebrowRef.current, { opacity: 1, duration: 0.25 * speed }, 0.28 * speed);
    }

    /* Headline lines rise from 110% (clipped by overflow:hidden wrappers) */
    if (lineEls.length) {
      entrance.to(lineEls, {
        y: '0%',
        opacity: 1,
        duration: 0.7 * speed,
        stagger: 0.13 * speed,
        ease: 'power2.out',
      }, 0.82 * speed);
    }

    /* Kinetic trio appears */
    if (trioOuterRef.current) {
      entrance.to(trioOuterRef.current, { opacity: 1, duration: 0.3 * speed }, 0.85 * speed);
    }

    /* Subhead */
    if (subheadRef.current) {
      entrance.to(subheadRef.current, { opacity: 1, y: 0, duration: 0.5 * speed }, 1.15 * speed);
    }

    /* Desktop CTAs */
    if (desktopCtasRef.current) {
      entrance.to(desktopCtasRef.current, { opacity: 1, y: 0, duration: 0.4 * speed }, '>-0.15');
    }

    /* Card slides from x:24 */
    if (cardWrapperRef.current) {
      entrance.to(cardWrapperRef.current, {
        x: 0, opacity: 1,
        duration: 0.6 * speed,
        ease: 'power2.out',
      }, 1.1 * speed);
    }

    /* Mobile CTAs */
    if (mobileCtasRef.current) {
      entrance.to(mobileCtasRef.current, { opacity: 1, y: 0, duration: 0.4 * speed }, 1.2 * speed);
    }

    /* Mobile: no scrub — done */
    if (isMobile) {
      return () => { entrance.kill(); };
    }

    /* ── 3. Desktop scrub (hero pinned for 150vh of scroll) ── */
    const scrubTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 1.2,
        start: 'top top',
        end: '+=150%',
        anticipatePin: 1,
        onEnter: () => {
          if (sectionRef.current) sectionRef.current.style.willChange = 'transform, opacity';
        },
        onLeaveBack: () => {
          if (sectionRef.current) sectionRef.current.style.willChange = '';
        },
        onLeave: () => {
          if (sectionRef.current) sectionRef.current.style.willChange = '';
        },
        /* Day-stamp column highlights sequentially as user scrolls */
        onUpdate: (self) => {
          if (!cardWrapperRef.current) return;
          const p = self.progress;
          /* 6 rows across first 80% of scrub: each row gets 80/6 ≈ 13.3% */
          const hi = p < 0.8 ? Math.min(4, Math.floor((p / 0.8) * 5)) : 4;
          cardWrapperRef.current
            .querySelectorAll<HTMLElement>('[data-day-stamp]')
            .forEach((el, i) => {
              el.style.color      = i <= hi ? 'var(--color-recovered)' : '';
              el.style.fontWeight = i === hi ? '600' : '';
            });
        },
      },
    });

    /* Headline lines: staggered Y-up + fade (0 → 0.55 of scrub) */
    if (lineEls.length) {
      scrubTl.to(lineEls, {
        y: -88,
        opacity: 0,
        stagger: { amount: 0.12 },
        ease: 'power2.in',
        duration: 0.55,
      }, 0);
    }

    /* Baselines: un-rule themselves bottom-first (0 → 0.65) */
    const basesDn = [...baselines].reverse();
    scrubTl.to(basesDn, {
      opacity: 0,
      stagger: 0.022,
      duration: 0.65,
    }, 0);

    /* Card: scale + drift toward top-left (0 → 0.8) */
    if (cardWrapperRef.current) {
      scrubTl.to(cardWrapperRef.current, {
        scale: 0.92,
        x: -20,
        y: -32,
        opacity: 0.82,
        ease: 'power1.inOut',
        duration: 0.8,
      }, 0);
    }

    /* Kinetic trio: continuous vertical roll through all three words (0 → 0.8) */
    if (trioInnerRef.current) {
      /* -66.67% of the inner div's height moves it up by 2 of the 3 word-heights,
         revealing PURSUE. at ~33% and RECOVER. at ~67% of the roll. */
      scrubTl.to(trioInnerRef.current, {
        y: '-66.67%',
        ease: 'power1.inOut',
        duration: 0.8,
      }, 0);
    }

    /* Scroll cue: fades immediately as scrub begins */
    if (scrollCueRef.current) {
      scrubTl.to(scrollCueRef.current, { opacity: 0, duration: 0.08 }, 0);
    }

    /* Subhead + desktop CTAs: fade at 60–85% of scrub */
    const fadeGroup = [subheadRef.current, desktopCtasRef.current].filter(Boolean);
    if (fadeGroup.length) {
      scrubTl.to(fadeGroup, {
        opacity: 0,
        y: -14,
        stagger: 0.05,
        duration: 0.25,
      }, 0.6);
    }

    /* Ticker: slides up from y:40 and docks under the fixed header at 80% */
    if (tickerDockRef.current) {
      scrubTl.to(tickerDockRef.current, {
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        duration: 0.2,
      }, 0.8);
    }

    return () => {
      entrance.kill();
      scrubTl.kill();
    };
  }, [reducedMotion, isMobile]); // lines.current is stable across this component's lifetime

  /* ── JSX ─────────────────────────────────────────────── */
  return (
    <section
      ref={sectionRef}
      className="relative bg-paper border-b border-rule overflow-hidden md:flex md:items-center hero-height"
    >
      {/* ── Ledger-grid backdrop: individual divs for GSAP stagger ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        {Array.from({ length: N_BASELINES }, (_, i) => (
          <div
            key={i}
            ref={el => { baselineRefs.current[i] = el; }}
            className="absolute left-0 right-0"
            style={{
              top: `${(i + 1) * BASELINE_GAP}px`,
              height: '1px',
              backgroundColor: 'rgba(0,0,0,0.04)',
            }}
          />
        ))}
        {/* Vertical column rules: desktop only, static */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage:
              'linear-gradient(to right,' +
              ' transparent 25%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) calc(25% + 1px), transparent calc(25% + 1px),' +
              ' transparent 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05) calc(50% + 1px), transparent calc(50% + 1px),' +
              ' transparent 75%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05) calc(75% + 1px), transparent calc(75% + 1px))',
          }}
        />
      </div>

      <SectionFolio n={1} />

      {/* Marginalia spine — xl+ only */}
      <div
        className="absolute right-5 top-0 bottom-0 hidden xl:flex items-center justify-center"
        aria-hidden="true"
        style={{ writingMode: 'vertical-rl' }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate/25 select-none">
          ADVANCED RECOVERY GROUP — COMMERCIAL COLLECTIONS — FAIRFIELD NJ
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="w-full">
        <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-10 md:py-20 lg:py-24 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-6 lg:gap-20">

            {/* ① Left column */}
            <div>
              {/* Eyebrow: typed on character-by-character */}
              <p
                ref={eyebrowRef}
                className="font-mono text-recovered tracking-widest text-xs font-semibold mb-3 uppercase h-4 flex items-center gap-0.5"
              >
                {eyebrowText}
                {!reducedMotion && eyebrowText.length < EYEBROW_TEXT.length && (
                  <span className="animate-pulse text-recovered/60 leading-none">|</span>
                )}
              </p>

              {/* Kinetic trio: PLACE. → PURSUE. → RECOVER.
                  Desktop: inner div driven by GSAP scrub via trioInnerRef.
                  Mobile:  CSS transition driven by trioIdx state. */}
              {reducedMotion ? (
                <p className="font-mono text-xs tracking-widest uppercase mb-3 font-semibold text-recovered">
                  RECOVER.
                </p>
              ) : (
                <div
                  ref={trioOuterRef}
                  className="overflow-hidden mb-3"
                  style={{ height: '1.05rem' }}
                  aria-hidden="true"
                >
                  <div
                    ref={trioInnerRef}
                    style={isMobile ? {
                      transform: `translateY(${-trioIdx * 33.33}%)`,
                      transition: 'transform 320ms cubic-bezier(.22,1,.36,1)',
                    } : undefined}
                  >
                    {TRIO_WORDS.map((word, i) => (
                      <div
                        key={word}
                        className="font-mono text-xs tracking-widest font-semibold uppercase flex items-center"
                        style={{
                          height: '1.05rem',
                          color: i === 2 ? 'var(--color-recovered)' : 'hsl(210 24.1% 55%)',
                        }}
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Headline — useSplitLines targets this element */}
              <h1
                ref={headlineRef}
                className="text-hero font-serif text-ink tracking-tight mb-8"
              >
                We recover what you&rsquo;re owed.
              </h1>

              {/* Subhead */}
              <p
                ref={subheadRef}
                className="text-lg md:text-xl text-slate font-sans max-w-prose leading-relaxed"
              >
                Advanced Recovery Group specializes exclusively in B2B debt recovery.
                Operating on a strict contingency basis, we deploy professional, firm,
                and proven strategies to restore your cash flow.
              </p>

              {/* Desktop-only CTAs + status (single ref for scrub fade) */}
              <div ref={desktopCtasRef} className="hidden lg:block mt-10">
                <div className="flex flex-row gap-4 mb-5">
                  <MagneticWrapper>
                    <Link
                      href="/contact-us/"
                      className="bg-ink text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-ink/90 transition-colors text-center inline-block"
                    >
                      Get a Free Consultation
                    </Link>
                  </MagneticWrapper>
                  <a
                    href="#process"
                    className="link-draw border border-ink text-ink px-8 py-4 text-sm font-medium rounded-sm hover:bg-mist transition-colors text-center"
                  >
                    See How It Works
                  </a>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-slate/55">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${heroStatus.open ? 'bg-recovered' : 'bg-slate/30'}`} />
                  {heroStatus.label}
                </div>
              </div>
            </div>

            {/* ② Card column */}
            <div ref={cardWrapperRef}>
              <div className="relative pb-[4px] pr-[4px] md:pb-4 md:pr-4 lg:max-w-[460px] lg:ml-auto">
                {/* Mobile: single 4px shadow layer */}
                <div className="absolute bg-paper md:hidden"
                  style={{ inset: 0, transform: 'translate(4px,4px)', border: '1px solid var(--color-rule)', zIndex: 0 }} />
                {/* Desktop: two-layer depth stack */}
                <div className="absolute bg-paper hidden md:block"
                  style={{ inset: 0, transform: 'translate(16px,16px)', border: '1px solid var(--color-rule)', zIndex: 0 }} />
                <div className="absolute bg-paper hidden md:block"
                  style={{ inset: 0, transform: 'translate(8px,8px)', border: '1px solid var(--color-rule)', zIndex: 1 }} />
                <div className="relative" style={{ zIndex: 2 }}>
                  <AnimatedLedgerCard />
                </div>
              </div>
            </div>

            {/* ③ Mobile-only CTAs */}
            <div ref={mobileCtasRef} className="lg:hidden flex flex-col gap-3">
              <Link
                href="/contact-us/"
                className="bg-ink text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-ink/90 transition-colors text-center block w-full"
              >
                Get a Free Consultation
              </Link>
              <a
                href="#process"
                className="link-draw border border-ink text-ink px-8 py-4 text-sm font-medium rounded-sm hover:bg-mist transition-colors text-center block w-full"
              >
                See How It Works
              </a>
              <div className="flex items-center gap-2 font-mono text-xs text-slate/55 pt-1">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${heroStatus.open ? 'bg-recovered' : 'bg-slate/30'}`} />
                {heroStatus.label}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Ticker dock (desktop scrub: slides up at 80% and docks under header) ── */}
      {/* Lives inside the pinned section. Starts invisible (gsap.set y:40, opacity:0). */}
      <div
        ref={tickerDockRef}
        className="absolute left-0 right-0 z-10 hidden lg:block"
        style={{ top: '60px' }}
        aria-hidden="true"
      >
        <VerticalsTicker />
      </div>

      {/* Scroll cue */}
      <div
        ref={scrollCueRef}
        className="absolute bottom-8 left-8 hidden md:flex items-center gap-2 font-mono text-[10px] text-slate/30 uppercase tracking-widest select-none pointer-events-none"
        style={isMobile ? {
          opacity: scrollCueVisible && !reducedMotion ? 1 : 0,
          transition: 'opacity 400ms ease',
        } : undefined}
        aria-hidden="true"
      >
        SCROLL ↓
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

      {/* TICKER — page-flow ticker (always visible below hero on all viewports) */}
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

      {/* BLOG TEASER */}
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
