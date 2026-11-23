import { test, expect, type Page } from '@playwright/test';
import { CONTACT_EMAIL, REPLY_DELAY } from '../../src/data/site';

const ENDPOINT = '**/rest/v1/proposals';

async function fill(page: Page) {
  await page.getByLabel('Your name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.org');
  await page.getByLabel('What problem does it solve?').fill('Our association tracks members in a spreadsheet.');
  await page.getByLabel(/I agree/).check();
}

test.beforeEach(async ({ page }) => { await page.goto('/en/propose'); });

test('sends the proposal and confirms', async ({ page }) => {
  let body: any;
  await page.route(ENDPOINT, async (route) => {
    body = route.request().postDataJSON();
    await new Promise((r) => setTimeout(r, 300));
    await route.fulfill({ status: 201, body: '' });
  });
  await fill(page);
  const submit = page.getByRole('button', { name: 'Send my proposal' });
  await submit.click();
  await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText(`Thanks, we’ll answer within ${REPLY_DELAY.en}.`);
  expect(body).toMatchObject({ name: 'Ada Lovelace', kind: 'app', timing: 'none', consent: true });
  await expect(page.getByLabel('Your name')).toHaveValue('');
});

test('a double click sends only once', async ({ page }) => {
  let count = 0;
  await page.route(ENDPOINT, async (route) => { count++; await new Promise((r) => setTimeout(r, 300)); await route.fulfill({ status: 201, body: '' }); });
  await fill(page);
  await page.getByRole('button', { name: 'Send my proposal' }).dblclick();
  await expect(page.getByRole('status')).toContainText('Thanks');
  expect(count).toBe(1);
});

const errorText = CONTACT_EMAIL ? new RegExp(`couldn’t send your proposal.*${CONTACT_EMAIL}`) : /couldn’t send your proposal\. Please try again in a few minutes\./;

test('server error keeps the answers and says what to do', async ({ page }) => {
  await page.route(ENDPOINT, (route) => route.fulfill({ status: 500, body: '{}' }));
  await fill(page);
  await page.getByRole('button', { name: 'Send my proposal' }).click();
  await expect(page.getByRole('alert')).toHaveText(errorText);
  await expect(page.getByLabel('Your name')).toHaveValue('Ada Lovelace');
  await expect(page.getByRole('button', { name: 'Send my proposal' })).toBeEnabled();
});

test('offline gives the same message', async ({ page, context }) => {
  await fill(page);
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Send my proposal' }).click();
  await expect(page.getByRole('alert')).toHaveText(errorText);
  await context.setOffline(false);
});

test('empty form: errors are announced and linked, focus goes to the first one', async ({ page }) => {
  let count = 0;
  await page.route(ENDPOINT, (route) => { count++; return route.fulfill({ status: 201 }); });
  await page.getByRole('button', { name: 'Send my proposal' }).click();
  await expect(page.getByLabel('Your name')).toBeFocused();
  for (const label of ['Your name', 'Email', 'What problem does it solve?']) {
    const field = page.getByLabel(label);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    const id = await field.getAttribute('aria-describedby');
    expect(id).toBeTruthy();
    await expect(page.locator(`[id="${id!.split(' ').at(-1)}"]`)).toHaveText('Please fill in this field.');
  }
  await expect(page.locator('#p-consent-error')).toHaveText(/Please accept/);
  expect(count).toBe(0);
});

test('consent links to the privacy policy and fields have limits', async ({ page }) => {
  await expect(page.locator('label[for="p-consent"] a')).toHaveAttribute('href', '/en/privacy');
  await expect(page.getByLabel('What problem does it solve?')).toHaveAttribute('maxlength', '4000');
});

test('honeypot is hidden from people', async ({ page }) => {
  const trap = page.locator('input[name="website"]');
  await expect(trap).toHaveAttribute('tabindex', '-1');
  await expect(trap).toHaveAttribute('autocomplete', 'off');
  await expect(trap).not.toBeInViewport();
  await expect(page.locator('.trap')).toHaveAttribute('aria-hidden', 'true');
});

test('French form', async ({ page }) => {
  await page.goto('/fr/propose');
  await expect(page.getByRole('button', { name: 'Envoyer ma proposition' })).toBeVisible();
  await expect(page.locator('label[for="p-consent"] a')).toHaveAttribute('href', '/fr/privacy');
});
