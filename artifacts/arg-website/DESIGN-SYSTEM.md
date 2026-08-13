# ARG Design System

> **Constitution for the Advanced Recovery Group website.**
> Every new page and component must satisfy every law below.
> When in doubt, look at an existing page — copy the pattern, don't invent.

---

## 1. Color Tokens

Defined in `src/index.css` under `@layer base`. Use Tailwind utility names only — never hex values inline.

| Token | Tailwind class | Purpose |
|---|---|---|
| `--color-ink` | `bg-ink` / `text-ink` | Primary dark (navy-black). Headings, body text, dark sections. |
| `--color-paper` | `bg-paper` / `text-paper` | Off-white. Page background, card surfaces, reversed text on dark. |
| `--color-mist` | `bg-mist` / `text-mist` | Light cool grey. Alternate section BG, input fills, subtle surfaces. |
| `--color-slate` | `text-slate` | Medium grey. Secondary body text, labels, metadata. |
| `--color-recovered` | `bg-recovered` / `text-recovered` | ARG green. Primary CTA, accent marks, active states, open/positive. |
| `--color-rule` | `border-rule` / `bg-rule` | Hairline separator. Always 1px. Never use a shadow instead. |
| `--color-recovered-bright` | `text-recovered-bright` / `hover:bg-recovered-bright` | Brighter green for hover/active states on green elements. |
| `--color-signal` | `text-signal` / `bg-signal` | Amber. **Moderate/warning states only.** Never use as a brand accent. |

**Rule:** No Tailwind generic grays (`gray-*`, `zinc-*`, etc.) in page code — always use the six tokens above. The error-boundary and dev-only surfaces may use `bg-mist border-rule` as the neutral surface.

---

## 2. Typography

Font stack loaded via `@font-face` in `src/index.css`. Three roles, no exceptions.

| Role | Font | Tailwind class | Used for |
|---|---|---|---|
| Display / Serif | Source Serif 4 | `font-serif` | Page headlines (`h1`, `h2`), large pull quotes, footer statement |
| Body / Sans | Public Sans | `font-sans` | Paragraphs, form labels, nav links, general UI text |
| Mono / Label | IBM Plex Mono | `font-mono` | Eyebrow labels, data values, phone/email, stat numbers, ledger rows |

**Rules:**
- Mono numbers **always** carry `tabular-nums` to prevent layout shift.
- Eyebrow labels: `font-mono text-[10px] uppercase tracking-[0.18em] text-slate` — do not vary this.
- Marketing headlines: sentence case, not Title Case ("We recover what you're owed" not "We Recover What You're Owed").
- Headline sizing: use `clamp()` for fluid type or the preset scale (`text-h1`, `text-h2` from index.css).

---

## 3. Layout Laws

- **Max content width:** `max-w-6xl mx-auto px-6 md:px-8` — every section content wrapper uses this. Never use a wider container.
- **Section padding scale:**
  - Tall sections: `py-24 md:py-32`
  - Standard sections: `py-16 md:py-20`
  - Compact sections: `py-12 md:py-16`
  - Page headers (light): `pt-32 pb-10 md:pt-48 md:pb-10`
- **Separators:** `1px border-rule` only. No `box-shadow`, no `drop-shadow`. Use `border-b border-rule` between sections.
- **Radii:** `rounded-sm` (2px) for interactive elements. Never exceed `rounded` (4px) for ARG surfaces. Larger radii feel consumer; ARG is institutional.
- **Sections are opaque:** every `<section>` has an explicit background color (`bg-paper`, `bg-mist`, `bg-ink`). No transparent section backgrounds — they cause compositing glitches and white flashes on scroll.
- **Viewport units:** Use `svh` with a `vh` fallback for layout-sizing heights. Use the `.h-svh` / `.min-h-svh` utility classes defined in `index.css`. Never use `vh` alone for layout heights.

```css
/* Correct — declared in index.css as .h-svh */
height: 100vh;   /* fallback */
height: 100svh;  /* svh for browsers that support it */
```

---

## 4. Motion Laws

All scroll-driven animation goes through the **ScrollDirector** (`src/motion/director.ts`). Never create `ScrollTrigger` instances directly in page code.

