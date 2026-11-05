import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';
import { openServerMarkup } from './helpers/ServerMarkup';

const fixture = `${fixtureUrl}/?fixture=adoption`;

/**
 * Installs the page's clock and stops it, so a timer runs only as far as the test moves it, however
 * long the steps between take on a busy engine. An installed clock still runs on its own; pausing it
 * is what stops it. Event timestamps, which ConfirmButton's guard against a double press reads,
 * follow it too.
 */
async function stopClock(page: Page) {
  const start = Date.now();
  await page.clock.install({ time: start });
  await page.clock.pauseAt(start + 1000);
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('LinkProvider routes destinations and leaves disabled links native', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(fixture);
  const projects = page.getByTestId('router-button');
  await expect(projects).toHaveAttribute('data-router-link', '');
  await projects.click();
  await expect(page.locator('body')).toHaveAttribute('data-navigated-to', '/projects');
  await expect(page).toHaveURL(/fixture=adoption$/);
  const disabled = page.getByTestId('disabled-link');
  await expect(disabled).not.toHaveAttribute('data-router-link');
  await expect(disabled).not.toHaveAttribute('href');
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  expect(errors).toEqual([]);
});

test('AvatarButton shows a halo on hover and while its menu is open, and names the account', async ({
  page,
}) => {
  await page.goto(fixture);
  const trigger = page.getByRole('button', { name: 'Open account menu' });
  await expect(trigger).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await trigger.hover();
  await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('.env-tooltip')).toContainText('alex@example.com');
  await trigger.click();
  await expect(page.getByRole('menu', { name: 'Account', exact: true })).toBeVisible();
  await page.mouse.move(1, 1);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('AvatarButton grows to the touch height around a small avatar', async ({ page }) => {
    await page.goto(fixture);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    const trigger = page.getByRole('button', { name: 'Open account menu' });
    await expect(trigger).toHaveCSS('width', '44px');
    await expect(trigger).toHaveCSS('height', '44px');
  });
});

test("a number within a label's words stays in their line, and a badge keeps the button's gap", async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=button-counts`);
  const button = page.getByTestId('show-tasks-light');
  await expect(button).toHaveText('Show 33 tasks');
  const spacing = await button.evaluate((element) => {
    const number = element.querySelector('.env-animated-number')!.getBoundingClientRect();
    const words = document.createRange();
    const text = element.querySelector('.env-button-text')!.firstChild!;
    words.setStart(text, 0);
    words.setEnd(text, text.textContent!.trimEnd().length);
    return {
      // The space between "Show" and the number: a word space, narrower than the button's gap.
      space: number.left - words.getBoundingClientRect().right,
      gap: parseFloat(getComputedStyle(element).columnGap),
    };
  });
  expect(spacing.space).toBeGreaterThan(0);
  expect(spacing.space).toBeLessThan(spacing.gap);
  // A badge is an item of its own, the gap from the words before it: only the number's button
  // holds a run of text.
  await expect(
    page.getByTestId('button-counts-light').locator('.env-button .env-button-text'),
  ).toHaveCount(1);
});

test('a text button alone in a box as wide as its content keeps its words in a line', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=button-counts`);
  const button = page.getByTestId('text-alone-light');
  await expect(button).toHaveText('Alex Morgan');
  // Its margins give its padding back, which its largest width allows for.
  const lines = await button.evaluate((element) => {
    const words = document.createRange();
    words.selectNodeContents(element);
    return new Set([...words.getClientRects()].map((line) => Math.round(line.top))).size;
  });
  expect(lines).toBe(1);
});

test('a pending button keeps its label and name, reports busy and ignores presses', async ({
  page,
  browserName,
}) => {
  await page.goto(fixture);
  const button = page.getByTestId('pending-button');
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button.locator('.env-spinner')).toBeVisible();
  // The label stays in its full color, which holds its contrast on the fill, and the spinner turns
  // in the same color beside it, as an arc alone rather than a labelled status line.
  await expect(button.locator('.env-button-content')).toHaveText('Save changes');
  const color = await button.evaluate((element) => getComputedStyle(element).color);
  await expect(button.locator('.env-button-content')).toHaveCSS('color', color);
  await expect(button.locator('.env-spinner')).toHaveCSS('color', color);
  await expect(button.locator('.env-spinner')).toHaveAttribute('data-label-hidden', '');
  await button.click({ force: true });
  await expect(page.getByTestId('pending-presses')).toHaveText('0');
  await expect(page.getByRole('progressbar', { name: 'Refreshing seats' })).toBeVisible();
  if (browserName === 'chromium') {
    // The browser's own accessibility tree, which drops visually hidden text, still names it.
    const session = await page.context().newCDPSession(page);
    const { root } = await session.send('DOM.getDocument', { depth: -1 });
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '[data-testid="pending-button"]',
    });
    const { nodes } = await session.send('Accessibility.getPartialAXTree', {
      nodeId,
      fetchRelatives: false,
    });
    expect(nodes[0].name?.value).toBe('Save changes');
  }
});

