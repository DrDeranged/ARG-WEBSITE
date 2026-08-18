import { Shell } from '@/components/layout/Shell';
import { EditorialImage } from '@/components/EditorialImage';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/PageHeader';
import { LedgerRow } from '@/components/LedgerRow';
import { MiniLedgerList } from '@/components/MiniLedgerList';
import { CloserBand } from '@/components/CloserBand';
import { SITE_ORIGIN } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { createReveal } from '@/motion/director';
import { useMotion } from '@/motion/MotionProvider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/* ── Office status (ET clock) ───────────────────────────────────────── */
type ActiveRow = 'weekday' | 'friday' | null;
interface OfficeStatus { open: boolean; label: string; activeRow: ActiveRow; }

function getOfficeStatus(): OfficeStatus {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
  const OPEN = 9 * 60, CLOSE_WD = 17 * 60, CLOSE_FR = 16 * 60;
  const weekdayOpen = day >= 1 && day <= 4 && m >= OPEN && m < CLOSE_WD;
  const fridayOpen  = day === 5 && m >= OPEN && m < CLOSE_FR;
  return {
    open: weekdayOpen || fridayOpen,
    label: weekdayOpen
      ? 'Open now — closes 5:00 PM ET'
      : fridayOpen
      ? 'Open now — closes 4:00 PM ET'
      : 'Closed — inquiries reviewed next business day',
    activeRow: weekdayOpen ? 'weekday' : fridayOpen ? 'friday' : null,
  };
}

