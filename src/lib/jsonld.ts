import type { CollectionEntry } from 'astro:content';
import { splitAuthors } from './authors';
import { extractDoi } from './content';
import { absoluteUrl, isProfileUrl } from './urls';

const SITE = 'https://jcernuda.com';

export interface PersonInput {
  name: string;
  image: string;
  email: string;
  socialLinks: Array<{ url: string }>;
}

/** JSON-LD Person for the home page. sameAs is derived from real profile links only. */
export function personJsonLd(input: PersonInput): Record<string, unknown> {
  const sameAs = input.socialLinks.map((l) => l.url).filter(isProfileUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    alternateName: 'Jaime Cernuda Garcia',
    jobTitle: 'Assistant Research Professor',
    worksFor: {
      '@type': 'Organization',
      name: 'Gnosis Research Center, Illinois Institute of Technology',
      url: 'https://grc.iit.edu',
    },
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'Illinois Institute of Technology',
      url: 'https://www.iit.edu',
    },
    url: SITE,
    image: new URL(input.image, SITE).href,
    email: `mailto:${input.email}`,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** JSON-LD ScholarlyArticle for a publication page. */
export function articleJsonLd(
  entry: CollectionEntry<'publications'>,
  canonical: string,
  description: string,
): Record<string, unknown> {
  const { title, authors, year, venue, tags, links, citation } = entry.data;
  const doi = extractDoi(links, citation);
  const pdf = links.pdf ? absoluteUrl(links.pdf) : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: title,
    name: title,
    abstract: description,
    author: splitAuthors(authors).map((a) => ({ '@type': 'Person', name: a.name })),
    datePublished: String(year),
    isPartOf: { '@type': 'Periodical', name: venue },
    keywords: tags.join(', '),
    inLanguage: 'en',
    url: canonical,
    ...(doi ? { sameAs: `https://doi.org/${doi}`, identifier: doi } : {}),
    ...(pdf
      ? { encoding: { '@type': 'MediaObject', contentUrl: pdf, encodingFormat: 'application/pdf' } }
      : {}),
  };
}
