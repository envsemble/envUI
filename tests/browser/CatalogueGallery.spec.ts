import { test, expect, type Page } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import { pagesOf } from '../../apps/site/src/navigation/SiteRoutes';
import { showTile } from './helpers/SiteSpecHelpers';

// The galleries of foundations, components and patterns, and their fitted tiles at rest.

test('the page of all foundations is one sheet, each pane a single link to its foundation', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/foundations`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Foundations');
  const panes = page.locator('.catalogue-foundation-sheet').getByRole('link');
  const foundations = pagesOf('catalogue').filter((entry) => entry.kind === 'foundation');
  await expect(panes).toHaveCount(foundations.length);
  for (const foundation of foundations) {
    // One link a pane, named by its heading, with nothing else to use inside it.
    const pane = panes.filter({ has: page.getByRole('heading', { name: foundation.title }) });
    await expect(pane).toHaveAccessibleName(foundation.title);
    await expect(pane).toHaveAttribute('href', `/${foundation.path}`);
    await expect(pane.locator('a, button, input, select, textarea, [tabindex]')).toHaveCount(0);
  }
  // The whole pane leads there, its picture as well as its name.
  const icons = panes.filter({ has: page.getByRole('heading', { name: 'Icons' }) });
  await expect(icons).toHaveCSS('cursor', 'pointer');
  await icons.scrollIntoViewIfNeeded();
  const box = (await icons.boundingBox())!;
  await page.mouse.click(box.x + 8, box.y + box.height - 8);
  await expect(page).toHaveURL(`${siteDevUrl}/foundations/icons`);
});

test('a gallery card and a Related card are each one link over the whole card, its live picture included', async ({
  page,
  context,
}) => {
  // Where on a card a press lands, as fractions of its box: the middle of its live picture, a
  // corner of it, and the name's row that slides in under it.
  const points = [
    [0.5, 0.4],
    [0.06, 0.06],
    [0.5, 0.97],
  ];
  for (const [from, tiles, link] of [
    ['components', '.catalogue-gallery-tile', '.catalogue-gallery-link'],
    ['patterns', '.catalogue-gallery-tile', '.catalogue-gallery-link'],
    ['components/button', '.catalogue-related-tile', '.catalogue-related-link'],
  ] as const) {
    for (const [index, [x, y]] of points.entries()) {
      await page.goto(`${siteDevUrl}/${from}`);
      const card = page.locator(tiles).nth(index + 1);
      await showTile(card);
      // One link, named by the card's name, and nothing else in the card to use.
      await expect(card.getByRole('link')).toHaveCount(1);
      const href = (await card.locator(link).getAttribute('href'))!;
      const box = (await card.boundingBox())!;
      await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
      await expect(card.locator(link)).toHaveCSS('cursor', 'pointer');
      await page.mouse.down();
      await page.mouse.up();
      await expect(page).toHaveURL(`${siteDevUrl}${href}`);
    }
  }
  // A Related card's link is named by its name and described by when to pick it.
  await page.goto(`${siteDevUrl}/components/button`);
  const related = page.locator('.catalogue-related-tile').first();
  await showTile(related);
  const relatedLink = related.locator('.catalogue-related-link');
  await expect(relatedLink).toHaveAccessibleName('Link');
  await expect(relatedLink).toHaveAccessibleDescription('A destination inside running text.');
  // From the keyboard the ring is around the whole card, and Enter opens it.
  await page.goto(`${siteDevUrl}/components`);
  const card = page.locator('.catalogue-gallery-tile').nth(1);
  await showTile(card);
  const cardLink = card.locator('.catalogue-gallery-link');
  await cardLink.focus();
  expect(await cardLink.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  const ring = await cardLink.evaluate((element) => {
    const cover = getComputedStyle(element, '::after');
    const box = element.closest('li')!.getBoundingClientRect();
    return {
      outline: cover.outlineStyle,
      width: Math.round(parseFloat(cover.width)),
      card: Math.round(box.width),
    };
  });
  expect(ring).toEqual({ outline: 'solid', width: ring.card, card: ring.card });
  const href = (await cardLink.getAttribute('href'))!;
  // A press with a modifier opens it in a new tab, as a link's does, and leaves this page.
  const box = (await card.boundingBox())!;
  const opened = context.waitForEvent('page');
  await page.keyboard.down(process.platform === 'darwin' ? 'Meta' : 'Control');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.4);
  await page.keyboard.up(process.platform === 'darwin' ? 'Meta' : 'Control');
  const tab = await opened;
  await expect(tab).toHaveURL(`${siteDevUrl}${href}`);
  await tab.close();
  await expect(page).toHaveURL(`${siteDevUrl}/components`);
  await cardLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${siteDevUrl}${href}`);
});

