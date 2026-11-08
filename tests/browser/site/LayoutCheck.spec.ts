/**
 * Every catalogue example and pattern example passes dev mode's `layout.check()` at 22, 40, 60 and
 * 80 rem, one of envUI's completion checks. Each figure the documentation places, an example, a do
 * or an anatomy figure, opens on its own in the fixture (`?fixture=layout-check`, on the
 * catalogue's stage), and is measured at each width with the window at that width too, so its open
 * overlays are placed for the window they are checked against. A don't figure shows a mistake on
 * purpose, so a figure whose fence is `dont=` is left out; every other figure is checked.
 *
 * It renders hundreds of examples, so it runs in the full tier (`npm run verify`), and in the
 * affected tier when the examples, the pages that place them or dev mode's checks change
 * (scripts/test/TestScope.ts); the fast tier leaves it to those.
 */
import { test, expect, type Page } from '@playwright/test';
import type { LayoutProblem, LayoutProblemRule } from '@envsemble/envui/dev';
import { documents } from '../../../apps/site/src/generated/Documentation';
import { fixtureUrl } from '../helpers/Servers';

/** The widths of the completion check, in rem. */
const widths = [22, 40, 60, 80] as const;
type Width = (typeof widths)[number];
/** The window's height while measuring, as a laptop's or a phone's. */
const windowHeight = 800;

/** A figure of a component or pattern page: its page, its example file and how it is shown. */
interface Figure {
  page: string;
  name: string;
  role: 'example' | 'do' | 'caution' | 'anatomy' | 'variants';
}

/** Every figure the documentation places, but the don'ts, which show mistakes on purpose. */
const figures: Figure[] = documents.flatMap((document) =>
  (document.outline ?? []).flatMap((section) =>
    section.examples.flatMap((block) =>
      block.role !== 'dont'
        ? [{ page: document.id, name: block.name, role: block.role ?? 'example' }]
        : [],
    ),
  ),
);

/**
 * A problem an example has on purpose, or that the readout can't tell from a fault, allowed for
 * that example only, at the widths given (else at every width), by its rule and its node's path.
 * Each says why. An allowance that matches nothing fails the test, so none outlives its reason.
 */
interface Allowance {
  page: string;
  name: string;
  rule: LayoutProblemRule;
  /** The problem's path, as the readout writes it, or its end, such as `column "env-card"`. */
  path: string;
  widths?: Width[];
  reason: string;
}
const allowances: Allowance[] = [];

/** Waits until the example's fonts, motion and placement have settled. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Motion that ends, not a spinner's, which never does, nor one on a scroll timeline, such as a
    // table region's edge fade, which follows the scroll rather than time; one cancelled on the way
    // ends too.
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.timeline === document.timeline &&
            animation.effect?.getComputedTiming().endTime !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => undefined)),
    );
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    // The boxes of the root and of what floats, until two frames in a row agree: a popup is
    // placed a frame or two after the window resizes.
    const boxes = () =>
      Array.from(
        document.querySelectorAll(
          '[data-testid="layout-check-root"], [data-side], [role="dialog"], [role="alertdialog"], [role="tooltip"], [role="menu"], [role="listbox"], [popover]',
        ),
      )
        .map((element) => {
          const box = element.getBoundingClientRect();
          return `${box.x},${box.y},${box.width},${box.height}`;
        })
        .join(';');
    let last = boxes();
    for (let stable = 0, count = 0; stable < 2 && count < 60; count++) {
      await frame();
      const next = boxes();
      stable = next === last ? stable + 1 : 0;
      last = next;
    }
  });
}

const allowed = (figure: Figure, width: Width, problem: LayoutProblem) =>
  allowances.find(
    (allowance) =>
      allowance.page === figure.page &&
      allowance.name === figure.name &&
      allowance.rule === problem.rule &&
      (problem.path === allowance.path || problem.path.endsWith(` > ${allowance.path}`)) &&
      (!allowance.widths || allowance.widths.includes(width)),
  );

test.use({ reducedMotion: 'reduce' });

/** Measures one figure at each width; the problems not allowed, written out, and the readouts. */
async function measureFigure(browser: Page, figure: Figure) {
  const found: string[] = [];
  const readouts: string[] = [];
  const used = new Set<Allowance>();
  for (const width of widths) {
    await browser.setViewportSize({ width: width * 16, height: windowHeight });
    await settle(browser);
    const [result] = await browser.evaluate(
      (rem) =>
        window.envui!.layout!.at([`${rem}rem`], { root: '[data-testid="layout-check-root"]' }),
      width,
    );
    readouts.push(result.text);
    for (const problem of result.problems) {
      const allowance = allowed(figure, width, problem);
      if (allowance) used.add(allowance);
      else found.push(`${width}rem ${problem.rule} at ${problem.path}: ${problem.message}`);
    }
  }
  for (const allowance of allowances)
    if (allowance.page === figure.page && allowance.name === figure.name && !used.has(allowance))
      found.push(`the allowance of ${allowance.rule} at ${allowance.path} matches nothing`);
  return { found, readouts };
}

for (const page of new Set(figures.map((figure) => figure.page)))
  test.describe(page, () => {
    for (const figure of figures.filter((each) => each.page === page)) {
      const title = `${figure.name}${figure.role === 'example' ? '' : ` (${figure.role})`}`;
      test(title, async ({ page: browser }, testInfo) => {
        test.setTimeout(60_000);
        const errors: string[] = [];
        browser.on('pageerror', (error) => errors.push(`throws: ${error.message}`));
        await browser.goto(
          `${fixtureUrl}/?fixture=layout-check&page=${figure.page}&name=${figure.name}`,
        );
        await expect(browser.locator('[data-rendered], [data-example-error]')).toHaveCount(1);
        // An example that throws, with what it threw.
        expect(await browser.locator('[data-example-error]').allTextContents()).toEqual([]);
        const { found, readouts } = await measureFigure(browser, figure);
        // The readout at each width, to find the nodes the problems name.
        if (errors.length || found.length)
          await testInfo.attach('readouts', {
            body: readouts.join('\n\n'),
            contentType: 'text/plain',
          });
        expect(
          [...errors, ...found],
          `apps/site/src/examples/${figure.page}/${figure.name}.tsx`,
        ).toEqual([]);
      });
    }
  });
