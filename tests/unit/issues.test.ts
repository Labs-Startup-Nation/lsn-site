import { afterEach, describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { sortIssues, formatIssueDate, type IssueEntry } from '../../src/lib/issue-utils';

const base = JSON.parse(readFileSync('tests/fixtures/issues/2026-01-05.json', 'utf8'));
const entry = (id: string, date = id): IssueEntry => ({ id, data: { ...base, date } });

describe('sortIssues', () => {
  test('newest first', () => {
    const sorted = sortIssues([entry('2026-10-19'), entry('2026-11-02'), entry('2026-10-26')]);
    expect(sorted.map((e) => e.id)).toEqual(['2026-11-02', '2026-10-26', '2026-10-19']);
  });
  test('file name must match the date', () => {
    expect(() => sortIssues([entry('2026-10-27', '2026-10-26')])).toThrow('Issue file "2026-10-27.json" must match its date "2026-10-26"');
  });
});

describe('formatIssueDate', () => {
  const originalTz = process.env.TZ;
  afterEach(() => { process.env.TZ = originalTz; });

  test.each(['UTC', 'America/Los_Angeles', 'Pacific/Kiritimati'])('same day in %s', (tz) => {
    process.env.TZ = tz;
    expect(formatIssueDate('2026-10-26', 'short')).toBe('26 Oct 2026');
    expect(formatIssueDate('2026-10-26', 'long')).toBe('26 October 2026');
    expect(formatIssueDate('2026-10-26', 'long', 'fr')).toBe('26 octobre 2026');
    expect(formatIssueDate('2026-10-26', 'short', 'fr')).toBe('26 oct. 2026');
  });
});

import { checkPdf } from '../../src/lib/issue-utils';

describe('checkPdf', () => {
  test('passes when the issue has no pdf or the file exists', () => {
    expect(() => checkPdf(entry('2026-10-26'), () => false)).not.toThrow();
    const withPdf = { id: '2026-11-02', data: { ...base, date: '2026-11-02', pdf: '/pdf/2026-11-02.pdf' } };
    expect(() => checkPdf(withPdf, (p) => p === 'public/pdf/2026-11-02.pdf')).not.toThrow();
  });
  test('fails the build when the pdf file is missing', () => {
    const withPdf = { id: '2026-11-02', data: { ...base, date: '2026-11-02', pdf: '/pdf/2026-11-02.pdf' } };
    expect(() => checkPdf(withPdf, () => false)).toThrow('Issue "2026-11-02" links to /pdf/2026-11-02.pdf but public/pdf/2026-11-02.pdf does not exist');
  });
});
