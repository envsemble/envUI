import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';
// The type brings dev mode's `window.envui` with it.
import type { LayoutProblem } from '@envsemble/envui/dev';

/** The skeletons fixture, once dev mode has installed `envui.layout`. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=skeletons`);
  await page.waitForFunction(() => window.envui?.layout !== undefined);
  // The bars are measured from the text, which the web font widens when it arrives, after the page
  // has loaded on a busy machine: wait for it, and for the frame in which the bars are drawn again.
  await page.evaluate(async () => {
    await document.fonts.load('1em "envUI Geist"');
    await document.fonts.ready;
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    await frame();
    await frame();
  });
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

test('a skeleton is one busy region with inert content, draws text as bars and shapes, and loads in place', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const projects = page.getByTestId('projects');
  await expect(projects).toHaveAttribute('data-env-skeleton', '');
  await expect(projects).toHaveAttribute('aria-busy', 'true');
  // The root stays in the accessibility tree, so its busy state is heard; its content is inert.
  await expect(projects).toHaveJSProperty('inert', false);
  await expect(projects.locator('> .env-skeleton-content')).toHaveJSProperty('inert', true);
  // Exactly one busy region is exposed, however many skeletons are nested inside it.
  const exposedBusy = (selector: string) =>
    page.evaluate((root) => {
      const scope = document.querySelector(root)!;
      return [scope, ...scope.querySelectorAll('[aria-busy="true"]')].filter(
        (element) => element.getAttribute('aria-busy') === 'true' && !element.closest('[inert]'),
      ).length;
    }, selector);
  expect(await exposedBusy('[data-testid="projects"]')).toBe(1);
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
  // A control is a filled shape of the skeleton's paint: its fill with a soft highlight across it,
  // laid out on the window so it crosses every skeleton as one, and its own rounded corners.
  const button = '[data-testid="projects"] .env-button';
  expect(await style(page, button, 'background-image')).toMatch(/^linear-gradient\(/);
  expect(await style(page, button, 'background-attachment')).toBe('fixed');
  expect(Number.parseFloat(await style(page, button, 'border-top-left-radius'))).toBeGreaterThan(0);
  // What a shape holds, such as an avatar's initials, isn't drawn.
  expect(await style(page, '[data-testid="owner-row"] .env-avatar *', 'visibility')).toBe('hidden');

  // Missing text over placeholder items is a bar of its text style's default length.
  const heading = '[data-testid="project-card"] .env-card-heading';
  await expect(page.locator(heading).first()).toBeEmpty();
  expect(await style(page, heading, 'display', '::before')).toBe('inline-block');
  // A bar has small rounded corners on every line: its mask is a rounded rectangle per line.
  expect(await style(page, heading, 'mask-image', '::before')).toMatch(/data:image\/svg\+xml.*rx/);
  expect(await style(page, heading, 'background-image', '::before')).toMatch(/^linear-gradient\(/);
  const description = '[data-testid="project-card"] .env-card-description';
  // A card's supporting sentence: one line, as tall as the line it stands for.
  expect(
    Number.parseFloat(await style(page, description, 'block-size', '::before')) /
      Number.parseFloat(await style(page, description, 'line-height')),
  ).toBeCloseTo(1);
  // The title and the meta share one row, as they do once the text loads.
  const header = page.locator('[data-testid="project-card"] .env-card-header').first();
  const lineHeight = Number.parseFloat(await style(page, heading, 'line-height'));
  expect((await header.boundingBox())!.height).toBeLessThanOrEqual(lineHeight + 1);
  const skeletonCard = (await page.getByTestId('project-card').first().boundingBox())!;
  expect(await style(page, '[data-testid="name-cell"]', 'display', '::before')).toBe(
    'inline-block',
  );
  // A count badge is a filled shape too, whatever its variant: no fill or edge of its own.
  const shape = await style(page, '[data-testid="badge-skeleton"]', 'background-image');
  for (const count of ['count-solid-skeleton', 'count-outline-skeleton']) {
    expect(await style(page, `[data-testid="${count}"]`, 'background-image')).toBe(shape);
    expect(await style(page, `[data-testid="${count}"]`, 'border-top-color')).toBe(
      'rgba(0, 0, 0, 0)',
    );
  }

  // A top bar's missing title is a bar too.
  await expect(page.getByTestId('top-bar')).toHaveAttribute('aria-busy', 'true');
  expect(
    await style(page, '[data-testid="top-bar"] .env-top-bar-title', 'display', '::before'),
  ).toBe('inline-block');

  // Content laid out as a block of its own in the line draws its own bar.
  expect(await style(page, '[data-testid="kbd"]', 'text-decoration-line')).toBe('line-through');
  expect(
    await style(
      page,
      '[data-testid="inline-blocks"] .env-animated-number-value',
      'text-decoration-line',
    ),
  ).toBe('line-through');
  // Running text in a narrow column wraps onto several lines, each drawn as a bar.
  const multi = page.getByTestId('multi-line');
  const lines = await multi.evaluate(
    (element) =>
      element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight),
  );
  expect(lines).toBeGreaterThanOrEqual(2);

  // Loaded: the same components over the items, no longer a skeleton.
  await page.getByRole('button', { name: 'Load' }).click();
  await expect(projects).not.toHaveAttribute('data-env-skeleton');
  await expect(projects).not.toHaveAttribute('aria-busy');
  await expect(projects.locator('> .env-skeleton-content')).toHaveCount(0);
  await expect(page.getByTestId('reader')).toHaveText('loaded');
  await expect(page.locator(heading).first()).toHaveText('Launch brief');
  // The card keeps its size as its text loads.
  const loadedCard = (await page.getByTestId('project-card').first().boundingBox())!;
  expect(Math.abs(loadedCard.height - skeletonCard.height)).toBeLessThanOrEqual(1);
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
  // A control's shape takes the paint as it is: no transition of its own starts again on every
  // frame of the sweep and lags behind it.
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation instanceof CSSTransition &&
              (animation.effect as KeyframeEffect | null)?.target?.closest('[data-env-skeleton]'),
          ).length,
    ),
  ).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await animations()).length).toBe(0);
});

test(
  'a skeleton popup is the busy root, keeps focus and closes, its content inert',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.getByRole('button', { name: 'Open the menu' }).click();
    const menu = page.locator('.env-menu');
    await expect(menu).toHaveAttribute('aria-busy', 'true');
    await expect(menu).toHaveAttribute('data-env-skeleton', '');
    await expect(menu.locator('> .env-skeleton-content')).toHaveJSProperty('inert', true);
    await expect(menu).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();

    await page.getByRole('button', { name: 'Open the dialog' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-busy', 'true');
    await expect(dialog).toHaveAttribute('data-env-skeleton', '');
    await expect(dialog.locator('.env-dialog-content')).toHaveJSProperty('inert', true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // Raw text in a popup's content is a bar too: the popup draws the line through it.
    await page.getByRole('button', { name: 'Open the popover' }).click();
    const popover = page.locator('.env-popover');
    await expect(popover).toHaveAttribute('aria-busy', 'true');
    await expect(popover).toHaveCSS('text-decoration-line', 'line-through');
    await expect(popover.locator('> .env-skeleton-content')).toHaveCSS('display', 'contents');
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
  },
);

test('a Spinner with showLabel is a busy status with its label, for loading with no known shape', async ({
  page,
}) => {
  await open(page);
  const state = page.getByTestId('loading-state');
  await expect(state).toHaveRole('status');
  await expect(state).toHaveAttribute('aria-busy', 'true');
  await expect(state).toHaveText('Loading activity');
  await expect(state).toHaveClass(/env-spinner/);
  await expect(state.locator('.env-spinner-label')).toBeVisible();
  await expect(state.locator('svg')).toHaveAttribute('aria-hidden', 'true');
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

test('a list holds no wrapper: it is inert, and a hidden status beside it says what is loading', async ({
  page,
}) => {
  await open(page);
  const list = page.getByTestId('list-skeleton');
  await expect(list).toHaveJSProperty('inert', true);
  await expect(list).not.toHaveAttribute('aria-busy');
  const status = page.locator('[data-testid="list-skeleton"] + .env-skeleton-status');
  await expect(status).toHaveRole('status');
  // Its text goes in once it is in the page, so it is announced; it names the list.
  await expect(status).toHaveText('Loading: Owners loading');
});

test('a row as a skeleton on its own is inert, its start slot included', async ({ page }) => {
  await open(page);
  const row = page.getByTestId('row-skeleton');
  await expect(row).toHaveAttribute('aria-busy', 'true');
  const checkbox = row.getByRole('checkbox', { includeHidden: true });
  expect(await checkbox.evaluate((element) => element.closest('[inert]') !== null)).toBe(true);
  await expect(checkbox).not.toBeFocused();
  await checkbox.evaluate((element) => (element as HTMLElement).focus());
  await expect(checkbox).not.toBeFocused();
});

test('a skeleton takes the boxes its content takes loaded, through its inert wrapper', async ({
  page,
}) => {
  await open(page);
  /** Each child's box, from the start of the region, and the region's own size. */
  const boxes = (id: string) =>
    page.getByTestId(id).evaluate((root) => {
      const origin = root.getBoundingClientRect();
      const children = Array.from(
        root.querySelectorAll('p, h3, blockquote, .env-list, .env-list-item'),
      );
      return [
        [Math.round(origin.width), Math.round(origin.height)],
        ...children.map((child) => {
          const box = child.getBoundingClientRect();
          return [box.x - origin.x, box.y - origin.y, box.width, box.height].map(Math.round);
        }),
      ];
    });
  // Raw text elements in a column keep no margins, also inside the wrapper.
  expect(await boxes('paragraphs-skeleton')).toEqual(await boxes('paragraphs-loaded'));
  // Lists on a muted surface keep their space between them, also with the status beside them.
  expect(await boxes('lists-skeleton')).toEqual(await boxes('lists-loaded'));
  // The shift check toggles the wrapper with the attribute, so it sees the same.
  const shifts = await page.evaluate(() =>
    window.envui!.layout!.skeletonShift('[data-testid="paragraphs-loaded"]'),
  );
  expect(shifts).toEqual([]);
  await expect(
    page.getByTestId('paragraphs-loaded').locator('> .env-skeleton-content'),
  ).toHaveCount(0);
  await expect(
    page.getByTestId('paragraphs-skeleton').locator('> .env-skeleton-content'),
  ).toHaveCount(1);
});

