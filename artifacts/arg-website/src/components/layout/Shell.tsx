import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Phone, Mail, ExternalLink, Search, Dog, Bot } from 'lucide-react';
import { ScrambleText } from '@/components/ScrambleText';
import { useMotion } from '@/motion';
import { LedgerDust } from '@/components/LedgerDust';
import { ArgAssist } from '@/components/ArgAssist';

/* ── Office Status ──────────────────────────────────────── */
type OfficeStatus = { open: boolean; label: string };

function getOfficeStatus(): OfficeStatus {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = now.getDay();
  const totalMin = now.getHours() * 60 + now.getMinutes();
  const OPEN = 9 * 60, CLOSE_WD = 17 * 60, CLOSE_FR = 16 * 60;
  const isWeekday = day >= 1 && day <= 4, isFriday = day === 5;
  if (isWeekday && totalMin >= OPEN && totalMin < CLOSE_WD)
    return { open: true, label: 'Open now — closes 5:00 PM ET' };
  if (isFriday && totalMin >= OPEN && totalMin < CLOSE_FR)
    return { open: true, label: 'Open now — closes 4:00 PM ET' };
  let next = '';
  if (day === 0 || day === 6) next = 'Mon 9:00 AM ET';
  else if (isFriday && totalMin >= CLOSE_FR) next = 'Mon 9:00 AM ET';
  else if (isWeekday && totalMin >= CLOSE_WD) { const n = ['','Mon','Tue','Wed','Thu','Fri']; next = `${n[day+1]??'Mon'} 9:00 AM ET`; }
  else next = 'today 9:00 AM ET';
  return { open: false, label: `Closed — opens ${next}` };
}

