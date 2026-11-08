import { test, expect } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import type * as PageModel from '../../apps/site/src/pages/PageModel';
import type * as RelatedPages from '../../apps/site/src/template/RelatedPages';
import type { DocumentationMetadata } from '../../scripts/docs/model/DocumentationTypes';
import { showTile } from './helpers/SiteSpecHelpers';

// The Related section of a page: its tiles and the components they name.

test('a Related tile of a page without an example shows its specimen', async ({ page }) => {
  // Icon is documented on the Icons foundation's page, which has no example: its tile links there
  // and shows a few of the icons, fitted to its stage as an example is.
  await page.goto(`${siteDevUrl}/components/avatar`);
  const tile = page.locator('.catalogue-related-tile').filter({ hasText: /^Icon/ });
  await showTile(tile);
  await expect(tile.getByRole('link', { name: 'Icon', exact: true })).toHaveAttribute(
    'href',
    '/foundations/icons',
  );
  await expect(tile.locator('.catalogue-tile-stage')).toHaveAttribute(
    'data-catalogue-specimen',
    'icons',
  );
  await expect(tile.locator('.catalogue-tile-canvas[data-fitted] svg')).toHaveCount(6);
  await expect(page.locator('.catalogue-tile-placeholder')).toHaveCount(0);
});

test('each Related tile shows the component it names, also one documented on another page', async ({
  page,
}) => {
  // An export documented on another's page, such as SearchField on TextField's, shows an example
  // that renders it, not the page's lead (RelatedPages.ts).
  await page.goto(`${siteDevUrl}/components`);
  const wrong = await page.evaluate(async () => {
    // The site's own modules, as its dev server serves them.
    const load = (path: string) => import(/* @vite-ignore */ path);
    const related = (await load('/src/template/RelatedPages.ts')) as typeof RelatedPages;
    const { documents } = (await load('/src/pages/PageModel.ts')) as typeof PageModel;
    const found: string[] = [];
    for (const document of documents) {
      const full = (await load(`/src/generated/pages/${document.id}.json`).catch(() => null)) as {
        default: { metadata?: DocumentationMetadata };
      } | null;
      const metadata = full?.default.metadata;
      for (const { name, picture } of metadata?.avoidWhen ? related.alternativesOf(metadata) : []) {
        // A page's own export shows the page's tile; a pattern or a guide is no component.
        if (!related.pageOf(name) || !picture || picture.tile || picture.foundation) continue;
        const { default: source } = (await load(
          `/src/examples/${picture.page}/${picture.name}.tsx?raw`,
        )) as { default: string };
        if (!new RegExp(`<${name.replace('.', '\\.')}[\\s/>.]`).test(source))
          found.push(`${document.id}: ${name} shows ${picture.page}/${picture.name}`);
      }
    }
    return [...new Set(found)];
  });
  expect(wrong).toEqual([]);
});