| Concern | Rule |
|---|---|
| Reveals | `createReveal(el, { id, onEnter })` — one call per element, IO-backed, fires once |
| Cinema pins | `createCinema(el, { id, end, ... })` — wraps pin + scrub in one call |
| Scrub pins | `createPinScrub(el, { id, ... })` — for non-cinema pinned scrubs |
| Pin gating | **All pins must be created inside `gsap.matchMedia('(min-width: 768px)')`** — zero `.pin-spacer` elements on mobile |
| Pin budget | **Maximum 2 pins per page.** Any new pin requires a comment justifying why it exists. |
| Properties | `transform` and `opacity` only. Never animate `height`, `width`, `top`, `left`, `margin`, `padding`. |
| Geometry | Establish all scroll geometry at init (inside `useLayoutEffect`, before user can scroll). Never add a pin after the entrance animation fires. |
| Reduced motion | Check `useMotion().reducedMotion`. When `true`, render **settled states** — no animation, no GSAP calls. |
| IDs | Every `createReveal`/`createCinema`/`createPinScrub` call must pass a unique `id` string. Use `FPSOverlay` (`?debugfps=1`) to assert zero duplicate IDs. |

```tsx
// Correct reveal registration
const mm = gsap.matchMedia();
mm.add('(min-width: 768px)', () => {
  createPinScrub(ref.current, { id: 'my-pin', end: '+=100%' });
  return () => { /* cleanup */ };
});
```

---

## 5. Media Laws

- **All video** goes through `<AmbientVideo>` (`src/components/AmbientVideo.tsx`). Never use a raw `<video>` element.
- **Poster required** on every `AmbientVideo`. Must resolve to an existing file in `public/videos/`. Verify with `curl -o /dev/null -w "%{http_code}"`.
- **No webm for `hands-ledger`** — pass `mp4` + `poster` only (the webm is corrupt).
- **Clip size:** ≤ 4 MB per clip. Check with `ls -lh public/videos/`.
- **Honesty rule for labels:** The `label` prop on `AmbientVideo` / `CinemaBand` must truthfully describe the footage. Licensed b-roll → "COLLECTIONS IN MOTION". Never label b-roll as "Our team" or "Our office" unless it actually is.
- **bg-ink backstop:** Every video section has `bg-ink` on the `<section>` so it renders intentionally when video is blocked or slow.

---

## 6. Content Laws

- **No invented facts.** Do not create phone numbers, email addresses, hours, statistics, prices, staff names, case outcomes, or URLs that haven't been verified against the real business.
- **Unknown = ask.** If a fact is needed but not in the existing codebase, ask the user instead of inventing it.
- **`[CONFIRM]` flag.** If a claim cannot be verified from the codebase and must be drafted anyway (e.g. job description copy), wrap it in a `{/* [CONFIRM] */}` comment so it can be reviewed before publishing.
- **Portal URL:** Always `https://app.simplicitycollect.com/Login.aspx` — never `portal.advancedrecoverygroup.com` or any other invented URL.

---

## 7. Shared Section Components

Extract, don't duplicate. When two pages share a structural pattern, use a shared component from `src/components/`.

| Component | File | Use for |
|---|---|---|
| `PageHeader` | `PageHeader.tsx` | Light (paper bg) or cinema (ink + video) page header with entrance animation |
| `LedgerRow` | `LedgerRow.tsx` | Tappable contact row: label + value + clipboard copy on desktop |
| `MiniLedgerList` | `MiniLedgerList.tsx` | Numbered steps list with sequential draw animation |
| `CinemaBand` | `CinemaBand.tsx` | Full-bleed ambient video band with overlay content slot |
| `CloserBand` | `CloserBand.tsx` | Ink CTA band with optional video bg — page-closing section |

---

## 8. Standing Rules

These apply to every agent session, every prompt, without exception.

1. **No refactors outside prompt scope.** If the prompt asks to add a contact section, only touch contact-related files. Do not clean up unrelated components.
2. **No model-string substitutions.** Do not replace real copy (phone numbers, addresses, URLs, company names) with placeholder text. If you don't know the value, add a `[CONFIRM]` flag.
3. **Push via Git pane.** The agent shell cannot authenticate to push. Commits accumulate locally; the user pushes via the Replit Git pane.
4. **TSC must be clean** before committing. Run `pnpm --filter @workspace/arg-website exec tsc --noEmit`.
5. **Screenshot at 375px** before marking any page change complete.
