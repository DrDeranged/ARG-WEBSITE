import { Shell } from '@/components/layout/Shell';
import { AmbientVideo } from '@/components/AmbientVideo';
import { EditorialImage } from '@/components/EditorialImage';
import { SectionRule } from '@/components/SectionRule';
import { Link } from 'wouter';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { useMotion, useSplitLines, createReveal, createPinScrub, createCinema } from '@/motion';

/* ─────────────────────────────────────────────────────────
   SCROLL-REVEAL HOOK  (used by blog teaser section)
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
   SECTION FOLIO — static
───────────────────────────────────────────────────────── */
function SectionFolio({ n, total = 7 }: { n: number; total?: number }) {
  return (
    <span className="absolute top-4 right-4 md:top-8 md:right-8 font-mono text-[10px] text-recovered/50 tabular-nums select-none pointer-events-none">
      {String(n).padStart(2, '0')} / {String(total).padStart(2, '0')}
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
      className="glass-paper font-mono text-[11px]"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 600ms ease',
      }}
      aria-hidden="true"
    >
      <div className="border-b border-paper/25 px-4 py-3 flex justify-between items-center bg-ink">
        <span className="text-paper/70 tracking-widest uppercase text-[9px]">Recovery File</span>
        <span className="text-paper/40 tabular-nums text-[9px]">{dateStr}</span>
      </div>
      <div className="border-b border-rule/60 px-4 py-3 flex justify-between items-center bg-paper/35">
        <span className="text-ink font-medium tracking-wider">{FILE_TYPES[fileIdx]}</span>
        <span className="text-slate/40 tabular-nums text-[9px]">FILE № 2026-{fileNumber}</span>
      </div>
      <div className="divide-y divide-rule/60">
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
                  <span data-day-stamp className="text-slate/40 tabular-nums">{step.day}</span>
                </span>
              )
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-rule/60 px-4 py-2 text-slate/50 text-[9px]">
        Representative recovery lifecycle.
      </div>
    </div>
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
      <div className="glass-paper border-t border-b border-rule py-3 overflow-x-hidden">
        <p className="font-mono text-xs text-slate tracking-widest text-center flex-wrap px-4">
          {TICKER_PARTS.map((p, i) => (
            <span key={i}>{p}{i < TICKER_PARTS.length - 1 && <span className="text-recovered mx-2">·</span>}</span>
          ))}
        </p>
      </div>
    );
  }
  return (
    <div className="glass-paper border-t border-b border-rule py-3 overflow-x-hidden">
      <div className="flex whitespace-nowrap ticker-animate" aria-hidden="true">
        <TickerSegment /><TickerSegment /><TickerSegment /><TickerSegment />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 1: WHY ARG — "entries write themselves"
   Pin: 120vh desktop. 4 ledger rows draw in sequentially
   tied to scrub: rule line scaleX, mono label fades, desc fades.
   Folio scrambles 01 → 02 on enter.
   Mobile: IO-based play-once stagger per row.
───────────────────────────────────────────────────────── */
const WHY_FEATURES = [
  { num: '01', title: 'Contingency-Based Recovery', desc: 'You only pay when we collect. Zero upfront fees, zero risk. Our incentives are perfectly aligned with your success.' },
  { num: '02', title: 'B2B Specialists', desc: 'We handle commercial debt exclusively — business-to-business, not consumer. We understand corporate structures, contracts, and negotiation.' },
  { num: '03', title: 'Litigation-Ready', desc: "When negotiation isn't enough, we escalate through affiliated counsel — liens, judgments, and enforcement, pursued properly." },
  { num: '04', title: 'Relationship-Preserving', desc: 'We operate with a level of professionalism that protects your reputation and, when possible, preserves your client relationships.' },
];

function WhyArgSection() {
  const { reducedMotion, ready } = useMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const ruleRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs    = useRef<(HTMLSpanElement | null)[]>([]);
  const titleRefs  = useRef<(HTMLHeadingElement | null)[]>([]);
  const descRefs   = useRef<(HTMLParagraphElement | null)[]>([]);

  // SCENE 2 — plain choreographed reveal (no pin). All viewports.
  // Rule draws, then the row's num/title/desc stagger-fade in sequence.
  useLayoutEffect(() => {
    if (reducedMotion || !ready) return;
    const ctx = gsap.context(() => {
      ruleRefs.current.forEach(el => el && gsap.set(el, { scaleX: 0, transformOrigin: 'left' }));
      numRefs.current.forEach(el => el && gsap.set(el, { opacity: 0 }));
      titleRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, y: 6 }));
      descRefs.current.forEach(el => el && gsap.set(el, { opacity: 0 }));

      WHY_FEATURES.forEach((_, i) => {
        const row = ruleRefs.current[i]?.parentElement?.parentElement;
        createReveal(row ?? null, {
          id: `why-reveal-${i}`,
          onEnter: () => {
            gsap.timeline()
              .to(ruleRefs.current[i],  { scaleX: 1, duration: 0.4, ease: 'power2.out' })
              .to(numRefs.current[i],   { opacity: 1, duration: 0.2 }, '>-0.1')
              .to(titleRefs.current[i], { opacity: 1, y: 0, duration: 0.3 }, '>-0.05')
              .to(descRefs.current[i],  { opacity: 1, duration: 0.3 }, '>-0.05');
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion, ready]);

  return (
    <section ref={sectionRef} data-folio-n={2} className="relative isolate bg-transparent py-24 md:py-32 border-b border-rule">
      <SectionFolio n={2} />

      <div className="glass-paper max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-10">
        <SectionRule />
        <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">
          Why Advanced Recovery Group
        </p>
        <h2 className="text-h2 font-serif text-ink mb-4">
          A precise, results-driven approach to commercial debt.
        </h2>
        <p className="font-mono text-xs text-slate/60 tracking-widest uppercase mb-16">
          100% Contingency &nbsp;·&nbsp; B2B Commercial Only &nbsp;·&nbsp; 24/7 Client Portal
        </p>

        <div className="flex flex-col">
          {WHY_FEATURES.map((f, i) => (
            <div key={f.num} className="relative py-8 md:py-10">
              {/* Animated rule (GSAP scaleX 0→1, replaces border-t) */}
              <div
                ref={el => { ruleRefs.current[i] = el; }}
                className="absolute top-0 left-0 right-0 h-[1px] bg-rule"
                style={{ transformOrigin: 'left', ...(reducedMotion ? {} : { transform: 'scaleX(0)' }) }}
              />
              {/* Bottom rule on final row */}
              {i === WHY_FEATURES.length - 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-rule" />
              )}
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-16 pt-1">
                <span
                  ref={el => { numRefs.current[i] = el; }}
                  className="font-mono text-sm text-slate/40 mt-0.5 tabular-nums flex-shrink-0 w-8"
                >
                  {f.num}
                </span>
                <div className="flex-1 max-w-3xl">
                  <h3
                    ref={el => { titleRefs.current[i] = el; }}
                    className="text-xl font-serif text-ink mb-2"
                  >
                    {f.title}
                  </h3>
                  <p
                    ref={el => { descRefs.current[i] = el; }}
                    className="text-slate leading-relaxed font-sans max-w-prose"
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 2: PROCESS — "one file, three moves"
   Desktop: pin 180vh. FILE chip travels the drawn timeline,
   docking at each step. Rule draws ahead of chip.
   Previous steps mark ✓. Image fades in at scrub start.
   Mobile: no pin, chip snaps per step on scroll-into-view.
───────────────────────────────────────────────────────── */
const PROCESS_STEPS = [
  { step: '01', title: 'Submit Placement', desc: 'Provide account details, invoices, and supporting documentation through our secure client portal.' },
  { step: '02', title: 'Dedicated Recovery', desc: 'Our specialized team immediately pursues collection using proven, compliant communication and negotiation strategies.' },
  { step: '03', title: 'You Get Paid', desc: 'We remit collected funds directly to you. We only retain our contingency fee upon successful collection.' },
];

const CHIP_STATUSES = ['·· SUBMITTED ··', '·· UNDER REVIEW ··', '·· IN PURSUIT ··', '✓ SECURED'];

function ProcessSection() {
  const { reducedMotion, ready } = useMotion();
  const sectionRef   = useRef<HTMLElement>(null);
  const timelineRef  = useRef<HTMLDivElement>(null);
  const stepChipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleInkRef   = useRef<HTMLDivElement>(null);
  const stepRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs      = useRef<(HTMLSpanElement | null)[]>([]);
  const bodyRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const checkRefs    = useRef<(HTMLSpanElement | null)[]>([]);
  const imgColRef    = useRef<HTMLDivElement>(null);
  // Mobile chip label ref
  const mobileChipRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (reducedMotion || !ready) return;
    const ctx = gsap.context(() => {
      // Initial states — use CSS var() references so colours live-update on theme toggle
      bodyRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, y: 10 }));
      dotRefs.current.forEach(el => {
        if (el) el.style.setProperty('background-color', 'hsl(var(--arg-rule))');
      });
      numRefs.current.forEach(el => {
        if (el) el.style.setProperty('color', 'hsl(var(--arg-rule))');
      });
      checkRefs.current.forEach(el => {
        if (el) el.style.opacity = '0';
      });
      stepChipRefs.current.forEach(el => el && gsap.set(el, { opacity: 0 }));

      // V2: IO-based activation for ALL viewports (no pin)
      gsap.set(imgColRef.current, { opacity: 0, x: 16 });
      if (ruleInkRef.current) {
        gsap.set(ruleInkRef.current, { scaleY: 0, transformOrigin: 'top' });
      }

      // Section enter: draw rule + slide image in
      createReveal(sectionRef.current, {
        id: 'process-section',
        start: 'top 70%',
        onEnter: () => {
          gsap.to(ruleInkRef.current, { scaleY: 1, duration: 1.2, ease: 'power2.inOut' });
          gsap.to(imgColRef.current,  { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' });
        },
      });

      // Per-step reveals: dot/number ink, body copy, check marks, chip labels
      PROCESS_STEPS.forEach((_, i) => {
        const el = stepRefs.current[i];
        createReveal(el ?? null, {
          id: `process-step-${i}`,
          start: 'top 78%',
          onEnter: () => {
            // Use CSS var() references so colours live-update when theme toggles
            if (dotRefs.current[i]) dotRefs.current[i]!.style.setProperty('background-color', 'hsl(var(--arg-ink))');
            if (numRefs.current[i]) numRefs.current[i]!.style.setProperty('color', 'hsl(var(--arg-paper))');
            gsap.to(bodyRefs.current[i], { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
            if (i > 0 && checkRefs.current[i - 1]) {
              checkRefs.current[i - 1]!.style.opacity = '1';
            }
            const status = CHIP_STATUSES[i];
            if (mobileChipRef.current)  mobileChipRef.current.textContent  = status;
            // Activate the inline step chip on desktop
            const chip = stepChipRefs.current[i];
            if (chip) gsap.to(chip, { opacity: 1, duration: 0.3, ease: 'power2.out' });
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion, ready]);

  return (
    <section ref={sectionRef} data-folio-n={3} id="process" className="relative isolate bg-transparent py-24 md:py-32 border-b border-rule scroll-m-20">
      <SectionFolio n={3} />
      <div className="glass-paper max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-10">
        <SectionRule />
        <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">Our Process</p>
        <h2 className="text-h2 font-serif text-ink mb-16 md:mb-24">From placement to recovery</h2>

        {/* Mobile chip (static, updates on step enter) */}
        <div className="lg:hidden mb-8">
          <div className="inline-flex items-center gap-2 border border-rule bg-mist px-4 py-2 font-mono text-[10px]">
            <span className="text-slate/50">FILE №</span>
            <span className="text-ink font-semibold tracking-wider">2026-0847</span>
            <span className="w-[1px] h-3 bg-rule mx-0.5" />
            <span ref={mobileChipRef} className="text-recovered tracking-wide">{CHIP_STATUSES[0]}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: timeline + chip */}
          <div ref={timelineRef} className="relative flex flex-col gap-12">

            {/* Rule: light background (always visible) */}
            <div className="hidden lg:block absolute left-[11px] top-3 bottom-3 w-[1px] bg-rule z-0" />
            {/* Rule: ink foreground (draws downward ahead of chip) */}
            <div
              ref={ruleInkRef}
              className="hidden lg:block absolute left-[11px] top-3 w-[1px] bg-ink z-0"
              style={{ height: reducedMotion ? 'calc(100% - 1.5rem)' : '0px' }}
            />


            {PROCESS_STEPS.map((p, i) => (
              <div
                key={p.step}
                ref={el => { stepRefs.current[i] = el; }}
                className="relative z-10 flex gap-6 md:gap-8"
              >
                {/* Step dot */}
                <div className="bg-paper w-6 h-6 flex-shrink-0 mt-1 flex items-center justify-center relative">
                  <div
                    ref={el => { dotRefs.current[i] = el; }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '1px solid hsl(var(--arg-rule))',
                      backgroundColor: reducedMotion ? 'hsl(var(--arg-ink))' : 'hsl(var(--arg-rule))',
                    }}
                  />
                  <span
                    ref={el => { numRefs.current[i] = el; }}
                    className="relative z-10 font-mono text-[10px] tabular-nums font-bold"
                    style={{ color: reducedMotion ? 'hsl(var(--arg-paper))' : 'hsl(var(--arg-rule))' }}
                  >
                    {p.step}
                  </span>
                </div>

                {/* Step body */}
                <div
                  ref={el => { bodyRefs.current[i] = el; }}
                  className="flex-1"
                >
                  {/* Row header: title + ✓ badge right-aligned */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-xl font-serif text-ink">{p.title}</h3>
                    {i < 2 && (
                      <span
                        ref={el => { checkRefs.current[i] = el; }}
                        className="font-mono text-xs text-recovered font-semibold whitespace-nowrap mt-1 flex-shrink-0"
                        style={reducedMotion ? {} : { transition: 'opacity 0.35s ease' }}
                      >
                        ✓ COMPLETE
                      </span>
                    )}
                  </div>
                  {/* Inline chip — fixed-width slot, never overlaps text */}
                  <div
                    ref={el => { stepChipRefs.current[i] = el; }}
                    className="hidden lg:inline-flex items-center gap-2 border border-rule bg-mist px-2.5 py-1 font-mono text-[9px] whitespace-nowrap mb-3"
                    aria-hidden="true"
                  >
                    <span className="text-slate/50">FILE №</span>
                    <span className="font-semibold tracking-wider text-ink">2026-0847</span>
                    <span className="w-[1px] h-2.5 bg-rule mx-0.5" />
                    <span className="text-recovered tracking-wide">{CHIP_STATUSES[i]}</span>
                  </div>
                  <p className="text-slate leading-relaxed max-w-prose">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: image */}
          <div
            ref={imgColRef}
            className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px]"
            style={reducedMotion ? {} : {}}
          >
            <EditorialImage
              src="/images/collectors.jpg"
              alt="ARG collections team at work"
              caption="THE ARG TEAM — FAIRFIELD, NJ"
              aspectClassName="h-full"
              width={800}
              height={600}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 3: RECOVERY ESTIMATOR — "the instrument"
   No pin (interactive). Entrance: section rises + sliders
   sweep 0 → defaults + outlook bar sweeps. While dragging
   any slider: rest of page dims at ink 4%.
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
const EST_SCRAMBLE = 'ABCDEFGHJKLMNPQRSTUVWXYZ!@#$%';

function RecoveryEstimator() {
  const { reducedMotion, ready } = useMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const [balance, setBalance] = useState(() => reducedMotion ? 500_000 : 0);
  const [months, setMonths]   = useState(() => reducedMotion ? 6 : 0);
  const [status, setStatus]   = useState('operating');
  const [animPct, setAnimPct] = useState(0);
  const [focusDim, setFocusDim] = useState(false);
  const rafRef = useRef<number | null>(null);

  const { score, pct, lines } = computeOutlook(balance, months, status);

  // Score scramble
  const [displayScore, setDisplayScore] = useState<string>(score);
  const prevScore = useRef(score);
  useEffect(() => {
    if (score === prevScore.current) return;
    const prevS = prevScore.current;
    prevScore.current = score;
    if (reducedMotion) { setDisplayScore(score); return; }
    let frame = 0;
    const tick = () => {
      frame++;
      if (frame >= 6) { setDisplayScore(score); return; }
      setDisplayScore(Array.from({ length: Math.max(score.length, prevS.length) }, () =>
        EST_SCRAMBLE[Math.floor(Math.random() * EST_SCRAMBLE.length)]
      ).join('').slice(0, score.length));
      setTimeout(tick, 50);
    };
    tick();
  }, [score, reducedMotion]);

  // Lines change key
  const linesStr = lines.join('|');
  const prevLinesStr = useRef(linesStr);
  const [lineKey, setLineKey] = useState(0);
  useEffect(() => {
    if (linesStr !== prevLinesStr.current) {
      prevLinesStr.current = linesStr;
      setLineKey(k => k + 1);
    }
  }, [linesStr]);

  // Outlook bar sweep
  useEffect(() => {
    if (reducedMotion) { setAnimPct(pct); return; }
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

  // Entrance: section rises + sliders animate 0 → defaults
  useLayoutEffect(() => {
    if (reducedMotion || !ready) return;
    const ctx = gsap.context(() => {
      createReveal(sectionRef.current, {
        id: 'estimator-reveal',
        start: 'top 85%',
        onEnter: () => {
          gsap.from(sectionRef.current, { opacity: 0, y: 24, duration: 0.65, ease: 'power2.out' });
          const proxy = { balance: 0, months: 0 };
          gsap.to(proxy, {
            balance: 500_000,
            months: 6,
            duration: 1.4,
            ease: 'power2.inOut',
            onUpdate: () => {
              setBalance(Math.round(proxy.balance / 10_000) * 10_000);
              setMonths(Math.round(proxy.months));
            },
            onComplete: () => {
              setBalance(500_000);
              setMonths(6);
            },
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  const fmt = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M` : `$${(v / 1_000).toFixed(0)}k`;

  const handleSliderPointerDown = () => { if (!reducedMotion) setFocusDim(true); };
  const handleSliderPointerUp   = () => setFocusDim(false);

  return (
    <>
      {/* Focus dim overlay — ink 4% when dragging any slider */}
      {focusDim && (
        <div
          className="fixed inset-0 z-30 pointer-events-none"
          style={{ backgroundColor: 'hsl(212 50% 12.5% / 0.04)' }}
          aria-hidden="true"
        />
      )}
      <section ref={sectionRef} data-folio-n={4} className="relative isolate glass-paper ledger-grid py-24 md:py-32 border-b border-rule">
        <SectionFolio n={4} />
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <SectionRule />
          <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">Recovery Estimator</p>
          <h2 className="text-h2 font-serif text-ink mb-4">What&rsquo;s still recoverable?</h2>
          <p className="text-slate max-w-prose mb-12">Adjust the inputs to see a qualitative outlook. Every file is assessed individually.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div className="flex flex-col gap-10">
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label htmlFor="est-balance" className="font-mono text-xs uppercase tracking-widest text-slate">Outstanding Balance</label>
                  <span className="font-mono text-2xl text-ink tabular-nums">{fmt(balance)}</span>
                </div>
                <input
                  id="est-balance" type="range" min={10_000} max={5_000_000} step={10_000} value={balance}
                  onChange={e => setBalance(Number(e.target.value))}
                  onPointerDown={handleSliderPointerDown}
                  onPointerUp={handleSliderPointerUp}
                  className="w-full h-[2px] bg-rule accent-recovered cursor-pointer"
                />
                <div className="flex justify-between font-mono text-xs text-slate/50 mt-1"><span>$10k</span><span>$5M</span></div>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <label htmlFor="est-months" className="font-mono text-xs uppercase tracking-widest text-slate">Months Since Default</label>
                  <span className="font-mono text-2xl text-ink tabular-nums">{months} mo</span>
                </div>
                <input
                  id="est-months" type="range" min={0} max={24} step={1} value={months}
                  onChange={e => setMonths(Number(e.target.value))}
                  onPointerDown={handleSliderPointerDown}
                  onPointerUp={handleSliderPointerUp}
                  className="w-full h-[2px] bg-rule accent-recovered cursor-pointer"
                />
                <div className="flex justify-between font-mono text-xs text-slate/50 mt-1"><span>0</span><span>24 mo</span></div>
              </div>
              <div>
                <label htmlFor="est-status" className="font-mono text-xs uppercase tracking-widest text-slate block mb-3">Debtor Status</label>
                <select
                  id="est-status" value={status} onChange={e => setStatus(e.target.value)}
                  className="glass-field w-full text-ink font-mono text-sm px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-recovered"
                >
                  <option value="operating">Operating</option>
                  <option value="reduced">Reduced operations</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div className="glass-field p-8 flex flex-col gap-8">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-slate mb-2">Recoverability Outlook</p>
                <p className={`text-3xl font-serif font-semibold font-mono tracking-wider ${BAND_TEXT[score]}`}>
                  {displayScore}
                </p>
              </div>
              <div>
                <div className="h-3 w-full bg-rule rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${BAND_COLORS[score]}`} style={{ width: `${animPct}%`, transition: 'width 400ms ease' }} />
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
                <Link href="/contact-us/"
                  className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 text-sm font-medium rounded-sm hover:bg-ink/90 transition-colors w-fit">
                  Get a real assessment →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 4: INDUSTRIES + PULL-LINE — "the spread"
   6 verticals fan out from stacked center → list positions
   (staggered translate). The serif pull-line reveals
   word-by-word tied to scrub across 60vh.
   Mobile: stagger fade-in, pull-line fades as a unit.
───────────────────────────────────────────────────────── */
const INDUSTRIES = [
  'Merchant Cash Advance',
  'Factoring',
  'Equipment Leasing',
  'Commercial Loans',
  'Fintech Lending',
  'Law Firms & Judgment Holders',
];

const PULL_QUOTE = 'Effective collections keep credit flowing. We give creditors the confidence that when things go wrong, their losses can be recovered.';
const PULL_WORDS = PULL_QUOTE.split(' ');

function IndustriesSection() {
  const { reducedMotion, ready } = useMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef   = useRef<HTMLQuoteElement>(null);
  const wordRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const panelRef   = useRef<HTMLDivElement>(null);
  const listRef    = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (reducedMotion || !ready) return;

    const words = wordRefs.current.filter(Boolean) as HTMLSpanElement[];

    // gsap.matchMedia enforces pin boundary structurally:
    // zero .pin-spacer elements exist in the DOM below 768px.
    const mm = gsap.matchMedia();

    // ≤767px — enter-once reveals, no pin, no pin-spacers.
    // CRITICAL: use gsap.from() so initial hidden state lives inside the branch
    // and is reverted by mm.revert() on resize. Content is visible by default
    // in JSX — animation FROM hidden, never a persistent opacity-0 set in CSS.
    mm.add('(max-width: 767px)', () => {
      // Words stagger in 60ms apart over 500ms each
      if (words.length) {
        gsap.from(words, {
          opacity: 0,
          y: 8,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            id: 'industries-words-mobile',
            trigger: quoteRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      }
      // Industry tiles follow after words
      if (panelRef.current) {
        const tiles = Array.from(panelRef.current.querySelectorAll('li'));
        if (tiles.length) {
          gsap.from(tiles, {
            opacity: 0,
            y: 8,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              id: 'industries-tiles-mobile',
              trigger: panelRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          });
        }
      }
    });

    // ≥768px — pin cinema: words reveal 0→0.65, panel fades 0.58→1.0
    mm.add('(min-width: 768px)', () => {
      gsap.set(words, { opacity: 0.12 });
      if (panelRef.current) gsap.set(panelRef.current, { opacity: 0 });

      // Cinema pin #2 — 120vh, onToggle manages z-index so no section bleeds through
      const tl = createCinema(sectionRef.current, {
        id: 'cinema-pin',
        end: '+=120%',
        onToggle: (self) => {
          if (sectionRef.current) {
            sectionRef.current.style.zIndex = self.isActive ? '10' : '1';
          }
        },
        onLeave: () => {
          if (sectionRef.current) {
            sectionRef.current.style.zIndex = '1';
          }
        },
        onLeaveBack: () => {
          if (sectionRef.current) {
            sectionRef.current.style.zIndex = '1';
          }
        },
      });

      tl.to({}, { duration: 1 }); // anchor total to 1.0s

      // Word-by-word reveal across first 65% of the scrub
      words.forEach((word, i) => {
        tl.to(word, { opacity: 1, duration: 0.012, ease: 'none' }, (i / words.length) * 0.65);
      });

      // Industry panel fades in at 0.58
      if (panelRef.current) {
        tl.to(panelRef.current, { opacity: 1, ease: 'power2.out', duration: 0.35 }, 0.58);
      }
    });

    return () => { mm.revert(); };
  }, [reducedMotion, ready]);

  return (
    /* Opaque, isolated stacking layer — height locked to 100svh (with 100vh
       fallback) so pin math is stable and browser chrome is excluded on mobile.
       bg-ink sits under the video so nothing shows through before first paint. */
    <section
      ref={sectionRef}
      data-folio-n={5}
      className="relative bg-ink isolate overflow-hidden md:h-svh"
    >
      <SectionFolio n={5} />

      {/* Solid ink base — absolute below video, so neighbours never bleed through */}
      <div className="absolute inset-0 z-0 bg-ink" />

      {/* bw-skyline cinema background */}
      <div className="absolute inset-0 z-[1]">
        <AmbientVideo
          mp4="/videos/bw-skyline.mp4"
          webm="/videos/bw-skyline.webm"
          poster="/videos/bw-skyline-poster.jpg"
          overlayOpacity={0.48}
          overlayVariant="gradient"
          aspectClassName=""
          className="w-full h-full"
        />
      </div>

      {/* Pull-quote centrepiece — flow on mobile (section auto-sizes), absolute centred on desktop */}
      <div className="relative z-10 flex flex-col justify-center px-6 md:px-8 pt-16 pb-4 md:absolute md:inset-0 md:pt-0 md:pb-0">
        <div className="max-w-5xl mx-auto w-full md:pb-28 lg:pb-32">
          <p className="font-mono text-paper/50 tracking-widest text-xs font-semibold mb-8 uppercase">
            Trusted Partners
          </p>
          <blockquote
            ref={quoteRef}
            className="font-serif text-paper leading-[1.2]"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3.25rem)' }}
          >
            {reducedMotion ? (
              PULL_QUOTE
            ) : (
              PULL_WORDS.map((word, i) => (
                <span
                  key={i}
                  ref={el => { wordRefs.current[i] = el; }}
                >
                  {word}{' '}
                </span>
              ))
            )}
          </blockquote>
        </div>
      </div>

      {/* Industry tiles panel — flow on mobile (no blank-band risk), absolute bottom on desktop */}
      <div
        ref={panelRef}
        className="relative z-10 glass-ink py-8 md:py-10 md:absolute md:bottom-0 md:left-0 md:right-0"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <p className="font-mono text-paper/60 tracking-widest text-xs font-semibold mb-5 uppercase">
            Industries we serve
          </p>
          <ul ref={listRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-sm text-paper/85">
            {INDUSTRIES.map((industry) => (
              <li key={industry} className="flex items-center gap-4">
                <span className="w-4 h-[1px] bg-recovered block flex-shrink-0" />
                {industry}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   TRUST STRIP — compact ink band between Industries and Giving Back
   office-floor plays at overlay 0.82 — barely-there motion.
   Three key facts. No folio. No animation. Pure signal.
───────────────────────────────────────────────────────── */
function TrustStrip() {
  return (
    <section data-cinema className="relative isolate bg-ink overflow-hidden py-12 md:py-16 border-b border-ink/20">
      {/* office-floor: barely-there ambient beneath the ink */}
      <div className="absolute inset-0 z-0">
        <AmbientVideo
          mp4="/videos/office-floor.mp4"
          webm="/videos/office-floor.webm"
          poster="/videos/office-floor-poster.jpg"
          overlayOpacity={0.72}
          overlayVariant="gradient"
          aspectClassName=""
          className="w-full h-full"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 glass-ink">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:divide-x divide-paper/10">
          <div className="py-6 sm:py-0 sm:pr-12 border-b sm:border-b-0 border-paper/10">
            <p className="font-mono text-[10px] text-paper/40 uppercase tracking-widest mb-3">Placement Model</p>
            <p className="font-serif text-paper text-2xl md:text-3xl leading-tight">Contingency Only</p>
            <p className="font-mono text-xs text-paper/50 mt-2">No recovery, no fee — ever.</p>
          </div>
          <div className="py-6 sm:py-0 sm:px-12 border-b sm:border-b-0 border-paper/10">
            <p className="font-mono text-[10px] text-paper/40 uppercase tracking-widest mb-3">Scope</p>
            <p className="font-serif text-paper text-2xl md:text-3xl leading-tight">B2B Commercial</p>
            <p className="font-mono text-xs text-paper/50 mt-2">Business debt only — not consumer.</p>
          </div>
          <div className="py-6 sm:py-0 sm:pl-12">
            <p className="font-mono text-[10px] text-paper/40 uppercase tracking-widest mb-3">First Contact</p>
            <p className="font-serif text-paper text-2xl md:text-3xl leading-tight">One Business Day</p>
            <p className="font-mono text-xs text-paper/50 mt-2">A specialist responds within 24 hours.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 5: GIVING BACK — "color returns"
   Photos enter fully desaturated → bloom to full color
   tied to scrub as section crosses viewport center.
   The only place on the site where color itself animates.
   Copy reveals line by line on enter.
───────────────────────────────────────────────────────── */
function GivingBackSection() {
  const { reducedMotion, ready } = useMotion();
  const sectionRef  = useRef<HTMLElement>(null);
  const photo1Ref   = useRef<HTMLDivElement>(null);
  const photo2Ref   = useRef<HTMLDivElement>(null);
  const overlay1Ref = useRef<HTMLDivElement>(null);
  const overlay2Ref = useRef<HTMLDivElement>(null);
  const copyRef     = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const lines       = useSplitLines(headlineRef);

  useLayoutEffect(() => {
    if (reducedMotion || !ready) return;
    const ctx = gsap.context(() => {
      // Headline lines rise on enter
      const lineEls = lines.current;
      if (lineEls.length) {
        gsap.set(lineEls, { y: '105%', opacity: 0 });
        createReveal(headlineRef.current, {
          id: 'giving-headline',
          onEnter: () => {
            gsap.to(lineEls, {
              y: '0%', opacity: 1,
              duration: 0.65,
              stagger: 0.1,
              ease: 'power2.out',
            });
          },
        });
      }

      // Copy block fades up
      if (copyRef.current) {
        gsap.set(copyRef.current, { opacity: 0, y: 14 });
        createReveal(copyRef.current, {
          id: 'giving-copy',
          start: 'top 80%',
          onEnter: () => gsap.to(copyRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }),
        });
      }

      // Photos: desaturate → full color via mix-blend saturation overlay (no filter animation)
      [overlay1Ref, overlay2Ref].forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        gsap.set(el, { opacity: 1 });
        gsap.to(el, {
          opacity: 0,
          ease: 'power1.inOut',
          delay: i * 0.15,
          scrollTrigger: {
            id: `giving-photo-${i}`,
            trigger: sectionRef.current,
            start: 'top center',
            end: 'center center',
            scrub: 0.8,
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section ref={sectionRef} data-cinema data-folio-n={6} className="relative isolate bg-ink text-paper py-24 md:py-32 border-b border-ink">
      <SectionFolio n={6} />
      <div className="glass-ink max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">Giving Back</p>
            <h2
              ref={headlineRef}
              className="text-h2 font-serif text-paper mb-8"
            >
              Feeding hope, building community
            </h2>
            <div ref={copyRef}>
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
            </div>
          </div>

          {/* Photos: bloom from grayscale to color on scrub (mix-blend saturation, no filter animation) */}
          <div className="grid grid-cols-2 gap-4">
            <div ref={photo1Ref} className="mt-12 relative">
              <EditorialImage
                src="/images/manny-kids.jpg"
                alt="ARG team member with children in the Dominican Republic"
                caption="DR MISSION TRIP"
                aspectClassName="aspect-square"
                width={400}
                height={400}
              />
              {/* Saturation overlay: opacity 1→0 = grayscale→color, no filter animation */}
              <div
                ref={overlay1Ref}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'hsl(0,0%,50%)',
                  mixBlendMode: 'saturation' as React.CSSProperties['mixBlendMode'],
                  opacity: reducedMotion ? 0 : 1,
                }}
              />
            </div>
            <div ref={photo2Ref} className="relative">
              <EditorialImage
                src="/images/meals.jpg"
                alt="Packing FMSC meal packages at the warehouse"
                caption="FMSC PARTNERSHIP"
                aspectClassName="aspect-square"
                width={400}
                height={400}
              />
              <div
                ref={overlay2Ref}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'hsl(0,0%,50%)',
                  mixBlendMode: 'saturation' as React.CSSProperties['mixBlendMode'],
                  opacity: reducedMotion ? 0 : 1,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   SCENE 6: CLOSING CTA — "footer finale"
   Top rule draws (scaleX 0→1). Headline rises.
   Giant phone number assembles from scrambled digits.
   "Contingency-based" underline draws last.
───────────────────────────────────────────────────────── */
const PHONE_DISPLAY = '(877) 464-8470';

function ScramblePhone({ phone, trigger }: { phone: string; trigger: boolean }) {
  const [chars, setChars] = useState<string[]>(Array.from(phone, c => (c === '(' || c === ')' || c === ' ' || c === '-') ? c : '·'));

  useEffect(() => {
    if (!trigger) return;
    Array.from(phone).forEach((final, i) => {
      if (final === '(' || final === ')' || final === ' ' || final === '-') {
        setChars(prev => { const n = [...prev]; n[i] = final; return n; });
        return;
      }
      const delay = i * 70;
      const scrambleFor = 280;
      const frameMs = 45;
      let elapsed = 0;
      const tick = () => {
        elapsed += frameMs;
        if (elapsed >= scrambleFor) {
          setChars(prev => { const n = [...prev]; n[i] = final; return n; });
          return;
        }
        setChars(prev => {
          const n = [...prev];
          n[i] = String(Math.floor(Math.random() * 10));
          return n;
        });
        setTimeout(tick, frameMs);
      };
      setTimeout(tick, delay);
    });
  }, [trigger, phone]);

  return <>{chars.join('')}</>;
}

function ClosingCTA() {
  const { reducedMotion, ready } = useMotion();
  const sectionRef   = useRef<HTMLElement>(null);
  const ruleRef      = useRef<HTMLDivElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const phoneRef     = useRef<HTMLAnchorElement>(null);
  const taglineRef   = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const lines        = useSplitLines(headlineRef);
  const [phoneTriggered, setPhoneTriggered] = useState(reducedMotion);

  useLayoutEffect(() => {
    if (reducedMotion || !ready) return;
    const ctx = gsap.context(() => {
      const lineEls = lines.current;

      // Initial states
      if (ruleRef.current)      gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: 'left' });
      if (lineEls.length)       gsap.set(lineEls, { y: '110%', opacity: 0 });
      if (phoneRef.current)     gsap.set(phoneRef.current, { opacity: 0, y: 12 });
      if (taglineRef.current)   gsap.set(taglineRef.current, { opacity: 0, y: 8 });
      if (underlineRef.current) gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: 'left' });

      createReveal(sectionRef.current, {
        id: 'closing-cta',
        start: 'top 75%',
        onEnter: () => {
          const tl = gsap.timeline();
          // 1. Top rule draws
          tl.to(ruleRef.current, { scaleX: 1, duration: 0.5, ease: 'power2.out' });
          // 2. Headline rises
          if (lineEls.length) {
            tl.to(lineEls, {
              y: '0%', opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power2.out',
            }, '>-0.1');
          }
          // 3. Phone number appears (scramble kicks in via React state)
          tl.to(phoneRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '>-0.1');
          tl.call(() => setPhoneTriggered(true), [], '>-0.35');
          // 4. Tagline fades
          tl.to(taglineRef.current, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '>');
          // 5. Underline draws
          tl.to(underlineRef.current, { scaleX: 1, duration: 0.4, ease: 'power2.out' }, '>-0.05');
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section ref={sectionRef} data-cinema data-folio-n={7} className="relative isolate bg-ink text-paper py-24 md:py-32 overflow-hidden">
      {/* dusk-skyline ambient video — barely-there motion behind the ink band */}
      <div className="absolute inset-0 z-0">
        <AmbientVideo
          mp4="/videos/dusk-skyline.mp4"
          webm="/videos/dusk-skyline.webm"
          poster="/videos/dusk-skyline-poster.jpg"
          overlayOpacity={0.62}
          overlayVariant="gradient"
          aspectClassName=""
          className="w-full h-full"
        />
      </div>

      <SectionFolio n={7} />

      {/* Animated top rule (replaces border-t border-recovered) */}
      <div
        ref={ruleRef}
        className="absolute top-0 left-0 right-0 h-[2px] bg-recovered z-[1]"
        style={reducedMotion ? {} : { transform: 'scaleX(0)', transformOrigin: 'left' }}
      />

      <div className="relative z-[1] max-w-4xl mx-auto px-6 md:px-8 py-10 md:py-12 text-center flex flex-col items-center glass-ink">
        {/* Headline */}
        <h2 ref={headlineRef} className="text-h2 font-serif text-paper mb-8">
          Ready to recover what you&rsquo;re owed?
        </h2>

        {/* Giant phone number — scrambles into place */}
        <a
          ref={phoneRef}
          href="tel:8774648470"
          className="font-mono font-bold text-paper tabular-nums leading-none mb-6 hover:text-recovered transition-colors"
          style={{
            fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
            letterSpacing: '-0.02em',
          }}
        >
          {reducedMotion ? PHONE_DISPLAY : <ScramblePhone phone={PHONE_DISPLAY} trigger={phoneTriggered} />}
        </a>

        {/* Tagline + underline */}
        <p
          ref={taglineRef}
          className="relative text-lg md:text-xl text-paper/80 mb-10 font-sans max-w-prose mx-auto inline-block"
        >
          Still owed? Let&rsquo;s fix that.
          {/* Underline draws after tagline fades in */}
          <span className="absolute left-0 bottom-0 right-0 flex justify-center pointer-events-none" aria-hidden="true">
            <span className="block w-48 h-[1px] bg-recovered/60 relative overflow-hidden">
              <span
                ref={underlineRef}
                className="absolute inset-0 bg-recovered/60"
                style={reducedMotion ? {} : { transform: 'scaleX(0)', transformOrigin: 'left' }}
              />
            </span>
          </span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact-us/"
            className="inline-block bg-recovered hover:bg-recovered-bright text-paper px-10 py-4 text-sm font-medium rounded-sm transition-colors">
            Start a recovery
          </Link>
          <Link href="/contact-us/"
            className="inline-block border border-paper/30 text-paper/70 hover:text-paper hover:border-paper/50 px-10 py-4 text-sm font-medium rounded-sm transition-colors">
            Contact us
          </Link>
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
const N_BASELINES  = 20;
const BASELINE_GAP = 56;
const EYEBROW_TEXT = 'COMMERCIAL COLLECTIONS — FAIRFIELD, NJ';
const TRIO_WORDS   = ['PLACE.', 'PURSUE.', 'RECOVER.'] as const;

/* ─────────────────────────────────────────────────────────
   HERO — main section
───────────────────────────────────────────────────────── */
function HeroSection() {
  const { reducedMotion, ready } = useMotion();
  const heroStatus = useHeroStatus();

  const [isMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

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
  const heroFilmRef    = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const scrollCueRef   = useRef<HTMLDivElement>(null);

  const lines = useSplitLines(headlineRef);

  // Trio auto-rotates on all viewports at 2.5s cadence (V2: desktop no longer scroll-linked)
  const [trioIdx, setTrioIdx] = useState<number>(reducedMotion ? 2 : 0);
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setTrioIdx(i => (i < 2 ? i + 1 : 2)), 2500);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const [scrollCueVisible, setScrollCueVisible] = useState(true);
  useEffect(() => {
    if (!isMobile || reducedMotion) return;
    const h = () => setScrollCueVisible(window.scrollY < 100);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, [isMobile, reducedMotion]);

  // HERO — V2 motion script
  // Entrance: 1.8s — film fade → headline rise → card → CTAs (simplified, no baseline etching)
  // Scrub (pin #1, 120vh): headline drifts up + film scales 1→1.05 + overlay deepens (only 3 beats)
  useLayoutEffect(() => {
    if (reducedMotion || !ready) return;

    const speed   = isMobile ? 0.6 : 1.0;
    const lineEls = lines.current;

    // settleAll: instant post-entrance state for the fast path (already scrolled)
    const settleAll = () => {
      if (lineEls.length)         gsap.set(lineEls, { y: 0, opacity: 1 });
      if (eyebrowRef.current)     gsap.set(eyebrowRef.current, { opacity: 1 });
      if (trioOuterRef.current)   gsap.set(trioOuterRef.current, { opacity: 1 });
      if (subheadRef.current)     gsap.set(subheadRef.current, { opacity: 1, y: 0 });
      if (desktopCtasRef.current) gsap.set(desktopCtasRef.current, { opacity: 1, y: 0 });
      if (cardWrapperRef.current) gsap.set(cardWrapperRef.current, { x: 0, opacity: 1 });
      if (mobileCtasRef.current)  gsap.set(mobileCtasRef.current, { opacity: 1, y: 0 });
      if (heroFilmRef.current)    gsap.set(heroFilmRef.current, { opacity: 1 });
    };

    // buildScrubTl: 3 beats only — no card, no CTAs, no baseline fade
    let scrubTl: gsap.core.Timeline | null = null;
    const buildScrubTl = () => {
      scrubTl = createPinScrub(sectionRef.current, {
        id: 'hero-pin',
        end: '+=150%',
      });

      // Headline drifts up
      if (lineEls.length) {
        scrubTl.to(lineEls, { y: -40, ease: 'power1.inOut', duration: 1 }, 0);
      }
      // Film scales 1→1.05
      if (heroFilmRef.current) {
        scrubTl.to(heroFilmRef.current, { scale: 1.05, ease: 'power1.inOut', duration: 1 }, 0);
      }
      // Overlay deepens (vignette becomes more opaque)
      if (heroOverlayRef.current) {
        scrubTl.to(heroOverlayRef.current, { opacity: 1, ease: 'power1.inOut', duration: 1 }, 0);
      }
    };

    // ── Fast path: skip entrance if already scrolled ───────────────────────
    if (!isMobile && window.scrollY > 200) {
      settleAll();
      const mmFast = gsap.matchMedia();
      mmFast.add('(min-width: 768px)', () => {
        buildScrubTl();
        return () => { scrubTl?.kill(); scrubTl = null; };
      });
      return () => { mmFast.revert(); };
    }

    // ── Normal path: hidden → 1.8s entrance → (desktop) pin ──────────────
    // Pin via gsap.matchMedia: created only at ≥768px, auto-reverted below
    // that breakpoint so zero .pin-spacer elements exist on mobile.
    // Lazy FROM capture means the scrub reads post-entrance values on first scroll.
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      buildScrubTl();
      return () => { scrubTl?.kill(); scrubTl = null; };
    });
    if (lineEls.length)         gsap.set(lineEls, { y: 40, opacity: 0 });
    if (eyebrowRef.current)     gsap.set(eyebrowRef.current, { opacity: 0 });
    if (trioOuterRef.current)   gsap.set(trioOuterRef.current, { opacity: 0 });
    if (subheadRef.current)     gsap.set(subheadRef.current, { opacity: 0, y: 10 });
    if (desktopCtasRef.current) gsap.set(desktopCtasRef.current, { opacity: 0, y: 6 });
    if (cardWrapperRef.current) gsap.set(cardWrapperRef.current, { x: 24, opacity: 0 });
    if (mobileCtasRef.current)  gsap.set(mobileCtasRef.current, { opacity: 0, y: 6 });
    if (heroFilmRef.current)    gsap.set(heroFilmRef.current, { opacity: 0 });

    const entrance = gsap.timeline();

    // Beat 1 — film fades in (0 → 0.6s)
    if (heroFilmRef.current) {
      entrance.to(heroFilmRef.current, { opacity: 1, duration: 0.6 * speed, ease: 'power2.out' }, 0);
    }

    // Beat 2 — eyebrow + trio + headline lines rise (0.2 → 1.0s)
    if (eyebrowRef.current) {
      entrance.to(eyebrowRef.current, { opacity: 1, duration: 0.3 * speed }, 0.2 * speed);
    }
    if (trioOuterRef.current) {
      entrance.to(trioOuterRef.current, { opacity: 1, duration: 0.3 * speed }, 0.25 * speed);
    }
    if (lineEls.length) {
      entrance.to(lineEls, {
        y: 0,
        opacity: 1,
        duration: 0.65 * speed,
        stagger: 0.11 * speed,
        ease: 'power2.out',
      }, 0.35 * speed);
    }

    // Beat 3 — card slides in from right (0.8 → 1.3s)
    if (cardWrapperRef.current) {
      entrance.to(cardWrapperRef.current, {
        x: 0, opacity: 1,
        duration: 0.5 * speed,
        ease: 'power2.out',
      }, 0.8 * speed);
    }

    // Beat 4 — subhead + CTAs fade in (1.05 → 1.5s)
    if (subheadRef.current) {
      entrance.to(subheadRef.current, { opacity: 1, y: 0, duration: 0.4 * speed }, 1.05 * speed);
    }
    if (desktopCtasRef.current) {
      entrance.to(desktopCtasRef.current, { opacity: 1, y: 0, duration: 0.35 * speed }, 1.15 * speed);
    }
    if (mobileCtasRef.current) {
      entrance.to(mobileCtasRef.current, { opacity: 1, y: 0, duration: 0.35 * speed }, 1.15 * speed);
    }

    return () => { entrance.kill(); mm.revert(); };
  }, [reducedMotion, isMobile, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      ref={sectionRef}
      data-cinema
      data-folio-n={1}
      className="relative isolate bg-ink border-b border-ink/20 overflow-hidden md:flex md:items-center hero-height"
    >
      {/* hero-film: AmbientVideo — observer-driven play/pause, poster fallback, save-data */}
      {!reducedMotion && (
        <div ref={heroFilmRef} className="absolute inset-0 z-0" aria-hidden="true">
          <AmbientVideo
            mp4="/videos/hero-film.mp4"
            webm="/videos/hero-film.webm"
            poster="/videos/hero-film-poster.jpg"
            overlayOpacity={0}
            aspectClassName=""
            className="w-full h-full"
            eager
          />
          {/* Ink gradient overlay — GSAP deepens opacity during hero scrub */}
          <div
            ref={heroOverlayRef}
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(16,31,48,0.52) 0%, rgba(16,31,48,0.52) 8%, rgba(16,31,48,0.40) 50%, rgba(16,31,48,0.52) 92%, rgba(16,31,48,0.52) 100%)',
              opacity: 0.88,
            }}
          />
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        {Array.from({ length: N_BASELINES }, (_, i) => (
          <div
            key={i}
            ref={el => { baselineRefs.current[i] = el; }}
            className="absolute left-0 right-0"
            style={{
              top: `${(i + 1) * BASELINE_GAP}px`,
              height: '1px',
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />
        ))}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage:
              'linear-gradient(to right,' +
              ' transparent 25%, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.06) calc(25% + 1px), transparent calc(25% + 1px),' +
              ' transparent 50%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.06) calc(50% + 1px), transparent calc(50% + 1px),' +
              ' transparent 75%, rgba(255,255,255,0.06) 75%, rgba(255,255,255,0.06) calc(75% + 1px), transparent calc(75% + 1px))',
          }}
        />
      </div>

      <SectionFolio n={1} />

      <div
        className="absolute right-5 top-0 bottom-0 hidden xl:flex items-center justify-center"
        aria-hidden="true"
        style={{ writingMode: 'vertical-rl' }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-paper/20 select-none">
          ADVANCED RECOVERY GROUP — COMMERCIAL COLLECTIONS — FAIRFIELD NJ
        </span>
      </div>

      <div className="w-full">
        <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-10 md:py-20 lg:py-24 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-6 lg:gap-20">

            <div>
              <p
                ref={eyebrowRef}
                className="font-mono text-recovered tracking-widest text-xs font-semibold mb-3 uppercase h-4 flex items-center gap-0.5"
              >
                {EYEBROW_TEXT}
              </p>

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
                    style={{
                      transform: `translateY(${-trioIdx * 33.33}%)`,
                      transition: 'transform 320ms cubic-bezier(.22,1,.36,1)',
                    }}
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

              <h1
                ref={headlineRef}
                className="text-hero font-serif text-paper tracking-tight mb-8"
              >
                We recover what you&rsquo;re owed.
              </h1>

              <p
                ref={subheadRef}
                className="text-lg md:text-xl text-paper/80 font-sans max-w-prose leading-relaxed"
              >
                Advanced Recovery Group specializes exclusively in B2B debt recovery.
                Operating on a strict contingency basis, we deploy professional, firm,
                and proven strategies to restore your cash flow.
              </p>

              <div ref={desktopCtasRef} className="hidden lg:block mt-10">
                <div className="flex flex-row gap-4 mb-5">
                  <Link
                    href="/contact-us/"
                    className="bg-paper text-ink px-8 py-4 text-sm font-medium rounded-sm hover:bg-paper/90 transition-colors text-center inline-block"
                  >
                    Get a Free Consultation
                  </Link>
                  <a
                    href="#process"
                    className="border border-paper/50 text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-paper/10 transition-colors text-center"
                  >
                    See How It Works
                  </a>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-paper/60">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${heroStatus.open ? 'bg-recovered' : 'bg-paper/30'}`} />
                  {heroStatus.label}
                </div>
              </div>
            </div>

            <div ref={cardWrapperRef}>
              <div className="relative pb-[4px] pr-[4px] md:pb-4 md:pr-4 lg:max-w-[460px] lg:ml-auto">
                <div className="absolute bg-paper md:hidden"
                  style={{ inset: 0, transform: 'translate(4px,4px)', border: '1px solid var(--color-rule)', zIndex: 0 }} />
                <div className="absolute bg-paper hidden md:block"
                  style={{ inset: 0, transform: 'translate(16px,16px)', border: '1px solid var(--color-rule)', zIndex: 0 }} />
                <div className="absolute bg-paper hidden md:block"
                  style={{ inset: 0, transform: 'translate(8px,8px)', border: '1px solid var(--color-rule)', zIndex: 1 }} />
                <div className="relative" style={{ zIndex: 2 }}>
                  <AnimatedLedgerCard />
                </div>
              </div>
            </div>

            <div ref={mobileCtasRef} className="lg:hidden flex flex-col gap-3">
              <Link
                href="/contact-us/"
                className="bg-paper text-ink px-8 py-4 text-sm font-medium rounded-sm hover:bg-paper/90 transition-colors text-center block w-full"
              >
                Get a Free Consultation
              </Link>
              <a
                href="#process"
                className="border border-paper/50 text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-paper/10 transition-colors text-center block w-full"
              >
                See How It Works
              </a>
              <div className="flex items-center gap-2 font-mono text-xs text-paper/60 pt-1">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${heroStatus.open ? 'bg-recovered' : 'bg-paper/30'}`} />
                {heroStatus.label}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div
        ref={scrollCueRef}
        className="absolute bottom-8 left-8 hidden md:flex items-center gap-2 font-mono text-[10px] text-paper/30 uppercase tracking-widest select-none pointer-events-none"
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

      {/* 02 / 07  WHY ARG — "entries write themselves" */}
      <WhyArgSection />

      {/* 03 / 07  PROCESS — "one file, three moves" */}
      <ProcessSection />

      {/* 04 / 07  RECOVERY ESTIMATOR — "the instrument" */}
      <RecoveryEstimator />

      {/* 05 / 07  INDUSTRIES + PULL-LINE — "the spread" */}
      <IndustriesSection />

      {/* TRUST STRIP — office-floor barely visible beneath ink */}
      <TrustStrip />

      {/* 06 / 07  GIVING BACK — "color returns" */}
      <GivingBackSection />

      {/* BLOG TEASER */}
      <section className="relative isolate bg-transparent py-24 md:py-32 border-b border-rule">
        <div className="glass-paper max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-10">
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

      {/* 07 / 07  CLOSING CTA — "footer finale" */}
      <ClosingCTA />
    </Shell>
  );
}
