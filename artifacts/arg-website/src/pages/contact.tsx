import { Shell } from '@/components/layout/Shell';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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

const CATEGORIES = [
  'MCA funder',
  'Factor',
  'Equipment lessor',
  'Lender',
  'Law firm',
  'Other',
] as const;

const BALANCES = ['<$50k', '$50k–$250k', '$250k–$1M', '$1M+'] as const;

const formSchema = z.object({
  name: z.string().min(2, 'Full name is required.'),
  company: z.string().min(2, 'Company name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().optional(),
  category: z.enum(CATEGORIES, { required_error: 'Please select a category.' }),
  balance: z.string().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters.')
    .max(5000, 'Message cannot exceed 5000 characters.'),
  website: z.string().optional(), // honeypot
});

type FormValues = z.infer<typeof formSchema>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

/* ── Direct-contact card (shown when email isn't configured) ── */
function DirectContactCard() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-3xl font-serif text-ink mb-8">Reach us directly.</h2>
        <div className="flex flex-col gap-6 font-mono text-base border-l-2 border-recovered pl-6 py-2">
          <div className="flex flex-col gap-1">
            <span className="text-slate text-xs uppercase tracking-widest">Phone</span>
            <a href="tel:8774648470" className="text-ink hover:text-recovered transition-colors tabular-nums flex items-center min-h-[44px]">
              (877) 464-8470
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate text-xs uppercase tracking-widest">Email</span>
            <a href="mailto:collect@advancedrecoverygroup.com" className="text-ink hover:text-recovered transition-colors break-all flex items-center min-h-[44px]">
              collect@advancedrecoverygroup.com
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate text-xs uppercase tracking-widest">Fax</span>
            <span className="text-ink tabular-nums">(888) 881-8211</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
          Business Hours
        </h3>
        <div className="font-mono text-sm space-y-2 text-ink">
          <p className="flex justify-between max-w-xs">
            <span>Monday – Thursday</span>
            <span>9AM – 5PM</span>
          </p>
          <p className="flex justify-between max-w-xs">
            <span>Friday</span>
            <span>9AM – 4PM</span>
          </p>
          <p className="text-slate/60 text-xs pt-1">All times Eastern</p>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [successTime, setSuccessTime] = useState('');
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null); // null = loading
  const [showDirectCard, setShowDirectCard] = useState(false);

  // Check on mount whether the backend can send email
  useEffect(() => {
    fetch(`${API_BASE}/api/contact/status`)
      .then((r) => r.json())
      .then((data: { configured: boolean }) => {
        setEmailConfigured(data.configured);
        if (!data.configured) setShowDirectCard(true);
      })
      .catch(() => {
        // If the status endpoint itself fails, fall back to the direct card
        setEmailConfigured(false);
        setShowDirectCard(true);
      });
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      category: undefined,
      balance: '',
      message: '',
      website: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setStatus('submitting');
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setSuccessTime(
          new Date().toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
          })
        );
        setStatus('success');
        form.reset();
      } else if (res.status === 503) {
        // Email not configured — swap to the direct-contact card
        setShowDirectCard(true);
        setStatus('idle');
      } else if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        form.setError('root', {
          message: data.error || 'Too many requests. Please wait a moment and try again.',
        });
        setStatus('idle');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  // Determine what to render in the form column
  const renderFormColumn = () => {
    // Still loading status
    if (emailConfigured === null) {
      return (
        <div className="flex items-center gap-3 py-8 font-mono text-sm text-slate/50">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading…
        </div>
      );
    }

    // Not configured, or 503 on submit → direct card
    if (showDirectCard) {
      return <DirectContactCard />;
    }

    // Success state
    if (status === 'success') {
      return (
        <div className="border-t-2 border-recovered pt-8 flex flex-col gap-6">
          <h2 className="text-3xl font-serif text-ink">Received.</h2>
          <p className="text-slate text-lg leading-relaxed">
            A specialist will contact you within one business day.
          </p>
          {successTime && (
            <p className="font-mono text-xs text-slate/60">Submitted at {successTime}</p>
          )}
          <button
            onClick={() => setStatus('idle')}
            className="w-fit font-mono text-sm text-slate border border-rule px-4 py-2 hover:bg-mist transition-colors rounded-sm mt-2"
          >
            Submit another inquiry
          </button>
        </div>
      );
    }

    // Normal form
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Honeypot — hidden from real users */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...form.register('website')}
            />
          </div>

          {/* Name + Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-name">Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      id="field-name"
                      className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans text-base"
                      disabled={status === 'submitting'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-company">Company *</FormLabel>
                  <FormControl>
                    <Input
                      id="field-company"
                      className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans text-base"
                      disabled={status === 'submitting'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-email">Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      id="field-email"
                      type="email"
                      className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans text-base"
                      disabled={status === 'submitting'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate" htmlFor="field-phone">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      id="field-phone"
                      type="tel"
                      className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans text-base"
                      disabled={status === 'submitting'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category + Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
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
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
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
                      {BALANCES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
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
            )}
          />

          {/* Root error */}
          {form.formState.errors.root && (
            <p className="font-mono text-xs text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          {/* Error state banner */}
          {status === 'error' && (
            <div className="border border-rule bg-mist px-5 py-4 rounded-sm text-sm text-slate leading-relaxed">
              Something went wrong sending your message. Call us at{' '}
              <a href="tel:8774648470" className="text-ink font-medium hover:text-recovered transition-colors">
                (877) 464-8470
              </a>{' '}
              or email{' '}
              <a href="mailto:collect@advancedrecoverygroup.com" className="text-ink font-medium hover:text-recovered transition-colors">
                collect@advancedrecoverygroup.com
              </a>{' '}
              directly.
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-ink text-paper hover:bg-ink/90 disabled:opacity-60 disabled:cursor-not-allowed rounded-sm px-10 py-4 h-auto text-sm font-medium transition-colors inline-flex items-center gap-2"
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
    );
  };

  return (
    <Shell>
      <Helmet>
        <title>Contact Us | Advanced Recovery Group</title>
        <meta name="description" content="Contact Advanced Recovery Group to discuss your commercial collections needs. Call (877) 464-8470 or send an inquiry — no upfront fees." />
      </Helmet>

      <section className="pt-32 pb-24 md:pt-48 md:pb-32 bg-paper border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <h1 className="text-5xl md:text-7xl font-serif text-ink mb-16 md:mb-24">Let's Talk.</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Left column — contact info + dog photo */}
            <div className="lg:col-span-5 flex flex-col gap-12">
              <div>
                <h3 className="font-mono text-slate tracking-widest text-xs font-semibold mb-6 uppercase">
                  Contact Information
                </h3>
                <div className="font-mono text-base space-y-6 text-ink tabular-nums border-l border-recovered pl-6 py-2">
                  <p className="flex flex-col">
                    <span className="text-slate text-xs mb-1">Phone</span>
                    <a href="tel:8774648470" className="hover:text-recovered transition-colors">(877) 464-8470</a>
                  </p>
                  <p className="flex flex-col">
                    <span className="text-slate text-xs mb-1">Fax</span>
                    (888) 881-8211
                  </p>
                  <p className="flex flex-col">
                    <span className="text-slate text-xs mb-1">Email</span>
                    <a href="mailto:collect@advancedrecoverygroup.com" className="hover:text-recovered transition-colors break-all">
                      collect@advancedrecoverygroup.com
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-mono text-slate tracking-widest text-xs font-semibold mb-6 uppercase">
                  Business Hours
                </h3>
                <div className="font-mono text-base space-y-2 text-ink">
                  <p className="flex justify-between max-w-xs">
                    <span>Monday – Thursday</span>
                    <span>9AM – 5PM</span>
                  </p>
                  <p className="flex justify-between max-w-xs">
                    <span>Friday</span>
                    <span>9AM – 4PM</span>
                  </p>
                </div>
              </div>

              {/* Dog photo */}
              <div>
                <div className="border-2 border-rule overflow-hidden rounded-sm" style={{ filter: 'grayscale(0.3) contrast(1.05)' }}>
                  <img
                    src="/images/dog-support.jpg"
                    alt="ARG office dog wearing a customer support headset at a desk"
                    className="w-full object-cover"
                    loading="lazy"
                    width="800"
                    height="900"
                  />
                </div>
                <p className="font-mono text-xs text-slate mt-3">
                  Our Director of First Impressions is standing by.
                </p>
              </div>
            </div>

            {/* Right column — form or direct-contact card */}
            <div className="lg:col-span-7">
              {renderFormColumn()}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist py-12 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="w-full aspect-[21/9] bg-paper overflow-hidden rounded-sm relative">
            <img
              src="/images/office.jpg"
              alt="Advanced Recovery Group headquarters in Fairfield, NJ"
              className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80"
              loading="lazy"
              width="1200"
              height="514"
            />
            <div className="absolute inset-0 border border-rule/50 rounded-sm pointer-events-none"></div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
