/**
 * Accessibility gate: axe scans every catalogue page in both themes, and the key pages of
 * highContrastPages (tests/browser/CatalogueThemes.ts) in light and dark high contrast too, and
 * compares the violations with KnownViolations.json. A new violation fails, and so does a listed
 * one that no longer occurs, so the list only shrinks. Run `npm run test:a11y`; after fixing
 * violations, or when a reviewed change has to add one, rewrite the list with
 * `npm run test:a11y:update` and review its diff.
 *
 * Violations are keyed by page, theme, axe rule and a stable target: the catalogue region (the
 * specimen's heading, sidebar, header…) and the element's tag with its env-/docs- classes, counted.
 * React ids and child positions are left out so unrelated edits do not move the keys.
 *
 * A template page's previews are iframes of the frame route, left out of the page's scan: each
 * template screen is scanned alone at its frame route instead, in both themes and scales at the
 * desktop width and comfortable at the phone width, under routes such as
 * frame:settings-page/SettingsPage?scale=compact&width=1280.
 */
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, rmdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { serveSite, siteBuilt, siteUrl } from '../browser/HostedSite';
import {
  emulateContrast,
  themesFor,
  type CatalogueTheme,
  type ThemeName,
} from '../browser/CatalogueThemes';
import {
  documentationPages,
  guidePages,
  overviewViews,
} from '../../apps/catalogue/src/navigation/DocumentationRoutes';

/** light and dark on every page, and light-hc and dark-hc on the pages of highContrastPages. */
type Theme = ThemeName;
/** rule id → stable target → count */
type RuleCounts = Record<string, Record<string, number>>;
/** page route → theme → rule counts */
type Violations = Record<string, Partial<Record<Theme, RuleCounts>>>;
interface Scan {
  route: string;
  theme: Theme;
  counts: RuleCounts;
  /** rule id → what it checks, and the first offending element of each target */
  details: Record<
    string,
    { help: string; helpUrl: string; impact: string; samples: Record<string, string> }
  >;
}

const exceptionsFile = fileURLToPath(new URL('./KnownViolations.json', import.meta.url));
/** WCAG 2.0–2.2 A and AA plus axe's best practices: every rule except AAA and deprecated ones. */
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
/**
 * High contrast promises text at 7:1, WCAG's AAA level (1.4.6), so its themes also run axe's AAA
 * contrast rule, color-contrast-enhanced, beside the AA rules. An enabled rule runs whatever the
 * tags, so this adds that one rule and no other AAA rule.
 */
const highContrastRules = { 'color-contrast-enhanced': { enabled: true } };

/** Every destination of the catalogue's own route list, with each of its views, if it has any. */
const pages = documentationPages.map(({ path, title, views }) => ({
  path,
  title,
  routes:
    path === 'overview'
      ? overviewViews.map((view) => `overview/${view.id}`)
      : views.length
        ? views.map((view) => `${path}/${view.id}`)
        : [path],
}));
/** Every template screen, by its template page's path, with the routes of its frame scans. */
const screens = guidePages
  .filter((page) => page.section === 'Templates')
  .flatMap(({ path, document }) =>
    (document?.sections ?? []).flatMap((section) =>
      section.blocks.flatMap((block) =>
        block.kind === 'template'
          ? [
              {
                path,
                frame: `${document!.id}/${block.name}`,
                scans: [
                  { scale: 'comfortable', width: 1280, height: 800, themes: ['light', 'dark'] },
                  { scale: 'compact', width: 1280, height: 800, themes: ['light', 'dark'] },
                  { scale: 'comfortable', width: 390, height: 844, themes: ['light'] },
                ] as const,
              },
            ]
          : [],
      ),
    ),
  );
const frameRoute = (frame: string, scale: string, width: number) =>
  `frame:${frame}?scale=${scale}&width=${width}`;
