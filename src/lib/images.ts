import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

// The originals stay in public/ (and keep serving at their old URLs). This map
// lets pages request resized, WebP variants generated at build time instead of
// shipping multi-megabyte PNGs as the largest contentful paint.
const publicImages = import.meta.glob<ImageMetadata>(
  ['/public/images/*.{png,jpg,jpeg}', '/public/images/projects/*.{png,jpg,jpeg}'],
  { eager: true, import: 'default' },
);

export interface OptimizeOptions {
  width: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  quality?: number;
}

/**
 * Build-time optimized URL for an image referenced by its public path
 * (for example "/images/Jaime_2.png"). Falls back to the original path when
 * the file is not one of the known root images.
 */
export async function optimizedImage(publicPath: string, opts: OptimizeOptions): Promise<string> {
  const meta = publicImages[`/public${publicPath}`];
  if (!meta) return publicPath;
  const image = await getImage({
    src: meta,
    width: Math.min(opts.width, meta.width),
    format: opts.format ?? 'webp',
    quality: opts.quality ?? 80,
  });
  return image.src;
}
