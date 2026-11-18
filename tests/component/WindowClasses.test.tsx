import { afterEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as layout from '../fixture/Layout.fixture.tsx';
import * as datePicker from '../fixture/DatePicker.fixture.tsx';
import * as dialogs from '../fixture/Dialog.fixture.tsx';
import * as menus from '../fixture/Menu.fixture.tsx';
import * as toasts from '../fixture/Toast.fixture.tsx';
import { addStyle, box, css, mouse, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const added: Element[] = [];
function append(html: string) {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const children = [...holder.children];
  document.body.append(...children);
  added.push(...children);
}

afterEach(() => {
  for (const element of added.splice(0)) element.remove();
  document.body.removeAttribute('style');
  document.documentElement.classList.remove('env-theme');
  delete document.documentElement.dataset.envTheme;
});

const element = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const width = (selector: string) => box(element(selector)).width;
const containerType = (selector: string) => css(element(selector), 'container-type');

test('the outermost boundary is the window and never collapses, nested ones size to content', async () => {
  await page.viewport(1024, 700);
  mount(layout);
  append(
    `<div id="centered-root" style="display: grid; place-items: center; inline-size: 40rem">
       <div class="env-theme" data-env-theme="light" id="centered-theme">An application</div>
     </div>
     <div data-env-layout="row" id="outer-row" style="inline-size: 40rem">
       <div class="env-theme" data-env-theme="dark" id="outer-island">Dark island</div>
       <span>Beside it</span>
     </div>`,
  );
  expect(width('#centered-theme')).toBeCloseTo(640, 0);
  expect(containerType('#centered-theme')).toBe('inline-size');
  expect(width('#outer-island')).toBeGreaterThan(100);
  append(
    `<div id="plain-root" style="inline-size: 40rem">
       <span class="env-theme" data-env-theme="light" id="inline-theme">Inline</span>
       <div class="env-theme" data-env-theme="light" id="padded-theme" style="padding: 1rem">
         Padded
       </div>
     </div>`,
  );
  expect(width('#inline-theme')).toBeCloseTo(640, 0);
  expect(containerType('#inline-theme')).toBe('inline-size');
  expect(width('#padded-theme')).toBeCloseTo(640, 0);
  expect(css(element('#root > .env-theme'), 'container-name')).toBe('env-window');
  const row = document.createElement('div');
  row.dataset.envLayout = 'row';
  row.id = 'nested-row';
  row.innerHTML =
    '<div class="env-theme" data-env-theme="dark" id="nested-island">Dark island</div><span>Beside it</span>';
  page.getByTestId('primitives').element().append(row);
  expect(containerType('#nested-island')).toBe('normal');
  const islandWidth = width('#nested-island');
  expect(islandWidth).toBeGreaterThan(40);
  expect(islandWidth).toBeLessThan(width('#nested-row'));
});

test('a primitive with container="env-window" is the window of what it holds', () => {
  mount(layout);
  addStyle(
    '@layer env.components { @container env-window (width >= 37.5rem) { .window-probe { --window-probe: medium; } } }',
  );
  page
    .getByTestId('primitives')
    .element()
    .insertAdjacentHTML(
      'beforeend',
      `<div data-env-layout="box" data-env-container style="--_layout-container: env-window; inline-size: 30rem">
         <span class="window-probe" id="narrow-probe">Narrow</span>
       </div>
       <span class="window-probe" id="page-probe">Page</span>`,
    );
  const probe = (id: string) => css(element(id), '--window-probe');
  expect(probe('#narrow-probe')).toBe('');
  expect(probe('#page-probe')).toBe('medium');
});

test('a date picker stacks its time under the calendar in a compact window', async () => {
  for (const [viewport, beside] of [
    [1024, true],
    [480, false],
  ] as const) {
    await page.viewport(viewport, 900);
    mount(datePicker);
    await page.getByRole('combobox', { name: 'Meeting light', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Meeting light' });
    await expect.poll(() => shown(dialog)).toBe(true);
    expect(css(dialog.element().closest('.env-popup-theme')!, 'container-name')).toBe('env-window');
    await expect
      .poll(
        () => {
          const calendar = box(dialog.element().querySelector('.env-calendar')!);
          const time = box(dialog.element().querySelector('.env-date-picker-time')!);
          return beside
            ? time.x > calendar.x + calendar.width - 1
            : time.y > calendar.y + calendar.height - 1;
        },
        { message: `${viewport} px` },
      )
      .toBe(true);
  }
});

function containLayout() {
  const contain = (node: Node) => {
    if (!(node instanceof HTMLElement)) return;
    for (const each of [node, ...node.querySelectorAll<HTMLElement>('*')])
      if (getComputedStyle(each).containerType !== 'normal') each.style.contain = 'layout';
  };
  const observer = new MutationObserver((records) =>
    records.forEach((record) => record.addedNodes.forEach(contain)),
  );
  observer.observe(document, { childList: true, subtree: true });
  return () => observer.disconnect();
}

describe('portals with an unthemed document root, also where a container contains layout', () => {
  async function open(
    module: Parameters<typeof mount>[0],
    containsLayout: boolean,
    { scroll = true } = {},
  ) {
    const stop = containsLayout ? containLayout() : () => {};
    mount(module);
    expect(document.documentElement.classList.contains('env-theme')).toBe(false);
    if (scroll) {
      document.body.style.minBlockSize = '300vh';
      window.scrollTo(0, 400);
    }
    return stop;
  }
  const variants = [false, true].map((containsLayout) => ({
    containsLayout,
    name: containsLayout ? 'where a container contains layout' : 'as browsers do',
  }));

  test(
    'a dialog’s backdrop and positioner cover the viewport, over the page',
    { tags: ['engines'] },
    async () => {
      await page.viewport(1024, 700);
      for (const { containsLayout, name } of variants) {
        const stop = await open(dialogs, containsLayout);
        try {
          await page.getByRole('button', { name: 'Open wide dialog' }).click();
          const dialog = page.getByRole('dialog', { name: 'Wide details' });
          await expect.poll(() => shown(dialog), { message: name }).toBe(true);
          for (const selector of ['.env-dialog-backdrop', '.env-dialog-positioner'])
            expect(box(element(selector)), `${name}: ${selector}`).toEqual({
              x: 0,
              y: 0,
              width: 1024,
              height: 700,
            });
          const corner = document.elementFromPoint(4, 4);
          const { x, y, width, height } = box(dialog);
          const middle = document.elementFromPoint(x + width / 2, y + height / 2);
          expect(corner?.closest('.env-dialog-backdrop'), name).not.toBeNull();
          expect(middle?.closest('[role="dialog"]'), name).not.toBeNull();
          await mouse.click(4, 4);
          await expect.poll(() => shown(dialog), { message: name }).toBe(false);
        } finally {
          stop();
        }
      }
    },
  );

  test('a toast sits at the window’s edge', { tags: ['engines'] }, async () => {
    await page.viewport(1024, 700);
    for (const { containsLayout, name } of variants) {
      const stop = await open(toasts, containsLayout);
      try {
        await page.getByTestId('toast-queue-bottom').click();
        const viewport = element('.env-toast-viewport[data-placement="bottom-end"]');
        await expect
          .poll(
            () => {
              const { x, y, width, height } = box(viewport);
              return (
                viewport.querySelector('.env-toast') !== null &&
                y + height <= 700 &&
                y + height > 700 - 64 &&
                x + width <= 1024 &&
                x + width > 1024 - 64
              );
            },
            { message: name },
          )
          .toBe(true);
      } finally {
        stop();
      }
    }
  });

  test(
    'a menu opens against its trigger, also in a grid body, where it takes no cell',
    { tags: ['engines'] },
    async () => {
      await page.viewport(1024, 700);
      for (const { containsLayout, name } of variants) {
        const stop = await open(menus, containsLayout, { scroll: false });
        try {
          document.body.style.display = 'grid';
          document.body.style.gap = '3rem';
          const trigger = page
            .getByTestId('menus-light')
            .getByRole('button', { name: 'View options' });
          trigger.element().scrollIntoView({ block: 'nearest' });
          window.scrollBy(0, 40);
          await trigger.click();
          const menu = page.getByRole('menu', { name: 'View options' });
          await expect.poll(() => shown(menu), { message: name }).toBe(true);
          await expect
            .poll(
              () => {
                const button = box(trigger);
                const popup = box(menu);
                const gap =
                  popup.y >= button.y
                    ? popup.y - (button.y + button.height)
                    : button.y - (popup.y + popup.height);
                return (
                  gap >= 0 &&
                  gap < 16 &&
                  popup.x + popup.width > button.x &&
                  popup.x < button.x + button.width
                );
              },
              { message: name },
            )
            .toBe(true);
          const theme = menu.element().closest('.env-popup-theme')!;
          expect(css(theme, 'position'), name).toBe('absolute');
          expect(css(theme, 'container-name'), name).toBe('env-window');
          expect(box(theme).width, name).toBeCloseTo(document.documentElement.clientWidth, 0);
        } finally {
          stop();
          document.body.removeAttribute('style');
        }
      }
    },
  );

  test('what a dialog holds lays out at the window’s class', async () => {
    addStyle(
      '@layer env.components { @container env-window (width >= 37.5rem) { .env-dialog { --window-probe: medium; } } }',
    );
    for (const { containsLayout, name } of variants)
      for (const [width, expected] of [
        [480, ''],
        [1024, 'medium'],
      ] as const) {
        await page.viewport(width, 800);
        const stop = await open(dialogs, containsLayout, { scroll: false });
        try {
          await page.getByRole('button', { name: 'Open top dialog' }).click();
          const dialog = page.getByRole('dialog', { name: 'Search plans' });
          await expect.poll(() => shown(dialog)).toBe(true);
          expect(css(dialog, '--window-probe'), `${name}, ${width} px`).toBe(expected);
        } finally {
          stop();
        }
      }
  });
});

test('under a themed document root, portals measure the root and keep their boxes', async () => {
  await page.viewport(1024, 700);
  mount(menus);
  document.documentElement.classList.add('env-theme');
  document.documentElement.dataset.envTheme = 'light';
  await page.getByTestId('menus-light').getByRole('button', { name: 'View options' }).click();
  const menu = page.getByRole('menu', { name: 'View options' });
  await expect.poll(() => shown(menu)).toBe(true);
  expect(css(menu.element().closest('.env-popup-theme')!, 'display')).toBe('contents');
  expect(css(document.documentElement, 'container-name')).toBe('env-window');
});
