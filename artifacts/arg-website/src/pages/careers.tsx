import { Shell } from '@/components/layout/Shell';
import { EditorialImage } from '@/components/EditorialImage';
import { Helmet } from 'react-helmet-async';
import { PageHeader } from '@/components/PageHeader';
import { CinemaBand } from '@/components/CinemaBand';
import { SITE_ORIGIN } from '@/routes';

export default function CareersPage() {
  return (
    <Shell>
      <Helmet>
        <title>Careers | Advanced Recovery Group</title>
        <meta name="description" content="Join Advanced Recovery Group — a fast-paced, results-driven commercial collections firm in Fairfield, NJ. Current opening: Collections Recovery Specialist." />
        <meta property="og:url" content={`${SITE_ORIGIN}/careers/`} />
      </Helmet>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <PageHeader variant="light" headline="Join the Team" />

      {/* ── Ambient b-roll band ──────────────────────────────────────
          HONESTY RULE: label is "COLLECTIONS IN MOTION" — this is
          licensed b-roll, never captioned as ARG's own office/team.
      ─────────────────────────────────────────────────────────────── */}
      <CinemaBand
        mp4="/videos/careers-broll.mp4"
        webm="/videos/careers-broll.webm"
        poster="/videos/careers-broll-poster.jpg"
        overlayOpacity={0.55}
        label="COLLECTIONS IN MOTION"
        aspectClassName="aspect-[4/3] md:aspect-video"
      >
        <p className="font-mono text-paper/60 text-[9px] tracking-[0.22em] uppercase mb-2">
          Work at ARG
        </p>
        <p
          className="font-serif text-paper leading-snug max-w-xl"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
        >
          At Advanced Recovery Group, we operate in a fast-paced, results-driven environment.
          We value professionalism, integrity, and a team-oriented approach to solving
          complex financial challenges.
        </p>
      </CinemaBand>

      {/* ── Current openings ─────────────────────────────────────── */}
      <section className="bg-mist py-24 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <h2 className="font-mono text-slate tracking-widest text-xs font-semibold mb-12 uppercase">
            Current Openings
          </h2>

          <div className="flex flex-col">
            {/* Job listing row */}
            <div className="list-row group relative border-t border-b border-rule py-12 flex flex-col md:flex-row gap-8 md:gap-16 items-start hover:bg-paper/50 transition-colors pl-4 md:pl-6">
              <div className="md:w-1/4 flex flex-col gap-2 pt-1">
                <span className="font-mono text-sm font-semibold text-ink">ARG-001</span>
                <span className="font-mono text-xs text-slate">Full-Time, On-Site</span>
                <span className="font-mono text-xs text-slate">Fairfield, NJ</span>
              </div>
              <div className="md:w-1/2">
                <h3 className="row-title text-2xl font-serif text-ink mb-4">
                  Collections Recovery Specialist
                </h3>
                <p className="text-slate leading-relaxed max-w-prose">
                  We are seeking a driven and professional collections specialist to manage a portfolio of commercial accounts. You will be responsible for negotiating payments, skip tracing, and maintaining impeccable documentation while preserving client relationships. Experience in B2B collections or financial services preferred.
                </p>
              </div>
              <div className="md:w-1/4 md:text-right pt-2">
                <a
                  href="mailto:collect@advancedrecoverygroup.com?subject=Application%20for%20Collections%20Recovery%20Specialist%20%28ARG-001%29"
                  className="link-draw block md:inline-block w-full md:w-auto text-center border border-ink text-ink hover:bg-ink hover:text-paper transition-colors px-6 py-3 text-sm font-medium rounded-sm"
                >
                  Apply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Office image ─────────────────────────────────────────── */}
      <section className="bg-paper py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex flex-col gap-8">
          <EditorialImage
            src="/images/office.jpg"
            alt="Advanced Recovery Group office in Fairfield, NJ"
            caption="OUR HEADQUARTERS — FAIRFIELD, NJ"
            aspectClassName="aspect-video md:aspect-[21/9]"
            width={1200}
            height={514}
          />
          <p className="text-xs font-mono text-slate/60 max-w-xl md:text-right md:ml-auto">
            Advanced Recovery Group is an Equal Opportunity Employer. We do not discriminate on the basis of race, religion, color, sex, gender identity, sexual orientation, age, non-disqualifying physical or mental disability, national origin, veteran status or any other basis covered by appropriate law.
          </p>
        </div>
      </section>
    </Shell>
  );
}
