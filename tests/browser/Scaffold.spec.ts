import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const scaffold = (query = '') => `${fixtureUrl}/?fixture=scaffold${query}`;
const scrollKeys = `${fixtureUrl}/?fixture=scroll-keys`;
const scaffoldPanes = `${fixtureUrl}/?fixture=scaffold-panes`;

const box = async (locator: Locator) => (await locator.boundingBox())!;

/** Which navigation form shows: the form whose slot has a box. */
const shownForms = (page: Page) =>
  page
    .locator('[data-navigation-form]')
    .evaluateAll((slots) =>
      slots
        .filter((slot) => getComputedStyle(slot).display !== 'none')
        .map((slot) => slot.getAttribute('data-navigation-form')),
    );

/** Waits two animation frames, by when the scaffold's effects have run and a smooth scroll moved. */
function twoFrames(page: Page) {
  return page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

test.describe('Scaffold', () => {
  test('shows one navigation form by its own width, compact first', async ({ page }) => {
    await page.goto(scaffold());
    const frame = page.getByTestId('frame');
    const body = page.getByRole('main');
    for (const [width, form] of [
      ['30rem', 'bar'],
      ['45rem', 'rail'],
      ['60rem', 'drawer'],
      ['80rem', 'drawer'],
    ] as const) {
      await page.getByRole('button', { name: `Width ${width}` }).click();
      await expect.poll(() => shownForms(page)).toEqual([form]);
      // Only the form that shows is in the accessibility tree.
      await expect(page.getByRole('navigation')).toHaveCount(1);
      await expect(page.getByRole('navigation', { name: `Main ${form}` })).toBeVisible();
      const navigation = await box(page.getByTestId(`${form}-form`));
      const content = await box(body);
      const outer = await box(frame);
      if (form === 'bar') {
        // At the bottom, across the width, below the body.
        expect(navigation.y).toBeGreaterThanOrEqual(content.y + content.height - 1);
        expect(navigation.width).toBeCloseTo(outer.width - 2, 0);
      } else {
        // At the start, beside the body, 0.5 rem clear of the window's edges, so its pane stands
        // apart.
        expect(navigation.x).toBeLessThan(content.x);
        expect(navigation.x).toBeCloseTo(outer.x + 1 + 8, 0);
        expect(navigation.y).toBeCloseTo(outer.y + 1 + 8, 0);
      }
    }
    // The window stayed as wide all along: the forms follow the scaffold's width, not the window's.
    expect(page.viewportSize()!.width).toBeGreaterThanOrEqual(80 * 16);
  });

  test('the forms per window class are the application’s to choose', async ({ page }) => {
    await page.goto(
      scaffold(
        `&width=30rem&forms=${encodeURIComponent(JSON.stringify({ compact: 'none', large: 'rail' }))}`,
      ),
    );
    await expect.poll(() => shownForms(page)).toEqual([]);
    await page.getByRole('button', { name: 'Width 80rem' }).click();
    await expect.poll(() => shownForms(page)).toEqual(['rail']);
    // Given only a drawer, it stands in at every width.
    await page.goto(scaffold('&width=30rem&only=drawer'));
    await expect.poll(() => shownForms(page)).toEqual(['drawer']);
  });

  test('is a banner, the navigation and a main, with skip links first', async ({ page }) => {
    await page.goto(scaffold('&width=60rem'));
    await expect(page.getByRole('banner')).toContainText('Inbox');
    await expect(page.getByRole('main')).toHaveAttribute('id', 'main');
    // The scaffold's first tab stops are the skip links, hidden until focused.
    await page.getByRole('button', { name: 'Width 80rem' }).focus();
    await page.keyboard.press('Tab');
    const toContent = page.getByRole('link', { name: 'Skip to content' });
    await expect(toContent).toBeFocused();
    expect((await box(toContent)).width).toBeGreaterThan(20);
    await page.keyboard.press('Tab');
    const toNavigation = page.getByRole('link', { name: 'Skip to navigation' });
    await expect(toNavigation).toBeFocused();
    // Skipping to the navigation focuses the form that shows, and Tab goes on inside it.
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('drawer-form').locator('xpath=..')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page.getByTestId('drawer-form').getByRole('button', { name: 'Inbox' }),
    ).toBeFocused();
    // Skipping to the content focuses the body without scrolling it.
    await toContent.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    expect(await page.getByRole('main').evaluate((element) => element.scrollTop)).toBe(0);
    await page.goto(scaffold('&landmarks=off'));
    await expect(page.getByRole('banner')).toHaveCount(0);
    await expect(page.getByRole('main')).toHaveCount(0);
    // Without landmarks, as a preview inside another page, it has no skip links, and its body an
    // id of its own.
    await expect(page.locator('.env-scaffold-skip-link')).toHaveCount(0);
    const id = await page.locator('.env-scaffold-body').getAttribute('id');
    expect(id).toBeTruthy();
    expect(id).not.toBe('main');
  });

  test('the skip link to the navigation hides where no form shows', async ({ page }) => {
    await page.goto(
      scaffold(
        `&width=30rem&forms=${encodeURIComponent(JSON.stringify({ compact: 'none', medium: 'none' }))}`,
      ),
    );
    const toNavigation = page.locator('.env-scaffold-skip-link[data-skip="navigation"]');
    await expect
      .poll(() => toNavigation.evaluate((link) => getComputedStyle(link).display))
      .toBe('none');
    await page.getByRole('button', { name: 'Width 45rem' }).click();
    await expect
      .poll(() => toNavigation.evaluate((link) => getComputedStyle(link).display))
      .toBe('none');
    await page.getByRole('button', { name: 'Width 60rem' }).click();
    await expect
      .poll(() => toNavigation.evaluate((link) => getComputedStyle(link).display))
      .not.toBe('none');
  });

  test('focus in a form that hides goes to the current item of the form that shows', async ({
    page,
  }) => {
    await page.goto(scaffold('&width=45rem'));
    const frame = page.getByTestId('frame');
    await page.getByTestId('rail-form').getByRole('button', { name: 'Inbox' }).focus();
    // Narrower, the bar shows instead of the rail: focus goes to its current destination.
    await frame.evaluate((element) => {
      element.style.inlineSize = '30rem';
    });
    await expect(
      page.getByTestId('bar-form').getByRole('button', { name: 'Settings' }),
    ).toBeFocused();
    // Focus elsewhere stays where it is as the form changes.
    await page.getByRole('button', { name: 'Search' }).focus();
    await frame.evaluate((element) => {
      element.style.inlineSize = '60rem';
    });
    await expect.poll(() => shownForms(page)).toEqual(['drawer']);
    await expect(page.getByRole('button', { name: 'Search' })).toBeFocused();
  });

  test('the body scrolls under the top bar, which stays in place', async ({ page }) => {
    await page.goto(scaffold('&width=60rem'));
    const body = page.locator('.env-scaffold-body');
    const bar = page.locator('.env-top-bar');
    const before = await box(bar);
    await body.evaluate((element) => element.scrollTo(0, 400));
    await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBe(400);
    expect(await box(bar)).toEqual(before);
    // The document itself does not scroll.
    expect(await page.evaluate(() => document.scrollingElement!.scrollTop)).toBe(0);
    const style = await body.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { overflowY: computed.overflowY, gutter: computed.scrollbarGutter };
    });
    expect(style).toEqual({ overflowY: 'auto', gutter: 'stable' });
  });

  test('topBarSpan="full" puts the top bar across the width, above the navigation', async ({
    page,
  }) => {
    await page.goto(scaffold('&width=60rem&span=full'));
    const bar = await box(page.locator('.env-top-bar'));
    const drawer = await box(page.getByTestId('drawer-form'));
    const frame = await box(page.getByTestId('frame'));
    expect(bar.x).toBeCloseTo(frame.x + 1, 0);
    expect(drawer.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1);
  });

  test('mirrors in right-to-left text', async ({ page }) => {
    await page.goto(scaffold('&width=60rem&dir=rtl'));
    const drawer = await box(page.getByTestId('drawer-form'));
    const body = await box(page.getByRole('main'));
    expect(drawer.x).toBeGreaterThan(body.x);
  });

  test('TopBar is one row at the top bar height, its title truncating first', async ({ page }) => {
    await page.goto(scaffold('&width=30rem'));
    const bar = page.locator('.env-top-bar');
    const height = await bar.evaluate((element) => element.getBoundingClientRect().height);
    // 3.25 rem.
    expect(height).toBeCloseTo(3.25 * 16, 0);
    const title = page.locator('.env-top-bar-title');
    await expect(title).toHaveCSS('text-overflow', 'ellipsis');
    await expect(title).toHaveCSS('white-space', 'nowrap');
    const actions = await box(page.locator('.env-top-bar-actions'));
    const outer = await box(bar);
    expect(actions.x + actions.width).toBeCloseTo(outer.x + outer.width - 16, 0);
  });
});

