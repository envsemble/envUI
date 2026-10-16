/**
 * Scale and size: every control of one size has the same height in a scale, in both scales, and
 * the scale's control heights are the token tables' (docs/foundations/scale.md). The density
 * fixture's sizes section holds one row per size of every control that takes a size, in a
 * comfortable and a compact Theme. Every target is at least 24 px, or has 24 px of room. Under a
 * coarse pointer every control grows to the touch height, so the controls of a row still match;
 * the parts of rails and the actions inside fields take hit areas inside their control, and a press
 * always reaches the control it lands on, whatever the layout.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { controlSizes, densityScales } from '../fixture/DensitySections';
import { fixtureUrl } from './Servers';

/** The control heights of each scale, in CSS pixels at the default 16 px root. */
const heights = {
  comfortable: { sm: 32, md: 40, lg: 48 },
  compact: { sm: 26, md: 32, lg: 38 },
} as const;

async function openSection(page: Page, section: string, theme = 'light') {
  await page.goto(`${fixtureUrl}/?fixture=density&section=${section}&theme=${theme}`);
  await expect(page.locator(`[data-density-section="${section}"]`)).toBeVisible();
  // Controls ease in as they appear, scaled, so a box measured mid-animation is smaller than the
  // control. The animations' states are polled rather than their finished promises awaited, as the
  // accessibility gate does; endless ones, such as spinners, are left out.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (animation) =>
                animation.playState === 'running' &&
                Number.isFinite(Number(animation.effect?.getComputedTiming().endTime)),
            ).length,
      ),
    )
    .toBe(0);
}

/**
 * The outer box of each control in a row: buttons (Button, IconButton, CopyButton, Select's
 * trigger, Pagination's buttons and a ButtonGroup's), the wells of TextField, SearchField, Combobox
 * and DatePicker, and the rails of SegmentedControl and Tabs, with a name for the failure message.
 */
async function controlBoxes(row: Locator) {
  return row.evaluate((element) =>
    [
      ...element.querySelectorAll<HTMLElement>(
        '.env-button, .env-text-field-well, .env-segmented-control, .env-tabs-list',
      ),
    ]
      // Buttons inside a field or a tab rail are its parts, not controls of the row.
      .filter((control) => !control.parentElement?.closest('.env-text-field-well, .env-tabs-list'))
      .map((control) => ({
        name:
          control.getAttribute('aria-label') ||
          control.className.split(' ').find((name) => name.startsWith('env-')) ||
          control.tagName,
        height: Math.round(control.getBoundingClientRect().height * 100) / 100,
      })),
  );
}

for (const scale of densityScales)
  for (const size of controlSizes)
    test(`every control of size ${size} is ${heights[scale][size]} px tall in the ${scale} scale`, async ({
      page,
    }) => {
      await openSection(page, 'sizes');
      const row = page.locator(`[data-density-scale="${scale}"] [data-size-row="${size}"]`);
      const boxes = await controlBoxes(row);
      // Button, IconButton, TextField, SearchField, Select, Combobox, DatePicker, SegmentedControl,
      // CopyButton, Pagination's two buttons, a ButtonGroup's two and a Tabs rail.
      expect(boxes.length).toBeGreaterThanOrEqual(14);
      expect(boxes, `${scale} ${size}`).toEqual(
        boxes.map(({ name }) => ({ name, height: heights[scale][size] })),
      );
    });

test('each scale writes data-env-scale on its boundary, and nested Themes and popups keep it', async ({
  page,
}) => {
  await openSection(page, 'sizes');
  for (const scale of densityScales)
    await expect(page.locator(`.env-theme[data-density-scale="${scale}"]`)).toHaveAttribute(
      'data-env-scale',
      scale,
    );
  // A Select opened in the compact boundary portals its list into a compact Theme.
  await page
    .locator('[data-density-scale="compact"] [data-size-row="md"]')
    .getByRole('combobox', { name: 'Plan', exact: true })
    .click();
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(list.locator('xpath=ancestor::*[contains(@class, "env-theme")][1]')).toHaveAttribute(
    'data-env-scale',
    'compact',
  );
  // The list grows in; its rows reach the compact row height once it has.
  const option = list.getByRole('option', { name: 'Team', exact: true });
  await expect
    .poll(() => option.evaluate((element) => element.getBoundingClientRect().height))
    .toBe(28);
});

/** What can be pressed, as a person aims at it. */
const targets =
  'button, a[href], [role="tab"], [role="radio"], [role="combobox"], [role="menuitem"], [role="treeitem"], input:not([type="hidden"])';

/**
 * The visible targets inside a root, each with its box: a control inside a label is aimed at
 * through the label. Visually hidden elements, such as a select's native input, are left out. It
 * runs in the page, as source text.
 */
