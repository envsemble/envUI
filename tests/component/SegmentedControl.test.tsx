import { beforeEach, expect, test, vi } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/SegmentedControl.fixture.tsx';
import { box, css, keyboard, mouse, passTime, stopTimers } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const text = (locator: Locator) => () => locator.element().textContent;
/** The texts of the tooltips that show, leaving out one that is still fading out. */
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
    // Counts take the locale's number format.
    await expect
      .element(
        page
          .getByRole('radiogroup', { name: `Counts in German ${theme}` })
          .getByRole('radio', { name: 'Alle 1.200' }),
      )
      .toBeInTheDocument();

    // Segments in a recessed track, with no outline and no lines between them; the chosen one rises
    // on a raised thumb with a shadow, and no check marks it.
    const probe = document.createElement('span');
    probe.style.backgroundColor = 'var(--env-segmented-control-thumb)';
    open.element().append(probe);
    const thumb = getComputedStyle(probe).backgroundColor;
    probe.remove();
    // One thumb, which travels between the segments, lies under the chosen one; the segment draws
    // none of its own.
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

    // Arrow keys move and choose, skipping the disabled option.
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

/** The narrow full-width control: two options in 13 rem. */
function narrowControl() {
  const narrow = page.getByTestId('segments-narrow-light');
  const control = narrow.getByRole('radiogroup', { name: 'Assignments light' });
  const segments = control.getByRole('radio').elements();
  const label = (index: number) =>
    segments[index]!.querySelector<HTMLElement>('.env-segmented-control-item-label')!;
  return { narrow, control, segments, label };
}

/** Whether a full-width control fills its container, its options sharing it evenly. */
function expectEvenSplit({ narrow, control, segments }: ReturnType<typeof narrowControl>) {
  expect(box(control).width).toBeCloseTo(box(narrow).width, 0);
  const [first, second] = segments.map((segment) => box(segment));
  expect(Math.abs(first!.width - second!.width)).toBeLessThan(1);
  return [first!, second!] as const;
}

test('a full-width control splits its container evenly and cuts long labels short, with a tooltip', async () => {
  const narrowed = narrowControl();
  const { control, segments, label } = narrowed;
  // In 13 rem the control fills its container, half each, without scrolling.
  expectEvenSplit(narrowed);
  expect(control.element().scrollWidth <= control.element().clientWidth).toBe(true);
  // Labels too long for their half end in an ellipsis; the options keep their whole names.
  expect(css(label(0), 'text-overflow')).toBe('ellipsis');
  expect(label(0).scrollWidth > label(0).clientWidth).toBe(true);
  const first = page.elementLocator(segments[0]!);
  const second = page.elementLocator(segments[1]!);
  await expect.element(first).toHaveAccessibleName('Assigned to me');
  await expect.element(second).toHaveAccessibleName('Everyone on the team');
  // A cut label shows whole in a tooltip, on hover and keyboard focus.
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

  // With room the labels show whole, without a tooltip, and the options still share the rail.
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
  // None shows past the tooltip's delay, 400 ms.
  stopTimers();
  await page.elementLocator(wide.getByRole('radio').elements()[0]!).hover();
  await passTime(600);
  expect(tooltips()).toEqual([]);
  vi.useRealTimers();
  // Without fullWidth the control keeps the width of its options.
  expect(
    box(page.getByTestId('segments-light').getByRole('radiogroup', { name: 'Layout light' })).width,
  ).toBeLessThan(300);

  // On touch screens a label too long for its share wraps, as no tooltip shows.
  await commands.emulateTouch(true);
  try {
    await page.viewport(1024, 900);
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    const touched = narrowControl();
    const wrapped = touched.label(1);
    // The label shows whole, on two lines, and the options still share the rail evenly.
    await expect.poll(() => css(wrapped, 'text-overflow')).not.toBe('ellipsis');
    expect(wrapped.scrollWidth <= wrapped.clientWidth).toBe(true);
    const range = document.createRange();
    range.selectNodeContents(wrapped);
    const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
    expect(lines.size).toBeGreaterThan(1);
    const [firstBox, secondBox] = expectEvenSplit(touched);
    expect(Math.abs(firstBox.height - secondBox.height)).toBeLessThan(1);
    // A tap chooses the first option back.
    await commands.touch(
      'touchStart',
      firstBox.x + firstBox.width / 2,
      firstBox.y + firstBox.height / 2,
    );
    await commands.touch('touchEnd');
    await expect.element(first).toHaveAttribute('aria-checked', 'true');
  } finally {
    await commands.emulateTouch(false);
  }
});
