import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Phone, Mail, ExternalLink, Search, Dog, Bot, ArrowRight } from 'lucide-react';
import { ScrambleText } from '@/components/ScrambleText';
import { useMotion } from '@/motion';
import { ArgAssist } from '@/components/ArgAssist';
import { FPSOverlay } from '@/components/FPSOverlay';
import { NAV_LINKS } from '@/routes';

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
        className="absolute inset-0 bg-ink/60 md:bg-ink/40 md:backdrop-blur-sm"
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
const SHELL_API_BASE = (import.meta.env.BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/* ── Floating Assist Tab ─────────────────────────────────
   Ledger-language fixed bottom-right launcher for ArgAssist.

   Phase sequence (skipped entirely for reducedMotion users):
     hidden   → DOM just mounted, invisible
     entering → 40ms: tab fades + slides up into view
     callout  → 1.2s: one-shot nudge plays; callout bubble
                appears above tab with an introductory line
     settled  → 7s: callout auto-dismisses, tab remains

   z-40 — below palette / sheet layers.
──────────────────────────────────────────────────────────*/
function AssistTab({
  onOpen,
  onDismiss,
}: {
  onOpen: () => void;
  onDismiss: () => void;
}) {
  const { reducedMotion } = useMotion();
  type Phase = 'hidden' | 'entering' | 'callout' | 'settled';
  const [phase, setPhase] = useState<Phase>('hidden');
  const [calloutGone, setCalloutGone]   = useState(false);
  const [nudgeActive, setNudgeActive]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('entering'), 40);
    const t2 = setTimeout(() => {
      setPhase('callout');
      if (!reducedMotion) {
        setNudgeActive(true);
        setTimeout(() => setNudgeActive(false), 550);
      }
    }, 1200);
    const t3 = setTimeout(() => {
      setPhase('settled');
      setCalloutGone(true);
    }, 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    setCalloutGone(true);  // collapse bubble the moment the sheet opens
    onOpen();
  };

  const tabVisible    = phase !== 'hidden';
  const calloutShown  = phase === 'callout' && !calloutGone && !reducedMotion;

  return (
    <div
      className="fixed z-40 bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col items-end gap-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* ── Callout bubble ───────────────────────────────────
          Clicks through to the assist sheet, same as the tab.
      ─────────────────────────────────────────────────────── */}
      <div
        aria-hidden={!calloutShown}
        style={{
          opacity:    calloutShown ? 1 : 0,
          transform:  calloutShown ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.97)',
          transition: 'opacity 380ms ease, transform 380ms ease',
          pointerEvents: calloutShown ? 'auto' : 'none',
        }}
      >
        <div
          className="relative bg-paper border border-rule rounded-[4px] px-3.5 py-2.5 cursor-pointer select-none"
          style={{
            maxWidth: '13rem',
            borderLeftWidth: '2px',
            borderLeftColor: 'var(--color-recovered)',
            boxShadow: '0 2px 14px rgba(16,31,48,0.10)',
          }}
          onClick={handleOpen}
          role="button"
          tabIndex={-1}
        >
          {/* Down-pointing tail — points toward the tab below */}
          <div
            className="absolute -bottom-[5px] right-5 w-2.5 h-2.5 bg-paper border-r border-b border-rule"
            style={{ transform: 'rotate(45deg)' }}
          />
          <p className="font-mono text-[9px] tracking-widest text-recovered mb-1 uppercase">
            ARG Assist
          </p>
          <p className="font-serif text-[13px] leading-snug text-ink">
            Questions about debt placement? I can help.
          </p>
        </div>
      </div>

      {/* ── Tab launcher ─────────────────────────────────────
          arg-nudge plays once ~1.2 s after the tab appears.
      ─────────────────────────────────────────────────────── */}
      <div
        style={{
          opacity:    reducedMotion || tabVisible ? 1 : 0,
          transform:  reducedMotion || tabVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 300ms ease, transform 300ms ease',
          animation:  nudgeActive ? 'arg-nudge 520ms ease forwards' : 'none',
        }}
      >
        <div
          className="relative flex items-center bg-paper border border-rule rounded-[4px] overflow-hidden"
          style={{
            borderTopWidth: '2px',
            borderTopColor: 'var(--color-recovered)',
            boxShadow: '0 2px 12px rgba(16,31,48,0.12)',
          }}
        >
          {/* Recovered stripe accent — thin top bar already provided by
              borderTopColor, this inner shimmer reinforces the brand pop */}
          <button
            onClick={handleOpen}
            aria-label="Open ARG Assist AI concierge"
            className="flex items-center gap-2 pl-3 pr-2.5 py-2.5 font-mono text-[10px] tracking-widest text-ink hover:text-recovered transition-colors group"
          >
            {/* Live pulse dot */}
            <span className="relative flex-shrink-0 w-2 h-2">
              <span
                className="absolute inset-0 rounded-full bg-recovered opacity-75"
                style={{ animation: 'ping 2.2s cubic-bezier(0,0,0.2,1) infinite' }}
              />
              <span className="relative w-2 h-2 rounded-full bg-recovered block" />
            </span>
            ARG ASSIST
            {/* Micro arrow — slides right on hover */}
            <ArrowRight
              size={9}
              className="opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200"
              aria-hidden="true"
            />
          </button>

          {/* Rule divider */}
          <div className="w-px h-3.5 bg-rule flex-shrink-0" />

          <button
            onClick={onDismiss}
            aria-label="Dismiss assist tab for this session"
            className="flex items-center justify-center w-7 h-7 text-slate/35 hover:text-ink transition-colors"
          >
            <X size={10} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shell ──────────────────────────────────────────────── */
