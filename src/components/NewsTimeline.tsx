import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/ui/timeline';
import { yearOf } from '@/lib/dates';

export interface NewsItem {
  date: string;
  title: string;
  description: string;
  link: string;
}

interface Props {
  items: NewsItem[];
  /** "compact" is the home page column, "full" is the news archive. */
  variant?: 'compact' | 'full';
}

/**
 * News timeline built on the ReUI Timeline. Rendered statically from Astro
 * (no client directive), so it ships no JavaScript. Composed in one React
 * file because the Timeline items read a React context from their parent.
 */
export default function NewsTimeline({ items, variant = 'full' }: Props) {
  const compact = variant === 'compact';
  let lastYear: string | null = null;

  return (
    <Timeline defaultValue={items.length} className={compact ? 'gap-0' : 'gap-0'}>
      {items.map((item, i) => {
        const year = yearOf(item.date);
        const showYear = Boolean(year) && year !== lastYear;
        if (year) lastYear = year;
        const linked = item.link && item.link !== '#';
        const title = linked ? (
          <a href={item.link} className="hover:text-primary transition-colors">
            {item.title}
          </a>
        ) : (
          item.title
        );

        return (
          <TimelineItem
            key={`${item.date}-${item.title}`}
            step={i + 1}
            className={compact ? 'not-last:pb-6' : 'md:ms-12 not-last:pb-12'}
          >
            {showYear && (
              <div
                className={
                  compact
                    ? 'flex items-center gap-3 mb-3'
                    : 'mb-6'
                }
              >
                <span
                  className={
                    compact
                      ? 'text-xs font-bold text-gray-400 dark:text-gray-500'
                      : 'text-2xl font-bold text-gray-900 dark:text-white'
                  }
                >
                  {year}
                </span>
                {compact && <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />}
              </div>
            )}
            <TimelineIndicator
              className={
                compact
                  ? 'size-3.5 bg-white dark:bg-surface-dark border-2 border-primary top-1!'
                  : 'size-4 bg-white dark:bg-surface-dark border-4 border-primary top-1.5!'
              }
              style={showYear ? { top: compact ? '2.25rem' : '3.75rem' } : undefined}
            />
            <TimelineSeparator className="bg-gray-200 dark:bg-gray-800" />
            <TimelineHeader
              className={compact ? '' : 'flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2'}
            >
              {compact ? (
                <>
                  <TimelineDate className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {item.date}
                  </TimelineDate>
                  <TimelineTitle className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">
                    {title}
                  </TimelineTitle>
                </>
              ) : (
                <>
                  <TimelineTitle className="text-xl font-bold text-gray-900 dark:text-white">{title}</TimelineTitle>
                  <TimelineDate className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0 mb-0">
                    {item.date}
                  </TimelineDate>
                </>
              )}
            </TimelineHeader>
            <TimelineContent
              className={
                compact
                  ? 'text-xs text-gray-600 dark:text-gray-400 leading-relaxed'
                  : 'text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl'
              }
            >
              {item.description}
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