function useOfficeStatus() {
  const [st, setSt] = useState<OfficeStatus>(getOfficeStatus);
  useEffect(() => {
    const id = setInterval(() => setSt(getOfficeStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  return st;
}

function useNowET() {
  const fmt = () => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 60_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/* ── FAQ ────────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "What does it cost?",
    a: "We work on contingency. If we don't recover, you don't pay. Fee structure is agreed before placement.",
  },
  {
    q: "What do you need to open a file?",
    a: "The contract or agreement, payment history, outstanding balance, and any debtor contact or banking details you have. Partial information is fine — our skip tracing fills gaps.",
  },
  {
    q: "How fast can a placement go live?",
    a: "Typically within one business day of receiving your documents.",
  },
  {
    q: "Do you handle litigation?",
    a: "When negotiation isn't enough, we escalate through affiliated counsel — liens, judgments, and enforcement.",
  },
  {
    q: "What industries do you serve?",
    a: "Commercial creditors: merchant cash advance, factoring, equipment leasing, commercial loans, fintech lending, and law firms holding judgments.",
  },
];

const FAQ_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(item => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="border-t border-rule">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="border-b border-rule">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left group min-h-[52px]"
            aria-expanded={openIdx === i}
          >
            <span className="font-mono text-sm text-ink pr-6 leading-snug">{item.q}</span>
            <ChevronDown
              size={14}
              className="flex-shrink-0 text-slate/50 group-hover:text-recovered transition-all"
              style={{
                transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 250ms ease, color 150ms ease',
              }}
              aria-hidden="true"
            />
          </button>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: openIdx === i ? '1fr' : '0fr',
              transition: 'grid-template-rows 250ms ease',
            }}
          >
            <div style={{ overflow: 'hidden' }}>
              <p className="font-sans text-sm text-slate leading-relaxed pb-5 pr-6 max-w-prose">
                {item.a}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── vCard download ─────────────────────────────────────────────────── */
function downloadVCard() {
  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Advanced Recovery Group',
    'ORG:Advanced Recovery Group',
    'TEL;TYPE=WORK,VOICE:+18774648470',
    'EMAIL:collect@advancedrecoverygroup.com',
    'URL:https://advancedrecoverygroup.com',
    'END:VCARD',
  ].join('\r\n');
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'advanced-recovery-group.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function VCardRow() {
  return (
    <button
      onClick={downloadVCard}
      className="group relative flex items-center justify-between w-full min-h-[44px] px-0 py-3 transition-colors hover:bg-mist cursor-pointer"
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm bg-recovered opacity-0 group-hover:opacity-100"
        style={{ transition: 'opacity 150ms ease' }}
        aria-hidden="true"
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate select-none transition-transform duration-200 group-hover:translate-x-[6px]">
        Save Contact
      </span>
      <span className="flex items-center gap-2 font-mono text-sm text-ink group-hover:text-recovered transition-colors tabular-nums">
        Save our contact ↓
      </span>
    </button>
  );
}


/* ── HoursLedger ────────────────────────────────────────────────────── */
function HoursLedger({ activeRow }: { activeRow: ActiveRow }) {
  const rows: { id: ActiveRow; label: string; time: string }[] = [
    { id: 'weekday', label: 'Monday – Thursday', time: '9AM – 5PM' },
    { id: 'friday',  label: 'Friday',            time: '9AM – 4PM' },
  ];
  return (
    <div className="border border-rule rounded-sm overflow-hidden">
      {rows.map((r) => {
        const active = activeRow === r.id;
        return (
          <div
            key={r.id}
            className={`flex justify-between items-center px-4 py-3 font-mono text-sm border-b last:border-b-0 border-rule transition-colors ${active ? 'bg-recovered/[0.07] text-recovered' : 'text-ink'}`}
          >
            <span className={active ? 'font-medium' : ''}>{r.label}</span>
            <span className={`tabular-nums text-xs ${active ? 'text-recovered font-medium' : 'text-slate/60'}`}>{r.time}</span>
          </div>
        );
      })}
      <div className="px-4 py-2 font-mono text-[10px] text-slate/40 uppercase tracking-widest bg-mist/50">
        All times Eastern
      </div>
    </div>
  );
}

/* ── LocalityCard ───────────────────────────────────────────────────── */
function LocalityCard({ status }: { status: OfficeStatus }) {
  const nowET = useNowET();
  return (
    <div className="border border-rule rounded-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-rule">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
          The Office — Fairfield, NJ
        </p>
      </div>
      {/* Abstract crosshair map mark — pure SVG/CSS, no external library */}
      <div className="flex items-center justify-center bg-mist/30 py-6 px-4">
        <svg
          viewBox="0 0 160 100"
          className="w-full max-w-[220px] h-auto text-ink"
          aria-hidden="true"
        >
          {/* Background grid */}
          <line x1="0" y1="25"  x2="160" y2="25"  stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.5" />
          <line x1="0" y1="50"  x2="160" y2="50"  stroke="currentColor" strokeOpacity="0.10" strokeWidth="0.5" />
          <line x1="0" y1="75"  x2="160" y2="75"  stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.5" />
          <line x1="40"  y1="0" x2="40"  y2="100" stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.5" />
          <line x1="80"  y1="0" x2="80"  y2="100" stroke="currentColor" strokeOpacity="0.10" strokeWidth="0.5" />
          <line x1="120" y1="0" x2="120" y2="100" stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.5" />
          {/* Crosshair tick marks at center */}
          <line x1="69" y1="50" x2="77" y2="50" stroke="var(--color-recovered, #2d9c6e)" strokeWidth="1" strokeLinecap="round" />
          <line x1="83" y1="50" x2="91" y2="50" stroke="var(--color-recovered, #2d9c6e)" strokeWidth="1" strokeLinecap="round" />
          <line x1="80" y1="39" x2="80" y2="47" stroke="var(--color-recovered, #2d9c6e)" strokeWidth="1" strokeLinecap="round" />
          <line x1="80" y1="53" x2="80" y2="61" stroke="var(--color-recovered, #2d9c6e)" strokeWidth="1" strokeLinecap="round" />
          {/* Outer ring — motion-safe animate-ping at 2s */}
          <circle
            cx="80" cy="50" r="5"
            fill="var(--color-recovered, #2d9c6e)"
            fillOpacity="0.25"
            className="motion-safe:animate-ping"
            style={{ animationDuration: '2s' }}
          />
          {/* Solid center dot */}
          <circle cx="80" cy="50" r="2.5" fill="var(--color-recovered, #2d9c6e)" />
        </svg>
      </div>
      {/* Live ET clock — updates each minute */}
      <div className="px-4 py-3 border-t border-rule bg-mist/20">
        <p className="font-mono text-xs text-slate">
          {nowET} at our office —{' '}
          <span className={status.open ? 'text-recovered' : 'text-slate/60'}>
            {status.open ? 'Open now' : 'Closed'}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ── WhatHappensNext steps ──────────────────────────────────────────── */
const STEPS = [
  { n: '01', text: 'We review your portfolio or file details' },
  { n: '02', text: 'A specialist calls to scope strategy and terms' },
  { n: '03', text: 'Placement goes live — recovery work begins' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate mb-5">{children}</p>;
}

/* ── Form schema ────────────────────────────────────────────────────── */
const CATEGORIES = [
  'MCA funder', 'Factor', 'Equipment lessor', 'Lender', 'Law firm', 'Other',
] as const;
const BALANCES = ['<$50k', '$50k–$250k', '$250k–$1M', '$1M+'] as const;

const formSchema = z.object({
  name:     z.string().min(2, 'Full name is required.'),
  company:  z.string().min(2, 'Company name is required.'),
  email:    z.string().email('Please enter a valid email address.'),
  phone:    z.string().optional(),
  category: z.enum(CATEGORIES, { required_error: 'Please select a category.' }),
  balance:  z.string().optional(),
  message:  z.string().min(10, 'Message must be at least 10 characters.').max(5000, 'Message cannot exceed 5000 characters.'),
  website:  z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

/* ── Main page ──────────────────────────────────────────────────────── */
export default function ContactPage() {
  const { reducedMotion, ready } = useMotion();

  const [status, setStatus]               = useState<Status>('idle');
  const [successTime, setSuccessTime]     = useState('');
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [showDirectCard, setShowDirectCard]   = useState(false);
  const [dogCaption, setDogCaption]           = useState<string | null>(null);
  const officeStatus = useOfficeStatus();

  /* ── Scroll reveal refs ─────────────────────────────────────────── */
  // Two-column body
  const leftColRef  = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  // Contact rows rule-draw reveal
  const contactBlockRef = useRef<HTMLDivElement>(null);

  // Locality card
  const localityCardRef = useRef<HTMLDivElement>(null);


  /* ── Scroll reveals ──────────────────────────────────────────────── */
  useLayoutEffect(() => {
    if (!ready || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Left column
      if (leftColRef.current) {
        gsap.set(leftColRef.current, { opacity: 0, y: 18 });
        createReveal(leftColRef.current, {
          onEnter: () =>
            gsap.to(leftColRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }),
        });
      }

      // Right column (slight offset)
      if (rightColRef.current) {
        gsap.set(rightColRef.current, { opacity: 0, y: 18 });
        createReveal(rightColRef.current, {
          onEnter: () =>
            gsap.to(rightColRef.current, {
              opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.1,
            }),
        });
      }

      // Contact rows — rule draws then row content fades
      if (contactBlockRef.current) {
        const rules = gsap.utils.toArray<HTMLElement>('[data-rule]', contactBlockRef.current);
        const rows  = gsap.utils.toArray<HTMLElement>('[data-row]',  contactBlockRef.current);
        gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
        gsap.set(rows,  { opacity: 0 });
        createReveal(contactBlockRef.current, {
          onEnter: () => {
            const tl = gsap.timeline();
            tl.to(rules, { scaleX: 1, duration: 0.28, ease: 'power2.out', stagger: 0.055 }, 0);
            tl.to(rows,  { opacity: 1, duration: 0.28, stagger: 0.065 }, 0.06);
          },
        });
      }

      // Locality card
      if (localityCardRef.current) {
        gsap.set(localityCardRef.current, { opacity: 0, y: 14 });
        createReveal(localityCardRef.current, {
          onEnter: () =>
            gsap.to(localityCardRef.current, {
              opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.15,
            }),
        });
      }
    });

    return () => ctx.revert();
  }, [ready, reducedMotion]);

  /* ── Data effects ────────────────────────────────────────────────── */
  useEffect(() => {
    fetch(`${API_BASE}/api/contact/status`)
      .then((r) => r.json())
      .then((data: { configured: boolean }) => {
        setEmailConfigured(data.configured);
        if (!data.configured) setShowDirectCard(true);
      })
      .catch(() => { setEmailConfigured(false); setShowDirectCard(true); });
  }, []);

  /* Easter egg: ⌘K palette dispatches 'arg:director' → scroll + caption swap */
  useEffect(() => {
    const handler = () => {
      const el = document.getElementById('arg-dog-photo');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setDogCaption('You rang?');
      const t = setTimeout(() => setDogCaption(null), 1500);
      return () => clearTimeout(t);
    };
    window.addEventListener('arg:director', handler);
    return () => window.removeEventListener('arg:director', handler);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', company: '', email: '', phone: '',
      category: undefined, balance: '', message: '', website: '',
    },
  });

  /* Pre-fill message from ARG Assist handoff (sessionStorage) */
  useEffect(() => {
    const handoff = sessionStorage.getItem('arg:assist-handoff');
    if (handoff) {
      form.setValue('message', `[From ARG Assist]\n\n${handoff}`, { shouldDirty: true });
      sessionStorage.removeItem('arg:assist-handoff');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: FormValues) {
    setStatus('submitting');
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setSuccessTime(new Date().toLocaleTimeString('en-US', {
          timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
        }));
        setStatus('success'); form.reset();
      } else if (res.status === 503) { setShowDirectCard(true); setStatus('idle'); }
      else if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        form.setError('root', { message: data.error || 'Too many requests. Please wait a moment and try again.' });
        setStatus('idle');
      } else { setStatus('error'); }
    } catch { setStatus('error'); }
  }

  /* ── Contact rows block (rule-draw animated) ─────────────────────── */
  const contactRowsBlock = (
    <div ref={contactBlockRef}>
      {/* Phone */}
      <div data-row className="relative">
        <div data-rule className="absolute top-0 left-0 right-0 h-[1px] bg-rule" aria-hidden="true" />
        <LedgerRow label="Phone" value="(877) 464-8470" href="tel:8774648470" type="phone" noBorder />
      </div>
      <div data-row className="relative">
        <div data-rule className="absolute top-0 left-0 right-0 h-[1px] bg-rule" aria-hidden="true" />
        <LedgerRow label="Email" value="collect@advancedrecoverygroup.com" href="mailto:collect@advancedrecoverygroup.com" type="email" noBorder />
      </div>
      <div data-row className="relative">
        <div data-rule className="absolute top-0 left-0 right-0 h-[1px] bg-rule" aria-hidden="true" />
        <LedgerRow label="Fax" value="(888) 881-8211" type="fax" noBorder />
      </div>
      <div data-row className="relative">
        <div data-rule className="absolute top-0 left-0 right-0 h-[1px] bg-rule" aria-hidden="true" />
        <VCardRow />
      </div>
      {/* ARG Assist row */}
      <div data-row className="relative">
        <div data-rule className="absolute top-0 left-0 right-0 h-[1px] bg-rule" aria-hidden="true" />
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('arg:assist'))}
          className="w-full flex items-center justify-between py-3 min-h-[44px] group hover:bg-mist/40 transition-colors text-left"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate/50 transition-transform duration-200 group-hover:translate-x-[6px]">
            AI Concierge
          </span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-sm text-ink group-hover:text-recovered transition-colors">
              Ask ARG Assist →
            </span>
          </span>
        </button>
      </div>
      {/* Bottom rule */}
      <div className="h-[1px] bg-rule" aria-hidden="true" />
    </div>
  );

  const footerNote = (
    <p className="font-mono text-xs text-slate/55 leading-relaxed">
      Placements can also be initiated through the{' '}
      <a
        href="https://app.simplicitycollect.com/Login.aspx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-ink underline underline-offset-2 hover:text-recovered transition-colors"
      >
        Client Portal
      </a>.
    </p>
  );

  /* ── Right column ────────────────────────────────────────────────── */
  const rightColumn = (
    <div ref={rightColRef} className="flex flex-col gap-8">
      <div>
        <SectionLabel>The Office</SectionLabel>
        <div id="arg-dog-photo">
          <EditorialImage
            src="/images/dog-support.jpg"
            alt="ARG office dog wearing a customer support headset at a desk"
            caption={dogCaption ?? 'Our Director of First Impressions is standing by.'}
            aspectClassName="aspect-[4/5]"
            width={800}
            height={1000}
          />
        </div>
      </div>

      {/* What Happens Next — sequential draw animation managed by MiniLedgerList */}
      <MiniLedgerList
        steps={STEPS}
        label="What Happens Next"
        revealIdPrefix="contact-steps"
      />

      {/* Locality card */}
      <div ref={localityCardRef}>
        <LocalityCard status={officeStatus} />
      </div>
    </div>
  );

  /* ── Loading state ───────────────────────────────────────────────── */
  if (emailConfigured === null) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-svh">
          <svg className="animate-spin h-5 w-5 text-slate/40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </Shell>
    );
  }

  /* ── Form left column ────────────────────────────────────────────── */
  const formLeftContent = (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <SectionLabel>The Direct Line</SectionLabel>
        {contactRowsBlock}
        <HoursLedger activeRow={officeStatus.activeRow} />
      </div>

      {status === 'success' ? (
        <div className="border-t-2 border-recovered pt-8 flex flex-col gap-6">
          <h2 className="text-3xl font-serif text-ink">Received.</h2>
          <p className="text-slate text-lg leading-relaxed">A specialist will contact you within one business day.</p>
          {successTime && <p className="font-mono text-xs text-slate/60">Submitted at {successTime}</p>}
          <button
            onClick={() => setStatus('idle')}
            className="w-fit font-mono text-sm text-slate border border-rule px-4 py-2 hover:bg-mist transition-colors rounded-sm mt-2 min-h-[44px]"
          >
            Submit another inquiry
          </button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" type="text" tabIndex={-1} autoComplete="off" {...form.register('website')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-name">Full Name *</FormLabel>
                  <FormControl><Input id="field-name" className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans text-base" disabled={status === 'submitting'} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="company" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-company">Company *</FormLabel>
                  <FormControl><Input id="field-company" className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans text-base" disabled={status === 'submitting'} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-email">Email Address *</FormLabel>
                  <FormControl><Input id="field-email" type="email" className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans text-base" disabled={status === 'submitting'} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-phone">Phone Number</FormLabel>
                  <FormControl><Input id="field-phone" type="tel" className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans text-base" disabled={status === 'submitting'} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-category">Business Type *</FormLabel>
                  <FormControl>
                    <select
                      id="field-category"
                      className="w-full border border-rule bg-paper text-ink font-sans text-base px-3 py-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-recovered h-11"
                      disabled={status === 'submitting'}
                      {...field}
                    >
                      <option value="">Select category…</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="balance" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-balance">Approximate Balance</FormLabel>
                  <FormControl>
                    <select
                      id="field-balance"
                      className="w-full border border-rule bg-paper text-ink font-sans text-base px-3 py-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-recovered h-11"
                      disabled={status === 'submitting'}
                      {...field}
                    >
                      <option value="">Select range…</option>
                      {BALANCES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-message">Message *</FormLabel>
                <FormControl>
                  <Textarea
                    id="field-message"
                    rows={5}
                    className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans resize-y min-h-[120px] text-base"
                    disabled={status === 'submitting'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {form.formState.errors.root && (
              <p className="font-mono text-xs text-destructive">{form.formState.errors.root.message}</p>
            )}
            {status === 'error' && (
              <div className="border border-rule bg-mist px-5 py-4 rounded-sm text-sm text-slate leading-relaxed">
                Something went wrong. Call{' '}
                <a href="tel:8774648470" className="text-ink font-medium hover:text-recovered transition-colors">(877) 464-8470</a>{' '}
                or email{' '}
                <a href="mailto:collect@advancedrecoverygroup.com" className="text-ink font-medium hover:text-recovered transition-colors">
                  collect@advancedrecoverygroup.com
                </a>.
              </div>
            )}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-ink text-paper hover:bg-ink/90 disabled:opacity-60 disabled:cursor-not-allowed rounded-sm px-10 py-4 min-h-[44px] text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending…
                  </>
                ) : 'Submit Inquiry'}
              </button>
              {status === 'error' && (
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-sm font-mono text-slate hover:text-ink transition-colors"
                >
                  Try again
                </button>
              )}
            </div>
          </form>
        </Form>
      )}
      {footerNote}
    </div>
  );

  /* ── Direct line left column ─────────────────────────────────────── */
  const directLeftContent = (
    <div className="flex flex-col gap-10">
      <div>
        <SectionLabel>The Direct Line</SectionLabel>
        {contactRowsBlock}
      </div>
      <div>
        <SectionLabel>Business Hours</SectionLabel>
        <HoursLedger activeRow={officeStatus.activeRow} />
      </div>
      {footerNote}
    </div>
  );

  return (
    <Shell>
      <Helmet>
        <title>Contact Us | Advanced Recovery Group</title>
        <meta name="description" content="Place an account or request a consultation with Advanced Recovery Group, a commercial collections agency serving MCA funders, factors, lessors, and lenders." />
        <meta property="og:title" content="Contact Us | Advanced Recovery Group" />
        <meta property="og:description" content="Place an account or request a consultation with Advanced Recovery Group, a commercial collections agency serving MCA funders, factors, lessors, and lenders." />
        <meta property="og:url" content={`${SITE_ORIGIN}/contact-us/`} />
        <script type="application/ld+json">{FAQ_JSON_LD}</script>
      </Helmet>

      {/* ── CINEMATIC HEADER BAND ─────────────────────────────────── */}
      {/* Entrance animation is managed inside PageHeader — no refs needed here */}
      <PageHeader
        variant="cinema"
        mp4="/videos/office-floor.mp4"
        webm="/videos/office-floor.webm"
        poster="/videos/office-floor-poster.jpg"
        eyebrow="Contact — Fairfield, NJ"
        headline="Let's talk."
        subline="Tell us what you're owed. A recovery specialist responds within one business day."
        ariaLabel="Contact page header"
        footer={
          <div className="flex items-center gap-2.5 font-mono text-xs text-paper/70">
            {/* Pulsing status dot — 2s interval, respects reduced-motion */}
            <span className="relative flex-shrink-0 w-2 h-2" aria-hidden="true">
              {officeStatus.open && (
                <span
                  className="absolute inset-0 rounded-full bg-recovered motion-safe:animate-ping"
                  style={{ animationDuration: '2s' }}
                />
              )}
              <span className={`absolute inset-0 rounded-full ${officeStatus.open ? 'bg-recovered' : 'bg-paper/30'}`} />
            </span>
            {officeStatus.label}
          </div>
        }
      />

      {/* ── TWO-COLUMN BODY ───────────────────────────────────────── */}
      <section className="bg-paper pt-14 pb-16 md:pt-16 md:pb-20 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div ref={leftColRef} className="lg:col-span-3">
              {showDirectCard ? directLeftContent : formLeftContent}
            </div>
            <div className="lg:col-span-2">
              {rightColumn}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-mist py-16 md:py-20 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate mb-3">Common Questions</p>
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-10">
            Everything you need to place an account.
          </h2>
          <div className="max-w-3xl">
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* ── CLOSER BAND ──────────────────────────────────────────── */}
      <CloserBand
        headline="Have documents ready to send?"
        mp4="/videos/hands-ledger.mp4"
        webm="/videos/hands-ledger.webm"
        poster="/videos/hands-ledger-poster.jpg"
        overlayOpacity={0.6}
      >
        <a
          href="mailto:collect@advancedrecoverygroup.com"
          className="inline-flex items-center justify-center gap-2 bg-recovered text-paper font-mono text-xs uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-recovered/90 transition-colors min-h-[44px]"
        >
          Email the file to collect@
        </a>
        <a
          href="https://app.simplicitycollect.com/Login.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest px-6 py-4 rounded-sm border border-paper/30 text-paper hover:bg-paper/10 transition-colors min-h-[44px]"
        >
          Client Portal
        </a>
      </CloserBand>
    </Shell>
  );
}
