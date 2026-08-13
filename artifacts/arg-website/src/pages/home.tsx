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
                  style={{ opacity: 0.12 }}
                >
                  {word}{' '}
                </span>
              ))
            )}
          </blockquote>
        </div>
      </div>

      {/* Industry tiles panel — anchored to bottom of the 100vh section */}
      <div
        ref={panelRef}
        className="absolute bottom-0 left-0 right-0 z-10 bg-paper border-t border-rule py-8 md:py-10"
        style={reducedMotion ? {} : { opacity: 0 }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-5 uppercase">
            Industries we serve
          </p>
          <ul ref={listRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-sm text-slate">
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
    <section className="relative isolate bg-ink overflow-hidden py-12 md:py-16 border-b border-ink/20">
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8">
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
    <section ref={sectionRef} data-folio-n={6} className="relative isolate bg-ink text-paper py-24 md:py-32 border-b border-ink">
      <SectionFolio n={6} />
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">Giving Back</p>
            <h2
              ref={headlineRef}
              className="text-h2 font-serif text-paper mb-8"
            >
              Feeding hope, building community
            </h2>
            <div ref={copyRef} style={reducedMotion ? {} : { opacity: 0 }}>
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
    <section ref={sectionRef} data-folio-n={7} className="relative isolate bg-ink text-paper py-24 md:py-32 overflow-hidden">
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

      <div className="relative z-[1] max-w-4xl mx-auto px-6 md:px-8 text-center flex flex-col items-center">
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
            ...(reducedMotion ? {} : { opacity: 0, transform: 'translateY(12px)' }),
          }}
        >
          {reducedMotion ? PHONE_DISPLAY : <ScramblePhone phone={PHONE_DISPLAY} trigger={phoneTriggered} />}
        </a>

        {/* Tagline + underline */}
        <p
          ref={taglineRef}
          className="relative text-lg md:text-xl text-paper/80 mb-10 font-sans max-w-prose mx-auto inline-block"
          style={reducedMotion ? {} : { opacity: 0, transform: 'translateY(8px)' }}
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
        onEnter:     () => { if (sectionRef.current) sectionRef.current.style.willChange = 'transform'; },
        onLeave:     () => { if (sectionRef.current) sectionRef.current.style.willChange = ''; },
        onLeaveBack: () => { if (sectionRef.current) sectionRef.current.style.willChange = ''; },
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
      data-folio-n={1}
      className="relative isolate bg-ink border-b border-ink/20 overflow-hidden md:flex md:items-center hero-height"
      style={{ transform: 'translateZ(0)' }}
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
      <section className="relative isolate bg-mist py-24 md:py-32 border-b border-rule">
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

      {/* 07 / 07  CLOSING CTA — "footer finale" */}
      <ClosingCTA />
    </Shell>
  );
}