test('every tile of the galleries is fitted: components at one scale, a scene at about its own size', async ({
  page,
}) => {
  // A tile's example loads as it nears the viewport and comes into its canvas after the fit has
  // started to watch it; each must still be fitted. Components show at one scale, their own size
  // where the stage has room, cut off by it where they are larger; a pattern's scene, on its
  // larger card, at about its own size, so its words read as a page's do (Gallery.css), cut off by
  // its stage where it is larger; a drawing shows what it holds inside its stage.
  const tiles = page.locator('.catalogue-gallery-tile');
  const unfitted = () =>
    tiles.evaluateAll((items) => {
      // The one scale every component's tile is drawn at: its own size where the stage has
      // room for the tiles' window, else smaller.
      const scaleOf = (canvas: Element | null) =>
        (canvas as HTMLElement | null)?.style.transform.match(/scale\(([^)]+)\)/)?.[1];
      const one = items
        .map((tile) =>
          scaleOf(
            tile.querySelector('[data-own-size][data-fitted]:not([data-popup], [data-held-scale])'),
          ),
        )
        .find(Boolean);
      return items.flatMap((tile) => {
        const name = tile.querySelector('.catalogue-gallery-name')?.textContent ?? '';
        const stage = tile.querySelector('.catalogue-tile-stage')!.getBoundingClientRect();
        const canvas = tile.querySelector<HTMLElement>('.catalogue-tile-canvas[data-fitted]');
        if (!canvas || !/scale\(/.test(canvas.style.transform)) return [`${name}: not fitted`];
        // What shows, as the fit measures it (Related.tsx): what paints something of its own,
        // a fill, an edge, a shadow, text or a picture, and not a visually hidden pixel, such as
        // a form's input; a box that only lays out others, such as an avatar group's room to
        // spread, shows nothing.
        const window = canvas.getBoundingClientRect();
        const scale = window.width / canvas.offsetWidth;
        const clear = (color: string) =>
          color === 'transparent' || /rgba\([^)]*,\s*0\)$|\/\s*0\)$/.test(color);
        const paints = (element: Element) => {
          if (/^(img|svg|canvas|video|input|textarea|select|hr)$/i.test(element.localName))
            return true;
          const style = getComputedStyle(element);
          if (style.opacity === '0') return false;
          // Clipped away whole, as a visually hidden announcer is, or inside what is.
          for (
            let node: Element | null = element;
            node && node !== canvas;
            node = node.parentElement
          )
            if (/^inset\((50|100)%/.test(getComputedStyle(node).clipPath)) return false;
          if (!clear(style.backgroundColor) || style.backgroundImage !== 'none') return true;
          if (style.boxShadow !== 'none') return true;
          if (
            ['top', 'right', 'bottom', 'left'].some(
              (side) =>
                parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
                style.getPropertyValue(`border-${side}-style`) !== 'none' &&
                !clear(style.getPropertyValue(`border-${side}-color`)),
            )
          )
            return true;
          return [...element.childNodes].some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
          );
        };
        // A box shows only as far as the boxes around it that clip show it, such as a scrolling
        // list's rows or a closed panel's content.
        const clipped = (element: Element) => {
          let box = element.getBoundingClientRect();
          for (
            let node = element.parentElement;
            node && node !== canvas;
            node = node.parentElement
          ) {
            const style = getComputedStyle(node);
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
            const clip = node.getBoundingClientRect();
            const left = Math.max(box.left, clip.left);
            const top = Math.max(box.top, clip.top);
            box = new DOMRect(
              left,
              top,
              Math.max(0, Math.min(box.right, clip.right) - left),
              Math.max(0, Math.min(box.bottom, clip.bottom) - top),
            );
          }
          return box;
        };
        const shown = [...canvas.querySelectorAll('*')]
          .filter((element) => element.checkVisibility({ visibilityProperty: true }))
          .filter((element) => !element.closest('svg') || element.localName === 'svg')
          .filter(paints)
          .map(clipped)
          .filter((box) => box.width > scale && box.height > scale)
          .filter((box) => box.width < window.width - 1 || box.height < window.height - 1);
        if (!shown.length) return [`${name}: empty`];
        // A popup shown open is drawn as its tile is: in a component's, at the one scale or at
        // the least a component's popup is drawn at, never between, whole or a window onto it from
        // its top; in a scene, at about its own size, as the scene is, so its words read as the
        // other tiles' do (Gallery.css). An overlay, such as a notification or a dialog, is drawn at
        // the overlays' one scale, or smaller only where it shows whole no larger, down to its
        // window's least (Tiles.ts).
        if (canvas.hasAttribute('data-popup')) {
          const at = Number(scaleOf(canvas));
          const own = canvas.hasAttribute('data-own-size');
          const style = getComputedStyle(canvas);
          const overlay = canvas.hasAttribute('data-overlay')
            ? parseFloat(style.getPropertyValue('--catalogue-overlay-scale'))
            : 0;
          const popupLeast = parseFloat(style.getPropertyValue('--catalogue-own-popup-least'));
          const near = (scale: number) => Math.abs(at - scale) <= 0.001;
          if (!own)
            return at >= 0.95 - 0.001 && at <= 1.001 ? [] : [`${name}: popup drawn at ${at}`];
          if (overlay)
            return near(overlay) || (at < overlay && at >= popupLeast - 0.001)
              ? []
              : [`${name}: overlay drawn at ${at}`];
          // A modal that isn't one of the overlays, such as a dialog with a field, is drawn as
          // large as shows it whole, down to its window's least.
          if (canvas.querySelector('.env-dialog-backdrop'))
            return at >= popupLeast - 0.001 && at <= Number(one ?? 1) + 0.001
              ? []
              : [`${name}: modal drawn at ${at}`];
          // A held view, such as a picker resting open, framed down to what its script acts on
          // with its fade shortened below it, is drawn smaller only as far as that needs, down
          // to a held view's least (useFit.ts).
          const held =
            canvas.parentElement!.style.getPropertyValue('--catalogue-crop-bottom') !== '' &&
            at < popupLeast &&
            at >= 0.6 - 0.001;
          return near(Number(one ?? 1)) || near(popupLeast) || held
            ? []
            : [`${name}: popup drawn at ${at}`];
        }
        // A held view that names what it shows, such as a docked panel framed whole, is drawn
        // smaller than the one scale only where it shows whole no larger, down to a held view's
        // least, and then whole: cut off nowhere (`data-held-scale`, useFit.ts).
        if (canvas.hasAttribute('data-held-scale')) {
          const at = Number(scaleOf(canvas));
          return at < Number(one ?? 1) && at >= 0.6 - 0.001 && !canvas.dataset.cut
            ? []
            : [`${name}: held view drawn at ${at}`];
        }
        if (canvas.hasAttribute('data-own-size'))
          return scaleOf(canvas) === one && Number(one) <= 1 ? [] : [`${name}: not at one scale`];
        if (canvas.parentElement?.classList.contains('catalogue-tile-crop'))
          return Number(scaleOf(canvas)) >= 0.95 ? [] : [`${name}: too small to read`];
        const outside =
          Math.min(...shown.map((box) => box.left)) < stage.left - 1 ||
          Math.min(...shown.map((box) => box.top)) < stage.top - 1 ||
          Math.max(...shown.map((box) => box.right)) > stage.right + 1 ||
          Math.max(...shown.map((box) => box.bottom)) > stage.bottom + 1;
        return outside ? [`${name}: clipped`] : [];
      });
    });
  for (const route of ['/components', '/patterns']) {
    await page.goto(`${siteDevUrl}${route}`);
    await expect(tiles.first()).toBeVisible();
    const count = await tiles.count();
    expect(count).toBeGreaterThan(route === '/components' ? 60 : 10);
    for (let index = 0; index < count; index += 4) await tiles.nth(index).scrollIntoViewIfNeeded();
    await expect.poll(unfitted, { message: route }).toEqual([]);
    // A picture cut off at its foot is never cut through a row: each row of a menu, a list, a
    // table or a tree that reaches past the foot fades out there, under a fade of at least half a
    // rem, rather than ending in a slice through it.
    const cutRows = await tiles.evaluateAll((items) =>
      items.flatMap((tile) => {
        const canvas = tile.querySelector('.catalogue-tile-canvas[data-cut~="bottom"]');
        if (!canvas) return [];
        const stage = tile.querySelector('.catalogue-tile-stage')!.getBoundingClientRect();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const length = getComputedStyle(canvas.parentElement!)
          .getPropertyValue('--catalogue-crop-bottom')
          .trim();
        const fade = parseFloat(length) * (length.endsWith('rem') ? rem : 1);
        if (fade >= rem / 2) return [];
        const rows = "[role^='menuitem'], [role='option'], [role='row'], [role='treeitem'], li, tr";
        return [...canvas.querySelectorAll(rows)]
          .filter((row) => !row.querySelector(rows))
          .filter((row) => row.checkVisibility({ visibilityProperty: true }))
          .filter((row) => {
            const box = row.getBoundingClientRect();
            return box.top < stage.bottom && box.bottom > stage.bottom + 2;
          })
          .map(
            (row) =>
              `${tile.querySelector('.catalogue-gallery-name')?.textContent}: ${row.textContent}`,
          );
      }),
    );
    expect(cutRows, route).toEqual([]);
    // A popup shown open, such as a menu beside its button or a dialog, shows its top and its
    // start in its stage, its corners there in view. Where it is larger, it is a window onto it,
    // cut off at its foot or its end, fading out there, after a whole row (above); a modal taller
    // than its stage's screen, framed down it on what its script acts on, at its top too.
    const cutPopups = await tiles.evaluateAll((items) =>
      items.flatMap((tile) => {
        const stage = tile.querySelector('.catalogue-tile-stage')!.getBoundingClientRect();
        const layer = tile.querySelector('.catalogue-overlay-layer');
        if (!layer) return [];
        const cut = tile.querySelector<HTMLElement>('.catalogue-tile-canvas')?.dataset.cut ?? '';
        // A card: the outermost popup or dialog, such as a menu, a palette or a hover card.
        const card =
          ".env-popup, [role='menu'], [role='dialog'], [role='alertdialog'], [role='tooltip']";
        const cards = [...layer.querySelectorAll<HTMLElement>(card)]
          .filter((element) => !element.parentElement?.closest(card))
          .filter((element) => element.checkVisibility());
        const name = tile.querySelector('.catalogue-gallery-name')?.textContent;
        return cards
          .filter((card) => {
            const box = card.getBoundingClientRect();
            return (
              box.left < stage.left - 1 ||
              (box.top < stage.top - 1 && !cut.includes('top')) ||
              (box.right > stage.right + 1 && !cut.includes('end')) ||
              (box.bottom > stage.bottom + 1 && !cut.includes('bottom'))
            );
          })
          .map((card) => `${name}: ${card.className}`);
      }),
    );
    expect(cutPopups, route).toEqual([]);
  }
});

