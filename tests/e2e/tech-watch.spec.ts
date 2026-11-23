import { test, expect } from '@playwright/test';

test.describe('Tech Watch index', () => {
  test('latest issue and archive (EN)', async ({ page }) => {
    await page.goto('/en/tech-watch');
    const latest = page.locator('#latest');
    await expect(latest).toContainText('week of 26 October 2026');
    await expect(latest).toContainText('GitHub rebuilt Copilot around AI agents');
    await expect(latest.getByRole('link', { name: 'Read the full issue' })).toHaveAttribute('href', '/en/tech-watch/2026-10-26');
    const rows = page.locator('#archive li a');
    const hrefs = await rows.evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs.indexOf('/en/tech-watch/2026-10-26')).toBeLessThan(hrefs.indexOf('/en/tech-watch/2026-01-05'));
    expect(hrefs.every((h) => /^\/en\/tech-watch\/\d{4}-\d{2}-\d{2}$/.test(h!))).toBe(true);
  });
  test('French index uses French dates and links', async ({ page }) => {
    await page.goto('/fr/tech-watch');
    await expect(page.locator('#latest')).toContainText('26 octobre 2026');
    await expect(page.locator('#archive li a').first()).toHaveAttribute('href', '/fr/tech-watch/2026-10-26');
  });
});

test.describe('Issue page', () => {
  test('week 44 has the whole newsletter', async ({ page }) => {
    await page.goto('/en/tech-watch/2026-10-26');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tech watch');
    await expect(page.locator('.top-story')).toHaveCount(3);
    await expect(page.locator('.top-story .num')).toHaveText(['1', '2', '3']);
    await expect(page.locator('article.card')).toHaveCount(13);
    await expect(page.locator('.issue-section > .sec h2')).toHaveText([
      'Market & money', 'Jobs & careers', 'AI & tools to try', 'Dev tools & stack', 'Paris & Île-de-France', 'Rules & society',
    ]);
    await expect(page.locator('.agenda .row')).toHaveCount(7);
    await expect(page.locator('.term')).toHaveCount(6);
    await expect(page.locator('.number-card strong')).toHaveText('40%');
    const hrefs = await page.getByRole('link', { name: 'Read the story' }).evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs.length).toBe(16);
    expect(hrefs.every((h) => h!.startsWith('https://'))).toBe(true);
    await expect(page.locator('#ai-tools')).toContainText('No pricing or free-plan changes');
    await expect(page.getByText('PDF carousel')).toHaveCount(0);
  });

  test('missing parts are hidden, not left empty', async ({ page }) => {
    await page.goto('/en/tech-watch/2026-01-05');
    await expect(page.getByRole('heading', { name: 'Coming up' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Tech terms' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Jobs & careers' })).toHaveCount(0);
    await expect(page.getByText(/PDF/)).toHaveCount(0);
    await expect(page.locator('.issue-section')).toHaveCount(1);
  });

  test('PDF carousel link when the issue has one', async ({ page }) => {
    await page.goto('/en/tech-watch/2026-01-12');
    await expect(page.getByRole('link', { name: 'Download the PDF carousel' })).toHaveAttribute('href', '/pdf/2026-01-12.pdf');
  });

  test('French page says the issue is in English', async ({ page }) => {
    await page.goto('/fr/tech-watch/2026-10-26');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByText('Ce numéro est rédigé en anglais.')).toBeVisible();
    await expect(page.locator('[data-issue-content]')).toHaveAttribute('lang', 'en');
    await expect(page.getByText('Semaine du 26 octobre 2026')).toBeVisible();
  });
});

test('RSS feed lists issues with absolute links', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.headers()['content-type']).toMatch(/xml/);
  const body = await res.text();
  expect(body).toMatch(/<link>https?:\/\/[^<]+\/en\/tech-watch\/2026-10-26\/?<\/link>/);
  expect(body).toContain('<pubDate>Mon, 26 Oct 2026');
  expect((body.match(/<item>/g) ?? []).length).toBeGreaterThanOrEqual(1);
});
