import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  test,
  expect,
  type ElementHandle,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';
import { siteDevUrl, fixtureUrl } from '../browser/support/Servers';
import {
  allThemes,
  chooseScheme,
  emulateContrast,
  themesFor,
  type CatalogueTheme,
} from '../browser/support/CatalogueThemes';
import { densityShots, exampleShots, openLists, stageOf, surfaceShots } from './VisualShots';
import { groupedPages } from '../../apps/site/src/routes/SiteRoutes';
import { displayStorageKeys } from '../../apps/site/src/display/DisplayStorage';

const frozenTime = new Date('2026-03-04T10:00:00Z');
const snapshots = fileURLToPath(new URL('./snapshots/', import.meta.url));
const stateMatrices: Record<string, string[]> = {
  button: ['Button'],
};

test.skip(
  process.env.ENVUI_VISUAL !== 'docker',
  'The visual baseline renders in the Linux Playwright image: run `npm run test:visual`.',
);

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'paused'), displayStorageKeys.motion);
});

function slug(text: string) {
  return (
    text
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled'
  );
}

async function finishAnimations(page: Page) {
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

async function settle(page: Page) {
  await page.locator('[data-site-pending]').first().waitFor({ state: 'detached' });
  await page.locator('.site-loading').first().waitFor({ state: 'detached' });
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          [...document.fonts].some(
            (font) => font.family.replace(/"/g, '') === 'envUI Geist' && font.status === 'loaded',
          ),
        ),
      { message: 'envUI Geist is loaded' },
    )
    .toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await finishAnimations(page);
}

