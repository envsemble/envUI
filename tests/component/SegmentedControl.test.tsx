import { beforeEach, expect, test, vi } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/SegmentedControl.fixture.tsx';
import {
  animationsDone,
  box,
  css,
  keyboard,
  mouse,
  nextFrames,
  passTime,
  stopTimers,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const text = (locator: Locator) => () => locator.element().textContent;
const tooltips = () =>
  [...document.querySelectorAll('.env-tooltip:not([data-ending-style])')].map(
    (tooltip) => tooltip.textContent,
  );

test('segmented controls choose one option with the pointer and arrow keys', async () => {
  for (const theme of ['light', 'dark']) {
    const group = page.getByRole('radiogroup', { name: `Work items ${theme}` });
    const value = text(page.getByTestId(`segments-value-${theme}`));
    const open = group.getByRole('radio', { name: 'Open 12' });
    const blocked = group.getByRole('radio', { name: 'Blocked 3' });
    const done = group.getByRole('radio', { name: 'Done 40' });
    await expect.element(open).toHaveAttribute('aria-checked', 'true');
    await expect.element(group.getByRole('radio', { name: 'Archived' })).toBeDisabled();
    await expect
      .element(
        page
          .getByRole('radiogroup', { name: `Counts in German ${theme}` })
          .getByRole('radio', { name: 'Alle 1.200' }),
      )
      .toBeInTheDocument();

    const probe = document.createElement('span');
    probe.style.backgroundColor = 'var(--_segmented-control-thumb)';
    open.element().append(probe);
    const thumb = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const raised = group.element().querySelector('.env-segmented-control-thumb')!;
    expect(css(raised, 'background-color')).toBe(thumb);
    expect(css(raised, 'box-shadow')).not.toBe('none');
    const under = (segment: Locator) => () => {
      const [a, b] = [box(raised), box(segment)];
      return Math.abs(a.x - b.x) < 1 && Math.abs(a.width - b.width) < 1;
    };
    await expect.poll(under(open)).toBe(true);
    await expect.poll(() => css(open, 'box-shadow')).toBe('none');
    expect(css(blocked, 'box-shadow')).toBe('none');
    expect(group.element().querySelectorAll('.env-segmented-control-item-indicator')).toHaveLength(
      0,
    );
    expect(css(group, 'outline-color')).toBe('rgba(0, 0, 0, 0)');
    expect(css(group, 'background-color')).not.toBe('rgba(0, 0, 0, 0)');
    expect(css(blocked, 'border-inline-start-width')).toBe('0px');
    expect(css(blocked, 'background-color')).toBe('rgba(0, 0, 0, 0)');

    await blocked.click();
    await expect.poll(value).toMatch(/^blocked/);
    await expect.element(blocked).toHaveAttribute('aria-checked', 'true');
    await expect.element(open).toHaveAttribute('aria-checked', 'false');
    await expect.poll(under(blocked)).toBe(true);

    (blocked.element() as HTMLElement).focus();
    await keyboard.press('ArrowRight');
    await expect.element(done).toHaveFocus();
    await expect.poll(value).toMatch(/^done/);
    await keyboard.press('ArrowLeft');
    await expect.element(blocked).toHaveFocus();
    await expect.poll(value).toMatch(/^blocked/);

    const layout = page.getByRole('radiogroup', { name: `Layout ${theme}` });
    await layout.getByRole('radio', { name: 'Board' }).click();
    await expect.poll(value).toMatch(/board$/);
    expect(box(layout).height).toBeLessThan(box(group).height);
  }
});

function narrowControl() {
  const narrow = page.getByTestId('segments-narrow-light');
  const control = narrow.getByRole('radiogroup', { name: 'Assignments light' });
  const segments = control.getByRole('radio').elements();
  const label = (index: number) =>
    segments[index]!.querySelector<HTMLElement>('.env-segmented-control-item-label')!;
  return { narrow, control, segments, label };
}

function expectEvenSplit({ narrow, control, segments }: ReturnType<typeof narrowControl>) {
  expect(box(control).width).toBeCloseTo(box(narrow).width, 0);
  const [first, second] = segments.map((segment) => box(segment));
  expect(Math.abs(first!.width - second!.width)).toBeLessThan(1);
  return [first!, second!] as const;
}

test('a full-width control splits its container evenly and cuts long labels short, with a tooltip', async () => {
  const narrowed = narrowControl();
  const { control, segments, label } = narrowed;
  expectEvenSplit(narrowed);
  expect(control.element().scrollWidth <= control.element().clientWidth).toBe(true);
  expect(css(label(0), 'text-overflow')).toBe('ellipsis');
  expect(label(0).scrollWidth > label(0).clientWidth).toBe(true);
  const first = page.elementLocator(segments[0]!);
  const second = page.elementLocator(segments[1]!);
  await expect.element(first).toHaveAccessibleName('Assigned to me');
  await expect.element(second).toHaveAccessibleName('Everyone on the team');
  await second.hover();
  await expect.poll(tooltips).toEqual(['Everyone on the team']);
  await mouse.move(0, 0);
  await expect.poll(tooltips).toEqual([]);
  (first.element() as HTMLElement).focus();
  await keyboard.press('ArrowRight');
  await expect.element(second).toHaveFocus();
  await expect.element(second).toHaveAttribute('aria-checked', 'true');
  await expect.poll(tooltips).toEqual(['Everyone on the team']);
  await keyboard.press('Escape');

  const wide = page
    .getByTestId('segments-wide-light')
    .getByRole('radiogroup', { name: 'Scopes light' });
  const widths = wide
    .getByRole('radio')
    .elements()
    .map((radio) => box(radio).width);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  expect(
    [...wide.element().querySelectorAll('.env-segmented-control-item-label')].every(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  stopTimers();
  await page.elementLocator(wide.getByRole('radio').elements()[0]!).hover();
  const pastTooltipDelay = 600;
  await passTime(pastTooltipDelay);
  expect(tooltips()).toEqual([]);
  vi.useRealTimers();
  expect(
    box(page.getByTestId('segments-light').getByRole('radiogroup', { name: 'Layout light' })).width,
  ).toBeLessThan(300);
});

test('the thumb covers the chosen segment as the control resizes, and travels only to a new choice', async () => {
  const { narrow, control, segments } = narrowControl();
  const thumb = control.element().querySelector<HTMLElement>('.env-segmented-control-thumb')!;
  const covers = (segment: Element) => {
    const [a, b] = [box(thumb), box(segment)];
    return Math.abs(a.x - b.x) < 1 && Math.abs(a.width - b.width) < 1;
  };
  const [first, second] = segments;
  await expect.poll(() => covers(first!)).toBe(true);
  await animationsDone(thumb);
  const container = narrow.element() as HTMLElement;
  for (const width of ['24rem', '18rem', '13rem']) {
    container.style.inlineSize = width;
    await nextFrames();
    expect(thumb.getAnimations()).toHaveLength(0);
    expect(covers(first!)).toBe(true);
    expectEvenSplit(narrowControl());
  }
  await page.elementLocator(second!).click();
  await expect.poll(() => thumb.getAnimations().length).toBeGreaterThan(0);
  await animationsDone(thumb);
  expect(covers(second!)).toBe(true);
  container.style.inlineSize = '24rem';
  await nextFrames();
  expect(thumb.getAnimations()).toHaveLength(0);
  expect(covers(second!)).toBe(true);
  await page.elementLocator(first!).click();
  await expect.poll(() => thumb.hasAttribute('data-traveling')).toBe(true);
  container.style.inlineSize = '20rem';
  await nextFrames();
  expect(thumb.hasAttribute('data-traveling')).toBe(true);
  expect(thumb.getAnimations().length).toBeGreaterThan(0);
  await animationsDone(thumb);
  await expect.poll(() => thumb.hasAttribute('data-traveling')).toBe(false);
  expect(covers(first!)).toBe(true);
  container.style.inlineSize = '';
  await nextFrames();
  expect(thumb.getAnimations()).toHaveLength(0);
});

test('on a touch screen a full-width control wraps long labels instead, and a tap chooses', async () => {
  await commands.emulateTouch(true);
  try {
    await page.viewport(1024, 900);
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    const touched = narrowControl();
    const wrapped = touched.label(1);
    await expect.poll(() => css(wrapped, 'text-overflow')).not.toBe('ellipsis');
    expect(wrapped.scrollWidth <= wrapped.clientWidth).toBe(true);
    const range = document.createRange();
    range.selectNodeContents(wrapped);
    const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
    expect(lines.size).toBeGreaterThan(1);
    const [firstBox, secondBox] = expectEvenSplit(touched);
    expect(Math.abs(firstBox.height - secondBox.height)).toBeLessThan(1);
    await commands.touch(
      'touchStart',
      secondBox.x + secondBox.width / 2,
      secondBox.y + secondBox.height / 2,
    );
    await commands.touch('touchEnd');
    await expect
      .element(page.elementLocator(touched.segments[1]!))
      .toHaveAttribute('aria-checked', 'true');
  } finally {
    await commands.emulateTouch(false);
  }
});

test('on a touch screen each segment takes a 44 px tap, its look still inside the track', async () => {
  await commands.emulateTouch(true);
  try {
    await page.viewport(1024, 900);
    mount(fixture);
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    for (const segment of [
      page
        .getByRole('radiogroup', { name: 'Work items light' })
        .getByRole('radio', { name: 'Blocked 3' }),
      page
        .getByRole('radiogroup', { name: 'Work items light' })
        .getByRole('radio', { name: 'Done 40' }),
    ]) {
      const element = segment.element();
      element.scrollIntoView({ block: 'center' });
      const at = box(element);
      expect(at.height).toBeLessThan(44);
      expect(at.width).toBeGreaterThanOrEqual(44);
      const reaches = (offset: number) =>
        element.contains(
          document.elementFromPoint(at.x + at.width / 2, at.y + at.height / 2 + offset),
        );
      expect([reaches(-21), reaches(21)]).toEqual([true, true]);
    }
  } finally {
    await commands.emulateTouch(false);
  }
});

test("an item's itemProps reach its button, its class beside the segment's own", async () => {
  mount({ default: fixture.SegmentContentFixture });
  const review = page.getByTestId('review-segment');
  await expect.element(review).toHaveRole('radio');
  await expect.element(review).toHaveClass('fixture-review-segment');
  await expect.element(review).toHaveClass('env-segmented-control-item');
  await expect.element(review).toHaveAttribute('title', 'Review');
});

test('a segment takes content in its label and at its end, or shows only its icon with its label in a tooltip', async () => {
  mount({ default: fixture.SegmentContentFixture });
  const group = page.getByRole('radiogroup', { name: 'View' });
  const list = group.getByRole('radio', { name: 'List', exact: true });
  const grid = group.getByRole('radio', { name: 'Grid', exact: true });
  const review = group.getByRole('radio', { name: '● Review New', exact: true });
  await expect.element(review).toBeVisible();
  expect(review.element().querySelector('.env-segmented-control-item-end')?.textContent).toBe(
    'New',
  );
  expect(list.element().querySelector('.env-segmented-control-item-label')).toBeNull();
  expect(box(list).width).toBeLessThan(box(list).height + 1);
  await grid.hover();
  await expect.poll(tooltips).toEqual(['Grid']);
  await mouse.move(0, 0);
  await expect.poll(tooltips).toEqual([]);
  (list.element() as HTMLElement).focus();
  await keyboard.press('ArrowRight');
  await expect.element(grid).toHaveFocus();
  await expect.element(grid).toHaveAttribute('aria-checked', 'true');
  await expect.poll(tooltips).toEqual(['Grid']);
});
