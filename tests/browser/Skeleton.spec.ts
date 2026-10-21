import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';
// The type brings dev mode's `window.envui` with it.
import type { LayoutProblem } from '@envsemble/envui/dev';

/** The skeletons fixture, once dev mode has installed `envui.layout`. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=skeletons`);
  await page.waitForFunction(() => window.envui?.layout !== undefined);
}

/** A computed style of an element, or of one of its pseudo-elements. */
function style(page: Page, selector: string, property: string, pseudo?: string) {
  return page
    .locator(selector)
    .first()
    .evaluate(
      (element, [name, pseudoElement]) =>
        getComputedStyle(element, pseudoElement ?? null).getPropertyValue(name),
      [property, pseudo] as const,
    );
}

test('a skeleton is busy and inert, draws text as bars and shapes, and loads in place', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const projects = page.getByTestId('projects');
  await expect(projects).toHaveAttribute('data-env-skeleton', '');
  await expect(projects).toHaveAttribute('aria-busy', 'true');
  await expect(projects).toHaveJSProperty('inert', true);
  // Inert content is skipped by the keyboard: Tab goes from the button before it to the next
  // surface's controls.
  await page.getByRole('button', { name: 'Load' }).focus();
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() =>
      document.activeElement?.closest('[data-testid]')?.getAttribute('data-testid'),
    ),
  ).toBe('loaded');
  await expect(page.getByTestId('reader')).toHaveText('in a skeleton');

  // Text is drawn as a line through it, in the skeleton's color, never as letters.
  expect(await style(page, '[data-testid="projects"]', 'text-decoration-line')).toBe(
    'line-through',
  );
  expect(await style(page, '[data-testid="raw"]', '-webkit-text-fill-color')).toBe(
    'rgba(0, 0, 0, 0)',
  );
  const color = await style(page, '[data-testid="projects"]', '--env-skeleton-color');
  // A control is a filled shape of the skeleton's color.
  const button = '[data-testid="projects"] .env-button';
  expect(await style(page, button, 'background-color')).toBe(
    await page.evaluate((value) => {
      const probe = document.createElement('i');
      probe.style.color = value;
      document.body.append(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved;
    }, color),
  );
  // What a shape holds, such as an avatar's initials, isn't drawn.
  expect(await style(page, '[data-testid="owner-row"] .env-avatar *', 'visibility')).toBe('hidden');

  // Missing text over placeholder items is a bar of its text style's default length.
  const heading = '[data-testid="project-card"] .env-card-heading';
  await expect(page.locator(heading).first()).toBeEmpty();
  expect(await style(page, heading, 'display', '::before')).toBe('inline-block');
  expect(await style(page, heading, 'inline-size', '::before')).toBe('160px');
  const description = '[data-testid="project-card"] .env-card-description';
  // Running text: three lines.
  expect(
    Number.parseFloat(await style(page, description, 'block-size', '::before')) /
      Number.parseFloat(await style(page, description, 'line-height')),
  ).toBeCloseTo(3);
  expect(await style(page, '[data-testid="name-cell"]', 'display', '::before')).toBe(
    'inline-block',
  );
  expect(await style(page, '[data-testid="stat"] .env-stat-value', 'display', '::before')).toBe(
    'inline-block',
  );

  // A top bar's missing title is a bar too.
  await expect(page.getByTestId('top-bar')).toHaveAttribute('aria-busy', 'true');
  expect(
    await style(page, '[data-testid="top-bar"] .env-top-bar-title', 'display', '::before'),
  ).toBe('inline-block');

  // Loaded: the same components over the items, no longer a skeleton.
  await page.getByRole('button', { name: 'Load' }).click();
  await expect(projects).not.toHaveAttribute('data-env-skeleton');
  await expect(projects).not.toHaveAttribute('aria-busy');
  await expect(projects).toHaveJSProperty('inert', false);
  await expect(page.getByTestId('reader')).toHaveText('loaded');
  await expect(page.locator(heading).first()).toHaveText('Launch brief');
  expect(await style(page, '[data-testid="projects"]', 'text-decoration-line')).toBe('none');
  // A given slot that stays empty takes no room outside a skeleton.
  await page.getByRole('button', { name: 'Unload' }).click();
  await expect(projects).toHaveAttribute('data-env-skeleton', '');
  await projects.evaluate((element) => element.removeAttribute('data-env-skeleton'));
  expect(await style(page, heading, 'display')).toBe('none');
});

test('the shimmer runs in step across the page, and stays still with reduced motion', async ({
  page,
}) => {
  await open(page);
  const animations = () =>
    page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => (animation as CSSAnimation).animationName === 'env-skeleton-shimmer')
        .map((animation) => animation.startTime),
    );
  // The surface over placeholders and the card that is a skeleton itself, started at once.
  await expect.poll(async () => (await animations()).length).toBeGreaterThanOrEqual(2);
  expect(new Set(await animations())).toEqual(new Set([0]));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await animations()).length).toBe(0);
});

test(
  'a skeleton popup keeps focus and closes, its content busy and inert',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.getByRole('button', { name: 'Open the menu' }).click();
    const menu = page.locator('.env-menu');
    await expect(menu).toHaveAttribute('aria-busy', 'true');
    await expect(menu.locator('.env-popup-skeleton')).toHaveJSProperty('inert', true);
    await expect(menu).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();

    await page.getByRole('button', { name: 'Open the dialog' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.locator('.env-dialog-content')).toHaveAttribute('data-env-skeleton', '');
    await expect(dialog.locator('.env-dialog-content')).toHaveJSProperty('inert', true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  },
);

test('LoadingState is a spinner with a label, for loading with no known shape', async ({
  page,
}) => {
  await open(page);
  const state = page.getByTestId('loading-state');
  await expect(state).toHaveRole('status');
  await expect(state).toHaveAttribute('aria-busy', 'true');
  await expect(state).toHaveText('Loading activity');
  await expect(state.locator('.env-spinner')).toBeVisible();
});

test('the shift check reports what moves or resizes when a skeleton loads', async ({ page }) => {
  await open(page);
  const check = (selector: string) =>
    page.evaluate((root) => window.envui!.layout!.skeletonShift(root), selector);
  // Bars and shapes change paint only.
  expect(await check('[data-testid="loaded"]')).toEqual([]);
  // A part whose skeleton look changes its size is reported, and only it, not what holds it.
  const problems: LayoutProblem[] = await check('[data-testid="shifting"]');
  expect(problems.map(({ rule, node, path }) => [rule, node, path])).toEqual([
    ['skeleton-shift', 'env-text', 'env-surface > env-text'],
    // Media without an aspect ratio is reported too, whether or not it moves now.
    ['skeleton-shift', 'img', 'env-surface > img'],
  ]);
  expect(problems[0].message).toMatch(/changes from [\d.]+rem×[\d.]+rem to /);
  // The surface is put back as it was.
  await expect(page.getByTestId('loaded')).not.toHaveAttribute('data-env-skeleton');
  await expect(page.getByTestId('projects')).toHaveAttribute('data-env-skeleton', '');
});
