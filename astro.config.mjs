import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import imgAttr from 'satteri-imgattr';

// Static site for GitHub Pages at the apex domain.
// build.format 'file' emits publications/hades.html so that GitHub Pages
// serves /publications/hades with a 200 and no redirect. Old links never
// carried a trailing slash, so the URLs stay byte-identical.
export default defineConfig({
  site: 'https://jcernuda.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react(), mdx(), sitemap()],
  markdown: {
    // Smart punctuation is off so that quotes and dashes in the paper
    // bodies render exactly as written.
    processor: satteri({
      features: { smartPunctuation: false },
      // Paper bodies embed up to 16 figures each; defer them until scrolled to.
      hastPlugins: [imgAttr({ defaults: { loading: 'lazy', decoding: 'async' } })],
    }),
  },
  vite: { plugins: [tailwindcss()] },
});
