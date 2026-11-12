/**
 * Scale and size: every control of one size has the same height in a scale, in both scales, and
 * the scale's control heights are the token tables' (docs/foundations/spacing.md). The density
 * fixture's sizes section holds one row per size of every control that takes a size, in a
 * comfortable and a compact Theme. Every target is at least 24 px, or has 24 px of room. Under a
 * coarse pointer every control grows to the touch height, so the controls of a row still match;
 * the parts of rails and the actions inside fields take hit areas inside their control, and a press
 * always reaches the control it lands on, whatever the layout. Each check runs over every section
 * and scale it covers in one test.
 */
import { expect, test } from 'vitest';
import { commands, page, server } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as primitives from '../fixture/Primitives.fixture.tsx';
import * as fixture from '../fixture/Scale.fixture.tsx';
import { controlSizes, densityScales } from '../fixture/ScaleSections.fixture.ts';
import * as tabsCompact from '../fixture/TabsCompact.fixture.tsx';
import { box, css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/** The control heights of each scale, in CSS pixels at the default 16 px root. */
const heights = {
  comfortable: { sm: 32, md: 40, lg: 48 },
  compact: { sm: 28, md: 36, lg: 44 },
} as const;

/** The height every control of a size draws at under a coarse pointer: at least the touch height. */
const touchHeights = {
  comfortable: { sm: 44, md: 44, lg: 48 },
  compact: { sm: 44, md: 44, lg: 44 },
} as const;

/** Mounts one section of the density fixture, in light, and waits for it to settle. */
async function openSection(section: string, scale?: 'system') {
  mount(fixture, { scale, search: `section=${section}&theme=light` });
  await settle();
}

/**
 * Waits for the page's animations to end. Controls ease in as they appear, scaled, and panels rise
 * into place, so a box measured mid-animation is not the control's. The animations' states are
 * polled rather than their finished promises awaited; endless ones, such as spinners, are left out.
 */
async function settle() {
  await expect
    .poll(
      () =>
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.playState === 'running' &&
              Number.isFinite(Number(animation.effect?.getComputedTiming().endTime)),
          ).length,
    )
    .toBe(0);
}

/** Runs `check` with a coarse pointer and touch, as a phone's, and turns them off after. */
async function onTouch(check: () => Promise<void>) {
  await commands.emulateTouch(true);
  try {
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    await check();
  } finally {
    await commands.emulateTouch(false);
  }
}

const scaleRoot = (scale: string) =>
  document.querySelector<HTMLElement>(`[data-density-scale="${scale}"]`)!;

/**
 * The outer box of each control in a row: buttons (Button, IconButton, CopyButton, Select's
 * trigger, Pagination's buttons and a ButtonGroup's), the wells of TextField, SearchField, Combobox
 * and DatePicker, and the rails of SegmentedControl and Tabs, with a name for the failure message.
 */
function controlBoxes(row: Element) {
  return (
    [
      ...row.querySelectorAll<HTMLElement>(
        '.env-button, .env-text-field-control, .env-segmented-control, .env-tabs-list',
      ),
    ]
      // Buttons inside a field or a tab rail are its parts, not controls of the row.
      .filter(
        (control) => !control.parentElement?.closest('.env-text-field-control, .env-tabs-list'),
      )
      .map((control) => ({
        name:
          control.getAttribute('aria-label') ||
          control.className.split(' ').find((name) => name.startsWith('env-')) ||
          control.tagName,
        height: Math.round(control.getBoundingClientRect().height * 100) / 100,
      }))
  );
}

const sizeRow = (scale: string, size: string) =>
  document.querySelector(`[data-density-scale="${scale}"] [data-size-row="${size}"]`)!;

