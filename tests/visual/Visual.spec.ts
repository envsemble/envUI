/**
 * Visual baseline: screenshots of today's identity, so that later changes are deliberate and
 * reviewed as image diffs. Every catalogue page's preview specimens and forced interaction states
 * are captured in light, or its first live example when it has no specimen; the theme sample of
 * samplePages (CatalogueThemes.ts) is captured in dark and high contrast as well. So are a few
 * density specimens of the test fixture, and a few lists, a tooltip and the toasts captured open.
 * Pattern pages compose the components captured here, so they take no images of their own.
 *
 * Fonts and anti-aliasing differ between systems, so the baseline renders only in the Linux
 * Playwright image: `npm run test:visual` checks it, `npm run test:visual:update` rewrites it.
 * Snapshots live in tests/visual/snapshots; review their diffs like code. Each run also compares
 * the images a page takes with the files in its folder, so a specimen that stops rendering, or an
 * image no specimen takes any more, fails rather than passing unnoticed.
 */
import { existsSync, readdirSync, rmSync, type Dirent } from 'node:fs';
import { join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  test,
  expect,
  type ElementHandle,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';
import { catalogueUrl, fixtureUrl } from '../browser/Servers';
import {
  allThemes,
  chooseScheme,
  emulateContrast,
  themesFor,
  type CatalogueTheme,
  type ThemeName,
} from '../browser/CatalogueThemes';
import { referencePages } from '../../apps/catalogue/src/navigation/DocumentationRoutes';

/**
 * The density fixture's sections captured, each with a theme its boundaries take from the address:
 * the sizes, a form and the mixed desktop view in light, and the desktop view in dark.
 */
const densityShots = [
  { section: 'sizes', theme: 'light' },
  { section: 'form', theme: 'light' },
  { section: 'desktop', theme: 'light' },
  { section: 'desktop', theme: 'dark' },
] as const;
/** Relative times, calendars and generated activity are drawn against this moment. */
const now = new Date('2026-03-04T10:00:00Z');
const snapshots = fileURLToPath(new URL('./snapshots/', import.meta.url));
/**
 * The forced-state matrices of InteractionStates.ts, by catalogue page and matrix label. A page
 * must show exactly these, so a matrix that disappears, or a new one, fails until it is listed.
 */
const stateMatrices: Record<string, string[]> = {
  button: ['Button'],
};

/**
 * A list or other popup the baseline captures open, beside its trigger, from a catalogue specimen or
 * example.
 */
interface OpenList {
  /** Names the snapshot after its theme: open/<theme>-<name>.png. */
  name: string;
  /** The themes it is captured in. */
  themes: readonly ThemeName[];
  /** The catalogue page and view that show the list. */
  route: string;
  /** The control that opens the list. */
  trigger: (page: Page) => Locator;
  /** The key that opens the list from the focused trigger. */
  key?: string;
  /** Opens the popups otherwise than with `key` from the focused trigger. */
  open?: (page: Page, trigger: ElementHandle) => Promise<void>;
  /** The open popup: the listbox, menu or dialog, or every toast shown. */
  popup: (page: Page) => Locator;
  /** How many popups open: several toasts stack. Defaults to one. */
  count?: number;
  /** The option or item highlighted as the list opens from the keyboard; none for a tooltip or toasts. */
  highlighted?: string;
  /**
   * The list moves focus to its highlighted option, as a select or menu does, a moment after it
   * opens; the capture waits for it, so the focus ring is on the option rather than the trigger. A
   * combobox and the palette keep focus in their input.
   */
  focusesHighlighted?: boolean;
  /** Pixels that may differ, where some edges are drawn a few levels apart from run to run. */
  maxDiffPixels?: number;
  /** A modal palette covers the page, so its capture leaves the trigger out. */
  withTrigger: boolean;
  /**
   * Stops the page's timers before the popups open and runs only the frames they need to enter,
   * so toasts that close after a few seconds stay for the capture.
   */
  pauseTimers?: boolean;
}

const liveExample = (page: Page, name: string) =>
  page.locator(`.docs-live-example[data-example="${name}"]`);

/**
 * The popups the test opened, without those of the figures shown open as pictures, which render
 * into a layer of their own figure.
 */
const opened = (page: Page, popups: Locator) =>
  popups.and(page.locator(':not(.docs-open-example *)'));

/** Toasts of the tones example, shown in order and captured stacked, with their timers stopped. */
function toasts(name: string, tones: string[], themes: readonly ThemeName[]): OpenList {
  const show = (page: Page, tone: string) =>
    liveExample(page, 'Tones').getByRole('button', { name: `Show ${tone}`, exact: true });
  return {
    name,
    themes,
    route: 'components/toast',
    trigger: (page) => show(page, tones[0]),
    open: async (page) => {
      for (const tone of tones) await press(page, show(page, tone));
    },
    popup: (page) => opened(page, page.locator('.env-toast')),
    count: tones.length,
    withTrigger: false,
    pauseTimers: true,
  };
}

/**
 * Each list opens from the keyboard with its trigger focused and the pointer parked, so no hover
 * paints into the shot and the component alone picks the highlighted option: a select or combobox
 * highlights its selected option, a menu its first item and the palette its first result. Each
 * capture checks that highlight before it compares. Each is captured in light; the menu, select,
 * tooltip and toasts in dark too, and the menu and select in light high contrast.
 */
const openLists: OpenList[] = [
  {
    name: 'select',
    themes: ['light', 'dark', 'light-hc'],
    route: 'components/select',
    trigger: (page) =>
      liveExample(page, 'ProjectVisibility').getByRole('combobox', {
        name: 'Visibility',
        exact: true,
      }),
    key: 'Space',
    popup: (page) => opened(page, page.getByRole('listbox')),
    // Team is selected; Public is a disabled option below it.
    highlighted: 'Team',
    focusesHighlighted: true,
    withTrigger: true,
  },
  {
    name: 'select-small',
    themes: ['light'],
    route: 'components/select',
    trigger: (page) =>
      liveExample(page, 'SmallToolbar').getByRole('combobox', { name: 'Zoom', exact: true }),
    key: 'Space',
    popup: (page) => opened(page, page.getByRole('listbox')),
    highlighted: '100%',
    focusesHighlighted: true,
    withTrigger: true,
  },
  {
    name: 'combobox',
    themes: ['light'],
    route: 'components/combobox',
    trigger: (page) =>
      liveExample(page, 'ChooseOwner').getByRole('combobox', { name: 'Owner', exact: true }),
    key: 'ArrowDown',
    popup: (page) => opened(page, page.getByRole('listbox')),
    highlighted: 'Alex Morgan',
    // The avatars' round edges come out up to four levels apart between runs, a few pixels each.
    maxDiffPixels: 16,
    withTrigger: true,
  },
  {
    name: 'menu',
    themes: ['light', 'dark', 'light-hc'],
    route: 'components/menu',
    trigger: (page) =>
      liveExample(page, 'IconsAndShortcuts').getByRole('button', {
        name: 'More actions',
        exact: true,
      }),
    key: 'ArrowDown',
    popup: (page) => opened(page, page.getByRole('menu', { name: 'Report actions', exact: true })),
    highlighted: 'Rename',
    focusesHighlighted: true,
    withTrigger: true,
  },
  {
    name: 'menu-choices',
    themes: ['light'],
    route: 'components/menu',
    trigger: (page) =>
      liveExample(page, 'Choices').getByRole('button', { name: 'View', exact: true }),
    key: 'ArrowDown',
    popup: (page) => opened(page, page.getByRole('menu', { name: 'View options', exact: true })),
    highlighted: 'Name',
    focusesHighlighted: true,
    withTrigger: true,
  },
  {
    name: 'command-palette',
    themes: ['light'],
    route: 'components/command-palette',
    trigger: (page) =>
      liveExample(page, 'GoToDocument').getByRole('button', {
        name: 'Go to document',
        exact: true,
      }),
    key: 'Enter',
    popup: (page) =>
      opened(page, page.getByRole('dialog', { name: 'Go to document', exact: true })),
    highlighted: 'Roadmap.md',
    withTrigger: false,
  },
  {
    // A dark fill on a light page in the light themes: its edge must not read as a halo.
    name: 'tooltip',
    themes: ['light', 'dark'],
    route: 'components/tooltip',
    trigger: (page) =>
      liveExample(page, 'IconActions').getByRole('button', {
        name: 'Refresh members',
        exact: true,
      }),
    // Keyboard focus opens a tooltip at once: Shift+Tab and Tab give the trigger keyboard focus,
    // whatever focus the script gave it.
    open: async (page, trigger) => {
      await trigger.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
    },
    popup: (page) => opened(page, page.locator('.env-tooltip', { hasText: 'Refresh members' })),
    withTrigger: true,
  },
  // The strong fills of toasts, each with its edge. Three show at once, so the danger notice, which
  // stays until it is dismissed, is captured on its own.
  toasts('toasts', ['neutral', 'success', 'info'], ['light', 'dark']),
  toasts('toast-error', ['danger'], ['light']),
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

/**
 * Waits until no finite animation is running. It polls each animation's state rather than awaiting
 * its finished promise: Chromium does not resolve that promise for a transition inside a closed
 * disclosure, such as a theme change's under the interaction states, though the transition ends.
 */
async function finishAnimations(page: Page) {
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

/** Wait until fonts, lazy content and finite animations have finished. */
async function settle(page: Page) {
  await page
    .getByText(/^Loading .*…$/)
    .first()
    .waitFor({ state: 'detached' });
  await page.evaluate(() => document.fonts.ready);
  await finishAnimations(page);
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

/** Switches the catalogue to the theme's scheme in its Display menu, under the theme's contrast. */
async function setTheme(page: Page, theme: CatalogueTheme) {
  await emulateContrast(page, theme);
  const { scheme } = theme;
  if ((await page.locator('.docs-app').getAttribute('data-env-theme')) !== scheme) {
    await chooseScheme(page, scheme);
    await page.mouse.move(0, 0);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  }
  await page.locator(`.docs-app[data-env-theme="${scheme}"]`).waitFor();
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
 * Soft, so one run reports every changed image of a page. A specimen taller than the window is
 * captured in a window tall enough to hold it: scrolled through a shorter one, its image came out
 * shifted, with its top cut off and a blank band below.
 */
async function capture(locator: Locator, path: string[]) {
  const page = locator.page();
  await page.evaluate(() => window.scrollTo(0, 0));
  const viewport = page.viewportSize()!;
  const height = Math.ceil((await locator.boundingBox())?.height ?? 0) + 64;
  if (height > viewport.height) await page.setViewportSize({ ...viewport, height });
  try {
    await expect.soft(locator).toHaveScreenshot(path);
  } finally {
    if (height > viewport.height) await page.setViewportSize(viewport);
  }
}

/** Waits until open popups have finished growing in, so their boxes have their final size. */
async function settlePopups(page: Page, paused = false) {
  if (paused) {
    // A stopped clock runs no frames, so it runs a frame at a time until the popups have entered:
    // a fraction of a second against the seconds a toast stays.
    await expect
      .poll(async () => {
        await page.clock.runFor(16);
        return page.locator('[data-starting-style]').count();
      })
      .toBe(0);
    await page.clock.runFor(32);
  } else {
    await expect(page.locator('[data-starting-style]')).toHaveCount(0);
    // The transition starts in the frame after the starting style is removed.
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
  }
  await finishAnimations(page);
}

/** The viewport area around the elements, with room for their shadows. */
async function around(page: Page, elements: (Locator | ElementHandle)[]) {
  const boxes = await Promise.all(
    elements.map(async (element) => {
      const box = await element.boundingBox();
      if (!box) throw new Error(`${element} has no box`);
      return box;
    }),
  );
  const margin = 24;
  const viewport = page.viewportSize()!;
  const left = Math.max(0, Math.floor(Math.min(...boxes.map((box) => box.x)) - margin));
  const top = Math.max(0, Math.floor(Math.min(...boxes.map((box) => box.y)) - margin));
  const right = Math.min(
    viewport.width,
    Math.ceil(Math.max(...boxes.map((box) => box.x + box.width)) + margin),
  );
  const bottom = Math.min(
    viewport.height,
    Math.ceil(Math.max(...boxes.map((box) => box.y + box.height)) + margin),
  );
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function updating(testInfo: TestInfo) {
  return ['all', 'changed'].includes(testInfo.config.updateSnapshots);
}

/** What a snapshot folder holds, or nothing when it does not exist yet. */
function contents(directory: string) {
  return existsSync(directory) ? readdirSync(directory).sort() : [];
}

/**
 * Compares the images a test took with the files its folder held before it ran. A check fails on
 * either difference; an update removes the files no capture took, and only once every capture of
 * the test has succeeded, so a failed update deletes nothing.
 */
function reconcile(testInfo: TestInfo, directory: string, recorded: string[], taken: Set<string>) {
  const orphaned = recorded.filter((file) => !taken.has(file));
  if (updating(testInfo)) {
    if (testInfo.errors.length === 0)
      for (const file of orphaned) rmSync(join(directory, file), { recursive: true });
    return;
  }
  const missing = [...taken].filter((file) => !recorded.includes(file)).sort();
  expect(
    { missing, orphaned },
    `The images in ${directory} match the specimens; after an intended change run \`npm run test:visual:update\``,
  ).toEqual({ missing: [], orphaned: [] });
}

test.describe('catalogue', () => {
  for (const { path, reference } of referencePages) {
    test(`${reference.title} (${path})`, async ({ page }, testInfo) => {
      const directory = join(snapshots, 'catalogue', reference.id);
      const recorded = contents(directory);
      const taken = new Set<string>();
      const take = async (locator: Locator, file: string) => {
        taken.add(file);
        await capture(locator, ['catalogue', reference.id, file]);
      };
      // Each page shows its specimens, or its live examples, on one page: a foundation's visuals,
      // a component's figures, or Field's in the Docs.
      const visited = [path];
      await page.clock.setFixedTime(now);
      await page.goto(`${catalogueUrl}/${path}`);
      await page.locator('.docs-page-header').waitFor();
      for (const theme of themesFor(path)) {
        await setTheme(page, theme);
        const name = namer();
        let specimens = 0;
        const matrices: string[] = [];
        const open = async (route: string) => {
          await expect(page).toHaveURL(new RegExp(`/${route}$`));
          await settle(page);
        };
        for (const view of visited) {
          await open(view);
          const examples = page.locator(
            '.docs-preview .docs-example:not(.docs-example .docs-example)',
          );
          for (const example of await examples.all()) {
            if (!(await example.isVisible())) continue;
            // An example is named after its title; an untitled one after its specimen, such as
            // InteractionStates, or else its first disclosure or part heading.
            const own = example.locator(
              ':scope > :is(h2, h3), :scope > .docs-example-heading > :is(h2, h3)',
            );
            const specimen = await example.evaluate(
              (element) => element.closest('[data-specimen]')?.getAttribute('data-specimen') ?? '',
            );
            const part = example.locator('summary, h3, h4').first();
            const title = (await own.count())
              ? await own.first().textContent()
              : specimen
                ? specimen.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
                : (await part.count())
                  ? await part.textContent()
                  : '';
            await take(example, `${theme.name}-${name(slug(title ?? ''))}.png`);
            specimens++;
          }
          // The forced hover, pressed, focus and disabled states of InteractionStates.ts, opened
          // where the catalogue keeps them in a closed disclosure.
          const states = page.locator(
            '.docs-preview [role="region"][aria-label$="interaction states"]',
          );
          for (const matrix of await states.all()) {
            const label = ((await matrix.getAttribute('aria-label')) ?? '').replace(
              / interaction states$/,
              '',
            );
            matrices.push(label);
            const summary = matrix.locator('xpath=ancestor::details[1]/summary');
            const closed = (await summary.count()) > 0 && !(await matrix.isVisible());
            // A matrix shown open is already in its specimen's image.
            if (!closed) continue;
            await press(page, summary);
            await take(matrix, `${theme.name}-states-${name(slug(label))}.png`);
            await press(page, summary);
            await expect(matrix).toBeHidden();
          }
        }
        // A page without a specimen gives its first live example, named after its file.
        for (const view of specimens ? [] : visited) {
          await open(view);
          const example = page.locator('.docs-live-example[data-example]').first();
          if (!(await example.count())) continue;
          const file = (await example.getAttribute('data-example')) ?? '';
          await take(example, `${theme.name}-${name(`example-${slug(file)}`)}.png`);
          specimens++;
          break;
        }
        expect(specimens, `The ${theme.name} page shows at least one specimen`).toBeGreaterThan(0);
        expect(
          matrices.sort(),
          `The ${theme.name} page shows the interaction states listed in stateMatrices`,
        ).toEqual([...(stateMatrices[reference.id] ?? [])].sort());
      }
      reconcile(testInfo, directory, recorded, taken);
    });
  }
});

test.describe('density', () => {
  // The mixed desktop view is 80 rem wide; the evidence it reproduces used the same viewport.
  test.use({ viewport: { width: 1440, height: 1000 } });
  for (const { section, theme } of densityShots) {
    test(`${section} (${theme})`, async ({ page }) => {
      await page.clock.setFixedTime(now);
      await page.goto(`${fixtureUrl}/?fixture=density&section=${section}&theme=${theme}`);
      const specimen = page.locator(`[data-density-section="${section}"]`);
      await specimen.waitFor();
      await expect(specimen).not.toContainText('Unknown density section');
      await settle(page);
      await expect(specimen).toHaveScreenshot(['density', `${theme}-${section}.png`]);
    });
  }
});

test.describe('open lists', () => {
  for (const list of openLists) {
    for (const theme of allThemes.filter(({ name }) => list.themes.includes(name))) {
      test(`${list.name} (${theme.name})`, async ({ page }) => {
        // Timers keep running until just before the popups open, so the page and its animations settle.
        if (list.pauseTimers) await page.clock.install({ time: now });
        else await page.clock.setFixedTime(now);
        await page.goto(`${catalogueUrl}/${list.route}`);
        await page.locator('.docs-page-header').waitFor();
        await setTheme(page, theme);
        await settle(page);
        // A modal popup hides the rest of the page from role queries, so the trigger is held as
        // an element to measure once the list is open.
        const trigger = await list.trigger(page).elementHandle();
        if (!trigger) throw new Error(`No trigger for the ${list.name} list`);
        await trigger.evaluate((element) =>
          element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }),
        );
        await page.mouse.move(0, 0);
        // Toasts start their timers as they show, so the clock stops before they open. Nothing
        // waits on a timer yet, so the second it skips to stop changes nothing.
        if (list.pauseTimers)
          await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
        const popup = list.popup(page);
        // Options pass data-highlighted on to their parts, such as a radio item's indicator.
        const highlighted = popup.locator(
          '[data-highlighted]:not([data-highlighted] [data-highlighted])',
        );
        // A select or menu moves focus to its highlighted option a moment after it opens. On a busy
        // machine Base UI now and then leaves focus on the trigger instead, with the list open; the
        // list is then closed and opened again, at most twice, so the image shows the option focused.
        for (let attempt = 1; ; attempt++) {
          if (list.open) await list.open(page, trigger);
          else {
            await trigger.focus();
            await page.keyboard.press(list.key!);
          }
          await expect(popup).toHaveCount(list.count ?? 1);
          for (const each of await popup.all()) await expect(each).toBeVisible();
          await settlePopups(page, list.pauseTimers);
          if (!list.focusesHighlighted) break;
          try {
            await expect(highlighted).toBeFocused({ timeout: 2000 });
            break;
          } catch (error) {
            if (attempt === 3) throw error;
            await page.keyboard.press('Escape');
            await expect(popup).toHaveCount(0);
            await finishAnimations(page);
          }
        }
        if (list.highlighted) {
          await expect(highlighted).toHaveCount(1);
          await expect(highlighted).toContainText(list.highlighted);
        }
        const popups = await popup.all();
        await expect(page).toHaveScreenshot(['open', `${theme.name}-${list.name}.png`], {
          clip: await around(page, list.withTrigger ? [trigger, ...popups] : popups),
          maxDiffPixels: list.maxDiffPixels,
        });
      });
    }
  }
});

// Playwright requires the fixtures object as the first parameter, even when no fixture is used.
// eslint-disable-next-line no-empty-pattern
test('every snapshot folder belongs to a catalogue page, a density section or an open list', async ({}, testInfo) => {
  const pages = new Set(referencePages.map(({ reference }) => reference.id));
  const density = new Set(densityShots.map(({ section, theme }) => `${theme}-${section}.png`));
  const open = new Set(
    openLists.flatMap((list) => list.themes.map((theme) => `${theme}-${list.name}.png`)),
  );
  // A folder no capture has written yet holds nothing stale.
  const stale = (folder: string, belongs: (entry: Dirent) => boolean) =>
    existsSync(join(snapshots, folder))
      ? readdirSync(join(snapshots, folder), { withFileTypes: true })
          .filter((entry) => !belongs(entry))
          .map((entry) => posix.join(folder, entry.name))
      : [];
  const unused = [
    ...stale(
      '',
      (entry) => entry.isDirectory() && ['catalogue', 'density', 'open'].includes(entry.name),
    ),
    ...stale('catalogue', (entry) => entry.isDirectory() && pages.has(entry.name)),
    ...stale('density', (entry) => entry.isFile() && density.has(entry.name)),
    ...stale('open', (entry) => entry.isFile() && open.has(entry.name)),
  ];
  if (updating(testInfo)) {
    for (const path of unused) rmSync(join(snapshots, path), { recursive: true });
    return;
  }
  expect(
    unused,
    'Snapshots of pages or sections that no longer exist; run `npm run test:visual:update`',
  ).toEqual([]);
});