test('navigation as a skeleton: icons are shapes, labels bars, no current fill', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  for (const [id, label] of [
    ['drawer', 'env-drawer-label'],
    ['rail', 'env-rail-label'],
    ['bar', 'env-bar-text'],
  ]) {
    const nav = page.getByTestId(id);
    await expect(nav).toHaveAttribute('aria-busy', 'true');
    await expect(nav.locator('> .env-skeleton-content')).toHaveJSProperty('inert', true);
    expect(await style(page, `[data-testid="${id}"] .${label}`, 'display', '::before')).toBe(
      'inline-block',
    );
    expect(await style(page, `[data-testid="${id}"] .env-icon`, 'background-image')).toMatch(
      /^linear-gradient/,
    );
  }
});

test('right to left, the bars start at the right', async ({ page }) => {
  await open(page);
  const title = page.getByTestId('rtl-title');
  expect(await style(page, '[data-testid="rtl-title"]', 'direction')).toBe('rtl');
  // The placeholder sits at the start of the line, its right: the space left of it is empty.
  const offset = await title.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const box = element.getBoundingClientRect();
    const bar = parseFloat(getComputedStyle(element, '::before').inlineSize);
    return { box: box.width, bar };
  });
  expect(offset.bar).toBeLessThan(offset.box);
});

