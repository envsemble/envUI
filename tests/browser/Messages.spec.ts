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
  for (const marked of [
    '⟦avatarGroup.label⟧',
    '⟦avatarGroup.more⟧',
    '⟦rating.label⟧',
    '⟦diffStat.label⟧',
    '⟦message.sending⟧',
    '⟦message.failed⟧',
    '⟦calendarHeatmap.less⟧',
    '⟦calendarHeatmap.more⟧',
    '⟦relativeTime.now⟧',
    '⟦alert.dismiss⟧',
    '⟦common.loading⟧',
    '⟦toast.dismiss⟧',
    '⟦toast.hidden⟧',
    '⟦toast.regionBottomEnd⟧',
    '⟦toast.regionTopCenter⟧',
  ])
    expect(found).toContain(marked);
  // CommandPalette says that nothing matches through its status.
  await root.getByRole('button', { name: 'Open palette' }).click();
  await expect(page.getByRole('dialog', { name: 'Go to' }).getByRole('status')).toHaveText(
    '⟦commandPalette.empty⟧',
  );
});

test('messages written inline keep the context while they stay the same', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=message-strings`);
  const probe = page.getByTestId('inline-probe');
  await expect(probe).toHaveText('⟦inline.close⟧');
  // The count is written in an effect, after the first paint.
  await expect(probe).toHaveAttribute('data-renders', /^\d+$/);
  const before = await probe.getAttribute('data-renders');
  const rerender = page.getByRole('button', { name: /⟦rerender⟧/ });
  for (const count of [1, 2, 3]) {
    await rerender.click();
    await expect(rerender).toHaveText(`⟦rerender⟧ ${count}`);
  }
  await expect(probe).toHaveAttribute('data-renders', before ?? '');
});