/** The scroll position of an element once it has stayed still for a quarter of a second. */
function settledTop(scroller: Locator) {
  return scroller.evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        let last = element.scrollTop;
        let stillFrames = 0;
        const check = () => {
          stillFrames = element.scrollTop === last ? stillFrames + 1 : 0;
          last = element.scrollTop;
          if (stillFrames >= 15) resolve(last);
          else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      }),
  );
}

/** Holds a key: its first press and then repeats, as a held key sends them. */
async function hold(page: Page, key: string, repeats: number) {
  await page.keyboard.down(key);
  for (let repeat = 0; repeat < repeats; repeat++) await page.keyboard.down(key);
  await page.keyboard.up(key);
}

/** Presses a key several times, faster than a smooth scroll settles. */
async function pressQuickly(page: Page, key: string, times: number) {
  for (let press = 0; press < times; press++) await page.keyboard.press(key);
}

/** Opens the scroll keys fixture once the scaffold listens for keys, and records what it takes. */
async function openScrollKeys(page: Page) {
  await page.goto(scrollKeys);
  await expect(page.locator('.env-scaffold-body')).toBeVisible();
  await twoFrames(page);
  // A window listener added once the scaffold listens hears whether it took a key.
  await page.evaluate(() =>
    window.addEventListener('keydown', (event) => {
      document.body.dataset.taken = String(event.defaultPrevented);
    }),
  );
  return () => page.evaluate(() => document.body.dataset.taken);
}

