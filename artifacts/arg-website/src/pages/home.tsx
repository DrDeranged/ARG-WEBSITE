import { Shell } from '@/components/layout/Shell';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useState, useRef } from 'react';

function FeatureRow({ num, title, desc, index }: { num: string; title: string; desc: string; index: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let observer: IntersectionObserver;
    if (ref.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            // Animate from 0 to index
            let start = 0;
            const target = parseInt(num, 10);
            const duration = 1000;
            const stepTime = Math.abs(Math.floor(duration / target));
            
            const timer = setInterval(() => {
              start += 1;
              setCount(start);
              if (start >= target) {
                clearInterval(timer);
                setCount(target);
              }
            }, stepTime);
            
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(ref.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [num]);

  return (
    <div ref={ref} className="group border-t border-rule last:border-b py-8 md:py-12 flex flex-col md:flex-row md:items-start gap-4 md:gap-16 hover:bg-paper/50 transition-colors -mx-6 px-6 md:mx-0 md:px-0">
      <span className="font-mono text-sm text-slate/50 group-hover:text-recovered transition-colors mt-1 tabular-nums">
        {count.toString().padStart(2, '0')}
      </span>
      <div className="flex-1 max-w-3xl">
        <h3 className="text-2xl font-serif text-ink mb-3">{title}</h3>
        <p className="text-slate leading-relaxed font-sans">{desc}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Shell>
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center justify-center min-h-[85vh] border-b border-rule overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-team.jpg" 
            alt="ARG Team" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/75 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-ink/40"></div>
        </div>
        
        <div className="max-w-6xl w-full mx-auto px-6 md:px-8 relative z-10 flex flex-col items-start mt-8 md:mt-16">
          <p className="font-mono text-recovered tracking-widest text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            COMMERCIAL COLLECTIONS
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-paper leading-[1.05] tracking-tight max-w-4xl mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
            We Recover<br/>What You're Owed.
          </h1>
          <p className="text-lg md:text-xl text-paper/80 font-sans max-w-2xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            Advanced Recovery Group specializes exclusively in B2B debt recovery. Operating on a strict contingency basis, we deploy professional, firm, and proven strategies to restore your cash flow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both w-full sm:w-auto">
            <Link 
              href="/contact-us/" 
              className="bg-recovered text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-recovered/90 transition-colors w-full sm:w-auto text-center"
            >
              Get a Free Consultation
            </Link>
            <a 
              href="#process" 
              className="border border-paper/30 text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-paper/10 transition-colors w-full sm:w-auto text-center"
            >
              Learn How It Works
            </a>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-paper border-b border-rule relative z-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-rule">
            <div className="flex flex-col gap-2 pt-6 md:pt-0 md:pr-8 first:pt-0">
              <span className="font-mono text-3xl text-recovered tabular-nums">25+</span>
              <span className="text-slate text-sm font-medium">Years Experience</span>
            </div>
            <div className="flex flex-col gap-2 pt-6 md:pt-0 md:px-8">
              <span className="font-mono text-3xl text-recovered">100%</span>
              <span className="text-slate text-sm font-medium">Contingency-Only — No Collection, No Fee</span>
            </div>
            <div className="flex flex-col gap-2 pt-6 md:pt-0 md:pl-8">
              <span className="font-mono text-3xl text-recovered tabular-nums">50</span>
              <span className="text-slate text-sm font-medium">Licensed in All US States</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ARG */}
      <section className="bg-mist py-24 md:py-32 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-16 md:mb-24 max-w-2xl">
            <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
              Why Advanced Recovery Group
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-ink leading-tight">
              A precise, results-driven approach to commercial debt.
            </h2>
          </div>

          <div className="flex flex-col">
            {[
              {
                num: "01",
                title: "Contingency-Based Recovery",
                desc: "You only pay when we collect. Zero upfront fees, zero risk. Our incentives are perfectly aligned with your success."
              },
              {
                num: "02",
                title: "B2B Specialists",
                desc: "We handle commercial debt exclusively — business-to-business, not consumer. We understand corporate structures, contracts, and negotiation."
              },
              {
                num: "03",
                title: "Licensed Nationwide",
                desc: "Fully licensed, bonded, and compliant in all 50 states. We navigate federal and state regulations so you don't have to."
              },
              {
                num: "04",
                title: "Relationship-Preserving",
                desc: "We operate with a level of professionalism that protects your reputation and, when possible, preserves your client relationships."
              }
            ].map((feature, idx) => (
              <FeatureRow key={feature.num} num={feature.num} title={feature.title} desc={feature.desc} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="process" className="bg-paper py-24 md:py-32 border-b border-rule scroll-m-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-16 md:mb-24">
            <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
              Our Process
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-ink leading-tight">
              From Placement to Recovery
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="flex flex-col gap-12 relative">
              {/* Vertical line connecting steps on desktop */}
              <div className="hidden lg:block absolute left-[11px] top-4 bottom-12 w-[1px] bg-rule z-0" />
              
              {[
                {
                  step: "01",
                  title: "Submit Placement",
                  desc: "Provide account details, invoices, and supporting documentation through our secure client portal."
                },
                {
                  step: "02",
                  title: "Dedicated Recovery",
                  desc: "Our specialized team immediately pursues collection using proven, compliant communication and negotiation strategies."
                },
                {
                  step: "03",
                  title: "You Get Paid",
                  desc: "We remit collected funds directly to you. We only retain our contingency fee upon successful collection."
                }
              ].map((process, i) => (
                <div key={process.step} className="relative z-10 flex gap-6 md:gap-8">
                  <div className="bg-paper w-6 h-6 flex-shrink-0 mt-1 flex items-center justify-center">
                    <span className="font-mono text-sm text-ink font-bold tabular-nums">{process.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-ink mb-2">{process.title}</h3>
                    <p className="text-slate leading-relaxed">{process.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px] overflow-hidden rounded-sm bg-mist">
              <img src="/images/collectors.jpg" alt="ARG Collections Process" className="w-full h-full object-cover grayscale mix-blend-multiply contrast-125 opacity-90" />
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES & TRUST */}
      <section className="bg-mist py-24 md:py-32 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
                Trusted Partners
              </p>
              <h2 className="text-4xl font-serif text-ink leading-tight mb-8">
                Industries We Serve
              </h2>
              <ul className="flex flex-col gap-4 font-mono text-sm text-slate">
                {[
                  "Healthcare & Medical Devices",
                  "Financial Services & FinTech",
                  "Distribution & Wholesale",
                  "Manufacturing & Logistics",
                  "Technology & SaaS",
                  "Professional Services",
                  "Commercial Real Estate",
                  "Transportation & Freight"
                ].map((industry) => (
                  <li key={industry} className="flex items-center gap-4">
                    <span className="w-4 h-[1px] bg-recovered block"></span>
                    {industry}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="lg:col-span-7 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-rule pt-12 lg:pt-0 lg:pl-16">
              <div className="relative">
                <span className="absolute -top-12 -left-6 text-8xl font-serif text-rule/50 select-none">"</span>
                <blockquote className="text-2xl md:text-3xl font-serif text-ink leading-snug mb-8 relative z-10">
                  Advanced Recovery Group stepped in when our internal efforts stalled. Their team is firm but remarkably professional. They recovered funds from accounts we had completely written off, without damaging our industry reputation.
                </blockquote>
                <p className="font-mono text-sm text-slate uppercase tracking-widest">
                  — Director of Finance, Healthcare Group
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHARITY / GIVEBACK */}
      <section className="bg-ink text-paper py-24 md:py-32 border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-recovered tracking-widest text-xs font-semibold mb-4 uppercase">
                Giving Back
              </p>
              <h2 className="text-4xl md:text-5xl font-serif text-paper leading-tight mb-8">
                Feeding Hope, Building Community
              </h2>
              <p className="text-paper/80 leading-relaxed mb-6">
                At Advanced Recovery Group, our mission extends beyond the ledger. We believe in leveraging our success to create tangible impact globally.
              </p>
              <p className="text-paper/80 leading-relaxed mb-10">
                Through our ongoing partnership with Feed My Starving Children, our team has packed thousands of meals. Recently, members of our staff traveled to the Dominican Republic to distribute food, build relationships, and witness firsthand the power of community service.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link href="/blog/a-journey-of-compassion-my-service-trip-to-the-dr/" className="flex items-center gap-2 text-recovered hover:text-paper transition-colors font-mono text-sm uppercase tracking-widest group">
                  Read the Mission Story
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <img src="/images/fmsc-logo.jpg" alt="Feed My Starving Children" className="h-12 w-auto mix-blend-screen opacity-80" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mt-12">
                <img src="/images/manny-kids.jpg" alt="ARG Team with Children in DR" className="w-full aspect-square object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
              <div>
                <img src="/images/meals.jpg" alt="Packing Meals for FMSC" className="w-full aspect-square object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG INSIGHTS */}
      <section className="bg-mist py-24 md:py-32 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
                Insights
              </p>
              <h2 className="text-4xl font-serif text-ink">
                From the Blog
              </h2>
            </div>
            <Link href="/blog/" className="font-mono text-sm text-ink hover:text-recovered transition-colors flex items-center gap-2 group">
              View All Articles <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: "When Is the Right Time to Partner with a Commercial Collections Firm?",
                date: "Nov 9, 2023",
                excerpt: "As defaults slip from 30 to 60 to 90 days overdue, the likelihood of collecting diminishes. Here's how to know when to bring in a commercial collections firm.",
                link: "/blog/when-is-the-right-time-to-partner-with-a-commercial-collections-firm/"
              },
              {
                title: "A Journey of Compassion: My Service Trip to the DR",
                date: "Aug 15, 2023",
                excerpt: "A personal account of ARG's mission trip to the Dominican Republic — feeding families, building connections, and living out our values.",
                link: "/blog/a-journey-of-compassion-my-service-trip-to-the-dr/"
              }
            ].map((article) => (
              <Link key={article.title} href={article.link} className="group block border-t border-rule pt-6">
                <span className="font-mono text-xs text-slate tabular-nums block mb-4">{article.date}</span>
                <h3 className="text-2xl font-serif text-ink mb-4 group-hover:text-recovered transition-colors">{article.title}</h3>
                <p className="text-slate mb-6 line-clamp-3">{article.excerpt}</p>
                <span className="font-mono text-sm text-ink group-hover:text-recovered flex items-center gap-2">
                  Read More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-recovered text-paper py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            Ready to Recover What You're Owed?
          </h2>
          <p className="text-lg md:text-xl text-paper/90 mb-10 font-sans">
            No upfront fees. Contingency-only. Get started today.
          </p>
          <Link 
            href="/contact-us/" 
            className="bg-paper text-ink px-10 py-4 text-sm font-medium rounded-sm hover:bg-paper/90 transition-colors inline-block"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </Shell>
  );
}
