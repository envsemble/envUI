import { expect, test } from '@playwright/test';
import { catalogueUrl, fixtureUrl } from './Servers';

const optionalImplementation = /\/RichTextEditing\.tsx|\/rich-text(?:\.ts|\/)|\/@tiptap/;
const iconCatalogue =
  /\/(?:IconCatalogue|IconUsage)\.tsx|\/icons\/index\.ts|\/@envsemble_envui_icons\.js/;

test('unrelated documentation routes load optional features only when requested', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(`${catalogueUrl}/#/components/button/preview`);
  await expect(page.getByRole('group', { name: 'Project actions' })).toBeVisible();
  expect(
    requests.filter((url) => optionalImplementation.test(url) || iconCatalogue.test(url)),
  ).toEqual([]);

  await page.evaluate(() => {
    location.hash = '/components/rich-text/overview';
  });
  await expect(page.getByRole('textbox', { name: 'Meeting notes', exact: true })).toBeVisible();
  expect(requests.some((url) => optionalImplementation.test(url))).toBe(true);

  await page.evaluate(() => {
    location.hash = '/foundations/icons/preview';
  });
  await expect(page.getByRole('searchbox', { name: 'Search icons', exact: true })).toBeVisible();
  expect(requests.some((url) => iconCatalogue.test(url))).toBe(true);
});

test('unrelated public API fixtures exclude optional features and their editors', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(fixtureUrl);
  await expect(page.getByTestId('color-controls-light')).toBeVisible();
  await expect(page.locator('.env-rich-text-editor')).toHaveCount(0);
  expect(requests.filter((url) => optionalImplementation.test(url))).toEqual([]);

  await page.goto(`${fixtureUrl}/rich-text.html`);
  await expect(page.getByRole('textbox', { name: 'Rich source', exact: true })).toBeVisible();
  expect(requests.some((url) => optionalImplementation.test(url))).toBe(true);
});