async function press(page: Page, control: Locator) {
  await control.click();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

async function setTheme(page: Page, theme: CatalogueTheme) {
  await emulateContrast(page, theme);
  const { scheme } = theme;
  if ((await page.locator('html').getAttribute('data-env-theme')) !== scheme) {
    await chooseScheme(page, scheme);
    await page.mouse.move(0, 0);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  }
  await page.locator(`html[data-env-theme="${scheme}"]`).waitFor();
}

function uniqueNamer() {
  const used = new Map<string, number>();
  return (name: string) => {
    const count = (used.get(name) ?? 0) + 1;
    used.set(name, count);
    return count === 1 ? name : `${name}-${count}`;
  };
}

async function capture(locator: Locator, path: string[]) {
  const page = locator.page();
  await page.evaluate(() => window.scrollTo(0, 0));
  const viewport = page.viewportSize()!;
  const height = Math.ceil((await locator.boundingBox())?.height ?? 0) + 64;
  if (height > viewport.height) await page.setViewportSize({ ...viewport, height });
  try {
    await expect.soft(locator).toHaveScreenshot(path);
  } finally {
    if (height > viewport.height) await page.setViewportSize(viewport);
  }
}

async function settlePopups(page: Page) {
  await expect(page.locator('[data-starting-style]')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await finishAnimations(page);
}

async function around(page: Page, elements: (Locator | ElementHandle)[]) {
  const boxes = await Promise.all(
    elements.map(async (element) => {
      const box = await element.boundingBox();
      if (!box) throw new Error(`${element} has no box`);
      return box;
    }),
  );
  const shadowMargin = 24;
  const viewport = page.viewportSize()!;
  const left = Math.max(0, Math.floor(Math.min(...boxes.map((box) => box.x)) - shadowMargin));
  const top = Math.max(0, Math.floor(Math.min(...boxes.map((box) => box.y)) - shadowMargin));
  const right = Math.min(
    viewport.width,
    Math.ceil(Math.max(...boxes.map((box) => box.x + box.width)) + shadowMargin),
  );
  const bottom = Math.min(
    viewport.height,
    Math.ceil(Math.max(...boxes.map((box) => box.y + box.height)) + shadowMargin),
  );
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function updating(testInfo: TestInfo) {
  return ['all', 'changed'].includes(testInfo.config.updateSnapshots);
}

function contents(directory: string) {
  return existsSync(directory) ? readdirSync(directory).sort() : [];
}

function reconcile(testInfo: TestInfo, directory: string, recorded: string[], taken: Set<string>) {
  const orphaned = recorded.filter((file) => !taken.has(file));
  if (updating(testInfo)) {
    if (testInfo.errors.length === 0)
      for (const file of orphaned) rmSync(join(directory, file), { recursive: true });
    return;
  }
  const missing = [...taken].filter((file) => !recorded.includes(file)).sort();
  expect(
    { missing, orphaned },
    `The images in ${directory} match the specimens; after an intended change run \`npm run test:visual:update\``,
  ).toEqual({ missing: [], orphaned: [] });
}

test.describe('catalogue', () => {
  for (const { path, document: subject } of groupedPages) {
    test(`${subject.title} (${path})`, async ({ page }, testInfo) => {
      const directory = join(snapshots, 'catalogue', subject.id);
      const recorded = contents(directory);
      const taken = new Set<string>();
      const take = async (locator: Locator, file: string) => {
        taken.add(file);
        await capture(locator, ['catalogue', subject.id, file]);
      };
      const visited = [path];
      await page.clock.setFixedTime(frozenTime);
      await page.goto(`${siteDevUrl}/${path}`);
      await page.locator('.site-page-header').waitFor();
      for (const theme of themesFor(path)) {
        await setTheme(page, theme);
        const name = uniqueNamer();
        let specimens = 0;
        let animated = 0;
        const matrices: string[] = [];
        const open = async (route: string) => {
          await expect(page).toHaveURL(new RegExp(`/${route}$`));
          await settle(page);
        };
        for (const view of visited) {
          await open(view);
          const examples = page.locator(
            '.catalogue-specimen-area .site-example:not(.site-example .site-example)',
          );
          for (const example of await examples.all()) {
            if (!(await example.isVisible())) continue;
            const own = example.locator(
              ':scope > :is(h2, h3), :scope > .catalogue-example-heading > :is(h2, h3)',
            );
            const specimen = await example.evaluate(
              (element) =>
                element
                  .closest('[data-catalogue-specimen]')
                  ?.getAttribute('data-catalogue-specimen') ?? '',
            );
            const part = example.locator('summary, h3, h4').first();
            const title = (await own.count())
              ? await own.first().textContent()
              : specimen
                ? specimen.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
                : (await part.count())
                  ? await part.textContent()
                  : '';
            await take(example, `${theme.name}-${name(slug(title ?? ''))}.png`);
            specimens++;
            if (await example.locator('.catalogue-motion-stage').count()) animated++;
          }
          const states = page.locator(
            '.catalogue-specimen-area [role="region"][aria-label$="interaction states"]',
          );
          for (const matrix of await states.all()) {
            const label = ((await matrix.getAttribute('aria-label')) ?? '').replace(
              / interaction states$/,
              '',
            );
            matrices.push(label);
            const summary = matrix.locator('xpath=ancestor::details[1]/summary');
            const inClosedDisclosure = (await summary.count()) > 0 && !(await matrix.isVisible());
            if (!inClosedDisclosure) continue;
            await press(page, summary);
            await take(matrix, `${theme.name}-states-${name(slug(label))}.png`);
            await press(page, summary);
            await expect(matrix).toBeHidden();
          }
        }
        if (!specimens) {
          await open(visited[0]!);
          for (const figure of await page
            .locator('.site-template figure.site-topic-figure')
            .all()) {
            if (!(await figure.isVisible())) continue;
            const label = (await figure.getAttribute('aria-label')) ?? '';
            await take(figure, `${theme.name}-${name(slug(label))}.png`);
            specimens++;
          }
        }
        const needsFirstExample = specimens <= animated;
        for (const view of needsFirstExample ? visited : []) {
          await open(view);
          const example = page
            .locator(
              '.site-live-example[data-example], .site-live-example-entry > .catalogue-motion-stage',
            )
            .first();
          if (!(await example.count())) continue;
          const file =
            (await example.getAttribute('data-example')) ??
            /code, (\w+)\.tsx/i.exec(
              (await example
                .locator('xpath=..')
                .locator(':scope > .site-live-example-code summary')
                .textContent()) ?? '',
            )?.[1] ??
            '';
          expect(file, 'The first example names its file').not.toBe('');
          await take(example, `${theme.name}-${name(`example-${slug(file)}`)}.png`);
          specimens++;
          break;
        }
        expect(specimens, `The ${theme.name} page shows at least one specimen`).toBeGreaterThan(0);
        expect(
          matrices.sort(),
          `The ${theme.name} page shows the interaction states listed in stateMatrices`,
        ).toEqual([...(stateMatrices[subject.id] ?? [])].sort());
      }
      reconcile(testInfo, directory, recorded, taken);
    });
  }
});

test.describe('density', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });
  for (const { section, theme } of densityShots) {
    test(`${section} (${theme})`, async ({ page }) => {
      await page.clock.setFixedTime(frozenTime);
      await page.goto(`${fixtureUrl}/?fixture=scale&section=${section}&theme=${theme}`);
      const specimen = page.locator(`[data-density-section="${section}"]`);
      await specimen.waitFor();
      await expect(specimen).not.toContainText('Unknown density section');
      await settle(page);
      await expect(specimen).toHaveScreenshot(['density', `${theme}-${section}.png`]);
    });
  }
});

