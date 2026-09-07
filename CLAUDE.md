# CLAUDE.md

Guidance for working in this repository.

## What this is

Static marketing/donation website for **Sri Matha Yellamanba Services**, a registered service
organisation in Visakhapatnam, India. Rebuilt from the original WordPress site at
smyservices.org. Deploys to **Hostinger shared hosting** as plain files — there is no server,
no database, no runtime.

**Stack:** Astro 7 (static output) · Tailwind CSS 4 · GSAP 3 + ScrollTrigger · Lenis ·
sharp (build-time images) · Playwright (visual tests).

## Commands

```bash
npm run dev           # dev server on :4321
npm run build         # optimize images -> build -> verify (all three, in order)
npm run verify        # re-run build checks against dist/
npm run optimize      # regenerate WebP variants only
npm run test:visual   # screenshot every route + assert content reveals (needs dev server)
```

`build` runs `prebuild` (image optimisation) and `postbuild` (verification) automatically.
**A failing check fails the build.** Do not work around `verify.mjs` — fix the cause.

## Architecture

```
src/
  data/site.ts        ALL copy, contact details, bank details, team, services.
                      Single source of truth — edit here, not in .astro files.
  data/media.ts       Generated gallery/activity image manifests.
  lib/motion.ts       Lenis + GSAP. Reveals, split text, counters, parallax.
  components/         Header, Footer, HeroCarousel, PageHero, Picture, Icon,
                      Lightbox, ContactRail, Preloader, StatsBar, CtaBand, CausesGrid.
  layouts/            BaseLayout (SEO + shell), LegalLayout.
  pages/              One file per route.
public/
  images/             131 source photos from the original site's media library.
  opt/                Generated WebP variants (git-ignored).
  .htaccess           Hostinger config: HTTPS, caching, old-WordPress redirects.
scripts/
  optimize-images.mjs sharp pipeline, caches by mtime.
  verify.mjs          Post-build link/image/SEO/CSS checks.
  shoot.mjs           Playwright screenshots + layout assertions.
  scrolltest.mjs      Asserts every revealed element becomes visible on scroll.
```

## Critical gotcha: Astro scoped styles and child components

**This has caused two separate production bugs. Read before styling anything.**

Astro compiles a component's `<style>` rules to `.cls[data-astro-cid-XXXX]`. The scope
attribute is only added to elements written **in that same file**. If you pass a class as a
prop into a child component, the element it lands on will **not** have the scope id, so the
rule silently matches nothing.

```astro
<!-- BROKEN: the <svg>/<img> is rendered inside the child component -->
<Icon name="pin" class="foot__icon" />        <!-- rendered at 300x150 -->
<Picture src={img} class="phero__bg" />       <!-- escaped absolute positioning -->

<!-- CORRECT: put the scoped class on a real element in THIS file -->
<div class="phero__bg"><Picture src={img} class="media-cover" /></div>

<!-- ALSO CORRECT: a global utility class, or a descendant selector -->
<style>.wrapper :global(img) { ... }</style>
```

Rules of thumb:
- Layout (position/size) belongs on an element **in the current file**.
- Classes handed to child components must be **global** (`global.css`) or Tailwind utilities.
- `Icon.astro` takes a `size` prop that emits real `width`/`height` attributes, so icons are
  never dependent on CSS to be sized.

`verify.mjs` detects this automatically and fails the build: it reports any
`.cls[data-astro-cid-…]` rule that matches nothing while `cls` is used on an unscoped element.

## Animation rules

- Everything scroll-driven lives in `initScrollAnimations()` inside a `gsap.matchMedia()`
  block, so `prefers-reduced-motion` gets the final state and triggers tear down cleanly.
- Groups over 8 children use `ScrollTrigger.batch` — the 67-image gallery would otherwise
  stagger the last items seconds behind.
- **Content must never depend on JS to be visible.** `[data-reveal]` starts at
  `visibility:hidden`, so there are three escapes: `revealAll()` in a `try/catch`, a `.no-js`
  CSS rule, and a `prefers-reduced-motion` rule. Keep all three if you touch this.
- Horizontal reveal offsets caused mobile overflow; `html { overflow-x: clip }` contains it.
  Do not switch that to `hidden` — it would create a scroll container.
- The preloader has both a JS timeout and a **pure-CSS 4s auto-dismiss**, so a failed script
  load cannot leave the site behind a permanent overlay.

## Content rules

**Never invent testimonials, beneficiary quotes, statistics, or dated news items.** This is a
real registered charity that publishes a CSR number and is subject to corporate due diligence;
fabricated social proof is a genuine liability. Where content is genuinely missing, render a
visible `.placeholder` block and log it in `CONTENT-TODO.md` instead of writing filler.

Facts already carried over from the original site (statistics, the "12+ years" figure) are
unverified — see `CONTENT-TODO.md`. Do not present them as confirmed.

## Testing expectation

HTTP status codes and grepping built HTML are **not** sufficient — both scoped-style bugs above
passed those checks while the pages were visibly broken. Run `npm run test:visual` and look at
the screenshots in `.shots/` before claiming a UI change works.

## Conventions

- British/Indian English in user-facing copy ("programme", "utilised", "organisation").
- Prices and phone numbers in Indian format; `toLocaleString('en-IN')` for counters.
- Semantic colour tokens only (`var(--c-brand)`), never raw hex in components.
- Every image goes through `Picture.astro` for WebP `srcset`; pass an accurate `sizes`.
- Decorative images take `alt=""`; the verifier enforces that `alt` is always present.
