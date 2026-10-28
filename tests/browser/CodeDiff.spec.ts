import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

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

test('a code diff keeps its expanded lines and shows no spinner as the theme switches', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('switched');
  const diff = scope.locator('.env-code-diff');
  await expect(diff).not.toHaveAttribute('aria-busy');
  /** The diff's lines, the element that holds them, and whether a spinner has shown since. */
  const state = () =>
    diff.evaluate((element) => {
      const host = [...element.querySelectorAll('*')].find((each) => each.shadowRoot);
      return {
        lines: host?.shadowRoot?.querySelectorAll('[data-line]').length ?? 0,
        same: (host as (Element & { marked?: boolean }) | undefined)?.marked === true,
        spinner: (window as { spinnerShown?: boolean }).spinnerShown === true,
      };
    });
  await expect.poll(async () => (await state()).lines).toBeGreaterThan(0);
  const folded = (await state()).lines;
  // Expand the folded lines, mark the element Diffs renders into and watch for a spinner.
  await diff.evaluate((element) => {
    const host = [...element.querySelectorAll('*')].find((each) => each.shadowRoot)!;
    (host as Element & { marked?: boolean }).marked = true;
    host.shadowRoot!.querySelector<HTMLElement>('[data-expand-button]')!.click();
    new MutationObserver(() => {
      if (element.querySelector('[role=status]'))
        (window as { spinnerShown?: boolean }).spinnerShown = true;
    }).observe(element, { childList: true, subtree: true });
  });
  await expect.poll(async () => (await state()).lines).toBeGreaterThan(folded);
  const expanded = (await state()).lines;
  const light = await tokenColor(diff, 'const');
  for (const scheme of ['dark', 'light']) {
    await scope.getByRole('button', { name: 'Switch theme' }).click();
    if (scheme === 'dark') await expect.poll(() => tokenColor(diff, 'const')).not.toBe(light);
    else await expect.poll(() => tokenColor(diff, 'const')).toBe(light);
    expect(await state(), scheme).toEqual({ lines: expanded, same: true, spinner: false });
  }
});
