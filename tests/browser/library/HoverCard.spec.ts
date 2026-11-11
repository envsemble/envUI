import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

const themes = ['light', 'dark'] as const;

function card(page: Page) {
  return page.locator('.env-hover-card');
}

async function center(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test(
  'a hover card opens after the delay on hover, stays open on the card and keeps the theme',
  { tag: '@engines' },
  async ({ page }) => {
    await page.clock.install();
    await page.goto(`${fixtureUrl}/?fixture=hover-card`);
    for (const theme of themes) {
      const trigger = page.getByTestId(`hover-card-${theme}`).getByRole('link', {
        name: `Roadmap ${theme}`,
      });
      // Time the opening in the page, so a slow test runner cannot blur the delay.
      const opened = trigger.evaluate(
        (element) =>
          new Promise<number>((resolve) => {
            element.addEventListener(
              'pointerenter',
              () => {
                const entered = performance.now();
                const observer = new MutationObserver(() => {
                  if (!document.querySelector('.env-hover-card')) return;
                  observer.disconnect();
                  resolve(performance.now() - entered);
                });
                observer.observe(document.body, { childList: true, subtree: true });
              },
              { once: true },
            );
          }),
      );
      await trigger.hover();
      // The pointer has to rest on the trigger first (600 ms by default).
      expect(await opened).toBeGreaterThanOrEqual(550);
      await expect(card(page)).toBeVisible();
      await expect(card(page).locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
        'data-env-theme',
        theme,
      );
      // Supplementary details, not a dialog.
      await expect(page.getByRole('dialog')).toHaveCount(0);

      // The pointer moves from the trigger onto the card, past the close delay, and the text can be selected.
      const text = card(page).getByText('Changed today by Alex');
      const target = await center(text);
      await page.mouse.move(target.x, target.y, { steps: 8 });
      await page.clock.runFor(600);
      await expect(card(page)).toBeVisible();
      await text.dblclick();
      expect(await page.evaluate(() => window.getSelection()?.toString().trim())).not.toBe('');
      await expect(card(page)).toBeVisible();

      // Leaving the trigger and the card closes it.
      await page.mouse.move(5, 5);
      await expect(card(page)).toHaveCount(0);
      await expect(page.getByTestId(`hover-card-changes-${theme}`)).toHaveText('true false');
    }
  },
);

test(
  'a hover card opens at once on keyboard focus, leaves focus on the trigger and closes on Escape',
  { tag: '@engines' },
  async ({ page }) => {
    await page.clock.install();
    await page.goto(`${fixtureUrl}/?fixture=hover-card`);
    for (const theme of themes) {
      const scope = page.getByTestId(`hover-card-${theme}`);
      const trigger = scope.getByRole('link', { name: `Roadmap ${theme}` });
      await scope.getByRole('button', { name: `Before ${theme}` }).focus();
      // WebKit leaves links out of the Tab order by default, so focus moves to the link directly
      // after a key press, which makes it keyboard focus.
      await page.keyboard.press('Shift');
      const opened = await trigger.evaluate(
        (element: HTMLElement) =>
          new Promise<number>((resolve) => {
            const focused = performance.now();
            const observer = new MutationObserver(() => {
              if (!document.querySelector('.env-hover-card')) return;
              observer.disconnect();
              resolve(performance.now() - focused);
            });
            observer.observe(document.body, { childList: true, subtree: true });
            element.focus();
          }),
      );
      // Well within the 600 ms hover delay.
      expect(opened).toBeLessThan(300);
      await expect(trigger).toBeFocused();
      await expect(card(page)).toBeVisible();
      await expect(card(page).locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
        'data-env-theme',
        theme,
      );
      await expect(trigger).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(card(page)).toHaveCount(0);
      await expect(trigger).toBeFocused();
      // The delayed focus opening does not bring it back.
      await page.clock.runFor(700);
      await expect(card(page)).toHaveCount(0);
      await expect(scope.getByTestId(`hover-card-changes-${theme}`)).toHaveText('true false');

      // Tab moves on rather than into the card, and the card does not reopen.
      await page.keyboard.press('Shift+Tab');
      await expect(scope.getByRole('button', { name: `Before ${theme}` })).toBeFocused();
      await expect(card(page)).toHaveCount(0);
    }
  },
);

test('a hover card closes on Escape while the pointer rests on its trigger', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=hover-card`);
  await page.getByRole('link', { name: 'Roadmap light' }).hover();
  await expect(card(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card(page)).toHaveCount(0);
});

test('a text trigger takes a quiet dotted underline, a button trigger none', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=hover-card`);
  for (const theme of themes) {
    const scope = page.getByTestId(`hover-card-${theme}`);
    const text = scope.getByText(`28 h ${theme}`);
    await expect(text).toHaveClass(/\benv-hover-detail\b/);
    const style = await text.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        dots: computed.backgroundImage,
        size: computed.backgroundSize.split(' ').map(parseFloat),
        textColor: computed.color,
        cursor: computed.cursor,
      };
    });
    // Round dots, spaced well apart, drawn below the text, with the pointer the arrow over it.
    expect(style.dots).toMatch(/^radial-gradient\(circle closest-side, (rgb\([^)]*\))/);
    const [pitch, dot] = style.size;
    expect(dot).toBeGreaterThanOrEqual(1.5);
    expect(pitch / dot).toBeGreaterThan(2.5);
    expect(style.cursor).toBe('default');
    // Quiet: the muted text color, not the text's own.
    expect(style.dots).not.toContain(style.textColor);

    for (const control of [
      scope.getByRole('button', { name: `Details ${theme}` }),
      scope.getByRole('link', { name: `Roadmap ${theme}` }),
    ]) {
      await expect(control).not.toHaveClass(/\benv-hover-detail\b/);
      expect(
        await control.evaluate((element) => getComputedStyle(element).backgroundImage),
      ).not.toContain('radial-gradient');
    }
    const button = scope.getByRole('button', { name: `Details ${theme}` });
    expect(await button.evaluate((element) => getComputedStyle(element).textDecorationLine)).toBe(
      'none',
    );
  }
});
