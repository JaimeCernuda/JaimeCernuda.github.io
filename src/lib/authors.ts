export interface AuthorToken {
  /** Text to display for this author. */
  name: string;
  /** True when the token is the site owner. */
  me: boolean;
}

/**
 * Split a comma-separated author string into display tokens.
 * Mirrors the old site: any token containing "Jaime Cernuda" is shown as
 * the bold literal "Jaime Cernuda".
 */
export function splitAuthors(authors: string): AuthorToken[] {
  return authors
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
    .map((name) =>
      name.includes('Jaime Cernuda') ? { name: 'Jaime Cernuda', me: true } : { name, me: false },
    );
}
