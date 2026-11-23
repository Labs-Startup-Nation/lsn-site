import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { issueSchema } from '../../src/lib/issue-schema';

const load = (p: string) => JSON.parse(readFileSync(p, 'utf8'));

describe('issueSchema', () => {
  test('accepts a minimal issue', () => {
    const r = issueSchema.safeParse(load('tests/fixtures/issues/2026-01-05.json'));
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
  });

  test('rejects a bad date and a non-https url, naming both', () => {
    const r = issueSchema.safeParse(load('tests/fixtures/broken/broken.json'));
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path.join('.'));
    expect(paths).toContain('date');
    expect(paths).toContain('topStories.0.url');
  });

  test('rejects a pdf path outside /pdf/', () => {
    const issue = { ...load('tests/fixtures/issues/2026-01-05.json'), pdf: 'https://evil.example/x.pdf' };
    expect(issueSchema.safeParse(issue).success).toBe(false);
  });

  test('week 44 issue is complete', () => {
    const r = issueSchema.safeParse(load('src/content/issues/2026-10-26.json'));
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
    const i = r.data!;
    expect(i.week).toBe(44);
    expect(i.topStories).toHaveLength(3);
    expect(i.sections.map((s) => s.id)).toEqual(['market', 'jobs', 'ai-tools', 'dev-tools', 'paris', 'rules']);
    expect(i.sections.map((s) => s.title)).toEqual([
      'Market & money', 'Jobs & careers', 'AI & tools to try', 'Dev tools & stack', 'Paris & Île-de-France', 'Rules & society',
    ]);
    expect(i.sections.reduce((n, s) => n + s.articles.length, 0)).toBe(13);
    expect(i.agenda).toHaveLength(7);
    expect(i.terms).toHaveLength(6);
    expect(i.number.value).toBe('40%');
    expect(i.concept.name).toBe('MCP (Model Context Protocol)');
    expect(i.sections.find((s) => s.id === 'ai-tools')!.note).toMatch(/^No pricing or free-plan changes/);
  });
});