test('on a phone, no gallery tile breaks a word across lines', async ({ page }) => {
  // Each component lays out as wide as it is written for, such as a notification at its own width,
  // and is drawn smaller to fit its stage, rather than squeezed until a word breaks mid-way.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${siteDevUrl}/components`);
  const tiles = page.locator('.catalogue-gallery-tile');
  await expect(tiles.first()).toBeVisible();
  const count = await tiles.count();
  for (let index = 0; index < count; index += 4) await tiles.nth(index).scrollIntoViewIfNeeded();
  const broken = () =>
    tiles.evaluateAll((items) =>
      items.flatMap((tile) => {
        const canvas = tile.querySelector('.catalogue-tile-canvas[data-fitted]');
        if (!canvas) return [`${tile.textContent}: not fitted`];
        const name = tile.querySelector('.catalogue-gallery-name')?.textContent;
        const walker = document.createTreeWalker(canvas, NodeFilter.SHOW_TEXT);
        const found: string[] = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.parentElement?.checkVisibility({ visibilityProperty: true })) continue;
          for (const word of node.textContent!.matchAll(/\S{2,}/g)) {
            const range = document.createRange();
            range.setStart(node, word.index);
            range.setEnd(node, word.index + word[0].length);
            // The lines a word's boxes stand on: more than one where it breaks.
            const lines = new Set(
              [...range.getClientRects()]
                .filter((box) => box.width > 0)
                .map((box) => Math.round(box.bottom)),
            );
            if (lines.size > 1) found.push(`${name}: ${word[0]}`);
          }
        }
        return found;
      }),
    );
  await expect.poll(broken).toEqual([]);
});

