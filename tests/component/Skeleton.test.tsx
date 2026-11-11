import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
// The type brings dev mode's `window.envui` with it.
import type { LayoutProblem } from '@envsemble/envui/dev';
import * as fixture from '../fixture/Skeleton.fixture.tsx';
import { box, css, keyboard, nextFrames, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

/** The skeletons fixture, once dev mode has installed `envui.layout`. */
async function open() {
  mount(fixture);
  await expect.poll(() => window.envui?.layout !== undefined).toBe(true);
  // The bars are measured from the text, which the web font widens when it arrives, after the page
  // has loaded on a busy machine: wait for it, and for the frame in which the bars are drawn again.
  await document.fonts.load('1em "envUI Geist"');
  await document.fonts.ready;
  await nextFrames();
}

const pulseAnimations = () =>
  document
    .getAnimations()
    .filter((animation) =>
      (animation as CSSAnimation).animationName?.startsWith('env-skeleton-pulse'),
    );

/** Holds every skeleton's pulse at its start, so paints read at different moments compare. */
function holdPulses() {
  for (const animation of pulseAnimations()) {
    animation.pause();
    animation.currentTime = 0;
  }
}

/** A computed style of the first element a selector finds, or of one of its pseudo-elements. */
const style = (selector: string, property: string, pseudo?: string) =>
  css(document.querySelector(selector)!, property, pseudo);
/** The first element of a test id: some, such as the project cards, repeat. */
const byTestId = (testId: string) =>
  document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
/** Whether an element the page may have taken out no longer shows. */
const hidden = (element: Element) => () =>
  !element.isConnected || !shown(page.elementLocator(element));

test('a skeleton is one busy region with inert content, draws text as bars and shapes, and loads in place', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await open();
  holdPulses();
  const projects = byTestId('projects');
  expect(projects.getAttribute('data-env-skeleton')).toBe('');
  expect(projects.getAttribute('aria-busy')).toBe('true');
  // The root stays in the accessibility tree, so its busy state is heard; its content is inert.
  expect(projects.inert).toBe(false);
  expect(projects.querySelector<HTMLElement>(':scope > .env-skeleton-content')!.inert).toBe(true);
  // Exactly one busy region is exposed, however many skeletons are nested inside it.
  expect(
    [projects, ...projects.querySelectorAll('[aria-busy="true"]')].filter(
      (element) => element.getAttribute('aria-busy') === 'true' && !element.closest('[inert]'),
    ),
  ).toHaveLength(1);
  // Inert content is skipped by the keyboard: Tab goes from the button before it to the next
  // surface's controls.
  (page.getByRole('button', { name: 'Load' }).element() as HTMLElement).focus();
  await keyboard.press('Tab');
  expect(document.activeElement?.closest('[data-testid]')?.getAttribute('data-testid')).toBe(
    'loaded',
  );
  expect(byTestId('reader').textContent).toBe('in a skeleton');

  // Text is drawn as a line through it, in the skeleton's color, never as letters.
  expect(style('[data-testid="projects"]', 'text-decoration-line')).toBe('line-through');
  expect(style('[data-testid="raw"]', '-webkit-text-fill-color')).toBe('rgba(0, 0, 0, 0)');
  // A control is a filled shape of the skeleton's paint, with its own rounded corners.
  const button = '[data-testid="projects"] .env-button';
  expect(style(button, 'background-image')).toMatch(/^linear-gradient\(/);
  expect(Number.parseFloat(style(button, 'border-top-left-radius'))).toBeGreaterThan(0);
  // What a shape holds, such as an avatar's initials, isn't drawn.
  expect(style('[data-testid="owner-row"] .env-avatar *', 'visibility')).toBe('hidden');

  // Missing text over placeholder items is a bar of its text style's default length.
  const heading = '[data-testid="project-card"] .env-card-title';
  expect(document.querySelector(heading)!.textContent).toBe('');
  expect(style(heading, 'display', '::before')).toBe('inline-block');
  // A bar has small rounded corners on every line: its mask is a rounded rectangle per line.
  expect(style(heading, 'mask-image', '::before')).toMatch(/data:image\/svg\+xml.*rx/);
  expect(style(heading, 'background-image', '::before')).toMatch(/^linear-gradient\(/);
  const description = '[data-testid="project-card"] .env-card-description';
  // A card's supporting sentence: one line, as tall as the line it stands for.
  expect(
    Number.parseFloat(style(description, 'block-size', '::before')) /
      Number.parseFloat(style(description, 'line-height')),
  ).toBeCloseTo(1);
  // The title and the meta share one row, as they do once the text loads.
  const header = document.querySelector('[data-testid="project-card"] .env-card-header')!;
  expect(box(header).height).toBeLessThanOrEqual(
    Number.parseFloat(style(heading, 'line-height')) + 1,
  );
  const skeletonCard = box(byTestId('project-card'));
  expect(style('[data-testid="name-cell"]', 'display', '::before')).toBe('inline-block');
  // A count badge is a filled shape too, whatever its variant: no fill or edge of its own.
  const shape = style('[data-testid="badge-skeleton"]', 'background-image');
  for (const count of ['count-solid-skeleton', 'count-outline-skeleton']) {
    expect(style(`[data-testid="${count}"]`, 'background-image')).toBe(shape);
    expect(style(`[data-testid="${count}"]`, 'border-top-color')).toBe('rgba(0, 0, 0, 0)');
  }

  // A top bar's missing title is a bar too.
  expect(byTestId('top-bar').getAttribute('aria-busy')).toBe('true');
  expect(style('[data-testid="top-bar"] .env-top-bar-title', 'display', '::before')).toBe(
    'inline-block',
  );
  // Navigation: icons are shapes, labels bars, no current fill.
  for (const [id, label] of [
    ['drawer', 'env-navigation-drawer-label'],
    ['rail', 'env-navigation-rail-label'],
    ['bar', 'env-navigation-bar-label'],
  ]) {
    const nav = byTestId(id!);
    expect(nav.getAttribute('aria-busy'), id).toBe('true');
    expect(nav.querySelector<HTMLElement>(':scope > .env-skeleton-content')!.inert, id).toBe(true);
    expect(style(`[data-testid="${id}"] .${label}`, 'display', '::before'), id).toBe(
      'inline-block',
    );
    expect(style(`[data-testid="${id}"] .env-icon`, 'background-image'), id).toMatch(
      /^linear-gradient/,
    );
  }
  // A list holds no wrapper: it is inert, and a hidden status beside it says what is loading, its
  // text going in once it is in the page, so it is announced.
  const list = byTestId('list-skeleton');
  expect(list.inert).toBe(true);
  expect(list.hasAttribute('aria-busy')).toBe(false);
  const status = list.nextElementSibling!;
  expect(status.matches('.env-skeleton-status[role="status"]')).toBe(true);
  await expect.poll(() => status.textContent).toBe('Loading: Owners loading');

  // Content laid out as a block of its own in the line draws its own bar.
  expect(style('[data-testid="kbd"]', 'text-decoration-line')).toBe('line-through');
  expect(
    style('[data-testid="inline-blocks"] .env-animated-number-value', 'text-decoration-line'),
  ).toBe('line-through');
  // Running text in a narrow column wraps onto several lines, each drawn as a bar.
  const multi = byTestId('multi-line');
  expect(box(multi).height / Number.parseFloat(css(multi, 'line-height'))).toBeGreaterThanOrEqual(
    2,
  );

  // Loaded: the same components over the items, no longer a skeleton.
  await page.getByRole('button', { name: 'Load' }).click();
  await expect.poll(() => projects.hasAttribute('data-env-skeleton')).toBe(false);
  expect(projects.hasAttribute('aria-busy')).toBe(false);
  expect(projects.querySelector(':scope > .env-skeleton-content')).toBeNull();
  expect(byTestId('reader').textContent).toBe('loaded');
  expect(document.querySelector(heading)!.textContent).toBe('Launch brief');
  // The card keeps its size as its text loads.
  expect(Math.abs(box(byTestId('project-card')).height - skeletonCard.height)).toBeLessThanOrEqual(
    1,
  );
  expect(style('[data-testid="projects"]', 'text-decoration-line')).toBe('none');
  // A given slot that stays empty takes no room outside a skeleton.
  await page.getByRole('button', { name: 'Unload' }).click();
  await expect.poll(() => projects.getAttribute('data-env-skeleton')).toBe('');
  projects.removeAttribute('data-env-skeleton');
  expect(style(heading, 'display')).toBe('none');
});

test('the pulse runs in step across the page, slower with reduced motion, and still in forced colors', async () => {
  await open();
  const pulses = () =>
    pulseAnimations().map((animation) => ({
      name: (animation as CSSAnimation).animationName,
      start: animation.startTime,
      duration: animation.effect?.getComputedTiming().duration,
    }));
  const kinds = () =>
    [
      ...new Set(pulses().map(({ name, duration }) => `${name} ${Math.round(Number(duration))}`)),
    ].sort();
  /** The root's pulse and its bar's paint at a point of the breath, the animation held there. */
  const at = (share: number) => {
    const root = byTestId('card-skeleton');
    const animation = root
      .getAnimations()
      .find((item) => (item as CSSAnimation).animationName?.startsWith('env-skeleton-pulse'))!;
    animation.pause();
    animation.currentTime = Number(animation.effect!.getComputedTiming().duration) * share;
    const result = {
      pulse: css(root, '--env-skeleton-pulse'),
      paint: css(root.querySelector('.env-card-description')!, 'background-image', '::before'),
    };
    animation.play();
    return result;
  };
  // The surface over placeholders and the card that is a skeleton itself, started at once: a breath
  // of 7.5 slow durations, 1.8 s, from the strong tone to the faint one and back.
  await expect.poll(() => pulses().length).toBeGreaterThanOrEqual(2);
  expect(new Set(pulses().map(({ start }) => start))).toEqual(new Set([0]));
  expect(kinds()).toEqual(['env-skeleton-pulse 1800']);
  const strong = at(0);
  const faint = at(0.5);
  expect([strong.pulse, faint.pulse]).toEqual(['0', '1']);
  expect(faint.paint).not.toBe(strong.paint);
  // A control's shape takes the paint as it is: no transition of its own starts again on every
  // frame of the pulse and lags behind it.
  expect(
    document
      .getAnimations()
      .filter(
        (animation) =>
          animation instanceof CSSTransition &&
          (animation.effect as KeyframeEffect | null)?.target?.closest('[data-env-skeleton]'),
      ),
  ).toHaveLength(0);
  // Reduced motion: slower, and half as deep, a change of tone only.
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(kinds).toEqual(['env-skeleton-pulse-reduced 3240']);
  expect(at(0.5).pulse).toBe('0.5');
  try {
    // Forced colors: the bars stand still in the system gray, and the surfaces carry no tint.
    await commands.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
    await expect.poll(() => pulses().length).toBe(0);
    const heading = '[data-testid="project-card"] .env-card-title';
    const bar = style(heading, 'background-image', '::before');
    expect(bar).toMatch(/^linear-gradient/);
    expect(bar).not.toContain('rgba(0, 0, 0, 0)');
    // Text that is there is drawn by the bar layer over the content, in the system gray too.
    const layer = style('[data-testid="projects"]', 'background-image', '::after');
    expect(layer).toMatch(/^linear-gradient/);
    expect(layer).not.toContain('rgba(0, 0, 0, 0)');
    expect(style('[data-testid="projects"] .env-avatar', 'background-image')).toBe(bar);
    expect(style('[data-testid="projects"]', 'background-image')).toBe('none');
    expect(style('[data-testid="nested-card"]', 'background-image')).toBe('none');
  } finally {
    await commands.emulateMedia({ forcedColors: 'none' });
  }
});

test(
  'a skeleton popup is the busy root, keeps focus and closes, its content inert',
  { tags: ['engines'] },
  async () => {
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    await open();
    await page.getByRole('button', { name: 'Open the menu' }).click();
    await expect.poll(() => document.querySelector('.env-menu')).not.toBeNull();
    const menu = document.querySelector<HTMLElement>('.env-menu')!;
    expect(menu.getAttribute('aria-busy')).toBe('true');
    expect(menu.getAttribute('data-env-skeleton')).toBe('');
    expect(menu.querySelector<HTMLElement>(':scope > .env-skeleton-content')!.inert).toBe(true);
    await expect.poll(() => document.activeElement).toBe(menu);
    await keyboard.press('Escape');
    await expect.poll(hidden(menu)).toBe(true);

    await page.getByRole('button', { name: 'Open the dialog' }).click();
    const dialog = page.getByRole('dialog');
    await expect.element(dialog).toHaveAttribute('aria-busy', 'true');
    await expect.element(dialog).toHaveAttribute('data-env-skeleton', '');
    expect(dialog.element().querySelector<HTMLElement>('.env-dialog-content')!.inert).toBe(true);
    await keyboard.press('Escape');
    await expect.poll(() => shown(dialog)).toBe(false);

    // Raw text in a popup's content is a bar too: the popup draws the line through it.
    await page.getByRole('button', { name: 'Open the popover' }).click();
    await expect.poll(() => document.querySelector('.env-popover')).not.toBeNull();
    const popover = document.querySelector<HTMLElement>('.env-popover')!;
    expect(popover.getAttribute('aria-busy')).toBe('true');
    expect(css(popover, 'text-decoration-line')).toBe('line-through');
    expect(css(popover.querySelector(':scope > .env-skeleton-content')!, 'display')).toBe(
      'contents',
    );
    await keyboard.press('Escape');
    await expect.poll(hidden(popover)).toBe(true);
  },
);

test('the shift check reports what moves or resizes when a skeleton loads', async () => {
  await open();
  const check = (selector: string) => window.envui!.layout!.skeletonShift(selector);
  // Bars and shapes change paint only.
  expect(await check('[data-testid="loaded"]')).toEqual([]);
  // A part whose skeleton look changes its size is reported, and only it, not what holds it.
  const problems: LayoutProblem[] = await check('[data-testid="shifting"]');
  expect(problems.map(({ rule, node, path }) => [rule, node, path])).toEqual([
    ['skeleton-shift', 'env-text', 'env-surface > env-text'],
    // Media without an aspect ratio is reported too, whether or not it moves now.
    ['skeleton-shift', 'img', 'env-surface > img'],
  ]);
  expect(problems[0]!.message).toMatch(/changes from [\d.]+rem×[\d.]+rem to /);
  // The surface is put back as it was.
  expect(byTestId('loaded').hasAttribute('data-env-skeleton')).toBe(false);
  expect(byTestId('projects').getAttribute('data-env-skeleton')).toBe('');
});

test('a skeleton takes the boxes its content takes loaded, through its inert wrapper', async () => {
  await open();
  /** Each child's box, from the start of the region, and the region's own size. */
  const boxes = (id: string) => {
    const root = byTestId(id);
    const origin = root.getBoundingClientRect();
    return [
      [Math.round(origin.width), Math.round(origin.height)],
      ...[...root.querySelectorAll('p, h3, blockquote, .env-list, .env-list-item')].map((child) => {
        const found = child.getBoundingClientRect();
        return [found.x - origin.x, found.y - origin.y, found.width, found.height].map(Math.round);
      }),
    ];
  };
  // Raw text elements in a column keep no margins, also inside the wrapper.
  expect(boxes('paragraphs-skeleton')).toEqual(boxes('paragraphs-loaded'));
  // Lists on a muted surface keep their space between them, also with the status beside them.
  expect(boxes('lists-skeleton')).toEqual(boxes('lists-loaded'));
  // The shift check toggles the wrapper with the attribute, so it sees the same.
  expect(await window.envui!.layout!.skeletonShift('[data-testid="paragraphs-loaded"]')).toEqual(
    [],
  );
  expect(byTestId('paragraphs-loaded').querySelector(':scope > .env-skeleton-content')).toBeNull();
  expect(
    byTestId('paragraphs-skeleton').querySelectorAll(':scope > .env-skeleton-content'),
  ).toHaveLength(1);
});

/** The bars the script lays over a root's text, each [x, y, width, height] in px. */
const textBars = (root: HTMLElement) =>
  [
    ...root.style
      .getPropertyValue('--env-skeleton-text-bars')
      .matchAll(/(-?[\d.]+)px (-?[\d.]+)px \/ ([\d.]+)px ([\d.]+)px/g),
  ].map((match) => match.slice(1).map(Number));

test('text that is there draws as rounded bars over its line boxes, in either direction and past a scrolling box', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await open();
  const projects = byTestId('projects');
  // The script marks the root once it has measured its text, and the line through goes.
  await expect.poll(() => projects.getAttribute('data-env-skeleton-text')).toBe('');
  expect(css(projects, '--env-skeleton-color')).toBe('transparent');
  // One rounded bar per line box of the heading that is there, laid over it in the bar layer.
  const range = document.createRange();
  range.selectNodeContents(projects.querySelector('h2')!);
  const line = range.getBoundingClientRect();
  const x = line.left - projects.getBoundingClientRect().left - projects.clientLeft;
  expect(
    textBars(projects).some(
      ([left, , w]) => Math.abs(left! - x) < 1 && Math.abs(w! - line.width) < 1,
    ),
  ).toBe(true);
  expect(css(projects, 'mask-image', '::after')).toContain('data:image/svg+xml');
  expect(css(projects, 'background-image', '::after')).toMatch(/^linear-gradient/);
  expect(css(projects, 'position', '::after')).toBe('absolute');
  // The surface itself carries the tint over its fill.
  expect(css(projects, 'background-image')).toMatch(/linear-gradient/);

  // Right to left, the bars start at the right: the placeholder sits at the start of the line, and
  // the space left of it is empty.
  const title = byTestId('rtl-title');
  expect(css(title, 'direction')).toBe('rtl');
  expect(Number.parseFloat(css(title, 'inline-size', '::before'))).toBeLessThan(box(title).width);

  // A root that scrolls draws the bars past its box, in either direction.
  for (const dir of ['ltr', 'rtl']) {
    const root = byTestId(`scrolling-${dir}`);
    await expect.poll(() => root.getAttribute('data-env-skeleton-text'), { message: dir }).toBe('');
    const bars = textBars(root);
    const width = Number.parseFloat(css(root, 'width', '::after'));
    const height = Number.parseFloat(css(root, 'height', '::after'));
    const scroll = [root.scrollWidth, root.scrollHeight];
    // The content overflows the box both ways, and the layer reaches past it to every bar.
    expect(scroll[0], dir).toBeGreaterThan(root.clientWidth);
    expect(scroll[1], dir).toBeGreaterThan(root.clientHeight);
    expect(width, dir).toBeGreaterThan(root.clientWidth);
    expect(height, dir).toBeGreaterThan(root.clientHeight);
    expect(bars.length, dir).toBeGreaterThanOrEqual(6);
    for (const [bx, by, bw, bh] of bars) {
      expect(bx).toBeGreaterThanOrEqual(0);
      expect(by).toBeGreaterThanOrEqual(0);
      expect(bx! + bw!).toBeLessThanOrEqual(width + 0.5);
      expect(by! + bh!).toBeLessThanOrEqual(height + 0.5);
    }
    // It never makes the root scroll further than its content does.
    expect([root.scrollWidth, root.scrollHeight], dir).toEqual(scroll);
  }

  // Loaded, the bars and the marks go.
  await page.getByRole('button', { name: 'Load' }).click();
  await expect.poll(() => projects.hasAttribute('data-env-skeleton-text')).toBe(false);
  expect(projects.style.getPropertyValue('--env-skeleton-text-bars')).toBe('');
});