test('every control of a size has its height in each scale, a tab counter centred on its line', async () => {
  await openSection('sizes');
  for (const scale of densityScales)
    for (const size of controlSizes) {
      const boxes = controlBoxes(sizeRow(scale, size));
      // Button, IconButton, TextField, SearchField, Select, Combobox, DatePicker, SegmentedControl,
      // CopyButton, Pagination's two buttons, a ButtonGroup's two and a Tabs rail.
      expect(boxes.length).toBeGreaterThanOrEqual(14);
      expect(boxes, `${scale} ${size}`).toEqual(
        boxes.map(({ name }) => ({ name, height: heights[scale][size] })),
      );
    }
  // Compact tabs make the whole rail as tall as a compact control, and a counter fits inside its
  // tab, centred on the label's line.
  mount(tabsCompact);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`compact-tabs-${theme}`);
    const control = box(scope.getByTestId(`compact-control-${theme}`));
    expect(Math.abs(box(scope.getByRole('tablist')).height - control.height), theme).toBeLessThan(
      1,
    );
    const tab = scope.getByRole('tab', { name: /Submissions/ }).element();
    const counter = box(tab.querySelector('.env-badge[data-count]')!);
    const tabBox = box(tab);
    expect(counter.y).toBeGreaterThanOrEqual(tabBox.y);
    expect(counter.y + counter.height).toBeLessThanOrEqual(tabBox.y + tabBox.height);
    const range = document.createRange();
    range.selectNodeContents(tab.firstChild!);
    const label = range.getBoundingClientRect();
    expect(
      Math.abs(counter.y + counter.height / 2 - (label.y + label.height / 2)),
      theme,
    ).toBeLessThan(1.5);
  }
});

test('labelled outline and ghost fields share one height per size in each scale', async () => {
  // Fields that show their labels, outline and ghost, are as tall as a button of their size at md
  // and lg, and take the md height at sm, so the floated label and the value each keep room.
  await openSection('sizes');
  for (const scale of densityScales)
    for (const size of controlSizes) {
      const row = document.querySelector(
        `[data-density-scale="${scale}"] [data-labelled-row="${size}"]`,
      )!;
      const boxes = controlBoxes(row);
      expect(boxes.length).toBe(6);
      const field = Math.max(heights[scale][size], heights[scale].md);
      expect(boxes, `${scale} ${size}`).toEqual(
        boxes.map(({ name }, index) => ({
          name,
          height: index === 0 ? heights[scale][size] : field,
        })),
      );
    }
});

/**
 * Tree rows at each density: a 20 px content line in both scales, so a compact row is never taller
 * than a comfortable one, and the default sm row is as tall as a compact menu row.
 */
const treeRows = {
  comfortable: { xs: 24, sm: 28, md: 36, lg: 44 },
  compact: { xs: 24, sm: 28, md: 30, lg: 34 },
} as const;

test('tree rows are as tall as their density in each scale, and menu rows a popup row', async () => {
  await openSection('tree');
  for (const scale of densityScales) {
    const rows = Object.fromEntries(
      [...scaleRoot(scale).querySelectorAll('.env-tree')].map((tree) => [
        tree.getAttribute('data-density'),
        tree.querySelector('.env-tree-item')!.getBoundingClientRect().height,
      ]),
    );
    expect(rows, scale).toEqual(treeRows[scale]);
    for (const density of ['xs', 'sm', 'md', 'lg'] as const)
      expect(treeRows.compact[density]).toBeLessThanOrEqual(treeRows.comfortable[density]);
  }
  // The menu of each scale opens in a popup of that scale, with rows a quarter rem taller than the
  // scale's row height (2.5 and 2 rem); they reach their height once it has grown in.
  await openSection('menu');
  await expect
    .poll(() =>
      Object.fromEntries(
        page
          .getByRole('menuitem', { name: 'Move to folder' })
          .elements()
          .map((row) => [
            row.closest<HTMLElement>('.env-theme')!.dataset.envScale,
            row.getBoundingClientRect().height,
          ]),
      ),
    )
    .toEqual({ comfortable: 40, compact: 32 });
});

