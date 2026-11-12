// Checks that every page's contents list is whole from its first render: a part that loads with
// the page, such as an example, a specimen or the token reference, and a section that renders after
// the first, adds nothing to it, removes nothing and renames nothing. It opens every page of the
// catalogue and the Docs in a desktop window, where the contents show beside the page, with the
// parts held back, reads the contents in the first frame that paints the page, then lets the parts
// load, scrolls through the page and reads them again. The contents come from the page's data
// (usePageContents), so it also checks that they list the page's own h2 headings once loaded, in
// order, by their ids and words: those of the page itself, not of its examples, figures or tiles.
//
//   node scripts/test/CheckContents.ts                the site at http://127.0.0.1:8770 (npm run dev)
//   node scripts/test/CheckContents.ts <site URL>     another running site in development
//   node scripts/test/CheckContents.ts -- --only components/button,docs/tokens
//
// It runs against the site in development, where each part is a file of its own that it can hold
// back. It exits with 1 when a page's contents changed after its first render.
import { chromium, type Browser, type Route } from '@playwright/test';
import { defaultPorts } from './CheckoutMarker.ts';

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const onlyIndex = args.indexOf('--only');
const only = onlyIndex === -1 ? undefined : args.splice(onlyIndex, 2)[1].split(',');
const site = (args[0] ?? `http://127.0.0.1:${defaultPorts.site}`).replace(/\/$/, '');
/** A desktop window, wide enough for the contents beside the page. */
const window = { width: 1440, height: 1000 };
/** The files of the parts a page loads after its first render, each its own file in development. */
const parts =
  /\/src\/(examples|specimens|figures\/dev-mode)\/|\/src\/pages\/(TokenReference|Changelog)\.tsx|\/ColorPalette\.tsx|\/IconCatalogue\.tsx/;
/** How many pages are checked at once. */
const parallel = 4;

