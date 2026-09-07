/** Format a Date as "Aug 15, 2023" using UTC so ISO date-only values never shift a day. */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Extract the first four-digit year from a label such as "Dec 2025". */
export function yearOf(label: string): string | null {
  const m = label.match(/\d{4}/);
  return m ? m[0] : null;
}
