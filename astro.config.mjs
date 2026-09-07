// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Production is Hostinger at the apex domain. A GitHub Pages deploy serves from
 * https://<user>.github.io/<repo>/, so SITE_URL and BASE_PATH let CI override
 * the canonical origin and path prefix without changing production defaults.
 */
const site = process.env.SITE_URL ?? 'https://smyservices.org';
const base = process.env.BASE_PATH ?? undefined;

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { format: 'directory' },
});