const routes = new Set([
  ...pages.flatMap((page) => page.routes),
  ...screens.flatMap(({ frame, scans }) =>
    scans.map(({ scale, width }) => frameRoute(frame, scale, width)),
  ),
]);
/**
 * ENVUI_PAGES limits the scan to some pages, by path such as components/button, as
 * `npm run check:affected` sets it for a change; `npm run test:a11y` scans every page.
 */
const only = process.env.ENVUI_PAGES?.split(',').filter(Boolean);
const unknown = only?.filter(
  (path) => path !== 'density' && !pages.some((page) => page.path === path),
);
if (unknown?.length)
  throw new Error(`ENVUI_PAGES names pages the catalogue does not have: ${unknown.join(', ')}`);
const scanned = only ? pages.filter((page) => only.includes(page.path)) : pages;
const screensScanned = only ? screens.filter((screen) => only.includes(screen.path)) : screens;

function readExceptions(): Violations {
  return JSON.parse(readFileSync(exceptionsFile, 'utf8'));
}

function sortKeys<T>(value: T): T {
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
  ) as T;
}

/**
 * Workers rewrite their own pages; a directory lock keeps the read-modify-write atomic. Lock.setup.ts
 * removes a lock that a stopped update left behind before the scans start.
 */
function updateExceptions(change: (violations: Violations) => void) {
  const lock = `${exceptionsFile}.lock`;
  const wait = new Int32Array(new SharedArrayBuffer(4));
  for (let attempt = 0; ; attempt++) {
    try {
      mkdirSync(lock);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || attempt > 500) throw error;
      Atomics.wait(wait, 0, 0, 20);
    }
  }
  try {
    const violations = readExceptions();
    change(violations);
    writeFileSync(exceptionsFile, `${JSON.stringify(sortKeys(violations), null, 2)}\n`);
  } finally {
    rmdirSync(lock);
  }
}

function updating(testInfo: TestInfo) {
  return ['all', 'changed'].includes(testInfo.config.updateSnapshots);
}

async function settle(page: Page) {
  await page.locator('#docs-main').waitFor();
  // Lazy previews and usage details announce themselves while they load.
  await page
    .getByText(/^Loading .*…$/)
    .first()
    .waitFor({ state: 'detached' });
  await page.evaluate(() => document.fonts.ready);
  // Theme changes transition colors; contrast measured mid-transition is neither theme's. The
  // animations' states are polled rather than their finished promises awaited: Chromium does not
  // resolve that promise for a transition inside a closed disclosure, though the transition ends.
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
 * Opens every example's Code disclosure, so axe checks the highlighted source as a reader who opens
 * it sees it; closed, its tokens are not rendered and the scan would pass over them.
 */
async function expandCode(page: Page) {
  await page.locator('#docs-main').waitFor();
  await page.evaluate(() => {
    for (const details of document.querySelectorAll<HTMLDetailsElement>(
      'details.docs-live-example-code',
    ))
      details.open = true;
  });
}

/**
 * Waits until every code block in a language that is highlighted shows its tokens: those of the
 * examples, and those whose label names such a language, such as "tsx code".
 */
async function highlighted(page: Page) {
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLElement>('.env-code-block pre')]
      .filter(
        (pre) =>
          pre.closest('.docs-live-example-code') ||
          /^(?:tsx?|jsx?|typescript|javascript|json|css|html|xml|sh|bash|shell|ya?ml|sql|java|md|markdown|ini) code$/i.test(
            pre.getAttribute('aria-label') ?? '',
          ),
      )
      .every((pre) => !pre.textContent?.trim() || pre.querySelector('code span')),
  );
}

/** Switches the catalogue to the theme's scheme with its button, under the theme's contrast. */
async function setTheme(page: Page, theme: CatalogueTheme) {
  await emulateContrast(page, theme);
  const app = page.locator('.docs-app');
  if ((await app.getAttribute('data-env-theme')) !== theme.scheme)
    await page
      .getByRole('button', { name: `Switch to ${theme.scheme} theme`, exact: true })
      .click();
  await page.locator(`.docs-app[data-env-theme="${theme.scheme}"]`).waitFor();
}

