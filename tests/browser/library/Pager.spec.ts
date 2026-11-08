import { expect, test } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

test('the previous link comes first and the next link last, with strings from messages', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=pagers`);
  // A Pager.Next child renders after the previous prop's link, not before it.
  const mixed = page.getByRole('navigation', { name: 'Mixed pager' });
  await expect(mixed.getByRole('link')).toHaveText(['PreviousIntroduction', 'Up nextSetup']);
  await expect(mixed.getByRole('link').first()).toHaveAttribute('rel', 'prev');
  // EnvUIProvider's messages name the landmark and caption the links.
  const translated = page.getByRole('navigation', { name: 'Seiten' });
  await expect(translated.getByRole('link')).toHaveText(['ZurückEinführung', 'WeiterEinrichtung']);
});
