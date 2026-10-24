import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=code-diff`;

/** The color of the first token in a code block or diff whose text is `text`. */
function tokenColor(root: Locator, text: string) {
  return root.evaluate((element, text) => {
    const host = [...element.querySelectorAll('*')].find((each) => each.shadowRoot);
    const scope = host?.shadowRoot ?? element;
    const token = [...scope.querySelectorAll('span')].find(
      (span) => span.children.length === 0 && span.textContent?.trim() === text,
    );
    return token ? getComputedStyle(token).color : null;
  }, text);
}

for (const theme of ['light', 'dark'] as const)
  test(`a code diff takes a code block's surface and token colors in the ${theme} theme`, async ({
    page,
  }) => {
    await page.goto(fixture);
    const scope = page.getByTestId(theme);
    const block = scope.getByTestId('block');
    const diffs = scope.locator('.env-code-diff');
    await expect(diffs).toHaveCount(2);
    for (const diff of await diffs.all()) {
      await expect(diff).not.toHaveAttribute('aria-busy');
      // The same translucent layer as a block, on the page and on a card alike.
      expect(await diff.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
        await block.evaluate((element) => getComputedStyle(element).backgroundColor),
      );
      // The same token colors: a key, a string and the plain punctuation.
      for (const text of ['"theme"', '"standard"', '{']) {
        await expect.poll(() => tokenColor(block, text)).not.toBeNull();
        await expect.poll(() => tokenColor(diff, text)).toBe(await tokenColor(block, text));
      }
      // Changed lines are tinted over the layer, translucent, so the surface shows through.
      const added = await diff.evaluate((element) => {
        const host = [...element.querySelectorAll('*')].find((each) => each.shadowRoot);
        const line = host?.shadowRoot?.querySelector('[data-line][data-line-type=change-addition]');
        return line ? getComputedStyle(line).backgroundColor : null;
      });
      expect(added).toMatch(/\/ 0\.3\)$|, 0\.3\)$/);
    }
  });
