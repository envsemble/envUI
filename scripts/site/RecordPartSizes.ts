// Records the size of every figure's subject that loads with its page, an example, a specimen or a
// guide's figure, in apps/site/src/loading/PartSizes.json: its skeleton keeps that size while it
// loads (StageSkeleton in loading/Loading.tsx), so the page doesn't move when it lands. Of an
// example shown open, it records its stage too, which keeps that height until its overlays rest
// open in it (reserveStage in OpenExample.tsx). It opens every page of the catalogue and the Docs
// in a desktop window with the parts held back, notes where each skeleton is, lets the parts load
// and measures what took each one's place. It records the room of each group of the token
// reference and each release of the changelog too, which their skeletons keep.
//
//   npm run site:part-sizes                the site at http://127.0.0.1:8770 (npm run dev)
//   npm run site:part-sizes -- <site URL>  another running site
//
// Run it when figures change size, such as after adding examples, and commit the record. A part it
// hasn't recorded keeps the stage's least height while it loads, so a stale record only moves the
// page a little.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium, type Page, type Route } from '@playwright/test';
import { defaultPorts } from '../test/CheckoutMarker.ts';

const site = (process.argv[2] ?? `http://127.0.0.1:${defaultPorts.site}`).replace(/\/$/, '');
const recordFile = fileURLToPath(
  new URL('../../apps/site/src/loading/PartSizes.json', import.meta.url),
);
/** The window the sizes are recorded in, a desktop's, beside the page's contents. */
const window = { width: 1440, height: 1000 };
/** The files of the parts a page loads on its own, in development, where each is its own file. */
const parts = /\/src\/(examples|specimens|figures\/dev-mode)\//;