test('ConfirmButton names the consequence and runs only on a deliberate second press', async ({
  page,
}) => {
  const errors = collectErrors(page);
  // The fixture's buttons disarm after 800 ms, a timer on the stopped clock.
  await stopClock(page);
  await page.goto(fixture);
  const button = page.getByTestId('confirm-button');
  const confirmed = page.getByTestId('confirmed');
  const status = page.locator('.env-confirm-button-status').first();
  await expect(button).toHaveText('Remove');
  await expect(button).toHaveAttribute('data-variant', 'outline');

  await button.click();
  await expect(button).toHaveText('Remove Morgan');
  await expect(button).toHaveAttribute('data-tone', 'danger');
  await expect(status).toHaveText('Remove Morgan. Press again to confirm.');
  await page.clock.runFor(450);
  await button.click();
  await expect(confirmed).toHaveText('1');
  await expect(button).toHaveText('Remove');
  await expect(status).toHaveText('');

  // A double click only arms it.
  await button.dblclick();
  await expect(button).toHaveText('Remove Morgan');
  await expect(confirmed).toHaveText('1');
  // Escape, leaving the button and waiting all disarm it.
  await button.press('Escape');
  await expect(button).toHaveText('Remove');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveText('Remove Morgan');
  await page.keyboard.press('Tab');
  await expect(button).toHaveText('Remove');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveText('Remove Morgan');
  await page.clock.runFor(800);
  await expect(button).toHaveText('Remove');
  await expect(confirmed).toHaveText('1');
  expect(errors).toEqual([]);
});

test('an icon-only ConfirmButton is round at rest and names the consequence when armed', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await stopClock(page);
  await page.goto(fixture);
  const button = page.getByTestId('confirm-icon-button');
  const confirmed = page.getByTestId('confirmed');
  await expect(button).toHaveAccessibleName('Remove Morgan');
  await expect(button).toHaveClass(/env-icon-button/);
  await expect(button).toHaveAttribute('data-variant', 'secondary');
  // The adoption fixture takes the default scale, compact under the fine pointer of the tests.
  const rest = (await button.boundingBox())!;
  expect(rest.width).toBeCloseTo(32, 0);
  expect(rest.height).toBeCloseTo(32, 0);
  // Round like IconButton: the corners take at least half the height.
  expect(
    await button.evaluate((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius)),
  ).toBeGreaterThanOrEqual(16);

  // Keyboard arming keeps focus on the button while it grows to name the consequence.
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAccessibleName('Remove');
  await expect(button).toHaveText('Remove');
  await expect(button).toHaveAttribute('data-tone', 'danger');
  await expect(button).not.toHaveClass(/env-icon-button/);
  await expect(button).toBeFocused();
  await expect(button.locator('.env-icon')).toHaveCount(1);
  expect((await button.boundingBox())!.width).toBeGreaterThan(rest.width + 40);
  await expect(page.locator('.env-confirm-button-status').nth(1)).toHaveText(
    'Remove. Press again to confirm.',
  );
  await page.clock.runFor(450);
  await page.keyboard.press('Enter');
  await expect(confirmed).toHaveText('1');
  await expect(button).toHaveAccessibleName('Remove Morgan');
  await expect(button).toHaveClass(/env-icon-button/);
  await expect(button).toBeFocused();

  await button.click();
  await expect(button).toHaveText('Remove');
  await button.press('Escape');
  await expect(button).toHaveClass(/env-icon-button/);
  await expect(confirmed).toHaveText('1');
  expect(errors).toEqual([]);
});

test('motion settles presses and respects reduced motion', async ({ page }) => {
  await page.goto(fixture);
  const button = page.getByTestId('router-button');
  await button.hover();
  await page.mouse.down();
  await expect(button).not.toHaveCSS('transform', 'none');
  await page.mouse.up();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await button.hover();
  await page.mouse.down();
  await expect(button).toHaveCSS('transform', 'none');
  await page.mouse.up();
});

