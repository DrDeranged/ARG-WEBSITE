import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Phone, Mail, ExternalLink, Search } from 'lucide-react';

/* ── Office Status ──────────────────────────────────────── */
type OfficeStatus = { open: boolean; label: string };

function getOfficeStatus(): OfficeStatus {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
  );
  const day = now.getDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat
  const hour = now.getHours();
  const min = now.getMinutes();
  const totalMin = hour * 60 + min;

  const OPEN = 9 * 60;      // 9:00 AM
  const CLOSE_WEEKDAY = 17 * 60; // 5:00 PM
  const CLOSE_FRI = 14 * 60;    // 2:00 PM

  const isWeekday = day >= 1 && day <= 4;
  const isFriday = day === 5;

  if (isWeekday && totalMin >= OPEN && totalMin < CLOSE_WEEKDAY) {
    const closeH = 5;
    return { open: true, label: `Open now — closes ${closeH}:00 PM ET` };
  }
  if (isFriday && totalMin >= OPEN && totalMin < CLOSE_FRI) {
    return { open: true, label: 'Open now — closes 2:00 PM ET' };
  }

  // Closed — compute next open
  let nextLabel = '';
  if (day === 0) nextLabel = 'Mon 9:00 AM ET';           // Sunday
  else if (day === 6) nextLabel = 'Mon 9:00 AM ET';       // Saturday
  else if (isFriday && totalMin >= CLOSE_FRI) nextLabel = 'Mon 9:00 AM ET';
  else if (isWeekday && totalMin >= CLOSE_WEEKDAY) {
    const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    nextLabel = `${days[day + 1] ?? 'Mon'} 9:00 AM ET`;
  } else {
    nextLabel = 'today 9:00 AM ET';
  }

  return { open: false, label: `Closed — opens ${nextLabel}` };
}

