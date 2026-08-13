# Advanced Recovery Group Website

Next.js-style React SPA for [advancedrecoverygroup.com](https://advancedrecoverygroup.com). Built with React + Vite, Tailwind CSS, GSAP ScrollTrigger, and Lenis smooth scroll.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite |
| Routing | Wouter |
| Styling | Tailwind CSS v4 (tokens in `src/index.css`) |
| Animation | GSAP + ScrollTrigger via `src/motion/director.ts` |
| Smooth scroll | Lenis (`syncTouch: false` — native touch feel) |
| Forms | React Hook Form + Zod |
| SEO | react-helmet-async |

## Project Structure

```
src/
├── pages/            # One file per route
│   ├── _template.tsx # ← Copy this to start a new page
│   ├── home.tsx
│   ├── contact.tsx
│   ├── careers.tsx
│   ├── blog-list.tsx
│   └── blog-article.tsx
├── components/
│   ├── layout/
│   │   └── Shell.tsx        # Header, footer, nav, palette, ARG Assist
│   ├── PageHeader.tsx        # Light + cinema page header variants
│   ├── LedgerRow.tsx         # Tappable label+value row (phone, email, fax)
│   ├── MiniLedgerList.tsx    # Numbered steps list with draw animation
│   ├── CinemaBand.tsx        # Full-bleed video band with overlay slot
│   ├── CloserBand.tsx        # Ink CTA band (page-closing section)
│   ├── AmbientVideo.tsx      # All video goes through this — never raw <video>
│   └── EditorialImage.tsx    # All editorial images
├── motion/
│   ├── director.ts           # ScrollDirector — createReveal / createCinema / createPinScrub
│   ├── MotionProvider.tsx    # Lenis + GSAP context, reducedMotion, ready flag
│   └── index.ts
└── routes.ts                 # ← Central route registry (paths, titles, og fields, nav)
```

## Adding a New Page

1. **Register the route** in `src/routes.ts`:
   ```ts
   {
     path: '/my-page/',
     title: 'My Page | Advanced Recovery Group',
     description: '≤160 char description.',
     nav: { label: 'My Page' },   // omit nav if not in header
   }
   ```
   Adding a `nav` entry automatically adds it to the header, mobile menu, and footer nav — no Shell.tsx edits needed.

2. **Register the component** in `src/App.tsx` → `PAGE_COMPONENTS`:
   ```ts
   const PAGE_COMPONENTS = {
     ...
     '/my-page/': MyPage,
   };
   ```

3. **Create the page file** — copy `src/pages/_template.tsx` → `src/pages/my-page.tsx` and work through the TODOs. The template includes wired examples of every pattern (meta, header, reveals, video band, steps, closer band).

4. **Follow `DESIGN-SYSTEM.md`** — every law applies, no exceptions.

5. **Audit checklist before pushing:**
   - [ ] `<Helmet>` present with title, description, og:title, og:description, og:url
   - [ ] All scroll reveals registered via `createReveal()` (not raw ScrollTrigger)
   - [ ] All pins inside `gsap.matchMedia('(min-width: 768px)')` and counted (max 2/page)
   - [ ] Screenshot at 375px — dark from first paint, no white bands, no horizontal scroll
   - [ ] `pnpm --filter @workspace/arg-website exec tsc --noEmit` exits clean
   - [ ] No invented facts, URLs, hours, or stats (see DESIGN-SYSTEM.md §6)

## Development

```bash
pnpm --filter @workspace/arg-website run dev
```

App runs at `localhost:$PORT` (assigned by Replit). Preview via the Replit preview pane.

## Pushing Changes

The agent shell cannot authenticate to push. After committing, push via the **Replit Git pane**.

## Design System

See [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) for the full constitution:
color tokens, typography roles, layout laws, motion rules, media rules, content honesty rules, and standing rules.
