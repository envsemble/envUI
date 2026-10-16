import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';
import { defaultMessages } from '../../packages/ui/src/foundations/messages/defaultMessages';

// The pseudo-locale check: tests/fixture/MessageStrings.tsx renders the components whose strings come
// from EnvUIProvider's messages with every message replaced by ⟦namespace.key⟧. No English default
// may be left in their text, names, descriptions, titles, placeholders or value texts. As each
// batch moves a family's strings into messages, it adds the family's components to the fixture.

/** Every string default, as people would read it. */
const englishDefaults = new Set(
  Object.values(defaultMessages)
    .flatMap((keys) => Object.values(keys))
    .filter((value): value is string => typeof value === 'string'),
);

test('no English default is left under a provider that sets every message', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=message-strings`);
  const root = page.getByTestId('messages');
  await expect(root).toBeVisible();
  // ConfirmButton announces its armed state.
  await root.getByRole('button', { name: 'Remove' }).click();
  await expect(root.getByRole('status').filter({ hasText: '⟦confirmButton.armed⟧' })).toHaveCount(
    1,
  );
  // CopyButton shows its result in a tooltip.
  await root.getByRole('button', { name: '⟦copy.copy⟧' }).hover();
  const found = await page.evaluate(() => {
    const texts: string[] = [];
    const attributes = ['aria-label', 'aria-description', 'title', 'placeholder', 'aria-valuetext'];
    for (const element of document.querySelectorAll('body *')) {
      for (const node of element.childNodes)
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
          texts.push(node.textContent.trim());
      for (const attribute of attributes) {
        const value = element.getAttribute(attribute);
        if (value) texts.push(value.trim());
      }
    }
    return texts;
  });
  const left = found.filter((text) => englishDefaults.has(text));
  expect(left).toEqual([]);
  expect(found).toContain('⟦common.close⟧');
  expect(found).toContain('⟦dialog.close⟧');
  expect(found).toContain('⟦themeToggle.toDark⟧');
});