/** Every page of the catalogue and the Docs, from the galleries and the Docs' home. */
async function routes(page: Page) {
  const found = new Set<string>(['components', 'patterns', 'foundations', 'docs']);
  for (const index of ['components', 'patterns', 'foundations', 'docs']) {
    await page.goto(`${site}/${index}`);
    await page.locator('.site-page-column h1').first().waitFor();
    const links = await page
      .locator('.site-page-column a[href^="/"], .env-scaffold-navigation a[href^="/"]')
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')!));
    for (const href of links) found.add(href.slice(1).split(/[?#]/)[0]!);
  }
  found.delete('');
  return [...found].sort();
}

/** The sizes of the parts on one page, by their keys, in rem. */
async function measure(page: Page, route: string) {
  const held: Route[] = [];
  let holding = true;
  await page.route(parts, (request) => (holding ? held.push(request) : request.continue()));
  await page.goto(`${site}/${route}`);
  await page.locator('.site-page-column h1').first().waitFor();
  // Every skeleton has rendered once the requests stop growing.
  let count = -1;
  while (count !== held.length) {
    count = held.length;
    await page.waitForTimeout(800);
  }
  // Where each skeleton is: between the elements beside it, which are there before and after it
  // loads, so what lands between them is the part. A skeleton beside another isn't measured, as
  // what lands there could be either's.
  const marked = await page.evaluate(() => {
    const keys: string[] = [];
    document.querySelectorAll<HTMLElement>('[data-site-part]').forEach((skeleton, index) => {
      const before = skeleton.previousElementSibling;
      const after = skeleton.nextElementSibling;
      if (before?.hasAttribute('data-site-part') || after?.hasAttribute('data-site-part')) return;
      const parent = skeleton.parentElement!;
      // The key, and which of the elements beside it there are.
      parent.setAttribute(
        `data-record-${index}`,
        JSON.stringify([skeleton.dataset.sitePart, Boolean(before), Boolean(after)]),
      );
      before?.setAttribute(`data-record-before-${index}`, '');
      after?.setAttribute(`data-record-after-${index}`, '');
      keys.push(skeleton.dataset.sitePart!);
    });
    return keys;
  });
  holding = false;
  for (const request of held) await request.continue().catch(() => {});
  await page.locator('[data-site-part]').first().waitFor({ state: 'detached', timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  // Entrances settle, and a figure that plays reaches its tallest.
  await page.waitForTimeout(1500);
  const sizes = await page.evaluate(() => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const round = (value: number) => Math.round((value / rem) * 100) / 100;
    const result: Record<string, [number, number]> = {};
    for (const parent of document.querySelectorAll<HTMLElement>('*')) {
      for (const mark of parent.attributes) {
        if (!/^data-record-\d+$/.test(mark.name)) continue;
        const index = mark.name.slice('data-record-'.length);
        const [key, hadBefore, hadAfter] = JSON.parse(mark.value) as [string, boolean, boolean];
        const children = [...parent.children];
        const before = children.findIndex((child) =>
          child.hasAttribute(`data-record-before-${index}`),
        );
        const after = children.findIndex((child) =>
          child.hasAttribute(`data-record-after-${index}`),
        );
        // An element beside it that the page rendered anew leaves the part's place unknown.
        if ((hadBefore && before === -1) || (hadAfter && after === -1)) continue;
        const boxes = children
          .slice(before + 1, after === -1 ? undefined : after)
          .map((child) => child.getBoundingClientRect())
          .filter((box) => box.width > 0 || box.height > 0);
        if (!boxes.length) continue;
        const left = Math.min(...boxes.map((box) => box.left));
        const right = Math.max(...boxes.map((box) => box.right));
        const top = Math.min(...boxes.map((box) => box.top));
        const bottom = Math.max(...boxes.map((box) => box.bottom));
        result[key] = [round(right - left), round(bottom - top)];
      }
    }
    return result;
  });
  // The stage of each example shown open, with its overlays resting open in it, which it keeps
  // from as it starts loading until they rest there (reserveStage in OpenExample.tsx).
  Object.assign(
    sizes,
    await page.evaluate(() => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const round = (value: number) => Math.round((value / rem) * 100) / 100;
      const result: Record<string, [number, number]> = {};
      for (const room of document.querySelectorAll<HTMLElement>(
        '[data-catalogue-reserve][data-placed]',
      )) {
        const stage = room.closest('.site-live-example');
        if (!stage) continue;
        const box = stage.getBoundingClientRect();
        result[room.dataset.catalogueReserve!] = [round(box.width), round(box.height)];
      }
      return result;
    }),
  );
  // The long parts, whose skeletons keep the room they take once loaded: each group of the token
  // reference, with its heading, and each release of the changelog, from its heading to the next.
  await page
    .locator('.site-loading')
    .first()
    .waitFor({ state: 'detached', timeout: 30_000 })
    .catch(() => {});
  Object.assign(
    sizes,
    await page.evaluate(() => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const round = (value: number) => Math.round((value / rem) * 100) / 100;
      const result: Record<string, [number, number]> = {};
      for (const group of document.querySelectorAll('section[aria-labelledby^="tokens-"]')) {
        const box = group.getBoundingClientRect();
        result[`tokens:${group.querySelector('h2')?.textContent}`] = [
          round(box.width),
          round(box.height),
        ];
      }
      const releases = [
        ...document.querySelectorAll<HTMLElement>(
          '[aria-labelledby="every-change"] .env-markdown h3',
        ),
      ];
      releases.forEach((heading, index) => {
        const top = heading.getBoundingClientRect().top;
        const end =
          releases[index + 1]?.getBoundingClientRect().top ??
          heading.parentElement!.getBoundingClientRect().bottom;
        result[`changelog:### ${heading.textContent?.trim()}`] = [
          round(heading.parentElement!.getBoundingClientRect().width),
          round(end - top),
        ];
      });
      return result;
    }),
  );
  await page.unroute(parts);
  return { marked, sizes };
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: window });
  const record: Record<string, [number, number]> = {};
  for (const route of await routes(page)) {
    let measured: Awaited<ReturnType<typeof measure>>;
    try {
      measured = await measure(page, route);
    } catch (error) {
      console.log(`${route}: not measured, ${(error as Error).message.split('\n')[0]}`);
      await page.unroute(parts);
      continue;
    }
    const { marked, sizes } = measured;
    // A part placed on several pages keeps the size of its first.
    for (const [key, size] of Object.entries(sizes)) record[key] ??= size;
    const missing = marked.filter((key) => !sizes[key]);
    console.log(
      `${route}: ${Object.keys(sizes).length} parts${missing.length ? `, none measured for ${missing.join(', ')}` : ''}`,
    );
  }
  const sorted = Object.fromEntries(
    Object.keys(record)
      .sort()
      .map((key) => [key, record[key]]),
  );
  // One part to a line, as Prettier keeps it.
  const comment =
    'Recorded by scripts/site/RecordPartSizes.ts (npm run site:part-sizes): the width and height, in rem, of each part that loads with a page, which its skeleton keeps while it loads.';
  const lines = [
    `  "$comment": ${JSON.stringify(comment)}`,
    ...Object.entries(sorted).map(
      ([key, size]) => `  ${JSON.stringify(key)}: [${size.join(', ')}]`,
    ),
  ];
  writeFileSync(recordFile, `{\n${lines.join(',\n')}\n}\n`);
  console.log(`Wrote ${Object.keys(sorted).length} sizes to ${recordFile}.`);
} finally {
  await browser.close();
}