async function scan(page: Page, route: string, theme: Theme): Promise<Scan> {
  const results = await new AxeBuilder({ page })
    // Template previews are scanned alone, at their frame route.
    .exclude('iframe.docs-template-frame')
    .options({
      runOnly: { type: 'tag', values: tags },
      ...(theme.endsWith('-hc') && { rules: highContrastRules }),
    })
    .analyze();
  const counts: RuleCounts = {};
  const details: Scan['details'] = {};
  for (const violation of results.violations) {
    const targets = await page.evaluate(
      (selectors) => {
        const stable = (element: Element) =>
          [...element.classList].filter((name) => /^(env|docs)-/.test(name));
        const part = (element: Element) =>
          element.localName +
          stable(element)
            .map((name) => `.${name}`)
            .join('');
        const resolve = (selector: string | string[]) => {
          // Targets inside shadow roots are a chain of selectors, one per root.
          const chain = Array.isArray(selector) ? selector : [selector];
          let root: Document | ShadowRoot | null | undefined = document;
          let element: Element | null = null;
          for (const step of chain) {
            element = root?.querySelector(step) ?? null;
            root = element?.shadowRoot;
          }
          return element;
        };
        const region = (element: Element) => {
          const example = element.closest('.docs-example');
          const heading = example?.querySelector(
            ':scope > h2, :scope > .docs-example-heading > h2',
          );
          if (heading?.textContent?.trim()) return heading.textContent.trim();
          if (example) return 'specimen';
          const regions: [string, string][] = [
            ['.docs-sidebar, .docs-navigation-panel', 'sidebar'],
            ['.docs-page-header, .docs-page-banner, .docs-overview-hero', 'header'],
            ['.docs-page-navigation', 'page navigation'],
            ['.docs-article', 'article'],
            ['.docs-preview', 'preview'],
            ['#docs-main', 'main'],
          ];
          return regions.find(([selector]) => element.closest(selector))?.[1] ?? 'page';
        };
        return selectors.map((selector) => {
          const element = resolve(selector);
          if (!element) return `unresolved :: ${String(selector)}`;
          let target = part(element);
          if (!stable(element).length) {
            const anchor = element.parentElement?.closest('[class*="env-"], [class*="docs-"]');
            if (anchor) target = `${part(anchor)} ${target}`;
          }
          return `${region(element)} :: ${target}`;
        });
      },
      violation.nodes.map((node) => node.target as unknown as string | string[]),
    );
    const rule = (counts[violation.id] ??= {});
    const samples: Record<string, string> = {};
    targets.forEach((target, index) => {
      rule[target] = (rule[target] ?? 0) + 1;
      if (samples[target]) return;
      const node = violation.nodes[index];
      const summary = node.failureSummary?.split('\n').slice(1).join(' ').trim();
      samples[target] =
        node.html.replace(/\s+/g, ' ').slice(0, 160) + (summary ? `\n            ${summary}` : '');
    });
    details[violation.id] = {
      help: violation.help,
      helpUrl: violation.helpUrl,
      impact: violation.impact ?? 'unknown',
      samples,
    };
  }
  return { route, theme, counts, details };
}

/** Lines for every count that differs from the known list; empty when they match. */
function compare(scan: Scan, known: RuleCounts = {}) {
  const added: string[] = [];
  const fixed: string[] = [];
  for (const rule of new Set([...Object.keys(known), ...Object.keys(scan.counts)])) {
    const actual = scan.counts[rule] ?? {};
    const expected = known[rule] ?? {};
    const ruleAdded: string[] = [];
    for (const target of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
      const found = actual[target] ?? 0;
      const listed = expected[target] ?? 0;
      if (found > listed)
        ruleAdded.push(
          `      + ${target} (found ${found}, listed ${listed})`,
          `          e.g. ${scan.details[rule].samples[target]}`,
        );
      if (found < listed) fixed.push(`    ${rule}: ${target} (found ${found}, listed ${listed})`);
    }
    if (ruleAdded.length) {
      const detail = scan.details[rule];
      added.push(
        `    ${rule} [${detail.impact}]: ${detail.help}\n      ${detail.helpUrl}`,
        ...ruleAdded,
      );
    }
  }
  return { added, fixed };
}

