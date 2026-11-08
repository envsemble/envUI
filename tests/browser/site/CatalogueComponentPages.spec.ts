import { test, expect } from '@playwright/test';
import { siteDevUrl } from '../helpers/Servers';
import { chooseScheme } from '../helpers/CatalogueThemes';
import { goTo } from '../helpers/SiteSpecHelpers';

// A component page of the catalogue: its sections, their groups and its anatomy.

test('a component page shows plain sections, equal cells and the parts of its anatomy', async ({
  page,
}) => {
  // Wide enough for an overview's three figures to share a row beside the page's contents.
  await page.setViewportSize({ width: 1920, height: 900 });
  // Figures that share a row are cells of one width, from the top of the row, each at least a
  // gallery cell's height, 11 rem, so a lone control sits in a calm field rather than a strip.
  await page.goto(`${siteDevUrl}/components/badge`);
  await expect(page.locator('[data-section="overview"] .site-loading')).toHaveCount(0);
  const cells = () =>
    page
      .locator('[data-section="overview"] .site-figure-run')
      .first()
      .evaluate((run) => {
        const stages = [...run.querySelectorAll('.site-live-example')].map((stage) =>
          stage.getBoundingClientRect(),
        );
        return {
          count: stages.length,
          widths: new Set(stages.map((box) => Math.round(box.width))).size,
          tops: new Set(stages.map((box) => Math.round(box.top))).size,
          least: stages.every((box) => box.height >= 11 * 16 - 1),
        };
      });
  await expect.poll(cells).toEqual({ count: 3, widths: 1, tops: 1, least: true });
  // Each figure's caption or code follows its stage closely, with no empty band.
  const codeGaps = () =>
    page
      .locator('[data-section="overview"] .site-figure-run')
      .first()
      .evaluate((run) =>
        [...run.children].map((figure) => {
          const [stage, next] = [...figure.children].map((child) => child.getBoundingClientRect());
          return { gap: Math.round(next.top - stage.bottom) };
        }),
      );
  expect(new Set((await codeGaps()).map(({ gap }) => gap)).size).toBe(1);
  await page.goto(`${siteDevUrl}/components/button`);
  // One page of sections, with no views; the props are on its page in the Docs, which the banner's
  // Design and Code switch opens, Design marked as the page shown.
  await expect(page.locator('.site-page-header').getByRole('tab')).toHaveCount(0);
  const partSwitch = page
    .locator('.site-page-header')
    .getByRole('navigation', { name: 'Design or code' });
  await expect(partSwitch.getByRole('link', { name: 'Code', exact: true })).toHaveAttribute(
    'href',
    '/docs/components/button',
  );
  await expect(partSwitch.getByRole('link', { name: 'Design', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  // Ordinary headings in the fixed order, and no questions.
  // The one-file structure's sections, which every kind of page shares.
  await expect(page.locator('.site-figure-section-heading h2')).toHaveText([
    'Overview',
    'Variants',
    'Anatomy',
    'Behaviour',
    'Rules',
    'Accessibility',
  ]);
  await expect(page.locator('.site-figures .env-message')).toHaveCount(0);
  // Do and don't figures are cells as a gallery's are: a square-cornered stage with no frame; under
  // it, a little apart, a strip of the same fill with the tag and the sentence beside it; and the
  // code switch under the strip.
  const verdict = page.getByRole('figure', { name: /^Do One primary button per group/ });
  await expect(verdict.locator('.site-verdict-caption .site-verdict-mark')).toHaveText('Do');
  await expect(verdict.locator('details summary')).toHaveText('Show code, OnePrimaryAction.tsx');
  const cell = await verdict.evaluate((figure) => {
    const stage = figure.querySelector('.site-verdict-stage')!;
    const strip = figure.querySelector('.site-verdict-caption')!;
    const box = (element: Element) => element.getBoundingClientRect();
    const [stageBox, stripBox, mark, sentence, code] = [
      stage,
      strip,
      figure.querySelector('.site-verdict-mark')!,
      figure.querySelector('.site-verdict-sentence')!,
      figure.querySelector('details summary')!,
    ].map(box);
    return {
      corner: getComputedStyle(stage).borderTopLeftRadius,
      shadow: getComputedStyle(stage).boxShadow,
      // The strip under the stage, apart from it, as wide, on the same fill.
      strip:
        stripBox.top > stageBox.bottom &&
        Math.abs(stripBox.width - stageBox.width) < 1 &&
        getComputedStyle(strip).backgroundColor === getComputedStyle(stage).backgroundColor,
      // The sentence starts on the tag's line, after it.
      beside: Math.abs(sentence.top - mark.top) < mark.height && sentence.left > mark.right,
      // The switch under the strip.
      below: code.top >= stripBox.bottom - 1,
    };
  });
  expect(cell).toEqual({
    corner: '0px',
    shadow: 'none',
    strip: true,
    beside: true,
    below: true,
  });
  // When to use is a guidance list, marked with sparks, where a component named at an item's end
  // follows it after a muted dot: the Button family's own page, so not a link.
  const useWhen = page.locator('.site-when .site-guidance li');
  await expect(useWhen.nth(2)).toHaveText(
    'A familiar action as an icon alone, in a dense place · IconButton',
  );
  await expect(page.locator('.site-when .catalogue-list-name')).toHaveText([
    'IconButton',
    'ConfirmButton',
    'CopyButton',
    'ButtonGroup',
  ]);
  await expect(page.locator('.site-when a')).toHaveCount(0);
  // Related, at the end, has a tile for each alternative, of one size, each a picture of it,
  // inert and fitted to its stage, once the section nears the viewport.
  await expect(page.locator('[data-section="usage"] .catalogue-related-tile')).toHaveCount(0);
  const tiles = page.locator('[data-section="related"] .catalogue-related-tile');
  await expect(tiles.locator('.catalogue-related-name')).toHaveText([
    'Link',
    'SegmentedControl',
    'Switch',
    'Menu',
    'Dialog',
  ]);
  await tiles.first().scrollIntoViewIfNeeded();
  const tileStages = () =>
    tiles.locator('.catalogue-tile-stage').evaluateAll((stages) => ({
      widths: new Set(stages.map((stage) => Math.round(stage.getBoundingClientRect().width))).size,
      heights: new Set(stages.map((stage) => Math.round(stage.getBoundingClientRect().height)))
        .size,
      fitted: stages.filter((stage) =>
        stage.querySelector('.catalogue-tile-canvas[data-fitted][inert]'),
      ).length,
    }));
  await expect.poll(tileStages).toEqual({ widths: 1, heights: 1, fitted: 5 });
  // The anatomy numbers each part of the live button beside the part it names, in the theme the
  // reader has chosen alone, and keeps them there as the page narrows and the theme changes.
  // The variants figure names each variant in plain text on the start side of its item.
  const variantNames = page.locator('.catalogue-variants .catalogue-variant-label');
  await variantNames.first().scrollIntoViewIfNeeded();
  await expect(variantNames).toHaveText([
    'Primary',
    'Secondary',
    'Outline',
    'Ghost',
    'Text',
    'Primary, accent',
  ]);
  await expect(variantNames.first()).toHaveAttribute('data-side', 'left');
  const stages = page.locator('.site-anatomy .site-anatomy-stage');
  await expect(stages).toHaveCount(1);
  const placement = () =>
    stages.evaluate((stage) => {
      // Until the example and its badges render, there is nothing to place: poll again.
      // The icon's number is the one its legend entry has: the callouts number the parts in the
      // order the figure is read.
      const iconElement = stage.querySelector('.env-button > .env-icon');
      const entry = [
        ...(stage.closest('figure')?.querySelectorAll('.site-anatomy-legend > li') ?? []),
      ].find((item) => item.textContent?.includes('Start icon'));
      const number = entry?.querySelector('.site-anatomy-number')?.textContent;
      const badgeElement = [...stage.querySelectorAll('.site-anatomy-badge')].find(
        (item) => item.textContent === number,
      );
      if (!iconElement || !badgeElement) return null;
      const icon = iconElement.getBoundingClientRect();
      const badge = badgeElement.getBoundingClientRect();
      return {
        badges: stage.querySelectorAll('.site-anatomy-badge').length,
        // Centred on the icon, give or take the rounding of a centred stage.
        aligned: Math.abs(badge.left + badge.width / 2 - (icon.left + icon.width / 2)) <= 1,
        theme: stage.getAttribute('data-env-theme'),
      };
    });
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'light' });
  await chooseScheme(page, 'dark');
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'dark' });
  await page.setViewportSize({ width: 420, height: 800 });
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'dark' });
  await expect(page.locator('.site-anatomy-legend > li')).toHaveCount(4);
  // One to a row, each figure's caption or code follows its stage as closely.
  await page.goto(`${siteDevUrl}/components/badge`);
  await expect(page.locator('[data-section="overview"] .site-loading')).toHaveCount(0);
  const column = await codeGaps();
  expect(new Set(column.map(({ gap }) => gap)).size).toBe(1);
});

