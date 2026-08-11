import { Shell } from '@/components/layout/Shell';
import { EditorialImage } from '@/components/EditorialImage';
import { AmbientVideo } from '@/components/AmbientVideo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ChevronDown } from 'lucide-react';
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

/* ── Office status (ET clock) ───────────────────────────── */
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

/* ── FAQ ────────────────────────────────────────────────── */
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

/* ── vCard download ─────────────────────────────────────── */
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
      className="group relative flex items-center justify-between w-full min-h-[72px] px-0 border-b border-rule transition-colors hover:bg-mist cursor-pointer"
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm bg-recovered opacity-0 group-hover:opacity-100"
        style={{ transition: 'opacity 150ms ease' }}
        aria-hidden="true"
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate select-none">Save Contact</span>
      <span className="flex items-center gap-2 font-mono text-sm text-ink group-hover:text-recovered transition-colors tabular-nums">
        Save our contact ↓
      </span>
    </button>
  );
}

/* ── Form schema ────────────────────────────────────────── */
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

/* ── Shared sub-components ──────────────────────────────── */
function ContactRow({
  label, value, href, type,
}: { label: string; value: string; href?: string; type: 'phone' | 'email' | 'fax' }) {
  const inner = (
    <span className="group relative flex items-center justify-between min-h-[72px] px-0 border-b border-rule transition-colors hover:bg-mist cursor-pointer">
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm bg-recovered opacity-0 group-hover:opacity-100"
        style={{ transition: 'opacity 150ms ease' }}
        aria-hidden="true"
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate select-none">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`font-mono tabular-nums text-ink ${type === 'email' ? 'text-sm md:text-base break-all' : 'text-base md:text-lg'}`}>
          {value}
        </span>
        {href && (
          <ChevronRight size={13} className="text-slate/30 group-hover:text-recovered flex-shrink-0" style={{ transition: 'color 150ms ease' }} aria-hidden="true" />
        )}
      </span>
    </span>
  );
  if (!href) return <div>{inner}</div>;
  return <a href={href}>{inner}</a>;
}

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