test('the gallery renders its tiles ahead of the scroll, before they come into view', async ({
  page,
}) => {
  // The page scrolls inside the scaffold's body: a tile below the fold is drawn by the time it is
  // scrolled to, rather than fading in as it comes into view (useNear, Related.tsx).
  for (const route of ['/components', '/patterns']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${siteDevUrl}${route}`);
    await expect(page.locator('.catalogue-tile-canvas[data-fitted]').first()).toBeVisible();
    // The tiles whose stage starts within a screen below the fold, unscrolled.
    const below = () =>
      page.locator('.catalogue-gallery-tile').evaluateAll((tiles) =>
        tiles
          .filter((tile) => {
            const { top } = tile.getBoundingClientRect();
            return top > innerHeight && top < innerHeight + 400;
          })
          .map((tile) => Boolean(tile.querySelector('.catalogue-tile-canvas[data-fitted]'))),
      );
    expect((await below()).length, route).toBeGreaterThan(0);
    await expect.poll(async () => (await below()).every(Boolean), { message: route }).toBe(true);
  }
});

/**
 * In the page: waits until every gallery tile whose stage shows whole has been still for half a
 * second, then reads each one's view over 60 frames, and again after the page scrolls a little.
 * A popup is placed against the stage's and the window's edges, so a view that followed it each
 * time would never stop (holdsFrame, useFit.ts).
 */
const stillTiles = (page: Page, from: number) =>
  page.evaluate(async (from) => {
    const frame = () => new Promise(requestAnimationFrame);
    const tiles = [...document.querySelectorAll<HTMLElement>('.catalogue-gallery-tile')];
    const whole = () =>
      tiles.filter((tile) => {
        const box = tile.querySelector('.catalogue-tile-stage')!.getBoundingClientRect();
        return (
          box.top >= 0 && box.bottom <= innerHeight && box.left >= 0 && box.right <= innerWidth
        );
      });
    const nameOf = (tile: Element) => tile.querySelector('.catalogue-gallery-name')!.textContent!;
    const viewOf = (tile: Element) =>
      tile.querySelector<HTMLElement>('.catalogue-tile-canvas[data-fitted]')?.style.transform;
    tiles[from]!.scrollIntoView({ block: 'start' });
    const shown = whole();
    // Still for 30 frames running, within four seconds.
    let calm = 0;
    let last = shown.map(viewOf).join();
    for (const start = performance.now(); calm < 30 && performance.now() - start < 4000;) {
      await frame();
      const now = shown.map(viewOf).join();
      calm = now === last && !now.includes(',,') && shown.every(viewOf) ? calm + 1 : 0;
      last = now;
    }
    const seen = shown.map((tile) => new Set([viewOf(tile)]));
    for (let count = 0; count < 60; count++) {
      await frame();
      shown.forEach((tile, index) => seen[index]!.add(viewOf(tile)));
    }
    const moving = shown.flatMap((tile, index) =>
      seen[index]!.size > 1
        ? [`${nameOf(tile)}: ${[...seen[index]!].slice(0, 3).join(' | ')}`]
        : [],
    );
    // Scrolled a little, each tile that still shows whole holds its view.
    const views = new Map(shown.map((tile) => [tile, viewOf(tile)]));
    let scroller: HTMLElement | null = tiles[from]!;
    while (
      scroller &&
      !(
        scroller.scrollHeight > scroller.clientHeight + 1 &&
        /auto|scroll/.test(getComputedStyle(scroller).overflowY)
      )
    )
      scroller = scroller.parentElement;
    scroller?.scrollBy(0, 60);
    for (let count = 0; count < 30; count++) await frame();
    const reframed = whole()
      .filter((tile) => views.has(tile) && views.get(tile) !== viewOf(tile))
      .map((tile) => `${nameOf(tile)}: ${views.get(tile)} → ${viewOf(tile)}`);
    return {
      moving,
      reframed,
      next: Math.max(from + 1, ...shown.map((tile) => tiles.indexOf(tile) + 1)),
      count: tiles.length,
    };
  }, from);

for (const [width, scale] of [
  [1280, 1.5],
  [1536, 1.25],
  [1920, 1],
] as const)
  test.describe(`at ${width} px wide, ${scale} device px to a px`, () => {
    test.use({ viewport: { width, height: 864 }, deviceScaleFactor: scale });
    test('every gallery tile at rest holds still, also as the page scrolls', async ({ page }) => {
      // Such as a menu bar resting with its menu open: the view eases to its frame and stops,
      // rather than following its popup as it is placed again a fraction away, every frame.
      test.setTimeout(240_000);
      for (const route of ['/components', '/patterns']) {
        await page.goto(`${siteDevUrl}${route}`);
        await page.mouse.move(0, 0);
        await expect(page.locator('.catalogue-tile-canvas[data-fitted]').first()).toBeVisible();
        const moving: string[] = [];
        const reframed: string[] = [];
        for (let from = 0, count = 1; from < count;) {
          const found = await stillTiles(page, from);
          moving.push(...found.moving);
          reframed.push(...found.reframed);
          ({ next: from, count } = found);
        }
        expect(moving, `${route}: tiles that never hold still`).toEqual([]);
        expect(reframed, `${route}: tiles framed again as the page scrolls`).toEqual([]);
      }
    });
  });
