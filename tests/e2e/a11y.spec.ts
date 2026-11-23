import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from './paths';

const URLS = [...PAGES, '/tech-watch/2026-10-26'];

for (const scheme of ['light', 'dark'] as const) {
  for (const lang of ['en', 'fr']) {
    test(`no axe violations (${lang}, ${scheme})`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      for (const path of URLS) {
        await page.goto(`/${lang}${path}`);
        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`), `${lang}${path}`).toEqual([]);
      }
    });
  }
}

test('every focusable control on the form shows a focus ring', async ({ page, browserName }) => {
  const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  await page.goto('/en/propose');
  await page.locator('#p-name').focus();
  for (let i = 0; i < 14; i++) {
    const style = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const target = el.closest('.chips label') ?? el;
      const s = getComputedStyle(target);
      return { id: el.id || el.tagName, outline: s.outlineStyle, inForm: !!el.closest('form') };
    });
    if (!style.inForm) break;
    expect(style.outline, style.id).not.toBe('none');
    await page.keyboard.press(tab);
  }
});
