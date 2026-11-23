import { test, expect } from '@playwright/test';

const color = (page: import('@playwright/test').Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => getComputedStyle(el).color);

test.use({ colorScheme: 'light' });

test('labels keep their colour wherever they sit', async ({ page }) => {
  await page.goto('/en/');
  expect(await color(page, '.pillar .label')).toBe('rgb(179, 33, 0)');   // --label-fire
  expect(await color(page, '.callout .label')).toBe('rgb(179, 33, 0)');
  expect(await color(page, '.number-card .tag')).toBe('rgb(254, 252, 118)'); // --sun on smoke
  expect(await color(page, '.top-story .label')).toBe('rgb(254, 252, 118)');
  await page.goto('/en/tech-watch');
  expect(await color(page, '.fmt .label')).toBe('rgb(179, 33, 0)');
  await page.goto('/en/join');
  expect(await color(page, '.way .label')).toBe('rgb(179, 33, 0)');
});

test('pillar footnote stays muted mono', async ({ page }) => {
  await page.goto('/en/');
  const s = await page.locator('.pillar .when').first().evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el).fontSize]);
  expect(s).toEqual(['rgb(107, 90, 69)', '12.5px']);
});
