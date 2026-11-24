import { test, expect } from '@playwright/test';
import { PAGES } from './paths';

const URLS = [...PAGES, '/tech-watch/2026-10-26', '/tech-watch/2026-01-05', '/tech-watch/2026-01-12'];

for (const width of [320, 375, 768]) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 800 });
    for (const lang of ['en', 'fr']) {
      for (const path of URLS) {
        await page.goto(`/${lang}${path}`);
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(sw, `${lang}${path}`).toBeLessThanOrEqual(width);
      }
    }
  });
}

for (const width of [320, 375]) {
  test(`hackathon facts stay on one line at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const lang of ['en', 'fr']) {
      await page.goto(`/${lang}/projects`);
      const lines = await page.locator('.fact strong').evaluateAll((els) =>
        els.map((el) => [el.textContent, Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight))]),
      );
      for (const [text, n] of lines) expect(n, `${lang} "${text}"`).toBe(1);
    }
  });
}
