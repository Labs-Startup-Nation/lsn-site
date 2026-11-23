import { test, expect } from '@playwright/test';

test('fonts are self-hosted and tokens apply in both themes', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) external.push(r.url());
  });
  await page.goto('/en/');
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('600 32px Unbounded'),
      document.fonts.load('400 16px Outfit'),
      document.fonts.load('500 12px "DM Mono"'),
    ]);
  });
  expect(external).toEqual([]);
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')),
  );
  for (const family of ['Unbounded', 'Outfit', 'DM Mono']) expect(loaded).toContain(family);
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await bg()).toBe('rgb(255, 251, 240)');
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await bg()).toBe('rgb(26, 18, 11)');
});
