import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { PAGES } from './paths';

test.describe('French browser', () => {
  test.use({ locale: 'fr-FR' });
  test('root redirects to /fr/', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/fr\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });
});

test.describe('German browser', () => {
  test.use({ locale: 'de-DE' });
  test('root redirects to /en/', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
  });
});

test('language switch keeps the page', async ({ page }) => {
  await page.goto('/en/about');
  await page.getByRole('link', { name: 'Français' }).click();
  await expect(page).toHaveURL(/\/fr\/about\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'À propos' })).toHaveAttribute('aria-current', 'page');
});

test('every page has hreflang alternates', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(`/en${path}`);
    for (const lang of ['en', 'fr', 'x-default']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`), `${path} ${lang}`).toHaveAttribute('href', /^https?:\/\//);
    }
  }
});

test('vercel.json redirects French browsers server-side', () => {
  const cfg = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const fr = cfg.redirects.find((r: any) => r.source === '/' && r.destination === '/fr/');
  expect(fr.has[0]).toMatchObject({ type: 'header', key: 'accept-language' });
  // No inline (?i) flag: not every regex engine accepts it.
  expect(fr.has[0].value).not.toContain('(?');
  const re = new RegExp(fr.has[0].value);
  for (const header of ['fr-FR,fr;q=0.9', 'FR', 'fr']) expect(re.test(header), header).toBe(true);
  for (const header of ['en-GB,fr;q=0.8', 'de-DE']) expect(re.test(header), header).toBe(false);
  expect(cfg.redirects.at(-1)).toMatchObject({ source: '/', destination: '/en/' });
});
