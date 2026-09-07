# jcernuda.com

Personal academic site for Jaime Cernuda. Astro 5, static output, deployed to GitHub Pages
(gh-pages branch, custom domain jcernuda.com) by .github/workflows/deploy.yml on push to master.

## Priorities, strictly in order
1. Fast. Prerendered HTML. No client JS unless a component is interactive. Prefer .astro
   components. React only as islands with client:visible or client:idle. Never client:only.
2. Indexable. Every page has title, meta description, canonical, Open Graph tags. Important
   text is always in the initial HTML, never behind tabs, accordions, modals, or fetch calls.
   Sitemap via @astrojs/sitemap, RSS via @astrojs/rss, robots.txt in public/.
3. Complete information. Content lives in src/content as Markdown/YAML with Zod schemas in
   src/content.config.ts. Adding a paper, project, post, or news item means adding one file or
   one entry. Never hardcode content in components.
4. Looks. Tailwind v4 with the tokens in src/styles/global.css (primary #135bec, Space
   Grotesk, light/dark surfaces). shadcn/ReUI components in src/components/ui. Only after 1
   to 3 hold.

## Conventions
- URLs are stable: /, /publications, /publications/<slug>, /projects, /projects/<slug>, /cv,
  /blog, /blog/<slug>, /news, /rss.xml. Do not rename slugs.
- Dark mode is the .dark class on <html>, toggled by a small island, persisted in
  localStorage, with a no-flash inline script in the head.
- Publication frontmatter: title, authors, type, venue, year, featured, tags, links, citation.
  Project frontmatter: title, description, year, category, featured, status, tags, links, image.
- No em dashes in any copy. Plain sentences.
- Before finishing any task: `npm run build`, then confirm dist/ has real text for the pages
  you touched and that no page gained client JS it did not need.
- Use the ReUI MCP to find and install components, the Astro docs MCP for Astro APIs.