test(
  'the system scale is compact on a fine pointer and comfortable on a coarse one, and an explicit scale inside it wins',
  { tags: ['engines'] },
  async () => {
    // The system scale, the default, is the stylesheet's choice, while a comfortable or compact
    // boundary inside it keeps its own.
    const check = async (touch: boolean) => {
      await openSection('sizes', 'system');
      expect(matchMedia('(pointer: fine)').matches).toBe(!touch);
      const rowHeight = (element: Element) =>
        getComputedStyle(element).getPropertyValue('--env-row-height');
      const outer = document.querySelector('#root > .env-theme')!;
      expect(outer.getAttribute('data-env-scale')).toBe('system');
      expect(rowHeight(outer)).toBe(touch ? '2.25rem' : '1.75rem');
      for (const scale of densityScales)
        expect(rowHeight(scaleRoot(scale)), scale).toBe(
          scale === 'compact' ? '1.75rem' : '2.25rem',
        );
    };
    await check(false);
    // Touch is emulated through Chromium's DevTools protocol.
    if (server.browser === 'chromium') await onTouch(() => check(true));
  },
);

test('a popup opened in a scale keeps it', async () => {
  await openSection('sizes');
  // A Select opened in the compact boundary portals its list into a compact Theme.
  await page
    .elementLocator(sizeRow('compact', 'md'))
    .getByRole('combobox', { name: 'Plan', exact: true })
    .click();
  const list = page.getByRole('listbox');
  await expect.element(list).toBeVisible();
  expect(list.element().parentElement!.closest('.env-theme')!.getAttribute('data-env-scale')).toBe(
    'compact',
  );
  // The list grows in; its rows reach the compact popup row's height once it has.
  const option = list.getByRole('option', { name: 'Team', exact: true });
  await expect.poll(() => option.element().getBoundingClientRect().height).toBe(32);
});

/** What can be pressed, as a person aims at it. */
const targets =
  'button, a[href], [role="tab"], [role="radio"], [role="combobox"], [role="menuitem"], [role="treeitem"], input:not([type="hidden"])';

/**
 * The visible targets inside a root, each with its box: a control inside a label is aimed at
 * through the label. Visually hidden elements, such as a select's native input, are left out.
 */
function findTargets(root: Element, selector: string) {
  return [...root.querySelectorAll<HTMLElement>(selector)]
    .map((element) => {
      const aim = element.closest('label') ?? element;
      return { element, box: aim.getBoundingClientRect() };
    })
    .filter(({ element, box }) => box.width > 2 && box.height > 2 && element.checkVisibility());
}

const nameOf = (element: Element) =>
  (element.getAttribute('aria-label') ?? element.textContent ?? '').trim();

/** The targets under 24 px that come closer than 24 px of room, in WCAG 2.5.8's terms. */
function crowdedTargets(root: Element) {
  const all = findTargets(root, targets).map(({ element: target, box }) => ({
    target,
    box,
    small: box.width < 23.99 || box.height < 23.99,
    cx: box.x + box.width / 2,
    cy: box.y + box.height / 2,
  }));
  const failures: string[] = [];
  for (const { target, box, small, cx, cy } of all) {
    if (!small) continue;
    // The spacing exception: a 24 px circle on the target's centre meets no other target, and no
    // other undersized target's circle, so their centres are 24 px apart.
    const near = all.some((other) => {
      if (other.target === target) return false;
      if (other.target.contains(target) || target.contains(other.target)) return false;
      const b = other.box;
      const dx = Math.max(b.x - cx, 0, cx - (b.x + b.width));
      const dy = Math.max(b.y - cy, 0, cy - (b.y + b.height));
      if (dx * dx + dy * dy < 144) return true;
      return other.small && (other.cx - cx) ** 2 + (other.cy - cy) ** 2 < 576;
    });
    if (near) failures.push(`${nameOf(target)} ${box.width.toFixed(1)}×${box.height.toFixed(1)}`);
  }
  return failures;
}

test('every target is at least 24 px, or has 24 px of room, in every section and scale', async () => {
  for (const section of ['sizes', 'toolbar', 'tabs', 'navigation', 'tree', 'table', 'desktop']) {
    await openSection(section);
    for (const scale of densityScales)
      expect(crowdedTargets(scaleRoot(scale)), `${scale} ${section}`).toEqual([]);
  }
  // Segments, tabs and the actions inside fields keep 24 px themselves, also in small rails and
  // fields of the compact scale.
  await openSection('sizes');
  for (const scale of densityScales) {
    const small = [
      ...sizeRow(scale, 'sm').querySelectorAll<HTMLElement>(
        '.env-segmented-control-item, [role="tab"], .env-text-field-end .env-button',
      ),
    ]
      .filter((element) => element.offsetWidth < 24 || element.offsetHeight < 24)
      .map((element) => `${element.offsetWidth}×${element.offsetHeight}`);
    expect(small, scale).toEqual([]);
  }
});

