import { test, expect } from '@playwright/test';
import { NAV_PATHS } from './paths';

test('current page is marked in the main nav', async ({ page }) => {
  await page.goto('/en/about');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
});

test('nav works by keyboard', async ({ page, browserName }) => {
  // Safari on macOS only tabs to links with Option+Tab.
  const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  await page.goto('/en/');
  const target = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Projects' });
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press(tab);
    if (await target.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(target).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/en\/projects\/?$/);
});

test('no horizontal scroll on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ['/', ...NAV_PATHS]) {
    await page.goto(`/en${path}`);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, path).toBeLessThanOrEqual(375);
  }
});

test('meta tags', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https?:\/\/.+\/og\.png$/);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page).toHaveTitle('LSN · Labs Startup Nation');
  await page.goto('/en/about');
  await expect(page).toHaveTitle('About · LSN');
});

test('footer links', async ({ page }) => {
  await page.goto('/en/');
  const footer = page.getByRole('contentinfo');
  for (const name of ['Tech Watch', 'Propose a project', 'Projects', 'About', 'Join']) {
    await expect(footer.getByRole('link', { name, exact: true })).toHaveCount(1);
  }
  await expect(footer.getByRole('link', { name: 'Legal notice' })).toHaveAttribute('href', '/en/legal');
  await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/en/privacy');
});

test('404 page links home', async ({ page }) => {
  const res = await page.goto('/nope');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('link', { name: /home page|accueil/i }).first()).toBeVisible();
});

test('header logo keeps its three brand squares', async ({ page }) => {
  await page.goto('/en/');
  const rects = page.locator('header .logo svg rect');
  await expect(rects).toHaveCount(3);
  for (const r of await rects.all()) expect((await r.boundingBox())!.width).toBeGreaterThan(2);
});
