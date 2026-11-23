import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

test('Base layout loads Vercel Web Analytics only on Vercel builds', () => {
  const base = readFileSync('src/layouts/Base.astro', 'utf8');
  expect(base).toMatch(/import Analytics from '@vercel\/analytics\/astro'/);
  expect(base).toMatch(/\{onVercel && <Analytics \/>\}/);
  expect(base).toMatch(/const onVercel = Boolean\(process\.env\.VERCEL\)/);
});