// The scan runs on the hosted build, served from dist/site/ by page.route, so no server is
// involved. The development server, with each module a request of its own, could drop a page's
// files, as when it restarted or ran out of sockets, and leave the page blank until the test's
// timeout.
test.beforeAll(() => {
  if (!siteBuilt())
    throw new Error(
      'The hosted catalogue is missing: run npm run test:a11y, which builds it first with npm run build:site.',
    );
});

test.beforeEach(async ({ page }) => {
  await serveSite(page);
});

for (const { path, title, routes: pageRoutes } of scanned) {
  test(`${title} (${path}) has no new accessibility violations`, async ({ page }, testInfo) => {
    // Pages scanned in high contrast as well take twice as long.
    test.setTimeout(240_000);
    const scans: Scan[] = [];
    for (const route of pageRoutes) {
      await page.goto(`${siteUrl}/#/${route}`);
      await expandCode(page);
      for (const theme of themesFor(path)) {
        await setTheme(page, theme);
        await settle(page);
        await highlighted(page);
        scans.push(await scan(page, route, theme.name));
      }
    }
    record(testInfo, title, scans);
  });
}

/** Rewrites the known violations of these scans, or fails on any difference from them. */
function record(testInfo: TestInfo, title: string, scans: Scan[]) {
  if (updating(testInfo)) {
    updateExceptions((violations) => {
      for (const { route, theme, counts } of scans) {
        const entry = (violations[route] ??= {});
        if (Object.keys(counts).length) entry[theme] = counts;
        else delete entry[theme];
        if (!Object.keys(entry).length) delete violations[route];
      }
    });
    return;
  }

  const known = readExceptions();
  const report: string[] = [];
  for (const scan of scans) {
    const { added, fixed } = compare(scan, known[scan.route]?.[scan.theme]);
    if (added.length) report.push(`  New violations on #/${scan.route} (${scan.theme}):`, ...added);
    if (fixed.length)
      report.push(
        `  No longer found, so remove from KnownViolations.json: #/${scan.route} (${scan.theme}):`,
        ...fixed,
      );
  }
  if (report.length)
    throw new Error(
      [
        `Accessibility scan of ${title} differs from tests/accessibility/KnownViolations.json.`,
        ...report,
        'Fix new violations. When the list is out of date, run `npm run test:a11y:update` and review its diff.',
      ].join('\n'),
    );
}

for (const { frame, scans: frameScans } of screensScanned) {
  test(`template ${frame} has no new accessibility violations`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const scans: Scan[] = [];
    for (const { scale, width, height, themes } of frameScans) {
      await page.setViewportSize({ width, height });
      for (const theme of themes) {
        await page.goto(`${siteUrl}/?${new URLSearchParams({ frame, scale, theme })}`);
        await page.locator('[data-template-frame]').waitFor();
        await page
          .getByText(/^Loading .*…$/)
          .first()
          .waitFor({ state: 'detached' });
        await page.evaluate(() => document.fonts.ready);
        scans.push(await scan(page, frameRoute(frame, scale, width), theme));
      }
    }
    record(testInfo, `template ${frame}`, scans);
  });
}

// Playwright requires the fixtures object as the first parameter, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test('known violations name only catalogue pages', async ({}, testInfo) => {
  const stale = Object.keys(readExceptions()).filter((route) => !routes.has(route));
  if (updating(testInfo)) {
    if (stale.length)
      updateExceptions((violations) => stale.forEach((route) => delete violations[route]));
    return;
  }
  if (stale.length)
    throw new Error(
      `KnownViolations.json lists pages the catalogue no longer has: ${stale.join(', ')}. Run \`npm run test:a11y:update\`.`,
    );
});