function OfficeStatusIndicator({ dark = false }: { dark?: boolean }) {
  const [status, setStatus] = useState<OfficeStatus>(getOfficeStatus);
  useEffect(() => {
    const id = setInterval(() => setStatus(getOfficeStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={`hidden md:inline-flex items-center gap-2 font-mono text-xs ${dark ? 'text-paper/60' : 'text-slate/70'}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.open ? 'bg-recovered' : dark ? 'bg-paper/30' : 'bg-slate/30'}`} />
      {status.label}
    </span>
  );
}

/* ── Command Palette ────────────────────────────────────── */
type PaletteAction = { id: string; label: string; sub: string; icon: ReactNode; action: () => void };

function CommandPalette({
  onClose, navigate, animated, showAssist,
}: {
  onClose: () => void; navigate: (path: string) => void; animated: boolean; showAssist: boolean;
}) {
  const [query, setQuery]      = useState('');
  const [activeIdx, setActive] = useState(0);
  const inputRef   = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const allActions: PaletteAction[] = [
    { id: 'home',    label: 'Home',        sub: 'Go to homepage',       icon: <Search size={14} />, action: () => { navigate('/'); onClose(); } },
    { id: 'contact', label: 'Contact Us',  sub: 'Send an inquiry',      icon: <Search size={14} />, action: () => { navigate('/contact-us/'); onClose(); } },
    { id: 'careers', label: 'Careers',     sub: 'View open positions',  icon: <Search size={14} />, action: () => { navigate('/careers/'); onClose(); } },
    { id: 'blog',    label: 'Blog',        sub: 'Insights & updates',   icon: <Search size={14} />, action: () => { navigate('/blog/'); onClose(); } },
    ...(showAssist ? [{ id: 'assist', label: 'ARG Assist', sub: 'AI placement concierge', icon: <Bot size={14} />, action: () => { window.dispatchEvent(new CustomEvent('arg:assist')); onClose(); } } as PaletteAction] : []),
    { id: 'call',    label: 'Call (877) 464-8470',                       sub: 'Talk to a specialist',   icon: <Phone size={14} />,        action: () => { window.location.href = 'tel:8774648470'; onClose(); } },
    { id: 'email',   label: 'Email collect@advancedrecoverygroup.com',   sub: 'Send us a message',      icon: <Mail size={14} />,         action: () => { window.location.href = 'mailto:collect@advancedrecoverygroup.com'; onClose(); } },
    { id: 'portal',  label: 'Open Client Portal',                        sub: 'Log in to your account', icon: <ExternalLink size={14} />, action: () => { window.open('https://app.simplicitycollect.com/Login.aspx', '_blank', 'noopener'); onClose(); } },
    { id: 'director', label: 'Meet the Director of First Impressions',   sub: 'A key member of the team', icon: <Dog size={14} />, action: () => { navigate('/contact-us/'); onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent('arg:director')), 350); } },
  ];

  const filtered = query
    ? allActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()) || a.sub.toLowerCase().includes(query.toLowerCase()))
    : allActions;

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActive(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter')   { filtered[activeIdx]?.action(); }
    else if (e.key === 'Escape')  { onClose(); }
  }, [filtered, activeIdx, onClose]);

  // Spring easing for open, faster for close
  const ease = animated ? 'cubic-bezier(.22,1,.36,1)' : 'ease';
  const dur  = animated ? '150ms' : '75ms';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex md:items-start md:justify-center md:pt-[15vh] md:px-4"
      role="dialog" aria-modal="true" aria-label="Command palette"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{ opacity: animated ? 1 : 0, transition: `opacity ${dur} ease` }}
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose} aria-hidden="true"
      />
      {/* Panel: full-screen on mobile, floating card on desktop */}
      <div
        className="relative w-full md:max-w-xl bg-paper border-b border-rule md:border md:rounded-sm flex flex-col overflow-hidden h-dvh md:h-auto"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          transform: animated ? 'scale(1)' : 'scale(0.98)',
          transition: `transform ${dur} ${ease}`,
        }}
      >
        {/* Search row — mobile close button ≥44px; desktop esc hint */}
        <div className="flex items-center gap-3 px-4 border-b border-rule flex-shrink-0" style={{ minHeight: '52px' }}>
          <Search size={16} className="text-slate flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
            placeholder="Search or jump to…"
            className="flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-slate/50 focus:outline-none"
            aria-label="Search commands" role="combobox" aria-expanded="true" aria-autocomplete="list"
          />
          {/* Mobile close button (≥44px tap target) */}
          <button
            onClick={onClose}
            className="md:hidden flex items-center justify-center -mr-1 text-slate"
            aria-label="Close"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X size={18} aria-hidden="true" />
          </button>
          {/* Desktop keyboard hint */}
          <kbd className="hidden md:inline font-mono text-xs text-slate/50 border border-rule px-1.5 py-0.5 rounded-sm">esc</kbd>
        </div>

        {/* Results list — scrollable, fills remaining height on mobile */}
        <ul role="listbox" className="py-1 overflow-y-auto flex-1 md:max-h-80">
          {filtered.length === 0 && <li className="px-4 py-3 font-mono text-sm text-slate/50">No results</li>}
          {filtered.map((action, idx) => (
            <li
              key={action.id}
              role="option" aria-selected={idx === activeIdx}
              onMouseEnter={() => setActive(idx)} onClick={action.action}
              className={`flex items-center gap-3 px-4 cursor-pointer transition-colors ${idx === activeIdx ? 'bg-mist' : 'hover:bg-mist/50'}`}
              style={{
                minHeight: '52px',
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateY(0)' : 'translateY(4px)',
                transition: animated
                  ? `opacity 150ms ease ${Math.min(idx, 10) * 20}ms, transform 150ms ease ${Math.min(idx, 10) * 20}ms`
                  : 'opacity 75ms ease, transform 75ms ease',
              }}
            >
              <span className="text-slate flex-shrink-0" aria-hidden="true">{action.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="font-mono text-sm text-ink block truncate">{action.label}</span>
                <span className="font-mono text-xs text-slate/60 block truncate">{action.sub}</span>
              </span>
              {idx === activeIdx && <kbd className="hidden md:inline font-mono text-xs text-slate/40 border border-rule px-1.5 py-0.5 rounded-sm flex-shrink-0">↵</kbd>}
            </li>
          ))}
        </ul>

        {/* Keyboard hints — desktop only */}
        <div className="hidden md:flex px-4 py-2 border-t border-rule items-center gap-4 font-mono text-xs text-slate/50 flex-shrink-0">
          <span><kbd className="border border-rule px-1 rounded-sm">↑</kbd> <kbd className="border border-rule px-1 rounded-sm">↓</kbd> navigate</span>
          <span><kbd className="border border-rule px-1 rounded-sm">↵</kbd> select</span>
          <span><kbd className="border border-rule px-1 rounded-sm">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

/* ── Global folio counter ────────────────────────────────
   Fixed bottom-right indicator that shows which section
   is in view (01 / 07 … 07 / 07). When the section changes,
   the old number "decrements" out before the new one rises in,
   giving the impression of pages turning.
   Only shows on pages that have [data-folio-n] sections.
   Hidden on mobile and reducedMotion.
──────────────────────────────────────────────────────────*/
const FOLIO_CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function GlobalFolioCounter() {
  const { reducedMotion } = useMotion();
  const [location] = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const currentNRef = useRef(0);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    if (window.innerWidth < 768) return;

    const wrap = wrapRef.current;
    const span = spanRef.current;
    if (!wrap || !span) return;

    currentNRef.current = 0;
    wrap.style.opacity = '0';

    const fmt = (n: number) =>
      `${String(n).padStart(2, '0')} / 07`;

    const scrambleTo = (el: HTMLElement, text: string, ms = 240) => {
      const frames = Math.max(6, Math.round(ms / 40));
      let f = 0;
      const tick = () => {
        f++;
        if (f >= frames) { el.textContent = text; return; }
        el.textContent = Array.from({ length: text.length }, (_, i) => {
          if (f / frames > i / text.length) return text[i];
          if (text[i] === ' ' || text[i] === '/') return text[i];
          return FOLIO_CHARS[Math.floor(Math.random() * FOLIO_CHARS.length)];
        }).join('');
        setTimeout(tick, 40);
      };
      tick();
    };

    const showFolio = (n: number) => {
      const prev = currentNRef.current;
      if (n === prev) return;
      currentNRef.current = n;

      wrap.style.transition = 'opacity 300ms ease';
      wrap.style.opacity = '1';

      if (prev === 0) {
        // First entrance — just scramble in
        span.style.transform = 'translateY(0)';
        span.style.opacity   = '1';
        scrambleTo(span, fmt(n), 300);
        return;
      }

      // Phase 1: slide current number out (decrement display = prev-1 briefly)
      span.style.transition = 'transform 90ms ease, opacity 90ms ease';
      span.style.transform  = 'translateY(-5px)';
      span.style.opacity    = '0.2';

      // Phase 2: swap to decrement label, pull in from below
      setTimeout(() => {
        const decrementLabel = fmt(Math.max(1, prev - 1));
        span.textContent     = decrementLabel;
        span.style.transition = 'none';
        span.style.transform  = 'translateY(6px)';
        span.style.opacity    = '0';
      }, 90);

      // Phase 3: new number rises and scrambles in
      setTimeout(() => {
        span.style.transition = 'transform 130ms ease, opacity 130ms ease';
        span.style.transform  = 'translateY(0)';
        span.style.opacity    = '1';
        scrambleTo(span, fmt(n), 220);
      }, 190);
    };

    // Use IntersectionObserver to track which folio section is in view
    let io: IntersectionObserver | null = null;

    const setup = () => {
      io?.disconnect();
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-folio-n]'),
      );
      if (!sections.length) {
        wrap.style.transition = 'opacity 300ms ease';
        wrap.style.opacity    = '0';
        currentNRef.current   = 0;
        return;
      }
      io = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (!e.isIntersecting) return;
            const n = parseInt(e.target.getAttribute('data-folio-n') ?? '0');
            if (n > 0) showFolio(n);
          });
        },
        { threshold: 0.25, rootMargin: '-10% 0px -10% 0px' },
      );
      sections.forEach(s => io!.observe(s));
    };

    // Small delay so page content is mounted before we query sections
    const timer = setTimeout(setup, 250);
    return () => {
      clearTimeout(timer);
      io?.disconnect();
    };
  // Re-run whenever the route changes so other pages hide the counter
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, location]);

  if (reducedMotion) return null;

  return (
    <div
      ref={wrapRef}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-20 pointer-events-none select-none hidden md:block"
      style={{ opacity: 0, transition: 'opacity 300ms ease' }}
      aria-hidden="true"
    >
      <span
        ref={spanRef}
        className="font-mono text-[9px] text-recovered/35 tabular-nums tracking-widest"
        style={{ display: 'block', transition: 'transform 130ms ease, opacity 130ms ease' }}
      />
    </div>
  );
}

