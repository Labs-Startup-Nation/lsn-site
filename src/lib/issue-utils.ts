import type { Issue } from './issue-schema';
import type { Lang } from '../i18n/lang';

export type IssueEntry = { id: string; data: Issue };

/** Newest first. Throws when a file name does not match the issue date (the URL comes from the file name). */
export function sortIssues(entries: IssueEntry[]): IssueEntry[] {
  for (const e of entries) {
    if (e.id !== e.data.date) throw new Error(`Issue file "${e.id}.json" must match its date "${e.data.date}"`);
  }
  return [...entries].sort((a, b) => b.data.date.localeCompare(a.data.date));
}

/** Formats a YYYY-MM-DD date in UTC so the day never shifts with the machine's time zone. */
export function formatIssueDate(date: string, style: 'short' | 'long', lang: Lang = 'en'): string {
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC', day: 'numeric', month: style === 'long' ? 'long' : 'short', year: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`));
}
