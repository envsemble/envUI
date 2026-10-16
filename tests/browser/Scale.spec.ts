/**
 * Scale and size: every control of one size has the same height in a scale, in both scales, and
 * the scale's control heights are the token tables' (docs/foundations/scale.md). The density
 * fixture's sizes section holds one row per size of every control that takes a size, in a
 * comfortable and a compact Theme. Every target is at least 24 px, or has 24 px of room. Under a
 * coarse pointer controls keep their size and gain a hit area of the touch height that never takes
 * a neighbour's presses, and the controls of rails and groups grow instead.
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

test('every target in the compact scale is at least 24 px, or has 24 px of room', async ({
  page,
}) => {
  for (const section of ['sizes', 'toolbar', 'tabs', 'navigation', 'tree', 'table', 'desktop']) {
    await openSection(page, section);
    const root = page.locator('[data-density-scale="compact"]');
    const crowded = await root.evaluate(
      (element, [selector, source]) => {
        const find = (0, eval)(source) as FindTargets;
        const all = find(element, selector);
        const failures: string[] = [];
        for (const { element: target, box } of all) {
          if (box.width >= 23.99 && box.height >= 23.99) continue;
          // WCAG 2.5.8's spacing exception: a 24 px circle on the target's centre meets no other
          // target.
          const cx = box.x + box.width / 2;
          const cy = box.y + box.height / 2;
          const near = all.some(({ element: other, box: b }) => {
            if (other === target || other.contains(target) || target.contains(other)) return false;
            const dx = Math.max(b.x - cx, 0, cx - (b.x + b.width));
            const dy = Math.max(b.y - cy, 0, cy - (b.y + b.height));
            return dx * dx + dy * dy < 144;
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
    expect(crowded, section).toEqual([]);
  }
  // Segments, tabs and the actions inside fields keep 24 px themselves, also in small rails and
  // fields of the compact scale.
  await openSection(page, 'sizes');
  const small = await page
    .locator('[data-density-scale="compact"] [data-size-row="sm"]')
    .evaluate((row) =>
      // Layout sizes: an end action eases in, scaled, as it appears.
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

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('controls keep their size and gain a 44 px hit area, and fields grow to it', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
    await openSection(page, 'sizes');
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    const row = page.locator('[data-density-scale="compact"] [data-size-row="sm"]');
    const button = row.locator('[data-control="button"]');
    await button.scrollIntoViewIfNeeded();
    const reach = await button.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const hits = (x: number, y: number) => element.contains(document.elementFromPoint(x, y));
      // The overlay reaches 9 px above and below a 26 px button.
      return {
        height: box.height,
        above: hits(box.x + box.width / 2, box.y - 8.5),
        below: hits(box.x + box.width / 2, box.y + box.height + 8.5),
      };
    });
    expect(reach).toEqual({ height: 26, above: true, below: true });
    const field = row.locator('.env-text-field-well').first();
    expect(await field.evaluate((element) => element.getBoundingClientRect().height)).toBe(44);
  });

  test('rails and groups grow their controls and never scroll', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
    for (const section of ['sizes', 'toolbar', 'tabs']) {
      await openSection(page, section);
      const rails = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>(
            '.env-segmented-control, .env-tabs-list, .env-button-group',
          ),
        ].map((rail) => {
          const parts = [...rail.querySelectorAll<HTMLElement>('.env-segment, .env-button')];
          return {
            name: rail.getAttribute('aria-label'),
            scrolls:
              rail.scrollWidth > rail.clientWidth ||
              rail.scrollHeight > rail.clientHeight ||
              rail.scrollLeft !== 0,
            touchSized: parts.every((part) => part.getBoundingClientRect().height >= 44),
          };
        }),
      );
      expect(rails.length).toBeGreaterThan(0);
      for (const rail of rails)
        expect(rail, section).toEqual({ name: rail.name, scrolls: false, touchSized: true });
    }
  });

  test('a press just inside a control reaches it, never its neighbour', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
    for (const section of ['sizes', 'toolbar', 'desktop']) {
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
              [box.x + box.width - 1.5, box.y + box.height / 2],
              [box.x + box.width / 2, box.y + 1],
              [box.x + box.width / 2, box.y + box.height - 1.5],
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