const SHELL_API_BASE = (import.meta.env.BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/* ── Shell ──────────────────────────────────────────────── */
export function Shell({ children }: { children: ReactNode }) {
  const [isScrolled, setIsScrolled]           = useState(false);
  const [mobileMenuOpen, setMobileMenu]       = useState(false);
  const [paletteOpen, setPaletteOpen]         = useState(false);   // controls DOM mounting
  const [paletteAnimated, setPaletteAnim]     = useState(false);   // controls CSS state
  const [assistOpen, setAssistOpen]           = useState(false);
  const [assistConfigured, setAssistConfigured] = useState<boolean | null>(null);
  const [finaleRevealed, setFinale]           = useState(false);
  const finaleRef    = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();
  const isActive = (href: string) =>
    href === '/' ? (location === '/' || location === '') : location.startsWith(href.replace(/\/$/, ''));

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMobileMenu(false); }, [location]);

  // Notify MotionProvider to refresh ScrollTrigger after each route change
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('arg:route-change'));
  }, [location]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); paletteOpen ? closePalette() : openPalette(); }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteOpen]);

  const { lenis } = useMotion();

  useEffect(() => {
    const locked = paletteOpen || mobileMenuOpen || assistOpen;
    if (lenis) {
      // Stop/start Lenis instead of hiding overflow — prevents scroll fighting
      locked ? lenis.stop() : lenis.start();
    } else {
      document.body.style.overflow = locked ? 'hidden' : '';
    }
    return () => {
      if (lenis) lenis.start();
      else document.body.style.overflow = '';
    };
  }, [paletteOpen, mobileMenuOpen, assistOpen, lenis]);

  // ── ARG Assist: check configuration once on mount ──────────────────────
  useEffect(() => {
    fetch(`${SHELL_API_BASE}/api/assist/status`)
      .then(r => r.json())
      .then((data: { configured: boolean }) => setAssistConfigured(data.configured))
      .catch(() => setAssistConfigured(false));
  }, []);

  // ── ARG Assist custom-event bridge (⌘K palette → open assist) ──────────
  useEffect(() => {
    if (!assistConfigured) return;
    const h = () => setAssistOpen(true);
    window.addEventListener('arg:assist', h);
    return () => window.removeEventListener('arg:assist', h);
  }, [assistConfigured]);

  // Footer finale scroll reveal
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setFinale(true); return; }
    const el = finaleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setFinale(true); io.disconnect(); } },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── Header scroll-progress rule (direct DOM, no re-render) ─────────────
  // Drives a recovered-green scaleX 0→1 rule at the header bottom,
  // reflecting total page scroll progress site-wide.
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { el.style.transform = 'scaleX(1)'; return; }

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p   = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const openPalette = useCallback(() => {
    setPaletteOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setPaletteAnim(true)));
  }, []);

  const closePalette = useCallback(() => {
    setPaletteAnim(false);
    setTimeout(() => setPaletteOpen(false), 75);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper font-sans">
      {/* ── Header ────────────────────────────────────── */}
      <header
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-paper/95 backdrop-blur-md border-b border-rule py-3' : 'bg-paper py-4 md:py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 relative z-50 flex-shrink-0">
            <img src="/images/logo-dark.png" alt="Advanced Recovery Group" className="h-8 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {[['Home', '/'], ['Contact Us', '/contact-us/'], ['Careers', '/careers/'], ['Blog', '/blog/']].map(
              ([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className={`link-draw text-sm font-medium transition-colors ${isActive(href) ? 'text-recovered' : 'text-slate hover:text-recovered'}`}
                >
                  {label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <OfficeStatusIndicator />
            <button
              onClick={openPalette}
              aria-label="Open command palette (⌘K)"
              className="flex items-center gap-1.5 text-slate/60 hover:text-ink transition-colors"
            >
              <Search size={14} aria-hidden="true" />
              <kbd className="font-mono text-xs border border-rule px-1.5 py-0.5 rounded-sm text-slate/50 hover:text-ink transition-colors">⌘K</kbd>
            </button>
            {/* ASSIST chip — only when key is configured */}
            {assistConfigured === true && (
              <button
                onClick={() => setAssistOpen(true)}
                aria-label="Open ARG Assist AI concierge"
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-slate/50 hover:text-recovered transition-colors border border-rule px-2.5 py-1 rounded-sm"
              >
                <Bot size={10} aria-hidden="true" />
                ASSIST
              </button>
            )}
            <a
              href="https://app.simplicitycollect.com/Login.aspx"
              target="_blank" rel="noopener"
              className="text-sm font-medium border border-ink text-ink px-5 py-2 hover:bg-ink hover:text-paper transition-colors rounded-sm"
            >
              Client Portal
            </a>
          </div>

          <button
            className="md:hidden relative z-50 text-ink p-2 -mr-2"
            onClick={() => setMobileMenu(v => !v)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>

        {/* ── Scroll progress rule (recovered green, scaleX 0→1) ── */}
        <div
          ref={progressRef}
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-recovered pointer-events-none"
          style={{ transform: 'scaleX(0)', transformOrigin: 'left' }}
        />
      </header>

      {/* ── Mobile Menu ───────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-paper flex flex-col pt-24 px-6 pb-6 animate-in fade-in duration-200 overflow-y-auto"
          style={{ paddingTop: 'max(6rem, calc(env(safe-area-inset-top, 0px) + 4rem))' }}
        >
          <nav className="flex flex-col gap-6 text-2xl font-serif" aria-label="Mobile navigation">
            {[['Home', '/'], ['Contact Us', '/contact-us/'], ['Careers', '/careers/'], ['Blog', '/blog/']].map(
              ([label, href]) => (
                <Link key={href} href={href} className="text-ink hover:text-recovered border-b border-rule pb-4">
                  {label}
                </Link>
              )
            )}
          </nav>
          <div className="mt-8 flex flex-col gap-4">
            <a href="https://app.simplicitycollect.com/Login.aspx" target="_blank" rel="noopener"
              className="block text-center text-lg font-medium border border-ink bg-ink text-paper px-6 py-4 rounded-sm">
              Client Portal
            </a>
            {assistConfigured === true && (
              <button
                onClick={() => { setMobileMenu(false); setAssistOpen(true); }}
                className="flex items-center justify-center gap-2 border border-rule text-slate px-6 py-4 rounded-sm text-sm font-mono"
              >
                <Bot size={14} aria-hidden="true" /> ARG Assist
              </button>
            )}
            <button
              onClick={() => { setMobileMenu(false); openPalette(); }}
              className="flex items-center justify-center gap-2 border border-rule text-slate px-6 py-4 rounded-sm text-sm font-mono"
            >
              <Search size={14} aria-hidden="true" /> Quick Actions
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col relative z-10">{children}</main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="bg-ink text-paper/80 pt-16 pb-8 border-t-4 border-recovered">
        <div className="max-w-6xl mx-auto px-6 md:px-8">

          {/* Footer Finale */}
          <div ref={finaleRef} className="pb-16 mb-16 border-b border-paper/10">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
              <div>
                <h2 className="font-serif text-paper leading-tight mb-4"
                  style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 1.05 }}>
                  Still owed?<br />Let&rsquo;s fix that.
                </h2>
                {/* Underline draws in on scroll */}
                <div className="h-[2px] bg-recovered"
                  style={{ width: finaleRevealed ? '100%' : '0%', transition: 'width 900ms cubic-bezier(.22,1,.36,1) 200ms' }}
                />
              </div>
              <a
                href="tel:8774648470"
                className="font-mono tabular-nums text-paper hover:text-recovered transition-colors link-draw"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
              >
                <ScrambleText text="(877) 464-8470" />
              </a>
            </div>
          </div>

          {/* Footer columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-1">
              <img src="/images/logo-light.png" alt="Advanced Recovery Group" className="h-10 w-auto object-contain mb-6 opacity-90" />
              <p className="text-sm text-paper/70 leading-relaxed font-sans max-w-sm">
                Advanced Recovery Group is a full-service commercial collections agency, providing successful management solutions with professionalism and efficiency.
              </p>
              <div className="mt-8">
                {/* CONFIRM: BBB accreditation active — remove seal if not */}
                <img src="/images/bbb-seal.svg" alt="BBB Accredited Business" className="h-12 opacity-80" />
              </div>
            </div>

            <div className="order-3 md:order-none">
              <h4 className="font-mono text-xs tracking-widest text-paper/50 mb-6 uppercase">Navigation</h4>
              <nav className="flex flex-col gap-4" aria-label="Footer navigation">
                {[['Home', '/'], ['Contact Us', '/contact-us/'], ['Careers', '/careers/'], ['Blog', '/blog/']].map(
                  ([label, href]) => (
                    <Link key={href} href={href} className="link-draw text-sm hover:text-white transition-colors w-fit">
                      {label}
                    </Link>
                  )
                )}
              </nav>
            </div>

            <div className="lg:col-span-2 order-2 md:order-none">
              <h4 className="font-mono text-xs tracking-widest text-paper/50 mb-6 uppercase">Contact</h4>
              <div className="font-mono text-sm space-y-3 text-paper/80 tabular-nums">
                <p><span className="text-paper/40 mr-4">P</span><a href="tel:8774648470" className="link-draw hover:text-white transition-colors">(877) 464-8470</a></p>
                <p><span className="text-paper/40 mr-4">F</span>(888) 881-8211</p>
                <p><span className="text-paper/40 mr-4">E</span><a href="mailto:collect@advancedrecoverygroup.com" className="link-draw hover:text-white transition-colors">collect@advancedrecoverygroup.com</a></p>
                <p className="pt-2 text-xs">Mon–Thu 9AM–5PM &nbsp;|&nbsp; Fri 9AM–4PM</p>
              </div>
              <div className="mt-6">
                <OfficeStatusIndicator dark />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-paper/40">
            <p>© {new Date().getFullYear()} Advanced Recovery Group. All rights reserved.</p>
            <a href="https://www.linkedin.com/company/adrgroup/" target="_blank" rel="noopener" className="link-draw hover:text-paper/80 transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>

      {paletteOpen && (
        <CommandPalette onClose={closePalette} navigate={navigate} animated={paletteAnimated} showAssist={assistConfigured === true} />
      )}

      {/* ── ARG Assist sheet — only mounted when key is configured ── */}
      {assistConfigured === true && (
        <ArgAssist open={assistOpen} onClose={() => setAssistOpen(false)} />
      )}

      {/* ── Global ambient layers (behind content, pointer-events-none) ── */}
      <LedgerDust />
      <GlobalFolioCounter />
    </div>
  );
}
