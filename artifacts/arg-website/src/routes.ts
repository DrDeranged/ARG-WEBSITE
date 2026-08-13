/**
 * Central route registry — single source of truth for page paths, meta,
 * og fields, and nav labels. Consumed by App.tsx (route generation),
 * Shell.tsx (nav links), and the sitemap.
 *
 * Adding a new page:
 *   1. Add an entry here.
 *   2. Register a <Route> in App.tsx (see the PAGE_COMPONENTS map there).
 *   3. Copy src/pages/_template.tsx → your new page file.
 *   4. Follow DESIGN-SYSTEM.md and the README audit checklist.
 *
 * Dynamic routes (e.g. /blog/:slug) are intentionally excluded — they have
 * no fixed canonical URL and are handled directly in App.tsx.
 */

export const SITE_ORIGIN = 'https://advancedrecoverygroup.com';

export interface RouteConfig {
  /** Canonical path. Use a trailing slash for all paths except '/'. */
  path: string;
  /** <title> tag value */
  title: string;
  /** <meta name="description"> value (≤160 chars) */
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Present when the route should appear in header/footer nav, in array order */
  nav?: { label: string };
}

export const ROUTES: RouteConfig[] = [
  {
    path: '/',
    title: 'Advanced Recovery Group — B2B Commercial Collections',
    description:
      "B2B commercial collections on a contingency basis. We recover what you're owed — MCA, factoring, equipment leasing, and commercial loans.",
    nav: { label: 'Home' },
  },
  {
    path: '/contact-us/',
    title: 'Contact Us | Advanced Recovery Group',
    description:
      'Place an account or request a consultation with Advanced Recovery Group, a commercial collections agency serving MCA funders, factors, lessors, and lenders.',
    ogTitle: 'Contact Us | Advanced Recovery Group',
    ogDescription:
      'Place an account or request a consultation with Advanced Recovery Group, a commercial collections agency serving MCA funders, factors, lessors, and lenders.',
    nav: { label: 'Contact Us' },
  },
  {
    path: '/careers/',
    title: 'Careers | Advanced Recovery Group',
    description:
      'Join Advanced Recovery Group — a fast-paced, results-driven commercial collections firm in Fairfield, NJ. Current opening: Collections Recovery Specialist.',
    nav: { label: 'Careers' },
  },
  {
    path: '/blog/',
    title: 'Blog | Advanced Recovery Group',
    description:
      'Insights and analysis on B2B commercial debt recovery, collections law, and the economy.',
    nav: { label: 'Blog' },
  },
];

/**
 * Ordered nav links derived from ROUTES.
 * Shell.tsx header, mobile menu, and footer consume this directly —
 * adding a page to ROUTES with a nav label auto-adds it to all three navs.
 */
export const NAV_LINKS = ROUTES
  .filter(r => r.nav)
  .map(r => ({ label: r.nav!.label, path: r.path }));