/** Scrolls the document once the page has rendered, and waits until it has. */
async function scrollDocument(page: Page, top: number) {
  await expect(page.getByTestId('page-start')).toBeAttached();
  await expect
    .poll(() =>
      page.evaluate((to) => {
        window.scrollTo(0, to);
        return document.scrollingElement!.scrollTop;
      }, top),
    )
    .toBe(top);
}

test.describe('Scaffold document scroll', { tag: '@engines' }, () => {
  test('the document scrolls, with the top bar, the drawer and a sticky header kept in view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 700 });
    await page.goto(scaffold('&width=60rem&scroll=document&header=sticky'));
    const body = page.locator('.env-scaffold-body');
    const bar = page.locator('.env-top-bar');
    const drawer = page.getByTestId('drawer-form').locator('xpath=..');
    const header = page.locator('.env-page-header');
    await expect(body).toHaveCSS('overflow-y', 'visible');
    // The Scaffold is at least as tall as the window, and grows with its content.
    expect((await box(page.locator('.env-scaffold'))).height).toBeGreaterThan(700);
    await scrollDocument(page, 2000);
    const top = await box(bar);
    expect(top.y).toBeCloseTo(0, 0);
    // The drawer stays in view, as tall as the window.
    const side = await box(drawer);
    expect(side.y).toBeCloseTo(0, 0);
    expect(side.height).toBeCloseTo(700, 0);
    // A sticky page header sits under the top bar.
    expect((await box(header)).y).toBeCloseTo(top.y + top.height, 0);
  });

  test('the bar sticks to the bottom, and a top bar across the width keeps the rail under it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 700 });
    await page.goto(scaffold('&width=30rem&scroll=document'));
    await scrollDocument(page, 1500);
    const bar = await box(page.getByTestId('bar-form').locator('xpath=..'));
    expect(bar.y + bar.height).toBeCloseTo(700, 0);
    await page.goto(scaffold('&width=45rem&scroll=document&span=full'));
    await scrollDocument(page, 1500);
    const top = await box(page.locator('.env-top-bar'));
    const rail = await box(page.getByTestId('rail-form').locator('xpath=..'));
    expect(rail.y).toBeGreaterThanOrEqual(top.y + top.height - 1);
    expect(rail.y + rail.height).toBeCloseTo(700, 0);
  });
});