test('in forced colors, bars and shapes stay visible in the system gray', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await open(page);
  const heading = '[data-testid="project-card"] .env-card-heading';
  // The paint is the system gray throughout, the highlight included.
  const bar = await style(page, heading, 'background-image', '::before');
  expect(bar).toMatch(/^linear-gradient/);
  expect(bar).not.toContain('rgba(0, 0, 0, 0)');
  // Text that is there is drawn by the bar layer over the content, in the system gray too.
  const layer = await style(page, '[data-testid="projects"]', 'background-image', '::after');
  expect(layer).toMatch(/^linear-gradient/);
  expect(layer).not.toContain('rgba(0, 0, 0, 0)');
  expect(await style(page, '[data-testid="projects"] .env-avatar', 'background-image')).toBe(bar);
});

test('text that is there draws as rounded bars over its line boxes, which shimmer with the rest', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const projects = page.getByTestId('projects');
  // The script marks the root once it has measured its text, and the line through goes.
  await expect(projects).toHaveAttribute('data-env-skeleton-text', '');
  expect(await style(page, '[data-testid="projects"]', '--env-skeleton-color')).toBe('transparent');
  // One rounded bar per line box of the heading that is there, laid over it in the bar layer.
  const bars = await projects.evaluate((root) => {
    const value = root.style.getPropertyValue('--env-skeleton-text-bars');
    const layers = [...value.matchAll(/(-?[\d.]+)px (-?[\d.]+)px \/ ([\d.]+)px ([\d.]+)px/g)].map(
      (match) => match.slice(1).map(Number),
    );
    const heading = root.querySelector('h2')!;
    const range = document.createRange();
    range.selectNodeContents(heading);
    const line = range.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    return {
      layers,
      heading: [line.left - box.left - root.clientLeft, line.width],
    };
  });
  const [x, width] = bars.heading;
  expect(bars.layers.some(([left, , w]) => Math.abs(left - x) < 1 && Math.abs(w - width) < 1)).toBe(
    true,
  );
  const after = await projects.evaluate((root) => {
    const style = getComputedStyle(root, '::after');
    return { mask: style.maskImage, paint: style.backgroundImage, position: style.position };
  });
  expect(after.mask).toContain('data:image/svg+xml');
  expect(after.paint).toMatch(/^linear-gradient/);
  expect(after.position).toBe('absolute');
  // The surface itself carries the highlight over its fill.
  expect(await style(page, '[data-testid="projects"]', 'background-image')).toMatch(
    /linear-gradient/,
  );
  // Loaded, the bars and the marks go.
  await page.getByRole('button', { name: 'Load' }).click();
  await expect(projects).not.toHaveAttribute('data-env-skeleton-text');
  expect(
    await projects.evaluate((root) => root.style.getPropertyValue('--env-skeleton-text-bars')),
  ).toBe('');
});

