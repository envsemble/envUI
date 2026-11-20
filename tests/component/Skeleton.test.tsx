import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/Skeleton.fixture.tsx';
import { box, css, keyboard, nextFrames, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

async function open() {
  mount(fixture);
  await barsRedrawnAfterWebFontWidensText();
}

async function barsRedrawnAfterWebFontWidensText() {
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

function holdPulses() {
  for (const animation of pulseAnimations()) {
    animation.pause();
    animation.currentTime = 0;
  }
}

const style = (selector: string, property: string, pseudo?: string) =>
  css(document.querySelector(selector)!, property, pseudo);
const byTestId = (testId: string) =>
  document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
const hidden = (element: Element) => () =>
  !element.isConnected || !shown(page.elementLocator(element));

test('a skeleton is one busy region with inert content, draws text as bars and shapes, and loads in place', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await open();
  holdPulses();
  const projects = byTestId('projects');
  expect(projects.getAttribute('data-env-skeleton')).toBe('');
  expect(projects.getAttribute('aria-busy')).toBe('true');
  expect(projects.inert).toBe(false);
  expect(projects.querySelector<HTMLElement>(':scope > .env-skeleton-content')!.inert).toBe(true);
  expect(
    [projects, ...projects.querySelectorAll('[aria-busy="true"]')].filter(
      (element) => element.getAttribute('aria-busy') === 'true' && !element.closest('[inert]'),
    ),
  ).toHaveLength(1);
  (page.getByRole('button', { name: 'Load' }).element() as HTMLElement).focus();
  await keyboard.press('Tab');
  expect(document.activeElement?.closest('[data-testid]')?.getAttribute('data-testid')).toBe(
    'loaded',
  );
  expect(byTestId('reader').textContent).toBe('in a skeleton');

  expect(style('[data-testid="projects"]', 'text-decoration-line')).toBe('line-through');
  expect(style('[data-testid="raw"]', '-webkit-text-fill-color')).toBe('rgba(0, 0, 0, 0)');
  const button = '[data-testid="projects"] .env-button';
  expect(style(button, 'background-image')).toMatch(/^linear-gradient\(/);
  expect(Number.parseFloat(style(button, 'border-top-left-radius'))).toBeGreaterThan(0);
  expect(style('[data-testid="owner-row"] .env-avatar *', 'visibility')).toBe('hidden');

  const heading = '[data-testid="project-card"] .env-card-title';
  expect(document.querySelector(heading)!.textContent).toBe('');
  expect(style(heading, 'display', '::before')).toBe('inline-block');
  expect(style(heading, 'mask-image', '::before')).toMatch(/data:image\/svg\+xml.*rx/);
  expect(style(heading, 'background-image', '::before')).toMatch(/^linear-gradient\(/);
  const description = '[data-testid="project-card"] .env-card-description';
  expect(
    Number.parseFloat(style(description, 'block-size', '::before')) /
      Number.parseFloat(style(description, 'line-height')),
  ).toBeCloseTo(1);
  const header = document.querySelector('[data-testid="project-card"] .env-card-header')!;
  expect(box(header).height).toBeLessThanOrEqual(
    Number.parseFloat(style(heading, 'line-height')) + 1,
  );
  const skeletonCard = box(byTestId('project-card'));
  expect(style('[data-testid="name-cell"]', 'display', '::before')).toBe('inline-block');
  const shape = style('[data-testid="badge-skeleton"]', 'background-image');
  for (const count of ['count-solid-skeleton', 'count-outline-skeleton']) {
    expect(style(`[data-testid="${count}"]`, 'background-image')).toBe(shape);
    expect(style(`[data-testid="${count}"]`, 'border-top-color')).toBe('rgba(0, 0, 0, 0)');
  }

  expect(byTestId('top-bar').getAttribute('aria-busy')).toBe('true');
  expect(style('[data-testid="top-bar"] .env-top-bar-title', 'display', '::before')).toBe(
    'inline-block',
  );
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
  const list = byTestId('list-skeleton');
  expect(list.inert).toBe(true);
  expect(list.hasAttribute('aria-busy')).toBe(false);
  const status = list.nextElementSibling!;
  expect(status.matches('.env-skeleton-status[role="status"]')).toBe(true);
  await expect.poll(() => status.textContent).toBe('Loading: Owners loading');

  expect(style('[data-testid="kbd"]', 'text-decoration-line')).toBe('line-through');
  const multi = byTestId('multi-line');
  expect(box(multi).height / Number.parseFloat(css(multi, 'line-height'))).toBeGreaterThanOrEqual(
    2,
  );

  await page.getByRole('button', { name: 'Load' }).click();
  await expect.poll(() => projects.hasAttribute('data-env-skeleton')).toBe(false);
  expect(projects.hasAttribute('aria-busy')).toBe(false);
  expect(projects.querySelector(':scope > .env-skeleton-content')).toBeNull();
  expect(byTestId('reader').textContent).toBe('loaded');
  expect(document.querySelector(heading)!.textContent).toBe('Launch brief');
  expect(Math.abs(box(byTestId('project-card')).height - skeletonCard.height)).toBeLessThanOrEqual(
    1,
  );
  expect(style('[data-testid="projects"]', 'text-decoration-line')).toBe('none');
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
  const at = (share: number) => {
    const root = byTestId('card-skeleton');
    const animation = root
      .getAnimations()
      .find((item) => (item as CSSAnimation).animationName?.startsWith('env-skeleton-pulse'))!;
    animation.pause();
    animation.currentTime = Number(animation.effect!.getComputedTiming().duration) * share;
    const result = {
      pulse: css(root, '--_skeleton-pulse'),
      paint: css(root.querySelector('.env-card-description')!, 'background-image', '::before'),
    };
    animation.play();
    return result;
  };
  await expect.poll(() => pulses().length).toBeGreaterThanOrEqual(2);
  expect(new Set(pulses().map(({ start }) => start))).toEqual(new Set([0]));
  expect(kinds()).toEqual(['env-skeleton-pulse 1800']);
  const strong = at(0);
  const faint = at(0.5);
  expect([strong.pulse, faint.pulse]).toEqual(['0', '1']);
  expect(faint.paint).not.toBe(strong.paint);
  expect(
    document
      .getAnimations()
      .filter(
        (animation) =>
          animation instanceof CSSTransition &&
          (animation.effect as KeyframeEffect | null)?.target?.closest('[data-env-skeleton]'),
      ),
  ).toHaveLength(0);
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(kinds).toEqual(['env-skeleton-pulse-reduced 3240']);
  expect(at(0.5).pulse).toBe('0.5');
  try {
    await commands.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
    await expect.poll(() => pulses().length).toBe(0);
    const heading = '[data-testid="project-card"] .env-card-title';
    const bar = style(heading, 'background-image', '::before');
    expect(bar).toMatch(/^linear-gradient/);
    expect(bar).not.toContain('rgba(0, 0, 0, 0)');
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

test('a skeleton takes the boxes its content takes loaded, through its inert wrapper', async () => {
  await open();
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
  expect(boxes('paragraphs-skeleton')).toEqual(boxes('paragraphs-loaded'));
  expect(boxes('lists-skeleton')).toEqual(boxes('lists-loaded'));
  expect(byTestId('paragraphs-loaded').querySelector(':scope > .env-skeleton-content')).toBeNull();
  expect(
    byTestId('paragraphs-skeleton').querySelectorAll(':scope > .env-skeleton-content'),
  ).toHaveLength(1);
});

const textBars = (root: HTMLElement) =>
  [
    ...root.style
      .getPropertyValue('--_skeleton-text-bars')
      .matchAll(/(-?[\d.]+)px (-?[\d.]+)px \/ ([\d.]+)px ([\d.]+)px/g),
  ].map((match) => match.slice(1).map(Number));

test('text that is there draws as rounded bars over its line boxes, in either direction and past a scrolling box', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await open();
  const projects = byTestId('projects');
  await expect.poll(() => projects.getAttribute('data-env-skeleton-text')).toBe('');
  expect(css(projects, '--_skeleton-color')).toBe('transparent');
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
  expect(css(projects, 'background-image')).toMatch(/linear-gradient/);

  const title = byTestId('rtl-title');
  expect(css(title, 'direction')).toBe('rtl');
  expect(Number.parseFloat(css(title, 'inline-size', '::before'))).toBeLessThan(box(title).width);

  for (const dir of ['ltr', 'rtl']) {
    const root = byTestId(`scrolling-${dir}`);
    await expect.poll(() => root.getAttribute('data-env-skeleton-text'), { message: dir }).toBe('');
    const bars = textBars(root);
    const width = Number.parseFloat(css(root, 'width', '::after'));
    const height = Number.parseFloat(css(root, 'height', '::after'));
    const scroll = [root.scrollWidth, root.scrollHeight];
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
    expect([root.scrollWidth, root.scrollHeight], dir).toEqual(scroll);
  }

  await page.getByRole('button', { name: 'Load' }).click();
  await expect.poll(() => projects.hasAttribute('data-env-skeleton-text')).toBe(false);
  expect(projects.style.getPropertyValue('--_skeleton-text-bars')).toBe('');
});
