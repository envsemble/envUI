import { test, expect, type Page } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import { readdirSync, readFileSync } from 'node:fs';
import { technicalText } from '../../apps/site/src/shared/CatalogueContent.ts';
import { allPages } from '../../apps/site/src/navigation/SiteRoutes';
import { goTo } from './helpers/SiteSpecHelpers';

/**
 * The words a page of the catalogue shows and names, as a reader and a screen reader meet them:
 * every text and the names, titles and placeholders of its content, outside the Code disclosures
 * under its figures and outside the examples they show, which are envUI at work with an
 * application's own sample text. Foundation figures, specimens, captions, swatches and legends all
 * count.
 */
async function catalogueWords(page: Page) {
  // Every section has rendered, those after the first once the page has painted.
  await expect(page.locator('.site-section-groups[aria-busy]')).toHaveCount(0);
  return page.locator('.site-main').evaluate((main) => {
    const skipped =
      '.site-live-example-code, .site-code-slot, pre, .env-code-block, .site-live-example, .site-verdict-stage, .site-anatomy-subject, .catalogue-related-stage, .catalogue-open-example, [hidden], .catalogue-banner-motif';
    const words: string[] = [];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode())
      if (node.textContent?.trim() && !node.parentElement?.closest(skipped))
        words.push(node.textContent.trim());
    for (const element of main.querySelectorAll('[aria-label], [title], [alt], [placeholder]'))
      if (!element.closest(skipped))
        for (const name of ['aria-label', 'title', 'alt', 'placeholder'])
          if (element.getAttribute(name)) words.push(element.getAttribute(name)!);
    return words;
  });
}

/** The technical text in a page's words, each as "kind: text". */
const technicalOf = (words: string[]) =>
  words.flatMap((text) => technicalText(text).map((found) => `${found.kind}: ${found.text}`));

/**
 * The pages that show no technical text at all: every foundation and every pattern. Every other
 * page of the catalogue is reported until it is rewritten to the same rule, then joins this list.
 */
const plainPages = [
  'foundations/colors',
  'foundations/typography',
  'foundations/spacing',
  'foundations/responsive',
  'foundations/icons',
  'foundations/accessibility',
  // The patterns, each its decision and its compositions.
  ...[
    'forms',
    'settings',
    'destructive-actions',
    'feedback',
    'loading',
    'empty-states',
    'key-figures',
    'navigation',
    'app-frame',
    'account-and-organizations',
    'filtering',
    'data-tables',
    'progressive-disclosure',
    'conversation',
    'file-upload',
  ].map((id) => `patterns/${id}`),
];

/** The component pages of the catalogue held to the plain-language rule. */
const plainComponentPages = allPages.filter(
  ({ kind, area }) => area === 'catalogue' && kind === 'component',
);

/** The pages set in the catalogue's type hierarchy so far, the samples of the typography rework. */
const typographyPages = [
  'foundations/spacing',
  'foundations/typography',
  'components/button',
  'patterns/forms',
];

