import { type ReactNode, useEffect, useRef, useState, type ComponentProps } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

import HomePage from '@/pages/home';
import ContactPage from '@/pages/contact';
import CareersPage from '@/pages/careers';
import BlogListPage from '@/pages/blog-list';
import BlogArticlePage from '@/pages/blog-article';

const queryClient = new QueryClient();

/** Client-side redirect — replaces history entry so back-button works correctly */
function Redirect({ to }: { to: string }) {
  const [, navigate] = useLocation();
  useEffect(() => { navigate(to, { replace: true }); }, []);
  return null;
}

/* ── Ledger-turn page transition ───────────────────────────
   1. Outgoing: fades + slips UP 8px (150ms)
   2. Rule sweeps L→R across top of viewport (300ms, overlaps both phases)
   3. Incoming: snaps to +8px below, then rises into place (160ms)
   All effects respect prefers-reduced-motion.
─────────────────────────────────────────────────────────── */
type TransPhase = 'idle' | 'out' | 'in-start' | 'in';

function Router() {
  const [location] = useLocation();
  const [phase, setPhase] = useState<TransPhase>('idle');
  const prevKey = useRef(location);

  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (location === prevKey.current) return;
    if (prefersReduced) { prevKey.current = location; return; }

    prevKey.current = location;
    setPhase('out');

    const t1 = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setPhase('in-start');
      // Two rAFs ensure the in-start style is painted before we animate to in
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('in')));
    }, 150);

    const t2 = setTimeout(() => setPhase('idle'), 310);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location, prefersReduced]);

  const ruleActive = phase !== 'idle';

  const pageStyle: React.CSSProperties = prefersReduced ? {} : (() => {
    switch (phase) {
      case 'out':
        return { opacity: 0, transform: 'translateY(-8px)', transition: 'opacity 150ms ease, transform 150ms ease' };
      case 'in-start':
        return { opacity: 0, transform: 'translateY(8px)', transition: 'none' };
      case 'in':
        return { opacity: 1, transform: 'translateY(0)', transition: 'opacity 160ms ease, transform 160ms ease' };
      default:
        return {};
    }
  })();

  return (
    <RoutedErrorBoundary>
      {/* Recovered-green rule that sweeps L→R during every route change */}
      {!prefersReduced && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-[200] h-[1px] bg-recovered pointer-events-none"
          style={{
            transform: ruleActive ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: ruleActive
              ? 'transform 300ms ease-out'
              : 'transform 0ms 300ms', // instant retract after 300ms hold
          }}
        />
      )}

      <div style={pageStyle}>
        <Switch>
          <Route path="/"            component={HomePage} />
          <Route path="/contact-us"  component={ContactPage} />
          <Route path="/contact-us/" component={ContactPage} />
          <Route path="/careers"     component={CareersPage} />
          <Route path="/careers/"    component={CareersPage} />
          <Route path="/blog"        component={BlogListPage} />
          <Route path="/blog/"       component={BlogListPage} />
          <Route path="/blog/:slug"  component={BlogArticlePage} />
          <Route path="/blog/:slug/" component={BlogArticlePage} />
          {/* ── Legacy URL redirects (old site served articles at root level) ── */}
          {/* Direct article → new /blog/ location */}
          <Route path="/a-journey-of-compassion-my-service-trip-to-the-dr"  component={() => <Redirect to="/blog/a-journey-of-compassion-my-service-trip-to-the-dr/" />} />
          <Route path="/a-journey-of-compassion-my-service-trip-to-the-dr/" component={() => <Redirect to="/blog/a-journey-of-compassion-my-service-trip-to-the-dr/" />} />
          <Route path="/when-is-the-right-time-to-partner-with-a-commercial-collections-firm"  component={() => <Redirect to="/blog/when-is-the-right-time-to-partner-with-a-commercial-collections-firm/" />} />
          <Route path="/when-is-the-right-time-to-partner-with-a-commercial-collections-firm/" component={() => <Redirect to="/blog/when-is-the-right-time-to-partner-with-a-commercial-collections-firm/" />} />
          {/* Articles not ported → blog index */}
          <Route path="/revenue-based-financing-grow"   component={() => <Redirect to="/blog/" />} />
          <Route path="/revenue-based-financing-grow/"  component={() => <Redirect to="/blog/" />} />
          <Route path="/economic-pulse-octob-2023"   component={() => <Redirect to="/blog/" />} />
          <Route path="/economic-pulse-octob-2023/"  component={() => <Redirect to="/blog/" />} />
          <Route path="/what-the-q3-delinquency-rates-mean-for-the-us-economy"   component={() => <Redirect to="/blog/" />} />
          <Route path="/what-the-q3-delinquency-rates-mean-for-the-us-economy/"  component={() => <Redirect to="/blog/" />} />
          <Route path="/credit-card-debt-in-q3-rising-consumer-confidence-and-increased-spending"   component={() => <Redirect to="/blog/" />} />
          <Route path="/credit-card-debt-in-q3-rising-consumer-confidence-and-increased-spending/"  component={() => <Redirect to="/blog/" />} />
          <Route path="/economic-pulse-september-2023"   component={() => <Redirect to="/blog/" />} />
          <Route path="/economic-pulse-september-2023/"  component={() => <Redirect to="/blog/" />} />
          <Route path="/the-importance-of-ethical-recovery-services-in-maintaining-trust-in-the-economy"   component={() => <Redirect to="/blog/" />} />
          <Route path="/the-importance-of-ethical-recovery-services-in-maintaining-trust-in-the-economy/"  component={() => <Redirect to="/blog/" />} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
