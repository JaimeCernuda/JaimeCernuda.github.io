import type { CollectionEntry, CollectionKey } from 'astro:content';
import { markdownToText } from './inlineMarkdown';

type Dated = { data: { year: number; title: string } };

/** Newest first, then by title, so build output is deterministic. */
export function sortByYear<T extends Dated>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title),
  );
}

/** Group a year-sorted list into [year, entries] pairs, newest first. */
export function groupByYear<T extends Dated>(list: T[]): Array<[number, T[]]> {
  const map = new Map<number, T[]>();
  for (const item of sortByYear(list)) {
    const bucket = map.get(item.data.year) ?? [];
    bucket.push(item);
    map.set(item.data.year, bucket);
  }
  return [...map.entries()];
}

/**
 * Strip Markdown and HTML from a body to produce plain text, skipping a
 * leading heading that repeats the title.
 */
export function bodyText(body: string | undefined, title?: string): string {
  if (!body) return '';
  let text = body;
  if (title) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`^#{1,6}\\s*${escaped}\\s*$`, 'm'), '');
  }
  // Paper bodies converted from PDFs start with CCS concepts, keywords, and
  // figure captions. Prefer the text that follows the introduction heading.
  const intro = text.match(/^#{1,6}\s*(?:[IVX0-9]+[.)]?\s*)?INTRODUCTION\s*$/im);
  if (intro && intro.index !== undefined) {
    text = text.slice(intro.index + intro[0].length);
  }
  return text
    .replace(/^\*?Fig(?:ure)?\.?\s*\d+[.:][^\n]*$/gim, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[?(\d+)\]?\]\(#ref-\d+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/^\|.*$/gm, ' ')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** First `max` characters of plain body text, cut at a word boundary. */
export function excerpt(body: string | undefined, max = 160, title?: string): string {
  const text = bodyText(body, title);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return (at > 60 ? cut.slice(0, at) : cut).trim() + '...';
}

/** Meta description for a publication entry. */
export function publicationDescription(entry: CollectionEntry<'publications'>): string {
  if (entry.data.description) return markdownToText(entry.data.description);
  const fromBody = excerpt(entry.body, 160, entry.data.title);
  if (fromBody) return fromBody;
  return `${entry.data.title}. ${entry.data.type} paper at ${entry.data.venue} (${entry.data.year}) by ${entry.data.authors}.`;
}

/** True when an entry has a non-empty Markdown body. */
export function hasBody(entry: { body?: string }): boolean {
  return Boolean(entry.body && entry.body.trim().length > 0);
}

/** Extract a DOI from a links object or a BibTeX citation string. */
export function extractDoi(links: { doi?: string }, citation: string): string | null {
  if (links.doi) return links.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  const m = citation.match(/doi\s*=\s*\{?\s*(?:DOI\s*)?(10\.[^\s},]+)/i);
  return m ? m[1] : null;
}

export type Entry<K extends CollectionKey> = CollectionEntry<K>;
