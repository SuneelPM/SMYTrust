/**
 * Prefix a root-relative path with the configured base path.
 *
 * Production (Hostinger) serves from the apex domain, so BASE_URL is "/" and
 * this is a no-op. GitHub Pages serves from https://<user>.github.io/<repo>/,
 * where every internal link and asset must carry that prefix or 404.
 *
 * Astro rewrites imported assets automatically but leaves hand-written
 * href/src strings untouched, so those must go through this helper.
 */
export function withBase(pathname: string): string {
  // Leave absolute URLs, anchors, and protocol links (mailto:, tel:) alone.
  if (!pathname.startsWith('/')) return pathname;

  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
  if (!base) return pathname;

  // Idempotent: a value may pass through here twice (once where a path prop is
  // supplied, again inside the component that renders it). Applying the prefix
  // a second time would produce /base/base/... , so bail out if it is present.
  if (pathname === base || pathname.startsWith(base + '/')) return pathname;

  return `${base}${pathname}`.replace(/\/{2,}/g, '/');
}

/** Convenience alias — short enough to use inline in templates. */
export const u = withBase;

/**
 * Inverse of withBase: remove the configured base prefix from a path.
 *
 * Components that inspect a path (e.g. to look up generated image variants)
 * must work on the raw, unprefixed form, because a caller may already have
 * passed the value through withBase().
 */
export function stripBase(pathname: string): string {
  if (!pathname.startsWith('/')) return pathname;

  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
  if (!base) return pathname;

  if (pathname === base) return '/';
  return pathname.startsWith(base + '/') ? pathname.slice(base.length) : pathname;
}
