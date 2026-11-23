import { test, expect } from '@playwright/test';
import { PUBLISHER, PUBLICATION_DIRECTOR, CONTACT_EMAIL } from '../../src/data/site';

test('legal notice names the publisher, director and host', async ({ page }) => {
  await page.goto('/en/legal');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Legal notice');
  if (PUBLISHER) await expect(page.locator('main')).toContainText(PUBLISHER);
  if (PUBLICATION_DIRECTOR) await expect(page.locator('main')).toContainText(PUBLICATION_DIRECTOR);
  await expect(page.locator('main')).toContainText('Vercel Inc.');
  await expect(page.locator('main')).toContainText('440 N Barranca Ave #4133, Covina, CA 91723, USA');
});

test('privacy policy covers what, why, how long, who, deletion, where, cookies', async ({ page }) => {
  await page.goto('/en/privacy');
  await expect(page.locator('main h2')).toHaveText([
    'What we collect', 'Why', 'How long', 'Who can see it', 'How to have it deleted', 'Where it is stored', 'Cookies',
  ]);
  await expect(page.locator('main')).toContainText('12 months');
  await expect(page.locator('main')).toContainText('Supabase');
  await expect(page.locator('main')).toContainText('European Union');
  await expect(page.locator('main')).toContainText('This site uses no cookies');
  if (CONTACT_EMAIL) await expect(page.locator(`main a[href="mailto:${CONTACT_EMAIL}"]`)).toHaveCount(1);
  else await expect(page.locator('main a[href$="/propose"]')).toHaveCount(1);
});

test('French versions exist', async ({ page }) => {
  await page.goto('/fr/legal');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mentions légales');
  await page.goto('/fr/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Politique de confidentialité');
  await expect(page.locator('main')).toContainText('12 mois');
  await expect(page.locator('main')).toContainText('Ce site n’utilise aucun cookie');
});
