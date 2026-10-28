// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Production is Cloudflare Pages at https://smytrust.in. A GitHub Pages deploy serves from
 * https://<user>.github.io/<repo>/, so SITE_URL and BASE_PATH let CI override
 * the canonical origin and path prefix without changing production defaults.
 */
const site = process.env.SITE_URL ?? 'https://smytrust.in';
const base = process.env.BASE_PATH ?? undefined;

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/gallery/'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  build: { format: 'directory' },
});
