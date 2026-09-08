import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Return the public path when the file exists under public/, otherwise
 * undefined. Lets templates fall back cleanly instead of rendering a broken
 * image for a path that is still a placeholder.
 */
export function existingPublicImage(path: string | undefined): string | undefined {
  if (!path || !path.startsWith('/')) return path;
  return existsSync(join(process.cwd(), 'public', path)) ? path : undefined;
}