test(
  'every variant keeps its focus ring clear of its label, and a text button lines up with the text',
  { tag: '@engines' },
  async ({ page }) => {
    await openServerMarkup(
      page,
      `import {createElement as h} from 'react';
      import {Button} from '@envsemble/envui';
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'text'];
      export const element = h('div', {style: {padding: '2rem'}},
        h('p', {id: 'edge', style: {margin: 0}}, 'Edge'),
        h('div', {style: {display: 'flex', gap: '1rem', flexWrap: 'wrap'}},
          variants.map((variant) => h(Button, {key: variant, variant, 'data-testid': variant},
            'Learn more'))),
        h('div', {style: {display: 'flex'}}, h(Button, {variant: 'text', 'data-testid': 'aligned'},
          'Learn more')));`,
    );
    const rings: Record<string, { outer: number }> = {};
    for (const variant of ['primary', 'secondary', 'outline', 'ghost', 'text']) {
      const button = page.getByTestId(variant);
      // Keyboard focus, so :focus-visible draws the ring: the buttons are the page's tab stops.
      await page.keyboard.press('Tab');
      await expect(button).toBeFocused();
      const ring = await button.evaluate((element) => {
        const style = getComputedStyle(element);
        const offset = parseFloat(style.outlineOffset);
        const box = element.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(element);
        const label = range.getBoundingClientRect();
        // The ring's inner edge is the border box grown by the offset; the label must keep 2 px
        // from it on every side, also where the pill's round ends curve in at the label's corners.
        const radius = (box.height + 2 * offset) / 2;
        const rise = Math.max(0, label.height / 2 - 0);
        const curve = radius - Math.sqrt(Math.max(0, radius ** 2 - rise ** 2));
        return {
          style: style.outlineStyle,
          inline: Math.min(label.left - box.left, box.right - label.right) + offset - curve,
          block: Math.min(label.top - box.top, box.bottom - label.bottom) + offset,
          outer: box.height + 2 * (offset + parseFloat(style.outlineWidth)),
        };
      });
      expect(ring.style, variant).toBe('solid');
      expect(ring.inline, variant).toBeGreaterThanOrEqual(2);
      expect(ring.block, variant).toBeGreaterThanOrEqual(2);
      rings[variant] = ring;
    }
    // A ghost button's ring traces its state layer: no bigger than a filled button's.
    expect(rings.ghost!.outer).toBeLessThanOrEqual(rings.secondary!.outer);
    // The text button's padding is taken back by its margin: its label starts where the text does.
    const edge = (await page.locator('#edge').boundingBox())!.x;
    const label = await page.getByTestId('aligned').evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().left;
    });
    expect(Math.abs(label - edge)).toBeLessThan(0.5);
  },
);

test(
  'the end slot holds keys in the label color at the far end, with the icon and label at the start',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(fixture);
    const button = page.getByTestId('end-button');
    // The keys are hidden and announced by aria-keyshortcuts, so the name is the label alone.
    await expect(button).toHaveAccessibleName('Search');
    await expect(button).toHaveAttribute('aria-keyshortcuts', 'Control+K');
    const end = button.locator('.env-button-end');
    await expect(end).toHaveText('Ctrl+K');
    const layout = await button.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const icon = element.querySelector('.env-icon')!.getBoundingClientRect();
      const keys = element.querySelector('.env-button-end')!.getBoundingClientRect();
      const probe = document.createElement('span');
      probe.style.color = 'color-mix(in srgb, currentColor 80%, transparent)';
      element.append(probe);
      const separator = getComputedStyle(probe).color;
      probe.remove();
      const cap = getComputedStyle(element.querySelector('.env-button-end .env-kbd')!);
      return {
        startGap: icon.left - box.left - parseFloat(style.paddingInlineStart),
        endGap: box.right - parseFloat(style.paddingInlineEnd) - keys.right,
        label: style.color,
        endColor: getComputedStyle(element.querySelector('.env-button-end')!).color,
        capColor: cap.color,
        capFill: cap.backgroundColor,
        separator,
        separatorColor: getComputedStyle(element.querySelector('.env-kbd-separator')!).color,
      };
    });
    // The icon starts at the padding and the keys end at it, with the room between them.
    expect(Math.abs(layout.startGap)).toBeLessThan(1);
    expect(Math.abs(layout.endGap)).toBeLessThan(1);
    // The slot and its keys take the button's own content color, each key on a faint fill of it as
    // keys are drawn everywhere, and the + between the keys is quieter, which the contrast gate
    // measures on every variant.
    expect(layout.endColor).toBe(layout.label);
    expect(layout.capColor).toBe(layout.label);
    const [red, green, blue, alpha] = channels(layout.capFill);
    const label = channels(layout.label);
    expect([red, green, blue].map(Math.round)).toEqual(label.slice(0, 3).map(Math.round));
    expect(alpha).toBeCloseTo(0.1, 2);
    expect(layout.separatorColor).toBe(layout.separator);
  },
);