test.describe('surfaces', () => {
  for (const theme of surfaceShots) {
    test(`list and radio rows (${theme})`, async ({ page }) => {
      await page.clock.setFixedTime(frozenTime);
      await page.goto(`${fixtureUrl}/?fixture=surfaces&theme=${theme}`);
      const specimen = page.locator(`[data-surfaces="${theme}"]`);
      await specimen.waitFor();
      await settle(page);
      await expect(specimen).toHaveScreenshot(['surfaces', `${theme}-rows.png`]);
    });
  }
});

test.describe('examples', () => {
  for (const shot of exampleShots) {
    test(`${shot.name} (${shot.theme})`, async ({ page }) => {
      await page.clock.setFixedTime(frozenTime);
      await page.goto(
        `${fixtureUrl}/?fixture=layout-check&page=${shot.page}&name=${shot.example}&theme=${shot.theme}`,
      );
      await expect(page.locator('[data-example-error]')).toHaveCount(0);
      await stageOf(page).and(page.locator('[data-rendered]')).waitFor();
      await page.evaluate(() => document.fonts.load('1em "envUI Geist"'));
      await settle(page);
      await page.mouse.move(0, 0);
      await expect(stageOf(page)).toHaveScreenshot(['examples', `${shot.theme}-${shot.name}.png`]);
    });
  }
});

test.describe('open lists', () => {
  for (const list of openLists) {
    for (const theme of allThemes.filter(({ name }) => list.themes.includes(name))) {
      test(`${list.name} (${theme.name})`, async ({ page }) => {
        await page.clock.setFixedTime(frozenTime);
        await emulateContrast(page, theme);
        await page.goto(
          `${fixtureUrl}/?fixture=layout-check&page=${list.page}&name=${list.example}&theme=${theme.scheme}`,
        );
        await expect(page.locator('[data-example-error]')).toHaveCount(0);
        await stageOf(page).and(page.locator('[data-rendered]')).waitFor();
        await page.evaluate(() => document.fonts.load('1em "envUI Geist"'));
        await settle(page);
        await page.mouse.move(0, 0);
        const trigger = list.trigger ? await list.trigger(page).elementHandle() : null;
        if (list.trigger && !trigger) throw new Error(`No trigger for the ${list.name} list`);
        const popup = list.popup(page);
        const highlighted = popup.locator(
          '[data-highlighted]:not([data-highlighted] [data-highlighted])',
        );
        const openAttempts = 3;
        for (let attempt = 1; ; attempt++) {
          if (trigger && list.open) await list.open(page, trigger);
          else if (trigger) {
            await trigger.focus();
            await page.keyboard.press(list.key!);
          }
          await expect(popup).toHaveCount(list.count ?? 1);
          for (const each of await popup.all()) await expect(each).toBeVisible();
          await settlePopups(page);
          if (!list.focusesHighlighted) break;
          try {
            await expect(highlighted).toBeFocused({ timeout: 2000 });
            break;
          } catch (error) {
            if (attempt === openAttempts) throw error;
            await page.keyboard.press('Escape');
            await expect(popup).toHaveCount(0);
            await finishAnimations(page);
          }
        }
        if (list.highlighted) {
          await expect(highlighted).toHaveCount(1);
          await expect(highlighted).toContainText(list.highlighted);
        }
        const popups = await popup.all();
        await expect(page).toHaveScreenshot(['open', `${theme.name}-${list.name}.png`], {
          clip: await around(page, list.withTrigger && trigger ? [trigger, ...popups] : popups),
          maxDiffPixels: list.maxDiffPixels,
        });
      });
    }
  }
});