const findTargets = `(root, selector) =>
  [...root.querySelectorAll(selector)]
    .map((element) => {
      const aim = element.closest('label') ?? element;
      return { element, box: aim.getBoundingClientRect() };
    })
    .filter(({ element, box }) => box.width > 2 && box.height > 2 && element.checkVisibility())`;

type Target = { element: HTMLElement; box: DOMRect };
type FindTargets = (root: Element, selector: string) => Target[];

for (const scale of densityScales)
  test(`every target in the ${scale} scale is at least 24 px, or has 24 px of room`, async ({
    page,
  }) => {
    for (const section of ['sizes', 'toolbar', 'tabs', 'navigation', 'tree', 'table', 'desktop']) {
      await openSection(page, section);
      const root = page.locator(`[data-density-scale="${scale}"]`);
      const crowded = await root.evaluate(
        (element, [selector, source]) => {
          const find = (0, eval)(source) as FindTargets;
          const all = find(element, selector).map(({ element: target, box }) => ({
            target,
            box,
            small: box.width < 23.99 || box.height < 23.99,
            cx: box.x + box.width / 2,
            cy: box.y + box.height / 2,
          }));
          const failures: string[] = [];
          for (const { target, box, small, cx, cy } of all) {
            if (!small) continue;
            // WCAG 2.5.8's spacing exception: a 24 px circle on the target's centre meets no other
            // target, and no other undersized target's circle, so their centres are 24 px apart.
            const near = all.some((other) => {
              if (other.target === target) return false;
              if (other.target.contains(target) || target.contains(other.target)) return false;
              const b = other.box;
              const dx = Math.max(b.x - cx, 0, cx - (b.x + b.width));
              const dy = Math.max(b.y - cy, 0, cy - (b.y + b.height));
              if (dx * dx + dy * dy < 144) return true;
              return other.small && (other.cx - cx) ** 2 + (other.cy - cy) ** 2 < 576;
            });
            if (near)
              failures.push(
                `${(target.getAttribute('aria-label') ?? target.textContent ?? '').trim()} ${box.width.toFixed(1)}×${box.height.toFixed(1)}`,
              );
          }
          return failures;
        },
        [targets, findTargets] as const,
      );
      expect(crowded, `${scale} ${section}`).toEqual([]);
    }
    // Segments, tabs and the actions inside fields keep 24 px themselves, also in small rails and
    // fields of the compact scale.
    await openSection(page, 'sizes');
    const small = await page
      .locator(`[data-density-scale="${scale}"] [data-size-row="sm"]`)
      .evaluate((row) =>
        [
          ...row.querySelectorAll<HTMLElement>(
            '.env-segment, [role="tab"], .env-text-field-end .env-button',
          ),
        ]
          .filter((element) => element.offsetWidth < 24 || element.offsetHeight < 24)
          .map((element) => `${element.offsetWidth}×${element.offsetHeight}`),
      );
    expect(small).toEqual([]);
  });

/** The height every control of a size draws at under a coarse pointer: at least the touch height. */
const touchHeights = {
  comfortable: { sm: 44, md: 44, lg: 48 },
  compact: { sm: 44, md: 44, lg: 44 },
} as const;

/**
 * The hit area of each visible target inside a root under a coarse pointer, as a press finds it:
 * the target's box and how far beyond each of its edges, through its centre, a press still lands on
 * it. Links in running text and breadcrumbs, which keep their size, are left out, and so are the
 * inputs of fields, such as a date picker's button, which fill the well inside its border: the row
 * test measures the well. It runs in the page, as source text.
 */
const measureHitAreas = `async (root, selector) => {
  const results = [];
  for (const element of root.querySelectorAll(selector)) {
    if (!element.checkVisibility()) continue;
    if (element.matches('.env-link, .env-breadcrumb-link, .env-text-input')) continue;
    element.scrollIntoView({ block: 'center', inline: 'center' });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const box = element.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    const hits = (x, y) => {
      const hit = document.elementFromPoint(x, y);
      return hit !== null && element.contains(hit);
    };
    const reach = (lands) => {
      let distance = 0;
      while (distance < 40 && lands(distance + 0.5)) distance += 1;
      return distance;
    };
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    results.push({
      name: (element.getAttribute('aria-label') || element.textContent || '').trim().slice(0, 32),
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
}`;