test.describe('Scaffold document scroll, focus', { tag: '@engines' }, () => {
  /** Where the focused element sits against the top bar, the sticky header and the bar. */
  const placement = (page: Page) =>
    page.evaluate(() => {
      const active = document.activeElement!;
      const box = active.getBoundingClientRect();
      const top = document.querySelector('.env-scaffold-top-bar')!.getBoundingClientRect();
      const header = document.querySelector('.env-page-header')!.getBoundingClientRect();
      const slot = document.querySelector('.env-scaffold-bar');
      const bar =
        slot && getComputedStyle(slot).display !== 'none'
          ? slot.getBoundingClientRect().top
          : window.innerHeight;
      return {
        name: active.textContent,
        clearOfTop: box.top >= Math.max(top.bottom, header.bottom) - 0.5,
        clearOfBottom: box.bottom <= bar + 0.5,
      };
    });

  for (const [width, windowClass] of [
    [480, 'compact, with the bar at the bottom'],
    [1100, 'expanded, with the drawer'],
  ] as const)
    test(`Tab keeps focus clear of the bars and the sticky header, ${windowClass}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 640 });
      await page.goto(scaffoldPanes);
      const first = page.getByRole('button', { name: 'Message 1', exact: true });
      await first.focus();
      // The document scrolls, and its scroll padding is the bars' heights.
      const padding = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        return [style.scrollPaddingTop, style.scrollPaddingBottom];
      });
      const topBar = await box(page.locator('.env-scaffold-top-bar'));
      expect(Number.parseFloat(padding[0])).toBeCloseTo(topBar.height, 0);
      if (width === 480)
        expect(Number.parseFloat(padding[1])).toBeCloseTo(
          (await box(page.locator('.env-scaffold-bar'))).height,
          0,
        );
      else expect(padding[1]).toBe('0px');
      for (let step = 2; step <= 40; step++) {
        await page.keyboard.press('Tab');
        await expect
          .poll(() => placement(page))
          .toEqual({ name: `Message ${step}`, clearOfTop: true, clearOfBottom: true });
      }
      // The document scrolled to keep focus in view.
      expect(await page.evaluate(() => document.scrollingElement!.scrollTop)).toBeGreaterThan(0);
      for (let step = 39; step >= 1; step--) {
        await page.keyboard.press('Shift+Tab');
        await expect
          .poll(() => placement(page))
          .toEqual({ name: `Message ${step}`, clearOfTop: true, clearOfBottom: true });
      }
    });
});

test.describe('Scaffold body scroll', { tag: '@engines' }, () => {
  test('the keyboard scrolls the body as it would the document', async ({ page }) => {
    // Without motion the scroll positions are exact.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openScrollKeys(page);
    const content = page.locator('.env-scaffold-body');
    const metrics = () =>
      content.evaluate((element) => ({
        top: element.scrollTop,
        end: element.scrollHeight - element.clientHeight,
        page: element.clientHeight * 0.875,
      }));
    const { page: step, end } = await metrics();
    const expectTop = (top: number) =>
      expect.poll(async () => Math.abs((await metrics()).top - top)).toBeLessThanOrEqual(1.5);

    // A fresh window: focus is on the document.
    await page.keyboard.press('PageDown');
    await expectTop(step);
    await page.keyboard.press('ArrowDown');
    await expectTop(step + 40);
    await page.keyboard.press('ArrowUp');
    await expectTop(step);
    await page.keyboard.press('Space');
    await expectTop(2 * step);
    await page.keyboard.press('Shift+Space');
    await expectTop(step);
    await page.keyboard.press('End');
    await expectTop(end);
    await page.keyboard.press('Home');
    await expectTop(0);

    // From a destination in the navigation: the page keys scroll, while Space activates it.
    await page.getByRole('navigation', { name: 'Keys navigation' }).getByRole('button').focus();
    await page.keyboard.press('PageDown');
    await expectTop(step);
    await page.keyboard.press('Home');
    await expectTop(0);
    await page.keyboard.press('Space');
    await twoFrames(page);
    expect((await metrics()).top).toBe(0);

    // Widgets that use the keys keep them, such as a menubar trigger.
    await page.getByRole('menuitem', { name: 'File', exact: true }).focus();
    await page.keyboard.press('PageDown');
    await twoFrames(page);
    expect((await metrics()).top).toBe(0);
  });

  test('quick presses and held keys scroll as far as the browser scrolls', async ({ page }) => {
    // With motion allowed the keys scroll smoothly, and many hold-and-settle steps take a while.
    test.slow();
    await page.setViewportSize({ width: 800, height: 600 });
    await openScrollKeys(page);
    const content = page.locator('.env-scaffold-body');
    const sequences = {
      page: () => page.keyboard.press('PageDown'),
      quickPages: () => pressQuickly(page, 'PageDown', 3),
      heldPage: () => hold(page, 'PageDown', 6),
      line: () => page.keyboard.press('ArrowDown'),
      heldLine: () => hold(page, 'ArrowDown', 15),
      quickSpaces: () => pressQuickly(page, 'Space', 2),
    };
    type Distances = Record<keyof typeof sequences, number>;
    async function distances(focus: () => Promise<unknown>) {
      const result: Partial<Distances> = {};
      for (const [name, run] of Object.entries(sequences)) {
        await content.evaluate((element) => element.scrollTo({ top: 0, behavior: 'instant' }));
        await settledTop(content);
        await focus();
        await run();
        result[name as keyof Distances] = await settledTop(content);
      }
      return result as Distances;
    }
    // With focus in the body the browser scrolls it; from the document the scaffold does.
    const native = await distances(() => page.getByTestId('page-start').focus());
    const emulated = await distances(() =>
      page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur()),
    );
    // Engines step by different amounts, so a single press only comes close to the browser's own.
    // An arrow key varies most: the scaffold steps 40px, as Chromium does, where WebKit on Linux
    // steps 67px.
    expect(Math.abs(emulated.page - native.page)).toBeLessThanOrEqual(native.page / 3);
    expect(Math.abs(emulated.line - native.line)).toBeLessThanOrEqual(native.line / 2);
    // Counted in single presses, quick presses add up and held keys repeat as in the browser.
    for (const [name, unit] of [
      ['quickPages', 'page'],
      ['heldPage', 'page'],
      ['heldLine', 'line'],
      ['quickSpaces', 'page'],
    ] as const)
      expect(emulated[name] / emulated[unit]).toBeCloseTo(native[name] / native[unit], 0);
  });

  test('the browser keeps the keys in the body and in what the pointer last pressed', async ({
    page,
  }) => {
    const taken = await openScrollKeys(page);
    const content = page.locator('.env-scaffold-body');
    const notes = page.getByTestId('sidebar-notes');
    const top = (scroller: Locator) => scroller.evaluate((element) => element.scrollTop);

    // A click in the page focuses the body, which the browser then scrolls.
    await page.getByText('Paragraph 2', { exact: true }).click();
    await expect(content).toBeFocused();
    await page.keyboard.press('PageDown');
    expect(await taken()).toBe('false');
    await expect.poll(() => top(content)).toBeGreaterThan(0);
    await page.keyboard.press('Space');
    expect(await taken()).toBe('false');
    const scrolled = await settledTop(content);

    // With focus on the document, the browser scrolls the list that the pointer last pressed.
    await notes.getByText('Note 3', { exact: true }).click();
    await expect(page.locator('body')).toBeFocused();
    await page.keyboard.press('PageDown');
    expect(await taken()).toBe('false');
    await expect.poll(() => top(notes)).toBeGreaterThan(0);
    expect(await settledTop(content)).toBe(scrolled);

    // After a press on the title, which does not scroll, the scaffold scrolls the body.
    await page.locator('.env-top-bar-title').click();
    await expect(page.locator('body')).toBeFocused();
    await page.keyboard.press('PageDown');
    expect(await taken()).toBe('true');
    await expect.poll(() => top(content)).toBeGreaterThan(scrolled);
  });

  test('Space scrolls from a link, and fields in shadow roots and media controls keep their keys', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const taken = await openScrollKeys(page);
    const content = page.locator('.env-scaffold-body');
    const step = await content.evaluate((element) => element.clientHeight * 0.875);
    const expectTop = (expected: number) =>
      expect
        .poll(async () => Math.abs((await settledTop(content)) - expected))
        .toBeLessThanOrEqual(1.5);
    // Links follow Enter only, so Space scrolls from them as it would the document.
    await page.getByRole('link', { name: 'Settings' }).focus();
    await page.keyboard.press('Space');
    await expectTop(step);
    // A field in an open shadow root keeps Space and the page keys.
    const field = page.getByRole('textbox', { name: 'Quick note' });
    await field.focus();
    await page.keyboard.type('a b');
    await page.keyboard.press('PageDown');
    await expect(field).toHaveValue('a b');
    await expectTop(step);
    // The path of a key typed in a closed shadow root ends at its host, so the scaffold cannot
    // tell a field from a button there and leaves Space and Home to it.
    const closedField = page.locator('fixture-closed-field');
    await closedField.focus();
    await page.keyboard.type('c d');
    expect(await taken()).toBe('false');
    await page.keyboard.press('Home');
    expect(await taken()).toBe('false');
    // Media controls use the keys too.
    await page.getByLabel('Recording').focus();
    for (const key of ['Space', 'Home', 'ArrowDown']) {
      await page.keyboard.press(key);
      expect(await taken()).toBe('false');
    }
    await expectTop(step);
  });
});
