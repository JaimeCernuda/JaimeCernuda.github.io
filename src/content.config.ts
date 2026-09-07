import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Shared shapes
const socialLink = z.object({
  name: z.string(),
  icon: z.string(),
  url: z.string(),
});

const publicationLinks = z
  .object({
    pdf: z.string(),
    code: z.string(),
    poster: z.string(),
    doi: z.string(),
    slides: z.string(),
    website: z.string(),
  })
  .partial();

// Markdown collections: one file per entry, the file name is the URL slug.
const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    type: z.enum(['Conference', 'Workshop', 'Poster', 'Journal', 'Technical Report']),
    venue: z.string(),
    year: z.number().int(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    links: publicationLinks.default({}),
    citation: z.string(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number().int(),
    category: z.string(),
    featured: z.boolean().default(false),
    status: z.enum(['On-going', 'Completed']),
    tags: z.array(z.string()).default([]),
    links: z.object({ website: z.string(), code: z.string() }).partial().default({}),
    image: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    readTime: z.string(),
    popular: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

// Single-entry data collections: one YAML file each under src/content/site.
const home = defineCollection({
  loader: glob({ pattern: 'home.yaml', base: './src/content/site' }),
  schema: z.object({
    hero: z.object({
      title: z.string(),
      subtitle: z.string(),
      status: z.string(),
      image: z.string(),
      social_links: z.array(socialLink),
    }),
    stats: z.array(z.object({ label: z.string(), value: z.string() })),
    featured_projects: z.array(reference('projects')),
    featured_publication: reference('publications'),
    selected_publications: z.array(reference('publications')),
  }),
});

const cv = defineCollection({
  loader: glob({ pattern: 'cv.yaml', base: './src/content/site' }),
  schema: z.object({
    profile: z.object({
      name: z.string(),
      title: z.string(),
      email: z.string(),
      website: z.string(),
      location: z.string(),
      image: z.string(),
    }),
    summary: z.string(),
    page_subtitle: z.string().optional(),
    education: z.array(
      z.object({
        degree: z.string(),
        school: z.string(),
        year: z.string(),
        details: z.array(z.string()).default([]),
      }),
    ),
    experience: z.array(
      z.object({
        role: z.string(),
        company: z.string(),
        year: z.string(),
        details: z.array(z.string()).default([]),
      }),
    ),
    // Hand-maintained list kept from the old file. The CV page renders the
    // publications collection instead.
    publications: z
      .array(z.object({ title: z.string(), authors: z.string(), venue: z.string() }))
      .optional(),
    skills: z.object({
      languages: z.array(z.string()).default([]),
      tools: z.array(z.string()).default([]),
      spoken: z.array(z.string()).default([]),
    }),
    awards: z
      .array(
        z.object({
          title: z.string(),
          venue: z.string().optional(),
          year: z.string().optional(),
          description: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: 'news.yaml', base: './src/content/site' }),
  schema: z.object({
    title: z.string(),
    news: z.array(
      z.object({
        date: z.string(),
        title: z.string(),
        description: z.string(),
        link: z.string().default('#'),
      }),
    ),
  }),
});

const footer = defineCollection({
  loader: glob({ pattern: 'footer.yaml', base: './src/content/site' }),
  schema: z.object({
    contact: z.object({
      title: z.string(),
      text: z.string(),
      button_text: z.string(),
      email: z.string(),
    }),
    copyright: z.string(),
    social_links: z.array(socialLink),
  }),
});

// List-page headers: publications.yaml, projects.yaml, blog.yaml.
const pages = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/pages' }),
  schema: z.object({
    header: z.object({
      title: z.string(),
      subtitle: z.string(),
      image: z.string().optional(),
      image_dark: z.string().optional(),
    }),
    posts: z.array(reference('blog')).optional(),
    sidebar: z
      .object({
        profile: z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          image: z.string(),
        }),
      })
      .optional(),
  }),
});

export const collections = { publications, projects, blog, home, cv, news, footer, pages };