function OfficeStatusIndicator({ dark = false }: { dark?: boolean }) {
  const [status, setStatus] = useState<OfficeStatus>(getOfficeStatus);

  useEffect(() => {
    // Refresh every 60 seconds
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
type PaletteAction = {
  id: string;
  label: string;
  sub: string;
  icon: ReactNode;
  action: () => void;
};

function CommandPalette({ onClose, navigate }: { onClose: () => void; navigate: (path: string) => void }) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const allActions: PaletteAction[] = [
    { id: 'home', label: 'Home', sub: 'Go to homepage', icon: <Search size={14} />, action: () => { navigate('/'); onClose(); } },
    { id: 'contact', label: 'Contact Us', sub: 'Send an inquiry', icon: <Search size={14} />, action: () => { navigate('/contact-us/'); onClose(); } },
    { id: 'careers', label: 'Careers', sub: 'View open positions', icon: <Search size={14} />, action: () => { navigate('/careers/'); onClose(); } },
    { id: 'blog', label: 'Blog', sub: 'Insights & updates', icon: <Search size={14} />, action: () => { navigate('/blog/'); onClose(); } },
    {
      id: 'call', label: 'Call (877) 464-8470', sub: 'Talk to a specialist', icon: <Phone size={14} />,
      action: () => { window.location.href = 'tel:8774648470'; onClose(); }
    },
    {
      id: 'email', label: 'Email collect@advancedrecoverygroup.com', sub: 'Send us a message', icon: <Mail size={14} />,
      action: () => { window.location.href = 'mailto:collect@advancedrecoverygroup.com'; onClose(); }
    },
    {
      id: 'portal', label: 'Open Client Portal', sub: 'Log in to your account', icon: <ExternalLink size={14} />,
      action: () => { window.open('https://app.simplicitycollect.com/Login.aspx', '_blank', 'noopener'); onClose(); }
    },
  ];

  const filtered = query
    ? allActions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.sub.toLowerCase().includes(query.toLowerCase())
      )
    : allActions;

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        filtered[activeIdx]?.action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filtered, activeIdx, onClose]
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-xl bg-paper border border-rule rounded-sm overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-rule">
          <Search size={16} className="text-slate flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search or jump to…"
            className="flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-slate/50 focus:outline-none"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
          />
          <kbd className="font-mono text-xs text-slate/50 border border-rule px-1.5 py-0.5 rounded-sm">esc</kbd>
        </div>

        {/* Results */}
        <ul role="listbox" className="py-1 max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="px-4 py-3 font-mono text-sm text-slate/50">No results</li>
          )}
          {filtered.map((action, idx) => (
            <li
              key={action.id}
              role="option"
              aria-selected={idx === activeIdx}
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={action.action}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                idx === activeIdx ? 'bg-mist' : 'hover:bg-mist/50'
              }`}
            >
              <span className="text-slate flex-shrink-0" aria-hidden="true">{action.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="font-mono text-sm text-ink block truncate">{action.label}</span>
                <span className="font-mono text-xs text-slate/60 block truncate">{action.sub}</span>
              </span>
              {idx === activeIdx && (
                <kbd className="font-mono text-xs text-slate/40 border border-rule px-1.5 py-0.5 rounded-sm flex-shrink-0">↵</kbd>
              )}
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [location, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  // Lock body scroll when palette/menu open
  useEffect(() => {
    document.body.style.overflow = paletteOpen || mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [paletteOpen, mobileMenuOpen]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper font-sans">
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-paper/95 backdrop-blur-md border-b border-rule py-3'
            : 'bg-paper py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 relative z-50 flex-shrink-0">
            <img src="/images/logo-dark.png" alt="Advanced Recovery Group" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {[
              ['Home', '/'],
              ['Contact Us', '/contact-us/'],
              ['Careers', '/careers/'],
              ['Blog', '/blog/']
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-slate hover:text-recovered transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {/* Office status */}
            <OfficeStatusIndicator />

            {/* ⌘K button */}
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette (⌘K)"
              className="flex items-center gap-1.5 text-slate/60 hover:text-ink transition-colors"
            >
              <Search size={14} aria-hidden="true" />
              <kbd className="font-mono text-xs border border-rule px-1.5 py-0.5 rounded-sm text-slate/50 hover:text-ink transition-colors">
                ⌘K
              </kbd>
            </button>

            <a
              href="https://app.simplicitycollect.com/Login.aspx"
              target="_blank"
              rel="noopener"
              className="text-sm font-medium border border-ink text-ink px-5 py-2 hover:bg-ink hover:text-paper transition-colors rounded-sm"
            >
              Client Portal
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden relative z-50 text-ink p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-paper flex flex-col pt-24 px-6 pb-6 animate-in fade-in duration-200">
          <nav className="flex flex-col gap-6 text-2xl font-serif" aria-label="Mobile navigation">
            {[
              ['Home', '/'],
              ['Contact Us', '/contact-us/'],
              ['Careers', '/careers/'],
              ['Blog', '/blog/']
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-ink hover:text-recovered border-b border-rule pb-4"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-4">
            <a
              href="https://app.simplicitycollect.com/Login.aspx"
              target="_blank"
              rel="noopener"
              className="block text-center text-lg font-medium border border-ink bg-ink text-paper px-6 py-4 rounded-sm"
            >
              Client Portal
            </a>
            <button
              onClick={() => { setMobileMenuOpen(false); setPaletteOpen(true); }}
              className="flex items-center justify-center gap-2 border border-rule text-slate px-6 py-4 rounded-sm text-sm font-mono"
            >
              <Search size={14} aria-hidden="true" /> Quick Actions
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      <footer className="bg-ink text-paper/80 pt-16 pb-8 border-t-4 border-recovered">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-1">
              <img src="/images/logo-light.png" alt="Advanced Recovery Group" className="h-10 w-auto object-contain mb-6 opacity-90" />
              <p className="text-sm text-paper/70 leading-relaxed font-sans max-w-sm">
                Advanced Recovery Group is a full-service commercial collections agency, providing successful management solutions with professionalism and efficiency.
              </p>
              <div className="mt-8">
                <img src="/images/bbb-seal.svg" alt="BBB Accredited Business" className="h-12 opacity-80" />
              </div>
            </div>

            <div>
              <h4 className="font-mono text-xs tracking-widest text-paper/50 mb-6 uppercase">Navigation</h4>
              <nav className="flex flex-col gap-4" aria-label="Footer navigation">
                {[
                  ['Home', '/'],
                  ['Contact Us', '/contact-us/'],
                  ['Careers', '/careers/'],
                  ['Blog', '/blog/']
                ].map(([label, href]) => (
                  <Link key={href} href={href} className="text-sm hover:text-white transition-colors w-fit">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-mono text-xs tracking-widest text-paper/50 mb-6 uppercase">Contact</h4>
              <div className="font-mono text-sm space-y-3 text-paper/80 tabular-nums">
                <p>
                  <span className="text-paper/40 mr-4">P</span>
                  <a href="tel:8774648470" className="hover:text-white transition-colors">(877) 464-8470</a>
                </p>
                <p><span className="text-paper/40 mr-4">F</span> (888) 881-8211</p>
                <p>
                  <span className="text-paper/40 mr-4">E</span>
                  <a href="mailto:collect@advancedrecoverygroup.com" className="hover:text-white transition-colors">collect@advancedrecoverygroup.com</a>
                </p>
                <p className="pt-2 text-xs">Mon–Thu 9AM–5PM | Fri 9AM–2PM</p>
              </div>

              <div className="mt-6">
                <OfficeStatusIndicator dark />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-paper/40">
            <p>© {new Date().getFullYear()} Advanced Recovery Group. All rights reserved.</p>
            <a href="https://www.linkedin.com/company/adrgroup/" target="_blank" rel="noopener" className="hover:text-paper/80 transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>

      {/* Command Palette */}
      {paletteOpen && (
        <CommandPalette onClose={() => setPaletteOpen(false)} navigate={navigate} />
      )}
    </div>
  );
}
