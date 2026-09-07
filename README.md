# jcernuda.com

Personal academic site for Jaime Cernuda. Built with Astro 7 as a fully static site and deployed to GitHub Pages on every push to `master` (see `.github/workflows/deploy.yml`).

## Commands

```
npm install        # install dependencies
npm run dev        # local dev server at http://localhost:4321
npm run build      # static build into dist/
npm run preview    # serve dist/ locally
npm run check      # type-check .astro and .ts files
```

## Content

All content lives in `src/content` and is validated by the Zod schemas in `src/content.config.ts`.

- Add a paper: create `src/content/publications/<slug>.md` with the same frontmatter as the existing files. The slug becomes the URL `/publications/<slug>`.
- Add a project: create `src/content/projects/<slug>.md`.
- Add a blog post: create `src/content/blog/<slug>.md` and add the slug to `posts` in `src/content/pages/blog.yaml`.
- Add a news item: prepend an entry to `news` in `src/content/site/news.yaml`.
- Home page selections (featured projects, featured and selected publications) are slugs in `src/content/site/home.yaml`; a wrong slug fails the build.

PDFs go in `public/papers`, figures in `public/images/publications/<slug>`.

## Icons

Icons are Material Symbols rendered from a self-hosted subset font in `public/fonts`. When a new icon name is used, regenerate the subset (icon names sorted, comma separated):

```
curl -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&icon_names=account_balance,arrow_back,...&display=block"
```

Download the woff2 URL from that CSS to `public/fonts/material-symbols-outlined-subset.woff2`.