test("a specimen's titles and captions name options in words, not values", async ({ page }) => {
  // The catalogue speaks plain language in its specimens too: Small rather than sm, Step 1 rather
  // than gap={1}. A value starts in lower case or is written as code, with =, braces, quotes or --.
  // It visits every component page with a specimen.
  test.slow();
  const pages = readdirSync('docs/components')
    .filter((file) => readFileSync(`docs/components/${file}`, 'utf8').includes('<!-- specimen:'))
    .map((file) => file.replace(/\.md$/, ''));
  expect(pages.length).toBeGreaterThan(0);
  await page.goto(`${siteDevUrl}/`);
  for (const id of pages) {
    await goTo(page, `/components/${id}`);
    // Every section has rendered, those after the first once the page has painted.
    await expect(page.locator('.site-section-groups[aria-busy]')).toHaveCount(0);
    await expect(
      page
        .locator(
          '.site-figures :is(.catalogue-specimen-grid, .catalogue-matrix-scroll, .catalogue-motion-stage)',
        )
        .first(),
    ).toBeVisible();
    const texts = await page
      .locator(
        '.site-figures :is(.catalogue-specimen > :is(h3, h4, h5, .env-text[data-variant="caption"]), .catalogue-matrix-scroll th)',
      )
      .allTextContents();
    const raw = texts
      .map((text) => text.trim())
      .filter((text) => text && (/^[a-z]/.test(text) || /[={}"`]|--/.test(text)));
    expect(raw, `${id} names options by their values`).toEqual([]);
  }
});

test('the foundation and pattern pages show no technical text, in their words or their figures', async ({
  page,
}) => {
  // The catalogue is for people looking at envUI: no token names, hex colors, lengths, percentages or
  // code. They belong to each foundation's guide and each pattern's page in the Docs.
  test.slow();
  await page.goto(`${siteDevUrl}/`);
  for (const path of plainPages) {
    await goTo(page, `/${path}`);
    if (path.startsWith('foundations/')) {
      // A foundation's sections, from its Markdown.
      await expect(page.locator('.catalogue-topic, .site-figure-section').last()).toBeVisible();
      // The marks of a figure are measured once it has laid out: numbers, or the parts' names.
      if (await page.locator('.catalogue-marked').count())
        await expect(
          page.locator('.site-anatomy-badge, .catalogue-marked-names > li').first(),
        ).toBeVisible();
      // Docs opens the foundation's page in the Docs, as it does for a component.
      await expect(
        page.locator('.site-page-header').getByRole('link', { name: 'Docs', exact: true }),
      ).toHaveAttribute('href', `/docs/${path}`);
    } else await expect(page.locator('.site-when').first()).toBeVisible();
    expect(technicalOf(await catalogueWords(page)), `${path} shows technical text`).toEqual([]);
  }
});

test('component pages show no technical text, in their words or their figures', async ({
  page,
}) => {
  // Lengths, tokens, percentages and code names belong to the page's In code, in the Docs.
  test.slow();
  await page.goto(`${siteDevUrl}/`);
  const found: string[] = [];
  for (const { path, title } of plainComponentPages) {
    await goTo(page, `/${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(title);
    // Its figures, whose captions are words of the page too, have loaded.
    await expect(page.locator('.site-loading')).toHaveCount(0);
    for (const entry of technicalOf(await catalogueWords(page))) found.push(`${path}: ${entry}`);
  }
  expect(found, "Say it in words, and move the value to the page's In code.").toEqual([]);
});

test('the technical text on every other page of the catalogue is counted, for the rewrite to come', async ({
  page,
}, testInfo) => {
  // Reporting only: the counts say how far each page is from the model pages' rule.
  test.slow();
  await page.goto(`${siteDevUrl}/`);
  const counts: string[] = [];
  for (const { path, title, kind, area } of allPages) {
    if (area !== 'catalogue' || plainPages.includes(path)) continue;
    if (plainComponentPages.some((plain) => plain.path === path)) continue;
    await goTo(page, path === 'overview' ? '/' : `/${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      kind === 'home' ? 'envUI' : title,
    );
    const found = technicalOf(await catalogueWords(page));
    if (!found.length) continue;
    const kinds = Map.groupBy(found, (entry) => entry.split(':')[0]!);
    counts.push(
      `${path}: ${found.length} (${[...kinds].map(([name, list]) => `${name} ${list.length}`).join(', ')})`,
    );
  }
  const report = counts.length ? counts.join('\n') : 'No technical text on any page.';
  console.log(`Technical text in the catalogue, by page:\n${report}`);
  await testInfo.attach('technical-text.txt', { body: report, contentType: 'text/plain' });
});

test("the catalogue's text keeps a readable measure, and opens each section with a larger lead", async ({
  page,
}) => {
  // Running text wraps at about 70 characters, never one long line across the page; a section's
  // lead is larger than the quieter text that supports it.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/`);
  for (const path of typographyPages) {
    await goTo(page, `/${path}`);
    const lead = page.locator('.site-lead').first();
    await expect(lead).toBeVisible();
    const found = await page.evaluate(() => {
      const text = [
        ...document.querySelectorAll<HTMLElement>(
          '.site-lead, .catalogue-supporting, .site-figures .env-markdown > p',
        ),
      ].filter((element) => !element.closest('[data-figure], .site-shared-row'));
      const long = text.flatMap((element) => {
        const lines = Math.round(
          element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight),
        );
        const characters = element.textContent!.trim().length / Math.max(lines, 1);
        return characters > 80 ? [`${Math.round(characters)}: ${element.textContent!.trim()}`] : [];
      });
      const style = (selector: string) => {
        const element = document.querySelector(selector);
        return (
          element && getComputedStyle(element.matches('p') ? element : element.querySelector('p')!)
        );
      };
      const leadStyle = style('.site-lead')!;
      const supporting = style(
        '.catalogue-supporting, .site-figures .env-markdown:not(.site-lead) > p',
      )!;
      return {
        long,
        larger: parseFloat(leadStyle.fontSize) > parseFloat(supporting.fontSize),
        quieter: leadStyle.color !== supporting.color,
      };
    });
    expect(found, path).toEqual({ long: [], larger: true, quieter: true });
  }
});