test('on a coarse pointer every control of a row is as tall, and at least the touch height', async () => {
  await onTouch(async () => {
    await openSection('sizes');
    for (const scale of densityScales)
      for (const size of controlSizes) {
        const row = sizeRow(scale, size);
        const boxes = controlBoxes(row);
        // Buttons, the wells of fields, the rails of SegmentedControl and Tabs, and the buttons
        // of a ButtonGroup and of Pagination.
        expect(boxes.length).toBeGreaterThanOrEqual(14);
        expect(boxes, `${scale} ${size}`).toEqual(
          boxes.map(({ name }) => ({ name, height: touchHeights[scale][size] })),
        );
        // The group itself, around its buttons.
        expect(row.querySelector('.env-button-group')!.getBoundingClientRect().height).toBe(
          touchHeights[scale][size],
        );
      }
    // A ButtonGroup's corners stay round at the touch height.
    const corners = [
      ...document.querySelectorAll('.env-button-group > .env-button:first-child'),
    ].map((button) => ({
      radius: Number.parseFloat(getComputedStyle(button).borderStartStartRadius),
      half: button.getBoundingClientRect().height / 2,
    }));
    expect(corners).toHaveLength(6);
    for (const { radius, half } of corners) expect(radius).toBe(half);
    // AvatarButton grows to the touch height around a small avatar.
    mount(adoption);
    const avatar = page.getByRole('button', { name: 'Open account menu' });
    expect([css(avatar, 'width'), css(avatar, 'height')]).toEqual(['44px', '44px']);
    // A toolbar's rows, and a desktop view's rows of controls at their default size.
    for (const section of ['toolbar', 'desktop']) {
      await openSection(section);
      for (const scale of densityScales) {
        const rows = scaleRoot(scale).querySelectorAll('.density-row');
        expect(rows.length).toBeGreaterThan(0);
        for (const row of rows) {
          const boxes = controlBoxes(row);
          expect(boxes, `${scale} ${section}`).toEqual(
            boxes.map(({ name }) => ({ name, height: 44 })),
          );
        }
      }
    }
  });
});

/**
 * Scrolls an element to the middle of the viewport, unless it and the 40 px a hit area may reach
 * around it are in view already, so a press at any point of it lands in the page.
 */
