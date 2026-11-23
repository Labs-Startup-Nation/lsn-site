import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const URL = '/en/dev/components';
const snapshots = (page: Page) => page.$$eval('.beam canvas', (cs) => (cs as HTMLCanvasElement[]).map((c) => c.toDataURL()));

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('every beam is drawn once and stays still', async ({ page }) => {
    await page.goto(URL);
    await page.waitForFunction(() => document.querySelectorAll('.beam[data-drawn]').length === document.querySelectorAll('.beam').length);
    const alphas = await page.$$eval('.beam canvas', (cs) =>
      (cs as HTMLCanvasElement[]).map((c) => c.getContext('2d')!.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data[3]),
    );
    expect(alphas.length).toBeGreaterThan(1);
    for (const a of alphas) expect(a).toBe(255);
    const a = await snapshots(page);
    await page.waitForTimeout(300);
    expect(await snapshots(page)).toEqual(a);
  });
  test('no glide with reduced motion', async ({ page }) => {
    await page.goto(URL);
    const hero = page.locator('.beam[data-interactive]');
    const box = (await hero.boundingBox())!;
    await page.mouse.move(box.x + box.width - 24, box.y + box.height - 24);
    await page.waitForTimeout(500);
    expect(Number(await hero.getAttribute('data-glide-dx'))).toBe(0);
  });
});

test('beams animate otherwise', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('.beam[data-interactive][data-drawn]');
  const hero = page.locator('.beam[data-interactive] canvas');
  const a = await hero.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.waitForTimeout(300);
  expect(await hero.evaluate((c: HTMLCanvasElement) => c.toDataURL())).not.toBe(a);
});

test('hero follows the pointer and settles back', async ({ page }) => {
  await page.goto(URL);
  const hero = page.locator('.beam[data-interactive]');
  const box = (await hero.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.move(box.x + box.width - 24, box.y + box.height - 24, { steps: 5 });
  await page.waitForTimeout(500);
  expect(Number(await hero.getAttribute('data-glide-dx'))).toBeGreaterThan(0.02);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height + 300);
  await page.waitForTimeout(1000);
  expect(Math.abs(Number(await hero.getAttribute('data-glide-dx')))).toBeLessThan(0.005);
  await expect(page.locator('.beam:not([data-interactive])').first()).not.toHaveAttribute('data-glide-dx');
});

test('canvases are hidden from assistive tech and one module script runs the beams', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.beam canvas:not([aria-hidden="true"])')).toHaveCount(0);
  await expect(page.locator('script[type="module"]')).toHaveCount(1);
});

test('dev page is noindex and not in the sitemap', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  expect(readFileSync('dist/sitemap-0.xml', 'utf8')).not.toContain('/dev/');
});
