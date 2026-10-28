/**
 * Accessibility gate: axe scans every page of the catalogue and the Docs in light, and the theme
 * sample of samplePages (tests/browser/CatalogueThemes.ts) in dark and both high-contrast themes
 * too, and compares the violations with KnownViolations.json. A new violation fails, and so does a
 * listed one that no longer occurs, so the list only shrinks. Run `npm run test:a11y`; after fixing
 * violations, or when a reviewed change has to add one, rewrite the list with `npm run
 * test:a11y:update` and review its diff.
 *
 * Violations are keyed by page, theme, axe rule and a stable target: the catalogue region (the
 * specimen's heading, sidebar, header…) and the element's tag with its env-, site-, catalogue-
 * and docs- classes, counted.
 * React ids and child positions are left out so unrelated edits do not move the keys.

 */
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, rmdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { serveSite, siteBuilt, siteUrl } from '../browser/HostedSite';
import {
  chooseScheme,
  emulateContrast,
  themesFor,
  type CatalogueTheme,
  type ThemeName,
} from '../browser/CatalogueThemes';
import { allPages } from '../../apps/site/src/navigation/SiteRoutes';

/** light on every page, and dark, light-hc and dark-hc on the pages of samplePages. */
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

/** Every page of the catalogue and the Docs, with the themes it is scanned in. */
const pages = allPages.map(({ path, title }) => ({
  path,
  title,
  routes: [{ route: path, themes: themesFor(path) }],
}));
/** Every route scanned, with the themes it is scanned in. */
const routes = new Map<string, Set<string>>([
  ...pages.flatMap((page) =>
    page.routes.map(({ route, themes }): [string, Set<string>] => [
      route,
      new Set(themes.map((theme) => theme.name)),
    ]),
  ),
]);

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
 * Workers rewrite their own pages; a directory lock keeps the read-modify-write atomic. A rewrite
 * holds it for milliseconds, so a lock older than a minute is one a stopped update left behind, and
 * is removed.
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
      if (Date.now() - (statSync(lock, { throwIfNoEntry: false })?.mtimeMs ?? Date.now()) > 60_000)
        rmSync(lock, { recursive: true, force: true });
      else Atomics.wait(wait, 0, 0, 20);
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
  await page.locator('#site-main').waitFor();
  // The catalogue's Loading spinner (.site-loading) marks a part that is still loading: an
  // example, its code, a specimen, a demo or the icon list; a part from LoadedPart says "Loading
  // the …".
  await page
    .locator('.site-loading')
    .or(page.getByText(/^Loading .*…$/))
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
  await page.locator('#site-main').waitFor();
  await page.evaluate(() => {
    for (const details of document.querySelectorAll<HTMLDetailsElement>(
      'details.site-live-example-code',
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
          pre.closest('.site-live-example-code') ||
          /^(?:tsx?|jsx?|typescript|javascript|json|css|html|xml|sh|bash|shell|ya?ml|sql|java|md|markdown|ini) code$/i.test(
            pre.getAttribute('aria-label') ?? '',
          ),
      )
      .every((pre) => !pre.textContent?.trim() || pre.querySelector('code span')),
  );
}

/** Switches the catalogue to the theme's scheme in its Display menu, under the theme's contrast. */
async function setTheme(page: Page, theme: CatalogueTheme) {
  await emulateContrast(page, theme);
  const app = page.locator('.site-app');
  if ((await app.getAttribute('data-env-theme')) !== theme.scheme)
    await chooseScheme(page, theme.scheme);
  await page.locator(`.site-app[data-env-theme="${theme.scheme}"]`).waitFor();
}

async function scan(page: Page, route: string, theme: Theme): Promise<Scan> {
  const results = await new AxeBuilder({ page })
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
          [...element.classList].filter((name) => /^(env|site|catalogue|docs)-/.test(name));
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
          const example = element.closest('.site-example');
          const heading = example?.querySelector(
            ':scope > h2, :scope > .catalogue-example-heading > h2',
          );
          if (heading?.textContent?.trim()) return heading.textContent.trim();
          if (example) return 'specimen';
          const regions: [string, string][] = [
            ['.site-sidebar', 'sidebar'],
            ['.site-compact-controls', 'page controls'],
            ['.site-page-header, .site-page-banner, .catalogue-overview-hero', 'header'],
            ['.site-page-navigation', 'page navigation'],
            ['.site-article', 'article'],
            ['.catalogue-specimen-area', 'specimen area'],
            ['#site-main', 'main'],
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
      'The hosted site is missing: run npm run test:a11y, which builds it first with npm run build:site.',
    );
});

test.beforeEach(async ({ page }) => {
  await serveSite(page);
});

for (const { path, title, routes: pageRoutes } of pages) {
  test(`${title} (${path}) has no new accessibility violations`, async ({ page }, testInfo) => {
    // A page of the theme sample, or of every view, takes several scans of about 10 s each.
    test.slow(pageRoutes.flatMap(({ themes }) => themes).length > 1);
    const scans: Scan[] = [];
    for (const { route, themes } of pageRoutes) {
      await page.goto(`${siteUrl}/${route === 'overview' ? '' : route}`);
      await expandCode(page);
      for (const theme of themes) {
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
    if (added.length) report.push(`  New violations on /${scan.route} (${scan.theme}):`, ...added);
    if (fixed.length)
      report.push(
        `  No longer found, so remove from KnownViolations.json: /${scan.route} (${scan.theme}):`,
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

// Playwright requires the fixtures object as the first parameter, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test('known violations name only the scans that run', async ({}, testInfo) => {
  const stale = Object.entries(readExceptions()).flatMap(([route, themes]) =>
    Object.keys(themes)
      .filter((theme) => !routes.get(route)?.has(theme))
      .map((theme) => [route, theme as Theme] as const),
  );
  if (updating(testInfo)) {
    if (stale.length)
      updateExceptions((violations) => {
        for (const [route, theme] of stale) {
          delete violations[route]![theme];
          if (!Object.keys(violations[route]!).length) delete violations[route];
        }
      });
    return;
  }
  if (stale.length)
    throw new Error(
      `KnownViolations.json lists scans that no longer run: ${stale.map(([route, theme]) => `${route} (${theme})`).join(', ')}. Run \`npm run test:a11y:update\`.`,
    );
});
