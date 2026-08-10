# Advanced Recovery Group Website

A full marketing website for Advanced Recovery Group (ARG), a commercial B2B debt collections agency. Multi-page site with a "financial ledger" design aesthetic, built with React + Vite + Tailwind CSS.

## Run & Operate

- `pnpm --filter @workspace/arg-website run dev` — run the website (port auto-assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS v4
- Routing: wouter (client-side)
- API: Express 5 (shared api-server artifact)
- DB: PostgreSQL + Drizzle ORM (provisioned, not yet used by the site)
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `artifacts/arg-website/` — the marketing website
- `artifacts/arg-website/src/pages/` — page components (HomePage, ContactPage, CareersPage, BlogListPage, BlogArticlePage)
- `artifacts/arg-website/public/images/` — all brand assets (logos, hero, team, charity photos)
- `artifacts/api-server/` — shared Express API server
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)

## Design System

- **ink** `#101F30` — headlines, footer bg, primary buttons
- **paper** `#FFFFFF` — page background
- **mist** `#F3F6F9` — alternate section bg
- **slate** `#4A5A6E` — body text
- **recovered** `#1E7A5A` — accent (CTAs, key numbers, link hovers)
- **rule** `#D8DFE6` — all borders and dividers
- Fonts: Source Serif 4 (headings), Public Sans (body), IBM Plex Mono (numbers/labels)
- Aesthetic: "financial ledger" — 1px rule separators, no card shadows, no gradients, max 4px radius

## Pages

- `/` — Homepage (hero, Why ARG, process, industries, team, charity/FMSC, blog preview, CTA)
- `/contact-us/` — Contact page with form
- `/careers/` — Careers page with open roles
- `/blog/` — Blog list
- `/blog/[slug]/` — Blog article pages (2 articles live: collections firm, DR trip)

## Architecture decisions

- Frontend-only site (no backend calls yet); all content is static in page components
- Images served from `public/images/` — all assets pre-loaded from attached_assets
- Contact form is UI-only; needs API integration to actually send emails (Task #1)
- Blog articles are hardcoded in BlogArticlePage.tsx keyed by slug

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `index.css` @import for Google Fonts must come before `@import 'tailwindcss'` — Tailwind v4 requires imports in this order
- The `@layer utilities {}` block must be a proper block with its opening brace on the same line — orphaned CSS after the block will cause "Missing opening {" errors in Tailwind's Vite plugin
- Images are at `/images/filename` (public/images/), not `/public/images/`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `attached_assets/CONTENT-NOTES_1786377771241.md` for full content brief and blog article list