/** Every page of the catalogue and the Docs, from the galleries, the Docs' home and the navigation. */
async function routes(browser: Browser) {
  const page = await browser.newPage({ viewport: window });
  const found = new Set<string>(['components', 'patterns', 'foundations', 'docs']);
  for (const index of ['components', 'patterns', 'foundations', 'docs']) {
    await page.goto(`${site}/${index}`);
    await page.locator('.site-page-column h1').first().waitFor();
    const links = await page
      .locator('.site-page-column a[href^="/"], .env-scaffold-navigation a[href^="/"]')
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')!));
    for (const href of links) found.add(href.slice(1).split(/[?#]/)[0]);
  }
  await page.close();
  found.delete('');
  return [...found].sort();
}

/** The contents as a page shows them: each link's level, target and words, one to a line. */
const readContents = () =>
  [...document.querySelectorAll<HTMLAnchorElement>('.site-contents-list a')].map((link) => {
    let depth = 0;
    for (let item = link.closest('li'); item; item = item.parentElement!.closest('li')) depth++;
    return `${'  '.repeat(depth - 1)}${link.getAttribute('href')} ${link.textContent.trim()}`;
  });

/**
 * The page's own h2 headings, as the contents list them: those outside its examples, figures,
 * tiles and open dialogs, and outside what the page hides; none on a page without contents.
 */
const readHeadings = () =>
  [
    ...(document.querySelector('.site-contents-list')
      ? document.querySelectorAll<HTMLElement>('.site-page-column h2')
      : []),
  ]
    .filter((heading) => {
      if (
        heading.closest(
          '.site-live-example, .site-verdict-stage, .site-anatomy-stage, .catalogue-open-example, .catalogue-specimen, .catalogue-tile-stage, .env-dialog, .env-table-of-contents',
        )
      )
        return false;
      const hider = heading.closest('[hidden], [inert], [aria-hidden="true"]');
      return (
        !hider || (!hider.hasAttribute('hidden') && Boolean(hider.closest('[data-base-ui-inert]')))
      );
    })
    .map((heading) => {
      const copy = heading.cloneNode(true) as HTMLElement;
      for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
      return `#${heading.id} ${copy.textContent.replace(/\s+/g, ' ').trim()}`;
    });

/** The contents of one page at its first render and once it has loaded, as lines. */
async function check(browser: Browser, route: string) {
  const context = await browser.newContext({ viewport: window });
  const page = await context.newPage();
  const held: Route[] = [];
  let holding = true;
  await page.route(parts, (request) => (holding ? held.push(request) : request.continue()));
  // The contents in the first frame that paints the page's heading.
  await page.addInitScript(
    `(${(read: string) => {
      const take = () => {
        if (document.querySelector('.site-page-column h1'))
          (globalThis as { firstContents?: string[] }).firstContents = (0, eval)(read)();
        else requestAnimationFrame(take);
      };
      requestAnimationFrame(take);
    }})(${JSON.stringify(`(${readContents})`)})`,
  );
  try {
    await page.goto(`${site}/${route}`);
    // A part the first render waits for is let go after a while, and the first render read then.
    const first = await page
      .waitForFunction(() => (globalThis as { firstContents?: string[] }).firstContents, null, {
        timeout: 8000,
      })
      .then((handle) => handle.jsonValue() as Promise<string[]>)
      .catch(() => undefined);
    holding = false;
    for (const request of held.splice(0)) await request.continue().catch(() => {});
    const firstContents: string[] =
      first ??
      (await page
        .waitForFunction(() => (globalThis as { firstContents?: string[] }).firstContents)
        .then((handle) => handle.jsonValue() as Promise<string[]>));
    // Everything loads: each section shows, every skeleton has gone, and parts near the view, as
    // a gallery's tiles, load as the page scrolls through.
    await page.waitForFunction(
      () => !document.querySelector('.site-section-groups[aria-busy], .docs-api[aria-busy]'),
    );
    await page.evaluate(async () => {
      const main = document.getElementById('site-main')!;
      for (let top = 0; top < main.scrollHeight; top += main.clientHeight) {
        main.scrollTo({ top });
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
    });
    await page
      .locator('.site-loading')
      .first()
      .waitFor({ state: 'detached', timeout: 30_000 })
      .catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);
    const loaded = await page.evaluate(readContents);
    const headings = await page.evaluate(readHeadings);
    return { first: firstContents, loaded, headings, waited: !first };
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch();
let changed = 0;
try {
  const all = only ?? (await routes(browser));
  console.log(`Checking the contents of ${all.length} pages at ${site}.`);
  const queue = [...all];
  await Promise.all(
    Array.from({ length: parallel }, async () => {
      for (let route = queue.shift(); route !== undefined; route = queue.shift()) {
        try {
          const { first, loaded, headings, waited } = await check(browser, route);
          const same = first.join('\n') === loaded.join('\n');
          const note = waited ? ' (its first render waited for a part held back)' : '';
          if (same && loaded.join('\n') !== headings.join('\n')) {
            changed++;
            console.log(`FAIL ${route}: the contents don't list the page's own headings`);
            for (const line of loaded.filter((entry) => !headings.includes(entry)))
              console.log(`       listed, no such heading: ${line}`);
            for (const line of headings.filter((entry) => !loaded.includes(entry)))
              console.log(`       a heading not listed: ${line}`);
            continue;
          }
          if (same) {
            console.log(`ok   ${route}: ${loaded.length} entries${note}`);
            continue;
          }
          changed++;
          const gone = first.filter((line) => !loaded.includes(line));
          const added = loaded.filter((line) => !first.includes(line));
          console.log(
            `FAIL ${route}: ${first.length} entries first, ${loaded.length} loaded${note}`,
          );
          for (const line of gone) console.log(`       - ${line}`);
          for (const line of added) console.log(`       + ${line}`);
          if (!gone.length && !added.length) console.log('       (the same entries, reordered)');
        } catch (error) {
          changed++;
          console.log(`FAIL ${route}: not checked, ${(error as Error).message.split('\n')[0]}`);
        }
      }
    }),
  );
  console.log(
    changed
      ? `${changed} of ${all.length} pages changed their contents after the first render or list other than their headings.`
      : `Every page's contents are whole from the first render (${all.length} pages).`,
  );
} finally {
  await browser.close();
}
process.exitCode = changed ? 1 : 0;
