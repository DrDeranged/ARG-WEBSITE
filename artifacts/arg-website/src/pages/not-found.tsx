import { Shell } from '@/components/layout/Shell';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <Shell>
      <Helmet>
        <title>Page Not Found | Advanced Recovery Group</title>
        <meta name="description" content="The page you're looking for doesn't exist or may have moved. Return to the Advanced Recovery Group homepage." />
      </Helmet>

      <section className="pt-32 pb-32 md:pt-48 md:pb-48 bg-paper border-b border-rule flex items-center" style={{ minHeight: '70vh' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <p className="font-mono text-slate tracking-widest text-xs font-semibold mb-4 uppercase">
            Error 404
          </p>
          <h1
            className="font-serif text-ink mb-8"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', lineHeight: 1.05 }}
          >
            Page not found.
          </h1>
          <p className="text-lg text-slate max-w-prose leading-relaxed mb-12">
            The page you're looking for doesn't exist or may have moved. If you followed a link from another site, the URL may be outdated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="bg-ink text-paper px-8 py-4 text-sm font-medium rounded-sm hover:bg-ink/90 transition-colors text-center inline-block"
            >
              Go to Homepage
            </Link>
            <Link
              href="/contact-us/"
              className="border border-ink text-ink px-8 py-4 text-sm font-medium rounded-sm hover:bg-mist transition-colors text-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
