# PityHub - Genshin Impact Pity & Wish Calculators

**Live domain:** `pitycalc.top` · **Stack:** [Astro](https://astro.build) 5 (100% static) · **Deploy target:** Cloudflare Pages

A complete, final static tool site (not an MVP): four interactive calculators built on one
exact, test-verified probability engine, a starry-dark design system, SEO-structured content,
and Cloudflare Pages configuration included.

## Tools

| Page | What it does |
| --- | --- |
| `/pity-calculator/` | Pity counter + 50/50 state + Capturing Radiance (+ Epitomized Path for weapons) → exact probability of the target 5★ within N wishes, with an interactive probability curve. Shareable URL state + localStorage. |
| `/wishes-needed/` | Inverse question: wishes needed for 50/80/90/95/99% confidence or a hard guarantee, per banner, with a build-time-verified cheat sheet. |
| `/savings-planner/` | Wishes needed vs income (F2P / F2P-full / Welkin / Welkin+BP presets or custom rate) → shortfall, patches, days and a calendar ETA. Convention documented on `/methodology/`. |
| `/simulator/` | Documented-rate pull simulation (single sequence + batch up to 10,000 runs) with a live cross-check against the exact dynamic-programming answer. |
| `/faq/`, `/methodology/`, `/guides/*` | FAQ with FAQPage structured data, full model/sources/verification page, and three SEO guides (soft pity, guarantees, Capturing Radiance). |

## The math (snapshot: October 2026)

- Base 5★ rate 0.6% (character/standard), 0.7% (weapon) - official, in-game *Wish → Details*.
- Soft pity: rate ramps from wish **74** (+~6 pts/wish) on character/standard and from **~63**
  (+~7 pts/wish) on weapon - community-measured; reproduces the official consolidated rates
  (1.6% / 1.85%) almost exactly.
- Hard pity **90** / **80** - official.
- 50/50 with guarantee; **Capturing Radiance** (v5.0+) modeled as a 10% rescue on an armed
  losing 50/50 → 55% consolidated, matching the official figure.
- **Epitomized Path** (v5.0+): 1 fate point max; 37.5% per 5★ for the selected weapon otherwise.
- `P(≥1 5★ in N) = 1 − ∏(1 − pᵢ)`; target probabilities via exact forward DP over
  (pity × guarantee/fate state); confidence levels by scanning the DP curve; Monte Carlo shares
  the same state machine (agreement enforced by tests).

### Verified numbers (`npm test`, 19 cases)

| Case | Result |
| --- | --- |
| 62 wishes → 5★ chance (character, pity 0) | **31.1%** - 62.5 is the *mean*; the median is **76** (the spec's "62 ≈ 50%" is a known community mix-up, verified and explained on-site) |
| Mean wishes → 5★ | 62.3 → 1.60% consolidated (official: 1.6%) |
| Weapon mean | 53.2 → 1.88% (official: 1.85%) |
| 90% confidence for a 5★ | 80 wishes |
| Hard pity | 90 wishes = **100%** (and 80 on weapon) |
| Featured character, fresh 50/50 | 50% at **80** · 90% at **155** · mean 93.4 · worst case **180** |
| Monte Carlo vs exact DP | 20,000 runs agree within 1.5 points (observed: 0.1) |

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # vitest - the math verification suite
npm run build      # static output to dist/
npm run preview    # serve dist/ locally
npm run check:links  # verify every internal link/asset in dist/ resolves
```

Optional assets: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/gen-images.ps1`
regenerates `public/og-default.png`, `favicon-32.png`, `apple-touch-icon.png`.

## Deploy to Cloudflare Pages

### Option A - Git integration (recommended)

1. Push this folder to a GitHub/GitLab repo.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build settings:
 - **Framework preset:** Astro
 - **Build command:** `npm run build`
 - **Build output directory:** `dist`
 - **Environment variable:** `NODE_VERSION` = `20` (or 22)
4. Save & deploy. Every push to the production branch redeploys; PRs get preview URLs.

### Option B - Direct upload / CLI

```bash
npm run build
npx wrangler pages deploy dist --project-name=pitycalc-top
# wrangler.toml in this repo already sets pages_build_output_dir = "dist"
```

### Custom domain `pitycalc.top`

1. Add the domain in the Pages project → **Custom domains** → `pitycalc.top` (and `www` if
   desired, with a redirect rule to the apex).
2. If the domain's DNS is already on Cloudflare, the CNAME record is created automatically;
   otherwise add a `CNAME` `pitycalc.top → pitycalc-top.pages.dev`.
3. Follow the redirect suggestion Cloudflare shows for `www` → apex (or add a Bulk Redirect).

### Included Cloudflare files

- `public/_headers` - immutable caching for `/_astro/*`, security headers (CSP, nosniff,
  frame-ancestors, etc.)
- `public/_redirects` - friendly aliases (`/calculator`, `/planner`, `/wishes`, `/sim`,
  `/soft-pity`, … → canonical URLs)
- `public/robots.txt` + generated `sitemap-index.xml` (via `@astrojs/sitemap`, site URL
  `https://pitycalc.top` set in `astro.config.mjs`)

## Project layout

```
src/
  lib/pity.ts        # the engine: rate model, exact DP, confidence search, Monte Carlo
  lib/income.ts      # savings-planner presets + convention (documented)
  lib/icons.ts       # central inline-SVG icon set (server <Icon> + client iconSvg())
  lib/site.ts        # site constants
  styles/global.css  # design system (starry dark: #1a1640 / #e8c268 / #6fd3c7)
  layouts/ components/  pages/
tests/pity.test.ts   # 19 verification cases
scripts/             # gen-images.ps1, check-links.mjs
```

## Quality gates (all passing)

- `npm test` → 19/19 (rate model, community-verified probabilities, DP guarantees, MC↔DP agreement)
- `npm run build` → 12 pages, 0 warnings
- `npm run check:links` → 260/260 internal references resolve
- Browser QA (1380px & 375px): 0 horizontal overflow on all 11 routes, all charts upgrade,
  results match the test-suite numbers exactly (e.g. 51.0% @ 80 fresh; MC 98.6% vs exact 98.5%)
- SEO: unique title/description/canonical/OG per page, FAQPage + WebApplication + Article +
  Breadcrumb JSON-LD, sitemap, robots.txt, themed 404
- A11y: skip link, labelled inputs, fieldset/legend groups, aria-live results, focus-visible
  rings, reduced-motion support, WCAG-AA contrast on core text

## Disclaimer

Unofficial fan tool. Genshin Impact and all related names are trademarks of HoYoverse /
COGNOSPHERE. No game assets are used; all graphics are original. Rates snapshot October 2026 - 
see `/methodology/` for sources and limitations.
