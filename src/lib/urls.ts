const SITE = 'https://jcernuda.com';

/**
 * Normalize a pathname to the canonical route form used by the site:
 * no `.html` suffix (build.format 'file' adds one at build time), `/index`
 * mapped to `/`, and no trailing slash except for the root.
 */
export function cleanPath(pathname: string): string {
  let p = pathname.replace(/\.html$/, '');
  if (p === '' || p === '/index') p = '/';
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p;
}

/** Absolute URL for a site path. */
export function absoluteUrl(path: string, site?: URL | string): string {
  return new URL(cleanPath(path), site ?? SITE).href;
}

/** True when a URL points at a specific profile page rather than a site root. */
export function isProfileUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const u = new URL(url);
    return u.pathname.length > 1 || u.search.length > 0;
  } catch {
    return false;
  }
}