test('a component page groups its sections into three, all on the page', async ({ page }) => {
  // Overview with Variants, Anatomy and Behaviour; Rules, which opens with Use it when; Accessibility;
  // then Related. A page groups the sections it has, every group on the page's own background, as
  // far from the next as any other.
  const groups = () =>
    page.locator('.site-section-groups > *').evaluateAll((elements) =>
      elements.map((element) => ({
        group: element.classList.contains('site-section-group'),
        sections: [...element.querySelectorAll('[data-section]')].map(
          (section) => (section as HTMLElement).dataset.section,
        ),
      })),
    );
  const gaps = () =>
    page
      .locator('.site-section-groups > *')
      .evaluateAll((elements) =>
        elements
          .slice(1)
          .map((element, index) =>
            Math.round(
              element.getBoundingClientRect().top - elements[index].getBoundingClientRect().bottom,
            ),
          ),
      );
  await page.goto(`${siteDevUrl}/components/scaffold`);
  await expect.poll(groups).toEqual([
    { group: true, sections: ['overview', 'variants', 'anatomy', 'behaviour'] },
    { group: true, sections: ['rules'] },
    { group: true, sections: ['accessibility'] },
    { group: true, sections: ['related'] },
  ]);
  expect(new Set(await gaps()).size).toBe(1);
  // Box has no Variants, Anatomy or Behaviour, and its Accessibility holds only the lists that
  // are in the Docs, so the catalogue has no group after its Rules.
  await goTo(page, '/components/box');
  await expect.poll(groups).toEqual([
    { group: true, sections: ['overview'] },
    { group: true, sections: ['rules'] },
    { group: true, sections: ['related'] },
  ]);
  // A page with every group: what it is, its variants, parts and behaviour; its rules, which
  // open with Use it when; its accessibility.
  await goTo(page, '/components/button');
  await expect.poll(groups).toEqual([
    { group: true, sections: ['overview', 'variants', 'anatomy', 'behaviour'] },
    { group: true, sections: ['rules'] },
    { group: true, sections: ['accessibility'] },
    { group: true, sections: ['related'] },
  ]);
  expect(new Set(await gaps()).size).toBe(1);
  // Its Use it when list of six runs in two columns of three where there is room, one when narrow.
  const columns = () =>
    page.locator('[data-section="rules"] .catalogue-when-columns ul').evaluate((list) => ({
      columns: getComputedStyle(list).gridTemplateColumns.split(' ').length,
      tops: new Set([...list.children].map((item) => Math.round(item.getBoundingClientRect().top)))
        .size,
    }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(columns).toEqual({ columns: 2, tops: 3 });
  await page.setViewportSize({ width: 420, height: 900 });
  await expect.poll(columns).toEqual({ columns: 1, tops: 6 });
});
