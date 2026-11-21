import { expect, test, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, rmdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { serveSite, siteBuilt, siteUrl } from '../browser/support/HostedSite';
import {
  allThemes,
  chooseScheme,
  emulateContrast,
  type CatalogueTheme,
  type ThemeName,
} from '../browser/support/CatalogueThemes';
import { findPage } from '../../apps/site/src/routes/SiteRoutes';

type Theme = ThemeName;
type RuleCounts = Record<string, Record<string, number>>;
type Violations = Record<string, Partial<Record<Theme, RuleCounts>>>;
interface Scan {
  route: string;
  theme: Theme;
  counts: RuleCounts;
  details: Record<
    string,
    { help: string; helpUrl: string; impact: string; samples: Record<string, string> }
  >;
}

const exceptionsFile = fileURLToPath(new URL('./KnownViolations.json', import.meta.url));
const aaAndBestPracticeTags = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
];
const highContrastRules = { 'color-contrast-enhanced': { enabled: true } };

const onePageOfEachKind = [
  'overview',
  'components/button',
  'components/text-field',
  'foundations/colors',
  'components',
  'docs/components/button',
  'docs/customizing',
  'docs/tokens',
  'docs/changelog',
];
const allThemesOn = new Set(['components/button', 'docs/tokens']);

const pages = onePageOfEachKind.map((path) => {
  const page = findPage(path);
  if (!page) throw new Error(`Accessibility.spec.ts names a page the site does not have: ${path}.`);
  const themes = allThemesOn.has(path) ? allThemes : allThemes.slice(0, 1);
  return { path, title: page.title, routes: [{ route: path, themes }] };
});
const routes = new Map<string, Set<string>>([
  ...pages.flatMap((page) =>
    page.routes.map(({ route, themes }): [string, Set<string>] => [
      route,
      new Set(themes.map((theme) => theme.name)),
    ]),
  ),
]);

const generatedNote =
  'Written by tests/accessibility/Accessibility.spec.ts. After fixing violations, run npm run test:a11y:update; add to it only for a reviewed reason.';

function readExceptions(): Violations {
  const { $comment: _note, ...violations } = JSON.parse(readFileSync(exceptionsFile, 'utf8'));
  return violations;
}

function sortKeys<T>(value: T): T {
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
  ) as T;
}

function updateExceptions(change: (violations: Violations) => void) {
  const lock = `${exceptionsFile}.lock`;
  const abandonedLockAge = 60_000;
  const wait = new Int32Array(new SharedArrayBuffer(4));
  for (let attempt = 0; ; attempt++) {
    try {
      mkdirSync(lock);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || attempt > 500) throw error;
      if (
        Date.now() - (statSync(lock, { throwIfNoEntry: false })?.mtimeMs ?? Date.now()) >
        abandonedLockAge
      )
        rmSync(lock, { recursive: true, force: true });
      else Atomics.wait(wait, 0, 0, 20);
    }
  }
  try {
    const violations = readExceptions();
    change(violations);
    writeFileSync(
      exceptionsFile,
      `${JSON.stringify({ $comment: generatedNote, ...sortKeys(violations) }, null, 2)}\n`,
    );
  } finally {
    rmdirSync(lock);
  }
}

function updating(testInfo: TestInfo) {
  return ['all', 'changed'].includes(testInfo.config.updateSnapshots);
}

async function showFigures(page: Page) {
  for (;;) {
    const skeleton = (
      await page.evaluateHandle(() => document.querySelector('.site-loading'))
    ).asElement();
    if (!skeleton) return;
    await skeleton.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForFunction((element) => !element.isConnected, skeleton);
  }
}

async function scrollToTop(page: Page) {
  await page.evaluate(() => document.getElementById('site-main')?.scrollTo({ top: 0 }));
}

async function settle(page: Page) {
  await page.locator('#site-main').waitFor();
  await showFigures(page);
  await scrollToTop(page);
  await page.locator('[data-site-pending]').first().waitFor({ state: 'detached' });
  await page.locator('.site-loading').first().waitFor({ state: 'detached' });
  await page.evaluate(() => document.fonts.ready);
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

async function expandCode(page: Page) {
  await page.locator('#site-main').waitFor();
  await page.evaluate(() => {
    for (const details of document.querySelectorAll<HTMLDetailsElement>(
      'details.site-live-example-code',
    ))
      details.open = true;
  });
}

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

async function setTheme(page: Page, theme: CatalogueTheme) {
  await emulateContrast(page, theme);
  const root = page.locator('html');
  if ((await root.getAttribute('data-env-theme')) !== theme.scheme)
    await chooseScheme(page, theme.scheme);
  await page.locator(`html[data-env-theme="${theme.scheme}"]`).waitFor();
}

async function scan(page: Page, route: string, theme: Theme): Promise<Scan> {
  const results = await new AxeBuilder({ page })
    .options({
      runOnly: { type: 'tag', values: aaAndBestPracticeTags },
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
            ['.site-top-bar', 'page controls'],
            ['.site-page-header, .catalogue-overview-hero', 'header'],
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