async function bringIntoView(element: Element) {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  if (left >= 40 && top >= 40 && right <= innerWidth - 40 && bottom <= innerHeight - 40) return;
  element.scrollIntoView({ block: 'center', inline: 'center' });
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

/**
 * The hit area of each visible target inside a root under a coarse pointer, as a press finds it:
 * the target's box and how far beyond each of its edges, through its centre, a press still lands on
 * it. Links in running text and breadcrumbs, which keep their size, are left out, and so are the
 * inputs of fields, such as a date picker's button, which fill the well inside its border: the row
 * test measures the well.
 */
async function measureHitAreas(root: Element, selector: string) {
  const results = [];
  for (const element of root.querySelectorAll(selector)) {
    if (!element.checkVisibility()) continue;
    if (element.matches('.env-link, .env-breadcrumbs-link, .env-text-field-input')) continue;
    await bringIntoView(element);
    const box = element.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    const hits = (x: number, y: number) => {
      const hit = document.elementFromPoint(x, y);
      return hit !== null && element.contains(hit);
    };
    const reach = (lands: (distance: number) => boolean) => {
      let distance = 0;
      while (distance < 40 && lands(distance + 0.5)) distance += 1;
      return distance;
    };
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    results.push({
      name: nameOf(element).slice(0, 32),
      inField: element.closest('.env-text-field-end') !== null,
      width: Math.round(
        box.width + reach((d) => hits(box.left - d, cy)) + reach((d) => hits(box.right + d, cy)),
      ),
      height: Math.round(
        box.height + reach((d) => hits(cx, box.top - d)) + reach((d) => hits(cx, box.bottom + d)),
      ),
    });
  }
  return results;
}

const pressable =
  'button, a[href], [role="tab"], [role="radio"], [role="menuitem"], [role="treeitem"]';

test('on a coarse pointer every hit area is the touch height, and as wide unless inside a field', async () => {
  await onTouch(async () => {
    for (const section of ['sizes', 'toolbar', 'tabs', 'tree', 'table', 'desktop', 'layouts']) {
      await openSection(section);
      const areas = await measureHitAreas(document.body, pressable);
      expect(areas.length, section).toBeGreaterThan(0);
      // The actions inside a field keep their width, so they never reach over the next action.
      expect(
        areas.filter(({ inField, width, height }) => height < 44 || (!inField && width < 44)),
        section,
      ).toEqual([]);
    }
    // An Alert's dismiss button reaches the touch size with its hit area.
    mount(primitives);
    const areas = await measureHitAreas(page.getByTestId('close-buttons').element(), 'button');
    expect(areas).toHaveLength(1);
    expect(areas[0]!.width).toBeGreaterThanOrEqual(44);
    expect(areas[0]!.height).toBeGreaterThanOrEqual(44);
  });
});

test('on a coarse pointer nothing that holds controls scrolls where it has room', async () => {
  // Table regions, rails, groups and the dock's rows are scroll containers. The fixture gives
  // them room, so none may scroll, also not for an action or a hit area taller than its row.
  await onTouch(async () => {
    for (const section of ['sizes', 'toolbar', 'tabs', 'table', 'desktop', 'layouts']) {
      await openSection(section);
      const scrolls = (value: string) => value === 'auto' || value === 'scroll';
      const scrolling = [...document.querySelectorAll<HTMLElement>('.density-page *')]
        .filter((element) => {
          const style = getComputedStyle(element);
          return (
            (scrolls(style.overflowX) || scrolls(style.overflowY)) &&
            element.querySelector('button, [role="tab"], [role="radio"]') !== null &&
            // A tree scrolls its rows in its frame by design.
            !element.matches('.env-tree')
          );
        })
        .filter(
          (element) =>
            element.scrollHeight > element.clientHeight ||
            element.scrollWidth > element.clientWidth,
        )
        .map(
          (element) =>
            `${element.className}: ${element.scrollWidth}×${element.scrollHeight} in ${element.clientWidth}×${element.clientHeight}`,
        );
      expect(scrolling, section).toEqual([]);
    }
  });
});

test('on a coarse pointer a press just inside a control reaches it, never its neighbour', async () => {
  // Each section shows both scales. layouts holds small buttons 4 px apart in layouts of the
  // application's own (a column, a wrapping row, a grid, a reversed row, each button in a span in
  // either direction) and a docked panel's header.
  await onTouch(async () => {
    for (const section of ['sizes', 'toolbar', 'desktop', 'layouts']) {
      await openSection(section);
      const stolen: string[] = [];
      for (const { element } of findTargets(
        document.body,
        'button, a[href], [role="tab"], [role="radio"], [role="menuitem"]',
      )) {
        await bringIntoView(element);
        const box = element.getBoundingClientRect();
        const points = [
          [box.x + 1, box.y + box.height / 2],
          [box.x + box.width - 1, box.y + box.height / 2],
          [box.x + box.width / 2, box.y + 1],
          [box.x + box.width / 2, box.y + box.height - 1],
        ] as const;
        for (const [x, y] of points) {
          const hit = document.elementFromPoint(x, y);
          if (hit && !element.contains(hit) && !hit.contains(element))
            stolen.push(
              `${nameOf(element)} at ${x.toFixed(0)},${y.toFixed(0)}: ${nameOf(hit).slice(0, 24)}`,
            );
        }
      }
      expect(stolen, section).toEqual([]);
    }
  });
});
