import { expect, test, type Page } from '@playwright/test';

const api = process.env.E2E_MODE === 'api';
async function openJournal(page: Page) {
  await page.goto('/');
  if (api) {
    await page.getByLabel('Access token', { exact: true }).fill(process.env.API_TOKEN ?? 'local-development-token-change-before-hosting');
    await page.getByRole('button', { name: 'Connect to journal' }).click();
  }
  await expect(page.getByRole('button', { name: 'New entry' })).toBeEnabled();
  await expect(page.getByText('Opening your notebook…')).toHaveCount(0);
}

test('journal CRUD, milestone timeline, refresh, confirmation and literal content', async ({ page }, testInfo) => {
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  await openJournal(page);
  const title = `A fictional browser test ${testInfo.project.name} ${Date.now()}`;
  await page.getByRole('button', { name: 'New entry' }).click();
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByLabel('Date', { exact: true }).fill('2026-10-26');
  await page.getByLabel('Mood').selectOption('hopeful');
  await page.getByLabel('Your thoughts').fill('A fictional thought. <script>alert("unsafe")</script>');
  await page.getByRole('button', { name: 'Save entry' }).click();
  await expect(page.getByRole('button', { name: `Read ${title}`, exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: `Read ${title}`, exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('<script>alert("unsafe")</script>');
  await page.getByRole('button', { name: 'Edit entry' }).click();
  await page.getByLabel('Title', { exact: true }).fill(`${title} edited`);
  await page.getByLabel('Mark as a milestone').check();
  await page.getByLabel('Milestone category').selectOption('achievement');
  await page.getByRole('button', { name: 'Save entry' }).click();
  await page.getByRole('button', { name: 'Growth Timeline' }).click();
  await expect(page.getByRole('button', { name: `Read ${title} edited`, exact: true })).toBeVisible();
  await page.getByRole('button', { name: `Read ${title} edited`, exact: true }).click();
  await page.getByRole('button', { name: 'Delete entry', exact: true }).click();
  await page.getByRole('button', { name: 'Keep entry' }).click();
  await expect(page.getByRole('button', { name: `Read ${title} edited`, exact: true })).toBeVisible();
  await page.getByRole('button', { name: `Read ${title} edited`, exact: true }).click();
  await page.getByRole('button', { name: 'Delete entry', exact: true }).click();
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page.getByRole('button', { name: `Read ${title} edited`, exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'New entry' })).toBeEnabled();
  await expect(page.getByRole('button', { name: `Read ${title} edited`, exact: true })).toHaveCount(0);
  expect(failures).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `../artifacts/${api ? 'api' : 'demo'}-${testInfo.project.name}.png`, fullPage: true, animations: 'disabled' });
});

test('demo separates contexts and never calls journal API', async ({ page, browser }) => {
  test.skip(api, 'Isolation here is the browser-local demo contract; API is a single private notebook.');
  const calls: string[] = [];
  page.on('request', request => { if (request.url().includes('/api/')) calls.push(request.url()); });
  await openJournal(page);
  await page.getByRole('button', { name: 'New entry' }).click();
  await page.getByLabel('Title', { exact: true }).fill('Only in browser one');
  await page.getByLabel('Your thoughts').fill('Fictional isolated demo record');
  await page.getByRole('button', { name: 'Save entry' }).click();
  await expect(page.getByRole('button', { name: 'Read Only in browser one', exact: true })).toBeVisible();
  const secondContext = await browser.newContext();
  const second = await secondContext.newPage();
  await second.goto('http://127.0.0.1:4173/');
  await expect(second.getByRole('button', { name: 'Read A little room to begin', exact: true })).toBeVisible();
  await expect(second.getByRole('button', { name: 'Read Only in browser one', exact: true })).toHaveCount(0);
  expect(calls).toEqual([]);
  await secondContext.close();
});