function WhatHappensNext() {
  const steps = [
    { n: '01', text: 'We review your portfolio or file details' },
    { n: '02', text: 'A specialist calls to scope strategy and terms' },
    { n: '03', text: 'Placement goes live — recovery work begins' },
  ];
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate mb-3">What Happens Next</p>
      <div className="border border-rule rounded-sm overflow-hidden divide-y divide-rule">
        {steps.map((s) => (
          <div key={s.n} className="flex items-start gap-4 px-4 py-3">
            <span className="font-mono text-[10px] text-slate/40 tabular-nums pt-0.5 flex-shrink-0">{s.n}</span>
            <span className="font-mono text-xs text-ink leading-relaxed">{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate mb-5">{children}</p>;
}

/* ── Main page ──────────────────────────────────────────── */
export default function ContactPage() {
  const [status, setStatus]               = useState<Status>('idle');
  const [successTime, setSuccessTime]     = useState('');
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [showDirectCard, setShowDirectCard]   = useState(false);
  const [dogCaption, setDogCaption]           = useState<string | null>(null);
  const officeStatus = useOfficeStatus();

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
    defaultValues: { name: '', company: '', email: '', phone: '', category: undefined, balance: '', message: '', website: '' },
  });

  /* Pre-fill message from ARG Assist handoff (sessionStorage) */
  useEffect(() => {
    const handoff = sessionStorage.getItem('arg:assist-handoff');
    if (handoff) {
      form.setValue('message', `[From ARG Assist]\n\n${handoff}`, { shouldDirty: true });
      sessionStorage.removeItem('arg:assist-handoff');
    }
  // Only run once on mount
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
        setSuccessTime(new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }));
        setStatus('success'); form.reset();
      } else if (res.status === 503) { setShowDirectCard(true); setStatus('idle'); }
      else if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        form.setError('root', { message: data.error || 'Too many requests. Please wait a moment and try again.' });
        setStatus('idle');
      } else { setStatus('error'); }
    } catch { setStatus('error'); }
  }

  /* ── RIGHT column — always the same ───────────────────── */
  const rightColumn = (
    <div className="flex flex-col gap-8">
      <div>
        <SectionLabel>The Office</SectionLabel>
        <div id="arg-dog-photo">
          <EditorialImage
            src="/images/dog-support.jpg"
            alt="ARG office dog wearing a customer support headset at a desk"
            caption={dogCaption ?? 'Our Director of First Impressions is standing by.'}
            depth
            aspectClassName="aspect-[4/5]"
            width={800}
            height={1000}
          />
        </div>
      </div>
      <WhatHappensNext />
    </div>
  );

  /* ── Shared contact rows block ─────────────────────────── */
  const contactRowsBlock = (
    <div className="flex flex-col gap-0 border-t border-rule">
      <ContactRow label="Phone" value="(877) 464-8470"                   href="tel:8774648470"                             type="phone" />
      <ContactRow label="Email" value="collect@advancedrecoverygroup.com" href="mailto:collect@advancedrecoverygroup.com"  type="email" />
      <ContactRow label="Fax"   value="(888) 881-8211"                                                                     type="fax"   />
      <VCardRow />
      {/* ARG Assist ledger row — opens the AI concierge sheet */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('arg:assist'))}
        className="w-full flex items-center justify-between py-4 border-t border-rule group hover:bg-mist/40 transition-colors text-left"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate/50">
          AI Concierge
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-sm text-ink group-hover:text-recovered transition-colors">
            Ask ARG Assist →
          </span>
        </span>
      </button>
    </div>
  );

  const footerNote = (
    <p className="font-mono text-xs text-slate/55 leading-relaxed">
      Placements can also be initiated through the{' '}
      <a href="https://portal.advancedrecoverygroup.com" target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2 hover:text-recovered transition-colors">
        Client Portal
      </a>.
    </p>
  );

  if (emailConfigured === null) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-screen">
          <svg className="animate-spin h-5 w-5 text-slate/40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </Shell>
    );
  }

  /* ── Form left column (email configured) ────────────────── */
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
          <button onClick={() => setStatus('idle')} className="w-fit font-mono text-sm text-slate border border-rule px-4 py-2 hover:bg-mist transition-colors rounded-sm mt-2">
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
                    <select id="field-category" className="w-full border border-rule bg-paper text-ink font-sans text-base px-3 py-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-recovered h-11" disabled={status === 'submitting'} {...field}>
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
                    <select id="field-balance" className="w-full border border-rule bg-paper text-ink font-sans text-base px-3 py-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-recovered h-11" disabled={status === 'submitting'} {...field}>
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
                <FormControl><Textarea id="field-message" rows={5} className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans resize-y min-h-[120px] text-base" disabled={status === 'submitting'} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {form.formState.errors.root && <p className="font-mono text-xs text-destructive">{form.formState.errors.root.message}</p>}
            {status === 'error' && (
              <div className="border border-rule bg-mist px-5 py-4 rounded-sm text-sm text-slate leading-relaxed">
                Something went wrong. Call <a href="tel:8774648470" className="text-ink font-medium hover:text-recovered transition-colors">(877) 464-8470</a> or email <a href="mailto:collect@advancedrecoverygroup.com" className="text-ink font-medium hover:text-recovered transition-colors">collect@advancedrecoverygroup.com</a>.
              </div>
            )}
            <div className="flex items-center gap-4">
              <button type="submit" disabled={status === 'submitting'} className="bg-ink text-paper hover:bg-ink/90 disabled:opacity-60 disabled:cursor-not-allowed rounded-sm px-10 py-4 h-auto text-sm font-medium transition-colors inline-flex items-center gap-2">
                {status === 'submitting' ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Sending…</>
                ) : 'Submit Inquiry'}
              </button>
              {status === 'error' && <button type="button" onClick={() => setStatus('idle')} className="text-sm font-mono text-slate hover:text-ink transition-colors">Try again</button>}
            </div>
          </form>
        </Form>
      )}
      {footerNote}
    </div>
  );

  /* ── Direct line left column (no form) ────────────────── */
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
        <meta property="og:url" content="https://advancedrecoverygroup.com/contact-us/" />
        <script type="application/ld+json">{FAQ_JSON_LD}</script>
      </Helmet>

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <section className="relative bg-paper border-b border-rule overflow-hidden pt-32 pb-14 md:pt-44 md:pb-20">
        <div
          className="absolute inset-0 pointer-events-none select-none"
          aria-hidden="true"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 55px, rgba(0,0,0,0.04) 55px, rgba(0,0,0,0.04) 56px)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-8">
          <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-5 uppercase">Contact — Fairfield, NJ</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-ink tracking-tight mb-6 leading-none">Let&rsquo;s talk.</h1>
          <p className="text-lg md:text-xl text-slate font-sans max-w-2xl leading-relaxed mb-6">
            Tell us what you&rsquo;re owed. A recovery specialist responds within one business day.
          </p>
          <div className="flex items-center gap-2 font-mono text-xs text-slate/60">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${officeStatus.open ? 'bg-recovered' : 'bg-slate/30'}`} />
            {officeStatus.label}
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN BODY ──────────────────────────────── */}
      <section className="bg-paper py-16 md:py-20 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-3">
              {showDirectCard ? directLeftContent : formLeftContent}
            </div>
            <div className="lg:col-span-2">
              {rightColumn}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
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

      {/* ── CLOSER BAND ─────────────────────────────────── */}
      <section className="relative bg-ink overflow-hidden py-14 md:py-16">
        {/* hands-ledger ambient background */}
        <div className="absolute inset-0 z-0">
          <AmbientVideo
            mp4="/videos/hands-ledger.mp4"
            poster="/videos/hands-ledger.jpg"
            overlayOpacity={0.7}
            aspectClassName=""
            className="w-full h-full"
          />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <h2 className="text-2xl md:text-3xl font-serif text-paper leading-snug">Have documents ready to send?</h2>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a href="mailto:collect@advancedrecoverygroup.com" className="inline-flex items-center justify-center gap-2 bg-recovered text-paper font-mono text-xs uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-recovered/90 transition-colors min-h-[44px]">
              Email the file to collect@
            </a>
            <a href="https://portal.advancedrecoverygroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest px-6 py-4 rounded-sm border border-paper/30 text-paper hover:bg-paper/10 transition-colors min-h-[44px]">
              Client Portal
            </a>
          </div>
        </div>
      </section>
    </Shell>
  );
}
