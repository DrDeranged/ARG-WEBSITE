import { type ReactNode, useEffect, useRef, useState } from 'react';
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

/* ── Page transition wrapper ────────────────────────────── */
function PageTransition({ children, locationKey }: { children: ReactNode; locationKey: string }) {
  const [visible, setVisible] = useState(true);
  const [displayKey, setDisplayKey] = useState(locationKey);
  const prevKey = useRef(locationKey);

  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (locationKey === prevKey.current) return;

    if (prefersReduced) {
      setDisplayKey(locationKey);
      prevKey.current = locationKey;
      return;
    }

    // Fade out → swap content → fade in
    setVisible(false);
    const swap = setTimeout(() => {
      setDisplayKey(locationKey);
      prevKey.current = locationKey;
      window.scrollTo({ top: 0, behavior: 'instant' });
      setVisible(true);
    }, 120);

    return () => clearTimeout(swap);
  }, [locationKey, prefersReduced]);

  if (prefersReduced) return <>{children}</>;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: visible
          ? 'opacity 250ms ease, transform 250ms ease'
          : 'opacity 120ms ease, transform 120ms ease',
      }}
    >
      {children}
    </div>
  );
}

function Router() {
  const [location] = useLocation();

  return (
    <RoutedErrorBoundary>
      <PageTransition locationKey={location}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/contact-us" component={ContactPage} />
          <Route path="/contact-us/" component={ContactPage} />
          <Route path="/careers" component={CareersPage} />
          <Route path="/careers/" component={CareersPage} />
          <Route path="/blog" component={BlogListPage} />
          <Route path="/blog/" component={BlogListPage} />
          <Route path="/blog/:slug" component={BlogArticlePage} />
          <Route path="/blog/:slug/" component={BlogArticlePage} />
          <Route component={NotFound} />
        </Switch>
      </PageTransition>
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
