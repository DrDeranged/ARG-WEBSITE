import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Phone, Mail, ExternalLink, Search } from 'lucide-react';
import { ScrambleText } from '@/components/ScrambleText';

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
  onClose, navigate, animated,
}: {
  onClose: () => void; navigate: (path: string) => void; animated: boolean;
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
    { id: 'call',    label: 'Call (877) 464-8470',                       sub: 'Talk to a specialist',   icon: <Phone size={14} />,        action: () => { window.location.href = 'tel:8774648470'; onClose(); } },
    { id: 'email',   label: 'Email collect@advancedrecoverygroup.com',   sub: 'Send us a message',      icon: <Mail size={14} />,         action: () => { window.location.href = 'mailto:collect@advancedrecoverygroup.com'; onClose(); } },
    { id: 'portal',  label: 'Open Client Portal',                        sub: 'Log in to your account', icon: <ExternalLink size={14} />, action: () => { window.open('https://app.simplicitycollect.com/Login.aspx', '_blank', 'noopener'); onClose(); } },
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
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      role="dialog" aria-modal="true" aria-label="Command palette"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{ opacity: animated ? 1 : 0, transition: `opacity ${dur} ease` }}
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose} aria-hidden="true"
      />
      <div
        className="relative w-full max-w-xl bg-paper border border-rule rounded-sm overflow-hidden"
        style={{ transform: animated ? 'scale(1)' : 'scale(0.98)', transition: `transform ${dur} ${ease}` }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-rule">
          <Search size={16} className="text-slate flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
            placeholder="Search or jump to…"
            className="flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-slate/50 focus:outline-none"
            aria-label="Search commands" role="combobox" aria-expanded="true" aria-autocomplete="list"
          />
          <kbd className="font-mono text-xs text-slate/50 border border-rule px-1.5 py-0.5 rounded-sm">esc</kbd>
        </div>
        <ul role="listbox" className="py-1 max-h-80 overflow-y-auto">
          {filtered.length === 0 && <li className="px-4 py-3 font-mono text-sm text-slate/50">No results</li>}
          {filtered.map((action, idx) => (
            <li
              key={action.id}
              role="option" aria-selected={idx === activeIdx}
              onMouseEnter={() => setActive(idx)} onClick={action.action}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${idx === activeIdx ? 'bg-mist' : 'hover:bg-mist/50'}`}
              style={{
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
              {idx === activeIdx && <kbd className="font-mono text-xs text-slate/40 border border-rule px-1.5 py-0.5 rounded-sm flex-shrink-0">↵</kbd>}
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 border-t border-rule flex items-center gap-4 font-mono text-xs text-slate/50">
          <span><kbd className="border border-rule px-1 rounded-sm">↑</kbd> <kbd className="border border-rule px-1 rounded-sm">↓</kbd> navigate</span>
          <span><kbd className="border border-rule px-1 rounded-sm">↵</kbd> select</span>
          <span><kbd className="border border-rule px-1 rounded-sm">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

/* ── Shell ──────────────────────────────────────────────── */
export function Shell({ children }: { children: ReactNode }) {
  const [isScrolled, setIsScrolled]       = useState(false);
  const [mobileMenuOpen, setMobileMenu]   = useState(false);
  const [paletteOpen, setPaletteOpen]     = useState(false);   // controls DOM mounting
  const [paletteAnimated, setPaletteAnim] = useState(false);   // controls CSS state
  const [finaleRevealed, setFinale]       = useState(false);
  const finaleRef  = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();
  const isActive = (href: string) =>
    href === '/' ? (location === '/' || location === '') : location.startsWith(href.replace(/\/$/, ''));

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMobileMenu(false); }, [location]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); paletteOpen ? closePalette() : openPalette(); }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteOpen]);

  useEffect(() => {
    document.body.style.overflow = paletteOpen || mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [paletteOpen, mobileMenuOpen]);

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
        <CommandPalette onClose={closePalette} navigate={navigate} animated={paletteAnimated} />
      )}
    </div>
  );
}