type HitArea = { name: string; inField: boolean; width: number; height: number };
type MeasureHitAreas = (root: Element, selector: string) => Promise<HitArea[]>;

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  for (const scale of densityScales)
    test(`every control of a row is as tall, and at least the touch height, in the ${scale} scale`, async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName !== 'chromium',
        'Only one engine emulates touch with a coarse pointer.',
      );
      await openSection(page, 'sizes');
      expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
      for (const size of controlSizes) {
        const row = page.locator(`[data-density-scale="${scale}"] [data-size-row="${size}"]`);
        const boxes = await controlBoxes(row);
        // Buttons, the wells of fields, the rails of SegmentedControl and Tabs, and the buttons of
        // a ButtonGroup and of Pagination.
        expect(boxes.length).toBeGreaterThanOrEqual(14);
        expect(boxes, `${scale} ${size}`).toEqual(
          boxes.map(({ name }) => ({ name, height: touchHeights[scale][size] })),
        );
        // The group itself, around its buttons.
        expect(
          await row
            .locator('.env-button-group')
            .evaluate((group) => group.getBoundingClientRect().height),
        ).toBe(touchHeights[scale][size]);
      }
      // A toolbar's rows, and a desktop view's rows of controls at their default size.
      for (const section of ['toolbar', 'desktop']) {
        await openSection(page, section);
        const rows = await page.locator(`[data-density-scale="${scale}"] .density-row`).all();
        expect(rows.length).toBeGreaterThan(0);
        for (const row of rows) {
          const boxes = await controlBoxes(row);
          expect(boxes, `${scale} ${section}`).toEqual(
            boxes.map(({ name }) => ({ name, height: 44 })),
          );
        }
      }
    });

  test('every hit area is at least the touch height, and as wide unless it is inside a field', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
    for (const section of ['sizes', 'toolbar', 'tabs', 'tree', 'table', 'desktop', 'layouts']) {
      await openSection(page, section);
      const areas = await page.evaluate(
        async ([selector, source]) => {
          const measure = (0, eval)(source) as MeasureHitAreas;
          return measure(document.body, selector);
        },
        [
          'button, a[href], [role="tab"], [role="radio"], [role="menuitem"], [role="treeitem"]',
          measureHitAreas,
        ] as const,
      );
      expect(areas.length, section).toBeGreaterThan(0);
      // The actions inside a field keep their width, so they never reach over the next action.
      expect(
        areas.filter(({ inField, width, height }) => height < 44 || (!inField && width < 44)),
        section,
      ).toEqual([]);
    }
  });

  test("a ButtonGroup's corners stay round at the touch height", async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
    await openSection(page, 'sizes');
    const corners = await page
      .locator('.env-button-group > .env-button:first-child')
      .evaluateAll((buttons) =>
        buttons.map((button) => ({
          radius: parseFloat(getComputedStyle(button).borderStartStartRadius),
          half: button.getBoundingClientRect().height / 2,
        })),
      );
    expect(corners).toHaveLength(6);
    for (const { radius, half } of corners) expect(radius).toBe(half);
  });

  test('nothing that holds controls scrolls where it has room', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
    // Table regions, rails, groups and the dock's rows are scroll containers. The fixture gives
    // them room, so none may scroll, also not for an action or a hit area taller than its row.
    for (const section of ['sizes', 'toolbar', 'tabs', 'table', 'desktop', 'layouts']) {
      await openSection(page, section);
      const scrolling = await page.evaluate(() => {
        const scrolls = (value: string) => value === 'auto' || value === 'scroll';
        return [...document.querySelectorAll<HTMLElement>('.density-page *')]
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
      });
      expect(scrolling, section).toEqual([]);
    }
  });

  test('a press just inside a control reaches it, never its neighbour', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
    // Each section shows both scales. layouts holds small buttons 4 px apart in layouts of the
    // application's own (a column, a wrapping row, a grid, a reversed row, each button in a span in
    // either direction) and a docked panel's header.
    for (const section of ['sizes', 'toolbar', 'desktop', 'layouts']) {
      await openSection(page, section);
      const stolen = await page.evaluate(
        async ([selector, source]) => {
          const find = (0, eval)(source) as FindTargets;
          const failures: string[] = [];
          for (const { element } of find(document.body, selector)) {
            element.scrollIntoView({ block: 'center', inline: 'center' });
            await new Promise((resolve) => requestAnimationFrame(resolve));
            const box = element.getBoundingClientRect();
            const points = [
              [box.x + 1, box.y + box.height / 2],
              [box.x + box.width - 1, box.y + box.height / 2],
              [box.x + box.width / 2, box.y + 1],
              [box.x + box.width / 2, box.y + box.height - 1],
            ];
            for (const [x, y] of points) {
              const hit = document.elementFromPoint(x, y);
              if (hit && !element.contains(hit) && !hit.contains(element))
                failures.push(
                  `${(element.getAttribute('aria-label') ?? element.textContent ?? '').trim()} at ${x.toFixed(0)},${y.toFixed(0)}: ${(hit.getAttribute('aria-label') ?? hit.textContent ?? '').trim().slice(0, 24)}`,
                );
            }
          }
          return failures;
        },
        ['button, a[href], [role="tab"], [role="radio"], [role="menuitem"]', findTargets] as const,
      );
      expect(stolen, section).toEqual([]);
    }
  });
});
