# Sri Matha Yellamanba Services — website

Static website for a registered service organisation in Visakhapatnam, rebuilt from
[smyservices.org](https://smyservices.org).

**Stack:** Astro 7 (static output) · Tailwind CSS 4 · GSAP 3 + ScrollTrigger · Lenis ·
sharp (build-time image optimisation). No server, no database — deploys to Hostinger
shared hosting.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Optimise images → build to `dist/` → verify |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run optimize` | Regenerate WebP variants only |
| `npm run verify` | Re-run the link/image/SEO checks on `dist/` |

`build` runs `optimize` before and `verify` after, so a broken link or missing image fails
the build rather than reaching production.

---

## Project layout

```
public/
  images/            131 photos, pulled from the original site's media library
  opt/               generated WebP variants (git-ignored, rebuilt on demand)
  .htaccess          Hostinger/Apache config: HTTPS, caching, old-URL redirects
src/
  data/
    site.ts          ALL text content — the single place to edit copy
    media.ts         auto-generated gallery/activity image manifests
  components/        Header, Footer, HeroCarousel, Picture, Lightbox, …
  layouts/           BaseLayout (SEO + shell), LegalLayout
  lib/motion.ts      Lenis + GSAP: reveals, split text, counters, parallax
  pages/             one file per route
scripts/
  optimize-images.mjs  sharp pipeline, caches by mtime
  verify.mjs           post-build link/image/SEO checks
```

### Editing content

Almost all copy lives in **`src/data/site.ts`**. Change the text there and it updates
everywhere it appears. You should rarely need to touch a `.astro` file to change wording.

To add gallery photos: drop files into `public/images/`, then add them to the `gallery`
array in `src/data/media.ts`.

---

## Deploying to Hostinger

1. **Build**

   ```bash
   npm run build
   ```

   This produces `dist/`. Confirm it ends with `VERIFY OK`.

2. **Upload**

   Open **hPanel → File Manager**, go to `public_html/`, and upload the **contents** of
   `dist/` (not the `dist` folder itself). `.htaccess` is included in the build — make sure
   hidden files are visible in File Manager so it uploads too.

   Faster alternative, if you have SSH on your plan:

   ```bash
   rsync -avz --delete dist/ user@your-server:~/public_html/
   ```

3. **Enable HTTPS**

   hPanel → Security → SSL. Install the free certificate. The `.htaccess` already forces
   HTTPS and redirects `www` to the bare domain.

4. **Point the domain**

   If the domain still serves the old WordPress site, either delete the old install first or
   move it aside. The `.htaccess` redirects old URLs (`/about-us/`, `/contact-us/`,
   `/donate-now/`, old `/wp-content/uploads/…` image paths) to the new ones so existing
   links and search rankings survive.

5. **Submit the sitemap**

   `https://smyservices.org/sitemap-index.xml` → Google Search Console.

### Environment variables

Create `.env` in the project root (never commit it):

```
PUBLIC_WEB3FORMS_KEY=your-key-from-web3forms.com
```

Only needed for the contact form. See `CONTENT-TODO.md`.

---

## Performance

Measured on the built output:

| | Size |
| --- | --- |
| HTML + CSS + JS, gzipped | ~58 KB |
| GSAP + ScrollTrigger + Lenis, gzipped | 49 KB of that |
| Hero image (1600w WebP) | ~110 KB |
| Source images | 22.4 MB → 12 MB of WebP variants |

Every image is served as a responsive `<picture>` with WebP `srcset` and the original JPEG/PNG
as fallback. Images below the fold are lazy-loaded; the first hero image is preloaded with
`fetchpriority="high"`.

## Accessibility

- Skip-to-content link, visible focus rings throughout.
- Hero carousel: pause/play, arrows, keyboard arrow keys, touch swipe, `aria-live` slide
  announcements, and only the visible slide's links in the tab order.
- All animation is disabled and the carousel stops auto-advancing under
  `prefers-reduced-motion: reduce`.
- Lightbox traps nothing but restores focus on close and supports Escape/arrow keys.

## SEO

Per-page `<title>`, meta description, canonical URL, Open Graph and Twitter card tags.
`NGO` schema.org JSON-LD with the registered address and contact details. Sitemap generated
at build. Content is server-rendered static HTML, so crawlers and link previews see it
without executing JavaScript.

---

## Before you launch

Read **`CONTENT-TODO.md`**. It lists the content gaps carried over from the original site —
most importantly the contact-form key, the social media URLs, and confirmation of the
headline statistics.