test('a skeleton root that scrolls draws the bars past its box, in either direction', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  for (const dir of ['ltr', 'rtl']) {
    const root = page.getByTestId(`scrolling-${dir}`);
    await expect(root).toHaveAttribute('data-env-skeleton-text', '');
    const layout = await root.evaluate((element) => {
      const value = element.style.getPropertyValue('--env-skeleton-text-bars');
      const bars = [...value.matchAll(/(-?[\d.]+)px (-?[\d.]+)px \/ ([\d.]+)px ([\d.]+)px/g)].map(
        (match) => match.slice(1).map(Number),
      );
      const after = getComputedStyle(element, '::after');
      return {
        bars,
        layer: [after.width, after.height].map(parseFloat),
        box: [element.clientWidth, element.clientHeight],
        scroll: [element.scrollWidth, element.scrollHeight],
      };
    });
    const [width, height] = layout.layer;
    // The content overflows the box both ways, and the layer reaches past it to every bar.
    expect(layout.scroll[0]).toBeGreaterThan(layout.box[0]);
    expect(layout.scroll[1]).toBeGreaterThan(layout.box[1]);
    expect(width).toBeGreaterThan(layout.box[0]);
    expect(height).toBeGreaterThan(layout.box[1]);
    expect(layout.bars.length).toBeGreaterThanOrEqual(6);
    for (const [x, y, w, h] of layout.bars) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + w).toBeLessThanOrEqual(width + 0.5);
      expect(y + h).toBeLessThanOrEqual(height + 0.5);
    }
    // It never makes the root scroll further than its content does.
    expect(await root.evaluate((element) => [element.scrollWidth, element.scrollHeight])).toEqual(
      layout.scroll,
    );
  }
});
