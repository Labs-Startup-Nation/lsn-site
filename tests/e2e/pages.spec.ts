import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { LINKEDIN_URL, CONTACT_EMAIL } from '../../src/data/site';
import { TEAM } from '../../src/data/team';
import { PAGES } from './paths';

test('home shows the latest issue automatically', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('.home-tops .top-story h3')).toHaveText([
    'GitHub turns Copilot into a control centre for AI agents.',
    'Anthropic files publicly for its stock market listing.',
    'Microsoft offers voluntary buyouts to about 60,000 employees.',
  ]);
  await expect(page.locator('.number-card strong')).toHaveText('40%');
  expect(readFileSync('src/pages/[lang]/index.astro', 'utf8')).not.toContain('GitHub turns Copilot');
});

test('home in French', async ({ page }) => {
  await page.goto('/fr/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('construisent avec');
  await expect(page.getByRole('link', { name: 'Proposer un projet' }).first()).toBeVisible();
});

test('projects: empty state and hackathon format', async ({ page }) => {
  await page.goto('/en/projects');
  await expect(page.getByText('No projects published yet')).toBeVisible();
  await expect(page.locator('.fact strong')).toHaveText(['1 day', '~5', '€0', 'Free', 'Jury']);
});

test('about: team section only with consenting members', async ({ page }) => {
  await page.goto('/en/about');
  await expect(page.getByRole('heading', { name: 'The team' })).toHaveCount(TEAM.length > 0 ? 1 : 0);
});

test('join: real contact links, or none', async ({ page }) => {
  await page.goto('/en/join');
  const linkedin = page.locator('a[href*="linkedin.com"]');
  if (LINKEDIN_URL) await expect(linkedin.first()).toHaveAttribute('href', LINKEDIN_URL);
  else await expect(linkedin).toHaveCount(0);
  const mail = page.locator('a[href^="mailto:"]');
  if (CONTACT_EMAIL) await expect(mail.first()).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`);
  else await expect(mail).toHaveCount(0);
});

test('no mockup leftovers on any page', async ({ page }) => {
  for (const lang of ['en', 'fr']) {
    for (const path of PAGES) {
      await page.goto(`/${lang}${path}`);
      const body = await page.locator('body').innerText();
      for (const s of ['À compléter', 'Maquette', 'Preview only', 'TODO', 'Lorem']) expect(body, `${lang}${path}`).not.toContain(s);
      await expect(page.locator('.todo')).toHaveCount(0);
    }
  }
});