export function Shell({ children }: { children: ReactNode }) {
  const [isScrolled, setIsScrolled]           = useState(false);
  const [mobileMenuOpen, setMobileMenu]       = useState(false);
  const [paletteOpen, setPaletteOpen]         = useState(false);   // controls DOM mounting
  const [paletteAnimated, setPaletteAnim]     = useState(false);   // controls CSS state
  const [assistOpen, setAssistOpen]           = useState(false);
  const [assistConfigured, setAssistConfigured] = useState<boolean | null>(null);
  const [finaleRevealed, setFinale]           = useState(false);

  // ── Floating Assist Tab state ───────────────────────────────────────────
  // tabSeenThisSession: user has hit 600px scroll at least once this session
  // tabDismissed: user clicked ×
  // tabScrollReady: 600px scroll threshold reached OR already seen this session
  const [tabSeenThisSession] = useState<boolean>(() =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('arg:assist-tab-seen') === '1'
  );
  const [tabDismissed, setTabDismissed] = useState<boolean>(() =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('arg:assist-tab-dismissed') === '1'
  );
  const [tabScrollReady, setTabScrollReady] = useState<boolean>(() =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('arg:assist-tab-seen') === '1'
  );
  const finaleRef    = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();
  const isActive = (href: string) =>
    href === '/' ? (location === '/' || location === '') : location.startsWith(href.replace(/\/$/, ''));
  const isDarkHero = (location === '/' || location === '') && !isScrolled;

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

  // ── Floating Assist Tab: show after 600px scroll (first visit) ─────────
  useEffect(() => {
    if (tabSeenThisSession || tabDismissed) return;
    const h = () => {
      if (window.scrollY > 600) {
        setTabScrollReady(true);
        try { sessionStorage.setItem('arg:assist-tab-seen', '1'); } catch {}
        window.removeEventListener('scroll', h);
      }
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, [tabSeenThisSession, tabDismissed]);

  const handleTabDismiss = useCallback(() => {
    setTabDismissed(true);
    try { sessionStorage.setItem('arg:assist-tab-dismissed', '1'); } catch {}
  }, []);

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
          isScrolled ? 'bg-paper/95 md:backdrop-blur-md border-b border-rule py-3' : isDarkHero ? 'bg-transparent py-4 md:py-5' : 'bg-paper py-4 md:py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 relative z-50 flex-shrink-0">
            <img src={isDarkHero ? '/images/logo-light.png' : '/images/logo-dark.png'} alt="Advanced Recovery Group" className="h-8 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className={`link-draw text-sm font-medium transition-colors ${isActive(path) ? 'text-recovered' : isDarkHero ? 'text-paper/80 hover:text-paper' : 'text-slate hover:text-recovered'}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <OfficeStatusIndicator />
            <button
              onClick={openPalette}
              aria-label="Open command palette (⌘K)"
              className={`flex items-center gap-1.5 transition-colors ${isDarkHero ? 'text-paper/60 hover:text-paper' : 'text-slate/60 hover:text-ink'}`}
            >
              <Search size={14} aria-hidden="true" />
              <kbd className={`font-mono text-xs border px-1.5 py-0.5 rounded-sm transition-colors ${isDarkHero ? 'border-paper/30 text-paper/50' : 'border-rule text-slate/50 hover:text-ink'}`}>⌘K</kbd>
            </button>
            {/* ASSIST chip — only when key is configured */}
            {assistConfigured === true && (
              <button
                onClick={() => setAssistOpen(true)}
                aria-label="Open ARG Assist AI concierge"
                className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest transition-colors border px-2.5 py-1 rounded-sm ${isDarkHero ? 'border-paper/30 text-paper/60 hover:text-paper' : 'border-rule text-slate/50 hover:text-recovered'}`}
              >
                <Bot size={10} aria-hidden="true" />
                ASSIST
              </button>
            )}
            <a
              href="https://app.simplicitycollect.com/Login.aspx"
              target="_blank" rel="noopener"
              className={`text-sm font-medium border px-5 py-2 transition-colors rounded-sm ${isDarkHero ? 'border-paper/60 text-paper hover:bg-paper hover:text-ink' : 'border-ink text-ink hover:bg-ink hover:text-paper'}`}
            >
              Client Portal
            </a>
          </div>

          <button
            className={`md:hidden relative z-50 p-2 -mr-2 ${isDarkHero ? 'text-paper' : 'text-ink'}`}
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
            {NAV_LINKS.map(({ label, path }) => (
              <Link key={path} href={path} className="text-ink hover:text-recovered border-b border-rule pb-4">
                {label}
              </Link>
            ))}
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
                {NAV_LINKS.map(({ label, path }) => (
                  <Link key={path} href={path} className="link-draw text-sm hover:text-white transition-colors w-fit">
                    {label}
                  </Link>
                ))}
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

      {/* ── Floating assist tab — appears after 600px scroll (first visit) ──
           Hidden while palette, mobile menu, or assist sheet is open.        */}
      {assistConfigured === true &&
        tabScrollReady &&
        !tabDismissed &&
        !paletteOpen &&
        !mobileMenuOpen &&
        !assistOpen && (
        <AssistTab
          onOpen={() => setAssistOpen(true)}
          onDismiss={handleTabDismiss}
        />
      )}

      {/* ── Global ambient layers (behind content, pointer-events-none) ── */}
      <FPSOverlay />
    </div>
  );
}
