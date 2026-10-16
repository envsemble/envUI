/**
 * Visual baseline: screenshots of today's identity, so that later changes are deliberate and
 * reviewed as image diffs. Every catalogue page's preview specimens and forced interaction states
 * are captured in both themes, and so are the density specimens of the test fixture.
 *
 * Fonts and anti-aliasing differ between systems, so the baseline renders only in the Linux
 * Playwright image: `npm run test:visual` checks it, `npm run test:visual:update` rewrites it.
 * Snapshots live in tests/visual/snapshots; review their diffs like code. Each run also compares
 * the images a page takes with the files in its folder, so a specimen that stops rendering, or an
 * image no specimen takes any more, fails rather than passing unnoticed.
 */
import { existsSync, readdirSync, rmSync, type Dirent } from 'node:fs';
import { join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { catalogueUrl, fixtureUrl } from '../browser/Servers';
import { densitySectionNames } from '../fixture/DensitySections';
import { referencePages } from '../../apps/catalogue/src/navigation/DocumentationRoutes';

type Theme = 'light' | 'dark';
const themes: Theme[] = ['light', 'dark'];
/** Relative times, calendars and generated activity are drawn against this moment. */
const now = new Date('2026-03-04T10:00:00Z');
const snapshots = fileURLToPath(new URL('./snapshots/', import.meta.url));
/**
 * The forced-state matrices of InteractionStates.ts, by catalogue page and matrix label. A page
 * must show exactly these, so a matrix that disappears, or a new one, fails until it is listed.
 */
const stateMatrices: Record<string, string[]> = {
  button: ['Button'],
  'nav-list': ['Navigation item'],
};

test.skip(
  process.env.ENVUI_VISUAL !== 'docker',
  'The visual baseline renders in the Linux Playwright image: run `npm run test:visual`.',
);

function slug(text: string) {
  return (
    text
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled'
  );
}

/** Wait until fonts, lazy content and finite animations have finished. */
async function settle(page: Page) {
  await page
    .getByText(/^Loading .*…$/)
    .first()
    .waitFor({ state: 'detached' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const finite = document
      .getAnimations()
      .filter((animation) =>
        Number.isFinite(Number(animation.effect?.getComputedTiming().endTime)),
      );
    await Promise.all(finite.map((animation) => animation.finished.catch(() => undefined)));
  });
  // envUI ships its own Inter; a fallback face would make every text specimen drift.
  expect(
    await page.evaluate(() =>
      [...document.fonts].some(
        (font) => font.family.replace(/"/g, '') === 'envUI Inter' && font.status === 'loaded',
      ),
    ),
    'envUI Inter is loaded',
  ).toBe(true);
}

/** Click, then park the pointer and drop focus, so neither paints a state into later shots. */
async function press(page: Page, control: Locator) {
  await control.click();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

async function setTheme(page: Page, theme: Theme) {
  if ((await page.locator('.docs-app').getAttribute('data-env-theme')) !== theme)
    await press(page, page.getByRole('button', { name: `Switch to ${theme} theme`, exact: true }));
  await page.locator(`.docs-app[data-env-theme="${theme}"]`).waitFor();
}

/** Names unique within a page: repeated titles get a counter. */
function namer() {
  const used = new Map<string, number>();
  return (name: string) => {
    const count = (used.get(name) ?? 0) + 1;
    used.set(name, count);
    return count === 1 ? name : `${name}-${count}`;
  };
}

/**
 * Every capture scrolls from the top, so a specimen's offset never depends on the one before.
 * Soft, so one run reports every changed image of a page.
 */
async function capture(locator: Locator, path: string[]) {
  await locator.page().evaluate(() => window.scrollTo(0, 0));
  await expect.soft(locator).toHaveScreenshot(path);
}

function updating(testInfo: TestInfo) {
  return ['all', 'changed'].includes(testInfo.config.updateSnapshots);
}

/** What a snapshot folder holds, or nothing when it does not exist yet. */
function contents(directory: string) {
  return existsSync(directory) ? readdirSync(directory).sort() : [];
}

/**
 * Compares the images a test took with the files its folder held before it ran. A check fails on
 * either difference; an update removes the files no capture took, and only once every capture of
 * the test has succeeded, so a failed update deletes nothing.
 */
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
  for (const { path, reference, views } of referencePages) {
    test(`${reference.title} (${path})`, async ({ page }, testInfo) => {
      const directory = join(snapshots, 'catalogue', reference.id);
      const recorded = contents(directory);
      const taken = new Set<string>();
      const take = async (locator: Locator, file: string) => {
        taken.add(file);
        await capture(locator, ['catalogue', reference.id, file]);
      };
      // A page not on the template shows its specimens in Preview; a page on the template shows
      // its live examples in Overview and its specimens in whichever view their section is in.
      const visited = reference.sections ? views.map((view) => view.id) : ['preview'];
      await page.clock.setFixedTime(now);
      await page.goto(`${catalogueUrl}/#/${path}/${visited[0]}`);
      await page.locator('.docs-reference-tabs').waitFor();
      for (const theme of themes) {
        await setTheme(page, theme);
        const name = namer();
        let specimens = 0;
        const matrices: string[] = [];
        for (const view of visited) {
          await page.evaluate((hash) => (location.hash = hash), `/${path}/${view}`);
          await page.locator('.docs-page-header').getByRole('tab', { selected: true }).waitFor();
          await expect(page).toHaveURL(new RegExp(`#/${path}/${view}$`));
          await settle(page);
          const examples = page.locator(
            '.docs-preview .docs-example:not(.docs-example .docs-example)',
          );
          for (const example of await examples.all()) {
            if (!(await example.isVisible())) continue;
            // Untitled examples are named after their first disclosure or specimen heading.
            const heading = example
              .locator(':scope > h2, :scope > .docs-example-heading > h2, summary, h3')
              .first();
            const title = (await heading.count()) ? await heading.textContent() : '';
            await take(example, `${theme}-${name(slug(title ?? ''))}.png`);
            specimens++;
          }
          // Example files, rendered live, are named after their file.
          for (const example of await page.locator('.docs-live-example[data-example]').all()) {
            const file = (await example.getAttribute('data-example')) ?? '';
            await take(example, `${theme}-${name(`example-${slug(file)}`)}.png`);
            specimens++;
          }
          // The forced hover, pressed, focus and disabled states of InteractionStates.ts, which
          // the catalogue keeps in closed disclosures.
          const states = page.locator(
            '.docs-preview [role="region"][aria-label$="interaction states"]',
          );
          for (const matrix of await states.all()) {
            const label = ((await matrix.getAttribute('aria-label')) ?? '').replace(
              / interaction states$/,
              '',
            );
            matrices.push(label);
            const summary = matrix.locator('xpath=ancestor::details[1]/summary');
            const closed = (await summary.count()) > 0 && !(await matrix.isVisible());
            if (closed) await press(page, summary);
            await take(matrix, `${theme}-states-${name(slug(label))}.png`);
            if (closed) {
              await press(page, summary);
              await expect(matrix).toBeHidden();
            }
          }
        }
        expect(specimens, `The ${theme} page shows at least one specimen`).toBeGreaterThan(0);
        expect(
          matrices.sort(),
          `The ${theme} page shows the interaction states listed in stateMatrices`,
        ).toEqual([...(stateMatrices[reference.id] ?? [])].sort());
      }
      reconcile(testInfo, directory, recorded, taken);
    });
  }
});

test.describe('density', () => {
  // The mixed desktop view is 80 rem wide; the evidence it reproduces used the same viewport.
  test.use({ viewport: { width: 1440, height: 1000 } });
  for (const section of densitySectionNames) {
    for (const theme of themes) {
      test(`${section} (${theme})`, async ({ page }) => {
        await page.clock.setFixedTime(now);
        await page.goto(`${fixtureUrl}/?fixture=density&section=${section}&theme=${theme}`);
        const specimen = page.locator(`[data-density-section="${section}"]`);
        await specimen.waitFor();
        await expect(specimen).not.toContainText('Unknown density section');
        if (section === 'menu') await expect(page.locator('.env-menu')).toHaveCount(2);
        await settle(page);
        await expect(specimen).toHaveScreenshot(['density', `${theme}-${section}.png`]);
      });
    }
  }
});

// Playwright requires the fixtures object as the first parameter, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test('every snapshot folder belongs to a catalogue page or a density section', async ({}, testInfo) => {
  const pages = new Set(referencePages.map(({ reference }) => reference.id));
  const density = new Set(
    densitySectionNames.flatMap((section) => themes.map((theme) => `${theme}-${section}.png`)),
  );
  const stale = (folder: string, belongs: (entry: Dirent) => boolean) =>
    readdirSync(join(snapshots, folder), { withFileTypes: true })
      .filter((entry) => !belongs(entry))
      .map((entry) => posix.join(folder, entry.name));
  const unused = [
    ...stale('', (entry) => entry.isDirectory() && ['catalogue', 'density'].includes(entry.name)),
    ...stale('catalogue', (entry) => entry.isDirectory() && pages.has(entry.name)),
    ...stale('density', (entry) => entry.isFile() && density.has(entry.name)),
  ];
  if (updating(testInfo)) {
    for (const path of unused) rmSync(join(snapshots, path), { recursive: true });
    return;
  }
  expect(
    unused,
    'Snapshots of pages or sections that no longer exist; run `npm run test:visual:update`',
  ).toEqual([]);
});
