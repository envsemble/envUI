/**
 * Visual baseline: screenshots of today's identity, so that later changes are deliberate and
 * reviewed as image diffs. Every catalogue page's preview specimens and forced interaction states
 * are captured in both themes, and so are the density specimens of the test fixture.
 *
 * Fonts and anti-aliasing differ between systems, so the baseline renders only in the Linux
 * Playwright image: `npm run test:visual` checks it, `npm run test:visual:update` rewrites it.
 * Snapshots live in tests/visual/snapshots; review their diffs like code.
 */
import { test, expect, type Locator, type Page } from '@playwright/test';
import { catalogueUrl, fixtureUrl } from '../browser/Servers';
import { referencePages } from '../../apps/catalogue/src/navigation/DocumentationRoutes';

type Theme = 'light' | 'dark';
const themes: Theme[] = ['light', 'dark'];
/** Relative times, calendars and generated activity are drawn against this moment. */
const now = new Date('2026-03-04T10:00:00Z');
/** The sections of tests/fixture/Density.tsx. */
const densitySections = [
  'form',
  'toolbar',
  'menu',
  'tree',
  'table',
  'tabs',
  'navigation',
  'desktop',
];

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

test.describe('catalogue', () => {
  for (const { path, reference } of referencePages) {
    test(`${reference.title} (${path})`, async ({ page }) => {
      await page.clock.setFixedTime(now);
      await page.goto(`${catalogueUrl}/#/${path}/preview`);
      await page.locator('.docs-preview').waitFor();
      for (const theme of themes) {
        await setTheme(page, theme);
        await settle(page);
        const name = namer();
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
          await capture(example, [
            'catalogue',
            reference.id,
            `${theme}-${name(slug(title ?? ''))}.png`,
          ]);
        }
        // The forced hover, pressed, focus and disabled states of InteractionStates.ts, which
        // the catalogue keeps in closed disclosures.
        const states = page.locator(
          '.docs-preview [role="region"][aria-label$="interaction states"]',
        );
        for (const matrix of await states.all()) {
          const label = (await matrix.getAttribute('aria-label')) ?? 'interaction states';
          const summary = matrix.locator('xpath=ancestor::details[1]/summary');
          const closed = (await summary.count()) > 0 && !(await matrix.isVisible());
          if (closed) await press(page, summary);
          await capture(matrix, [
            'catalogue',
            reference.id,
            `${theme}-states-${name(slug(label.replace(/ interaction states$/, '')))}.png`,
          ]);
          if (closed) {
            await press(page, summary);
            await expect(matrix).toBeHidden();
          }
        }
      }
    });
  }
});

test.describe('density', () => {
  // The mixed desktop view is 80 rem wide; the evidence it reproduces used the same viewport.
  test.use({ viewport: { width: 1440, height: 1000 } });
  for (const section of densitySections) {
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
