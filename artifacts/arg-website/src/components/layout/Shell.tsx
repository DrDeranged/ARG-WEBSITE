import { type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';

export function Shell({ children }: { children: ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper font-sans">
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-paper/90 backdrop-blur-md border-b border-rule py-3 shadow-sm'
            : 'bg-paper py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 relative z-50">
            {/* The logo should swap to white if hero is dark and not scrolled, but requirement says just use logo-dark.png in nav. Actually, on hero we have an overlay, so logo-dark might be hard to read. I'll stick to logo-dark and assume paper background or use a white backdrop for header when scrolled, but on load it's transparent. Let's make it always white background for safety or just follow the prompt: sticky, blur on scroll. Wait, if it's transparent on top of the hero, the dark logo might clash. I'll make the header background paper/95 always, or just add a subtle white gradient. Let's make it always paper to keep the ledger look crisp. The prompt says "After scrolling past hero: add subtle backdrop blur + 1px bottom border in rule color". It implies before scroll it's transparent. We'll use logo-light if on homepage and not scrolled? Prompt just says "Left: logo image from /images/logo-dark.png". I will use logo-dark. */}
            <img src="/images/logo-dark.png" alt="Advanced Recovery Group" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
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

          <div className="hidden md:flex items-center">
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
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-paper flex flex-col pt-24 px-6 pb-6 animate-in fade-in zoom-in-95 duration-200">
          <nav className="flex flex-col gap-6 text-2xl font-serif">
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
          <div className="mt-8">
            <a
              href="https://app.simplicitycollect.com/Login.aspx"
              target="_blank"
              rel="noopener"
              className="block text-center text-lg font-medium border border-ink bg-ink text-paper px-6 py-4 rounded-sm"
            >
              Client Portal
            </a>
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
              <nav className="flex flex-col gap-4">
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
                <p><span className="text-paper/40 mr-4">P</span> (877) 464-8470</p>
                <p><span className="text-paper/40 mr-4">F</span> (888) 881-8211</p>
                <p><span className="text-paper/40 mr-4">E</span> collect@advancedrecoverygroup.com</p>
                <p className="pt-2 text-xs">Mon–Thu 9AM–5PM | Fri 9AM–2PM</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-paper/40">
            <p>© 2026 Advanced Recovery Group. All rights reserved.</p>
            <a href="https://www.linkedin.com/company/adrgroup/" target="_blank" rel="noopener" className="hover:text-paper/80 transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
