import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as primitives from '../fixture/Primitives.fixture.tsx';
import * as fixture from '../fixture/Scale.fixture.tsx';
import { controlSizes, densityScales } from '../fixture/ScaleSections.ts';
import { css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const heights = {
  comfortable: { sm: 32, md: 40, lg: 48 },
  compact: { sm: 28, md: 36, lg: 44 },
} as const;

const touchHeights = {
  comfortable: { sm: 44, md: 44, lg: 48 },
  compact: { sm: 44, md: 44, lg: 44 },
} as const;

async function openSection(section: string, scale?: 'system') {
  mount(fixture, { scale, search: `section=${section}&theme=light` });
  await settle();
}

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

function controlBoxes(row: Element) {
  return [
    ...row.querySelectorAll<HTMLElement>(
      '.env-button, .env-text-field-control, .env-segmented-control',
    ),
  ]
    .filter((control) => !control.parentElement?.closest('.env-text-field-control'))
    .map((control) => ({
      name:
        control.getAttribute('aria-label') ||
        control.className.split(' ').find((name) => name.startsWith('env-')) ||
        control.tagName,
      height: Math.round(control.getBoundingClientRect().height * 100) / 100,
    }));
}

const sizeRow = (scale: string, size: string) =>
  document.querySelector(`[data-density-scale="${scale}"] [data-size-row="${size}"]`)!;

test('every control of a size has its height in each scale', async () => {
  await openSection('sizes');
  for (const scale of densityScales)
    for (const size of controlSizes) {
      const boxes = controlBoxes(sizeRow(scale, size));
      expect(boxes.length).toBeGreaterThanOrEqual(13);
      expect(boxes, `${scale} ${size}`).toEqual(
        boxes.map(({ name }) => ({ name, height: heights[scale][size] })),
      );
    }
});

test('labelled outline and ghost fields share one height per size in each scale', async () => {
  await openSection('sizes');
  for (const scale of densityScales)
    for (const size of controlSizes) {
      const row = document.querySelector(
        `[data-density-scale="${scale}"] [data-labelled-row="${size}"]`,
      )!;
      const boxes = controlBoxes(row);
      expect(boxes.length).toBe(6);
      expect(boxes, `${scale} ${size}`).toEqual(
        boxes.map(({ name }) => ({ name, height: heights[scale][size] })),
      );
    }
});

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

async function expectSystemScale(touch: boolean) {
  await openSection('sizes', 'system');
  expect(matchMedia('(pointer: fine)').matches).toBe(!touch);
  const rowHeight = (element: Element) =>
    getComputedStyle(element).getPropertyValue('--env-row-height');
  const outer = document.querySelector('#root > .env-theme')!;
  expect(outer.getAttribute('data-env-scale')).toBe('system');
  expect(rowHeight(outer)).toBe(touch ? '2.25rem' : '1.75rem');
  for (const scale of densityScales)
    expect(rowHeight(scaleRoot(scale)), scale).toBe(scale === 'compact' ? '1.75rem' : '2.25rem');
}

test(
  'the system scale is compact on a fine pointer, and an explicit scale inside it wins',
  { tags: ['engines'] },
  () => expectSystemScale(false),
);

test('a popup opened in a scale keeps it', async () => {
  await openSection('sizes');
  await page
    .elementLocator(sizeRow('compact', 'md'))
    .getByRole('combobox', { name: 'Plan', exact: true })
    .click();
  const list = page.getByRole('listbox');
  await expect.element(list).toBeVisible();
  expect(list.element().parentElement!.closest('.env-theme')!.getAttribute('data-env-scale')).toBe(
    'compact',
  );
  const option = list.getByRole('option', { name: 'Team', exact: true });
  await expect.poll(() => option.element().getBoundingClientRect().height).toBe(32);
});

const targets =
  'button, a[href], [role="tab"], [role="radio"], [role="combobox"], [role="menuitem"], [role="treeitem"], input:not([type="hidden"])';

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
  for (const section of ['sizes', 'toolbar', 'navigation', 'tree', 'table', 'desktop']) {
    await openSection(section);
    for (const scale of densityScales)
      expect(crowdedTargets(scaleRoot(scale)), `${scale} ${section}`).toEqual([]);
  }
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

test('on a coarse pointer the system scale is comfortable, and an explicit scale inside it wins', async () => {
  await onTouch(() => expectSystemScale(true));
});

test('on a coarse pointer every control of a row is as tall, and at least the touch height', async () => {
  await onTouch(async () => {
    await openSection('sizes');
    for (const scale of densityScales)
      for (const size of controlSizes) {
        const row = sizeRow(scale, size);
        const boxes = controlBoxes(row);
        expect(boxes.length).toBeGreaterThanOrEqual(13);
        expect(boxes, `${scale} ${size}`).toEqual(
          boxes.map(({ name }) => ({ name, height: touchHeights[scale][size] })),
        );
        expect(row.querySelector('.env-button-group')!.getBoundingClientRect().height).toBe(
          touchHeights[scale][size],
        );
      }
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const corners = [
      ...document.querySelectorAll('.env-button-group > .env-button:first-child'),
    ].map((button) => ({
      radius: Number.parseFloat(getComputedStyle(button).borderStartStartRadius),
      control:
        Number.parseFloat(getComputedStyle(button).getPropertyValue('--env-radius-control')) * rem,
    }));
    expect(corners).toHaveLength(6);
    for (const { radius, control } of corners) expect(radius).toBeCloseTo(control, 1);
    mount(adoption);
    const avatar = page.getByRole('button', { name: 'Open account menu' });
    expect([css(avatar, 'width'), css(avatar, 'height')]).toEqual(['44px', '44px']);
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

async function bringIntoView(element: Element) {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  if (left >= 40 && top >= 40 && right <= innerWidth - 40 && bottom <= innerHeight - 40) return;
  element.scrollIntoView({ block: 'center', inline: 'center' });
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

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
    for (const section of ['sizes', 'toolbar', 'tree', 'table', 'desktop', 'layouts']) {
      await openSection(section);
      const areas = await measureHitAreas(document.body, pressable);
      expect(areas.length, section).toBeGreaterThan(0);
      expect(
        areas.filter(({ inField, width, height }) => height < 44 || (!inField && width < 44)),
        section,
      ).toEqual([]);
    }
    mount(primitives);
    const areas = await measureHitAreas(page.getByTestId('close-buttons').element(), 'button');
    expect(areas).toHaveLength(1);
    expect(areas[0]!.width).toBeGreaterThanOrEqual(44);
    expect(areas[0]!.height).toBeGreaterThanOrEqual(44);
  });
});

test('on a coarse pointer nothing that holds controls scrolls where it has room', async () => {
  await onTouch(async () => {
    for (const section of ['sizes', 'toolbar', 'table', 'desktop', 'layouts']) {
      await openSection(section);
      const scrolls = (value: string) => value === 'auto' || value === 'scroll';
      const scrolling = [...document.querySelectorAll<HTMLElement>('.density-page *')]
        .filter((element) => {
          const style = getComputedStyle(element);
          return (
            (scrolls(style.overflowX) || scrolls(style.overflowY)) &&
            element.querySelector('button, [role="tab"], [role="radio"]') !== null &&
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