/** The sRGB channels, 0 to 255, and alpha of a computed color, rgb() or color(srgb …). */
function channels(color: string) {
  const srgb = /^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)$/.exec(color);
  if (srgb) return [...srgb.slice(1, 4).map((value) => Number(value) * 255), Number(srgb[4] ?? 1)];
  const rgb = /^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/.exec(color);
  if (!rgb) throw new Error(`Cannot read the color ${color}`);
  return [...rgb.slice(1, 4).map(Number), Number(rgb[4] ?? 1)];
}

test('a button given its own colors lays state layers of its content color over its container', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=colors`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const container = [11, 110, 79];
  const content = [255, 255, 255];
  // The state opacities are tokens: 8% under the pointer and 10% pressed in the light theme.
  const opacity = await page.getByTestId('color-overrides').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      hover: Number(style.getPropertyValue('--env-state-hover-opacity')),
      pressed: Number(style.getPropertyValue('--env-state-pressed-opacity')),
    };
  });
  expect(opacity).toEqual({ hover: 0.08, pressed: 0.1 });
  const layered = (share: number) =>
    container.map((channel, index) => channel * (1 - share) + content[index] * share);
  /** Waits until the button's fill is `expected`, within rounding. */
  async function expectFill(button: import('@playwright/test').Locator, expected: number[]) {
    await expect
      .poll(async () => {
        const [r, g, b, alpha] = channels(
          await button.evaluate((element) => getComputedStyle(element).backgroundColor),
        );
        return Math.max(...[r, g, b].map((value, index) => Math.abs(value - expected[index])), 0) <
          1 && alpha === 1
          ? 'matches'
          : `${r} ${g} ${b} / ${alpha}`;
      })
      .toBe('matches');
  }
  // Every variant takes the container in place of its designed fills, whose states give way to
  // the state layers.
  for (const variant of ['primary', 'secondary', 'outline'] as const) {
    const button = page.getByTestId(`custom-button-${variant}`);
    await button.evaluate((element) => {
      element.style.setProperty('--env-button-container', 'rgb(11 110 79)');
      element.style.setProperty('--env-button-content', 'rgb(255 255 255)');
    });
    await expect(button, variant).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expectFill(button, container);
    await button.hover();
    await expectFill(button, layered(opacity.hover));
    await page.mouse.down();
    await expectFill(button, layered(opacity.pressed));
    await page.mouse.up();
    await page.mouse.move(0, 0);
    await expectFill(button, container);
  }
  // Its content alone set, a button keeps its own fill at rest and lays the content over it.
  const tinted = page.getByTestId('light-button-secondary');
  await tinted.evaluate((element) =>
    element.style.setProperty('--env-button-content', 'rgb(11 110 79)'),
  );
  const rest = await tinted.evaluate((element) => getComputedStyle(element).backgroundColor);
  await tinted.hover();
  const expected = await tinted.evaluate((element) => {
    const probe = document.createElement('span');
    probe.style.backgroundColor =
      'color-mix(in srgb, var(--env-color-bg-neutral-muted), rgb(11 110 79) calc(var(--env-state-hover-opacity) * 100%))';
    element.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
  // Within rounding: the gate that tells a set content mixes in 0% of it.
  await expect
    .poll(async () => {
      const actual = channels(
        await tinted.evaluate((element) => getComputedStyle(element).backgroundColor),
      );
      return channels(expected).every((value, index) => Math.abs(value - actual[index]) < 0.01);
    })
    .toBe(true);
  expect(expected).not.toBe(rest);
  await page.mouse.move(0, 0);
  // The color properties don't inherit: set on an element around a button, they color nothing.
  const outside = page.getByTestId('override-outside');
  const before = await outside.evaluate((element) => getComputedStyle(element).backgroundColor);
  await page
    .getByTestId('color-overrides')
    .evaluate((element) => element.style.setProperty('--env-button-container', 'rgb(11 110 79)'));
  await expect(outside).toHaveCSS('background-color', before);
});
