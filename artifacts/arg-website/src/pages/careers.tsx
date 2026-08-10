import { Shell } from '@/components/layout/Shell';

export default function CareersPage() {
  const jobs = [
    {
      id: "ARG-001",
      title: "Commercial Collections Specialist",
      type: "Full-Time, On-Site",
      description: "We are seeking a driven and professional collections specialist to manage a portfolio of commercial accounts. You will be responsible for negotiating payments, skip tracing, and maintaining impeccable documentation while preserving client relationships."
    },
    {
      id: "ARG-002",
      title: "Account Manager",
      type: "Full-Time, On-Site",
      description: "Act as the primary liaison between our agency and our corporate clients. The Account Manager ensures transparent reporting, handles placement onboarding, and delivers exceptional service to our partners."
    },
    {
      id: "ARG-003",
      title: "Compliance & Operations Associate",
      type: "Full-Time, On-Site",
      description: "Ensure our recovery operations adhere to all federal, state, and local regulations. This role involves auditing communications, updating licensing documentation, and supporting operational workflows."
    }
  ];

  return (
    <Shell>
      <section className="pt-32 pb-24 md:pt-48 md:pb-24 bg-paper border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <h1 className="text-5xl md:text-7xl font-serif text-ink mb-12">Join the Team</h1>
          <p className="text-xl text-slate max-w-3xl leading-relaxed">
            At Advanced Recovery Group, we operate in a fast-paced, results-driven environment. We value professionalism, integrity, and a team-oriented approach to solving complex financial challenges. If you're looking to build a career in commercial collections with a company that invests in its people and gives back to the community, we want to hear from you.
          </p>
        </div>
      </section>

      <section className="bg-mist py-24 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <h2 className="font-mono text-slate tracking-widest text-xs font-semibold mb-12 uppercase">
            Current Openings
          </h2>
          
          <div className="flex flex-col border-t border-rule">
            {jobs.map((job) => (
              <div key={job.id} className="border-b border-rule py-12 flex flex-col md:flex-row gap-8 md:gap-16 items-start group hover:bg-paper/50 transition-colors -mx-6 px-6 md:mx-0 md:px-0">
                <div className="md:w-1/4 flex flex-col gap-2 pt-1">
                  <span className="font-mono text-sm font-semibold text-ink">{job.id}</span>
                  <span className="font-mono text-xs text-slate">{job.type}</span>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-serif text-ink mb-4">{job.title}</h3>
                  <p className="text-slate leading-relaxed">{job.description}</p>
                </div>
                <div className="md:w-1/4 md:text-right pt-2">
                  <a 
                    href={`mailto:collect@advancedrecoverygroup.com?subject=Application for ${job.title} (${job.id})`}
                    className="inline-block border border-ink text-ink hover:bg-ink hover:text-paper transition-colors px-6 py-3 text-sm font-medium rounded-sm"
                  >
                    Apply via Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex flex-col gap-8">
          <div className="w-full aspect-video md:aspect-[21/9] bg-mist overflow-hidden rounded-sm">
            <img src="/images/office.jpg" alt="ARG Office Space" className="w-full h-full object-cover grayscale opacity-90" />
          </div>
          <div className="flex justify-between items-start flex-col md:flex-row gap-4 text-xs font-mono text-slate">
            <p>Our headquarters in action.</p>
            <p className="max-w-xl md:text-right text-slate/60">
              Advanced Recovery Group is an Equal Opportunity Employer. We do not discriminate on the basis of race, religion, color, sex, gender identity, sexual orientation, age, non-disqualifying physical or mental disability, national origin, veteran status or any other basis covered by appropriate law.
            </p>
          </div>
        </div>
      </section>
    </Shell>
  );
}
