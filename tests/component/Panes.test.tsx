import { createRoot } from 'react-dom/client';
import { Panes, Theme } from '@envsemble/envui';
import { expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Panes.fixture.tsx';
import { box, css, keyboard, mouse, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const panes = (search = '') => mount(fixture, { search });
const setWidth = (width: string) => page.getByRole('button', { name: `Width ${width}` }).click();
const focus = (target: Locator) => (target.element() as HTMLElement).focus();
const root = () => page.getByTestId('panes');
const list = () => root().getByRole('region', { name: 'Projects' });
const detail = () => root().getByRole('region', { name: 'Northwind launch' });
const handle = () => root().getByRole('separator', { name: 'Resize projects' });

test('the sized pane has its width and the other the rest, touching with or without a handle, mirrored right to left', async () => {
  for (const search of ['width=60rem', 'width=60rem&handle=none']) {
    panes(search);
    const start = box(list());
    const end = box(detail());
    const frame = box(page.getByTestId('frame'));
    expect(start.width).toBeCloseTo(22.5 * 16, 0);
    expect(end.x).toBeCloseTo(start.x + start.width, 0);
    expect(end.x + end.width).toBeCloseTo(frame.x + frame.width - 1, 0);
    expect(root().getByRole('separator').elements()).toHaveLength(search.includes('none') ? 0 : 1);
    const body = list().element().querySelector<HTMLElement>('.env-panes-body')!;
    expect(css(body, 'overflow-y')).toBe('auto');
    expect(box(list()).height).toBeCloseTo(24 * 16 - 2, 0);
    body.scrollTop = body.scrollHeight;
    await expect.poll(() => body.scrollTop).toBeGreaterThan(0);
    expect(box(root().getByTestId('list-header')).y).toBeCloseTo(box(list()).y, 0);
    const surface = box(root().getByTestId('detail-surface'));
    expect(surface.y + surface.height).toBeCloseTo(end.y + end.height, 0);
  }

  panes('width=60rem&sized=end');
  expect(box(detail()).width).toBeCloseTo(22.5 * 16, 0);
  expect(box(list()).width).toBeCloseTo(60 * 16 - 2 - 22.5 * 16, 0);
  await expect.element(handle()).toHaveAttribute('aria-controls', detail().element().id);

  panes('width=60rem&dir=rtl');
  expect(box(detail()).x).toBeLessThan(box(list()).x);
});

test('below stackBelow the panes stack, each half the height, and the handle hides; without it they never stack', async () => {
  panes('width=30rem&stack=medium');
  const frame = box(page.getByTestId('frame'));
  await expect.poll(() => box(list()).width).toBeCloseTo(frame.width - 2, 0);
  expect(box(detail()).width).toBeCloseTo(frame.width - 2, 0);
  expect(box(detail()).y).toBeCloseTo(box(list()).y + box(list()).height, 0);
  expect(box(list()).height).toBeCloseTo((frame.height - 2) / 2, 0);
  expect(shown(handle())).toBe(false);
  await setWidth('45rem');
  await expect.poll(() => shown(handle())).toBe(true);
  expect(box(list()).width).toBeCloseTo(22.5 * 16, 0);

  panes('width=45rem&stack=expanded');
  expect(shown(handle())).toBe(false);
  await setWidth('60rem');
  await expect.poll(() => shown(handle())).toBe(true);

  panes('width=30rem');
  expect(shown(handle())).toBe(true);
  expect(box(detail()).y).toBeCloseTo(box(list()).y, 0);
});

test('the handle starts from the width that shows, where the room allows less than the size', async () => {
  panes('width=45rem&size=40');
  const width = box(list()).width / 16;
  expect(width).toBeLessThan(30);
  focus(handle());
  await keyboard.press('ArrowLeft');
  await expect.poll(() => box(list()).width / 16).toBeCloseTo(width - 1, 0);
  expect(Number.parseFloat(handle().element().getAttribute('aria-valuetext')!)).toBeLessThan(30);
});

test(
  'the handle resizes the pane by keyboard and pointer, in rem, and a double click returns it to its default',
  { tags: ['engines'] },
  async () => {
    panes('width=60rem');
    await expect.element(handle()).toHaveAttribute('aria-valuetext', '22.5 rem');
    await expect.element(handle()).toHaveAttribute('aria-orientation', 'vertical');
    await expect.element(handle()).toHaveAttribute('aria-controls', list().element().id);
    focus(handle());
    await keyboard.press('ArrowRight');
    await expect.element(handle()).toHaveAttribute('aria-valuetext', '23.5 rem');
    await keyboard.press('Shift+ArrowLeft');
    await expect.element(handle()).toHaveAttribute('aria-valuetext', '18.5 rem');
    await expect.element(handle()).toHaveAttribute('aria-valuenow', '18.5');
    expect(box(list()).width).toBeCloseTo(18.5 * 16, 0);
    const edge = box(handle());
    const x = edge.x + edge.width / 2;
    const y = edge.y + edge.height / 2;
    await mouse.move(x, y);
    await mouse.down();
    await mouse.move(x + 16, y);
    await mouse.move(x + 32, y);
    await mouse.up();
    await expect.element(handle()).toHaveAttribute('aria-valuetext', '20.5 rem');
    await expect.poll(() => page.getByTestId('sizes').element().textContent).toContain('20.5!');
    await handle().dblClick();
    await expect.element(handle()).toHaveAttribute('aria-valuetext', '22.5 rem');
    await expect.poll(() => page.getByTestId('sizes').element().textContent).toMatch(/ 22\.5!$/);

    panes('width=60rem&size=30');
    await expect.element(handle()).toHaveAttribute('aria-valuetext', '30 rem');
    focus(handle());
    await keyboard.press('ArrowLeft');
    await expect.element(handle()).toHaveAttribute('aria-valuetext', '29 rem');
    await handle().dblClick();
    await expect.element(handle()).toHaveAttribute('aria-valuetext', '30 rem');
  },
);

test(
  'the handle is invisible on the seam but its grip, and its hit area reaches only into the pane after it',
  { tags: ['engines'] },
  async () => {
    panes('width=60rem');
    const separator = handle().element() as HTMLElement;
    const seam = box(list()).x + box(list()).width;
    const edge = box(separator);
    expect(edge.x).toBeCloseTo(seam, 0);
    const y = edge.y + edge.height / 2;
    const before = document.elementFromPoint(seam - 2, y);
    expect(separator.contains(before)).toBe(false);
    expect(list().element().contains(before)).toBe(true);
    expect(document.elementFromPoint(seam + edge.width - 2, y)).toBe(separator);
    expect(css(separator, 'background-color')).toBe('rgba(0, 0, 0, 0)');
    expect(css(separator, 'background-color', '::before')).toBe('rgba(0, 0, 0, 0)');
    expect(css(separator, 'content', '::after')).not.toBe('none');
    const line = box(page.elementLocator(separator));
    expect(line.width).toBeCloseTo(12, 0);
    await mouse.move(seam + 4, y);
    await expect
      .poll(() => css(separator, 'background-color', '::before'))
      .not.toBe('rgba(0, 0, 0, 0)');
    expect(css(separator, 'width', '::before')).toBe('1px');
    await mouse.move(0, 0);
    await expect
      .poll(() => css(separator, 'background-color', '::before'))
      .toBe('rgba(0, 0, 0, 0)');

    panes('width=60rem&grip=off');
    expect(css(handle().element(), 'content', '::after')).toBe('none');
  },
);

test('a disabled handle neither moves nor resets on a double click', async () => {
  panes('width=60rem&size=20.5&disabled');
  await expect.element(handle()).toHaveAttribute('aria-valuetext', '20.5 rem');
  await expect.element(handle()).toHaveAttribute('aria-disabled', 'true');
  handle()
    .element()
    .dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  await expect.element(handle()).toHaveAttribute('aria-valuetext', '20.5 rem');
  expect(page.getByTestId('sizes').element().textContent).toBe('');
});

test(
  'an application rounds Panes with a class, and the panes inside follow the corners',
  { tags: ['engines'] },
  async () => {
    const style = document.createElement('style');
    style.textContent =
      '.app-rounded-panes { border-radius: var(--env-radius-lg); block-size: 16rem; inline-size: 48rem; } .app-pane-fill { block-size: 100%; background: var(--env-color-bg-default); }';
    document.head.append(style);
    const host = document.createElement('div');
    document.body.append(host);
    const app = createRoot(host);
    app.render(
      <Theme theme="light">
        <Panes.Root className="app-rounded-panes">
          <Panes.Pane label="Rounded list">
            <div className="app-pane-fill" data-testid="rounded-list-fill" />
          </Panes.Pane>
          <Panes.Pane label="Rounded detail">
            <div className="app-pane-fill" data-testid="rounded-detail-fill" />
          </Panes.Pane>
        </Panes.Root>
      </Theme>,
    );
    await expect.element(page.getByTestId('rounded-list-fill')).toBeVisible();
    const rounded = host.querySelector<HTMLElement>('.app-rounded-panes')!;
    const edge = box(rounded);
    const fill = page.getByTestId('rounded-list-fill').element();
    expect(getComputedStyle(rounded).borderTopLeftRadius).not.toBe('0px');
    expect(getComputedStyle(rounded).overflow).toBe('clip');
    const webkitHitsThroughRoundedClips =
      /AppleWebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (!webkitHitsThroughRoundedClips) {
      const corner = document.elementFromPoint(edge.x + 1, edge.y + 1);
      expect(fill.contains(corner)).toBe(false);
    }
    const inside = document.elementFromPoint(edge.x + 1, edge.y + edge.height / 2);
    expect(fill.contains(inside)).toBe(true);
    app.unmount();
    host.remove();
    style.remove();
  },
);

test('a pane the application renders alone fills Panes, whichever pane is sized, and the handle hides', async () => {
  for (const search of ['width=60rem&only=list', 'width=60rem&only=detail&sized=end']) {
    panes(search);
    const frame = box(page.getByTestId('frame'));
    const pane = search.includes('only=list') ? list() : detail();
    expect(box(pane).x).toBeCloseTo(frame.x + 1, 0);
    expect(box(pane).width).toBeCloseTo(frame.width - 2, 0);
    expect(shown(handle())).toBe(false);
  }
});
