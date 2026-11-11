import { afterEach, describe, expect, test } from 'vitest';
import { commands, page, server, type Locator } from 'vitest/browser';
import * as scaffoldFixture from '../fixture/Scaffold.fixture.tsx';
import * as scaffoldPanes from '../fixture/ScaffoldPanes.fixture.tsx';
import * as scrollKeys from '../fixture/ScaffoldScrollKeys.fixture.tsx';
import { box, css, keyboard, nextFrames, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

const scaffold = (search = '') => mount(scaffoldFixture, { search });

/** Which navigation form shows: the form whose slot has a box. */
const shownForms = () =>
  [...document.querySelectorAll('[data-navigation-form]')]
    .filter((slot) => getComputedStyle(slot).display !== 'none')
    .map((slot) => slot.getAttribute('data-navigation-form'));

const element = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
/** The slot a navigation form's stand-in sits in. */
const slotOf = (form: string) => page.getByTestId(`${form}-form`).element().parentElement!;

let listening: AbortController | undefined;
afterEach(() => {
  listening?.abort();
  listening = undefined;
});

/**
 * Mounts the scroll keys fixture once the scaffold listens for keys, and records what it takes:
 * whether the last key reached the window cancelled. Focus is on the document, as in a fresh window.
 */
async function openScrollKeys() {
  mount(scrollKeys);
  await expect.poll(() => shown(page.getByRole('main'))).toBe(true);
  await nextFrames();
  window.focus();
  // A window listener added once the scaffold listens hears whether it took a key.
  listening = new AbortController();
  window.addEventListener(
    'keydown',
    (event) => {
      document.body.dataset.taken = String(event.defaultPrevented);
    },
    { signal: listening.signal },
  );
  return () => document.body.dataset.taken;
}

describe('Scaffold body scroll, as its code loads', { tags: ['engines'] }, () => {
  // First in the file: the frame keeps a module once it has loaded it, and every Scaffold whose
  // body scrolls loads this one as it mounts.
  test('a key pressed before the scrolling code has loaded scrolls once it has', async () => {
    // The scaffold loads the code as the body mounts: hold it back, as a slow network would.
    await commands.holdModule('scrollKeys');
    try {
      await commands.emulateMedia({ reducedMotion: 'reduce' });
      mount(scrollKeys);
      const content = element('.env-scaffold-body');
      await commands.moduleRequested('scrollKeys');
      window.focus();
      await keyboard.press('PageDown');
      await keyboard.press('ArrowDown');
      await nextFrames();
      expect(content.scrollTop).toBe(0);
      await commands.releaseModule('scrollKeys');
      const step = content.clientHeight * 0.875;
      await expect.poll(() => Math.abs(content.scrollTop - (step + 40))).toBeLessThanOrEqual(1.5);
    } finally {
      await commands.unrouteModule('scrollKeys');
    }
  });
});

describe('Scaffold', () => {
  test('shows one navigation form by its own width, compact first', async () => {
    scaffold();
    const frame = page.getByTestId('frame');
    const body = page.getByRole('main');
    for (const [width, form] of [
      ['30rem', 'bar'],
      ['45rem', 'rail'],
      ['60rem', 'drawer'],
      ['80rem', 'drawer'],
    ] as const) {
      await page.getByRole('button', { name: `Width ${width}` }).click();
      await expect.poll(shownForms).toEqual([form]);
      // Only the form that shows is in the accessibility tree.
      expect(page.getByRole('navigation').elements()).toHaveLength(1);
      expect(shown(page.getByRole('navigation', { name: `Main ${form}` }))).toBe(true);
      const navigation = box(page.getByTestId(`${form}-form`));
      const content = box(body);
      const outer = box(frame);
      if (form === 'bar') {
        // At the bottom, across the width, below the body.
        expect(navigation.y).toBeGreaterThanOrEqual(content.y + content.height - 1);
        expect(navigation.width).toBeCloseTo(outer.width - 2, 0);
      } else {
        // At the start, the full height, flush with the window's edges and the body.
        expect(navigation.x).toBeLessThan(content.x);
        expect(navigation.x).toBeCloseTo(outer.x + 1, 0);
        expect(navigation.y).toBeCloseTo(outer.y + 1, 0);
        expect(navigation.x + navigation.width).toBeCloseTo(content.x, 0);
      }
    }
    // The window stayed as wide all along: the forms follow the scaffold's width, not the window's.
    expect(innerWidth).toBeGreaterThanOrEqual(80 * 16);
  });

  test('the forms per window class are the application’s to choose', async () => {
    scaffold(
      `width=30rem&forms=${encodeURIComponent(JSON.stringify({ compact: 'none', large: 'rail' }))}`,
    );
    await expect.poll(shownForms).toEqual([]);
    await page.getByRole('button', { name: 'Width 80rem' }).click();
    await expect.poll(shownForms).toEqual(['rail']);
    // Given only a drawer, it stands in at every width.
    scaffold('width=30rem&only=drawer');
    await expect.poll(shownForms).toEqual(['drawer']);
  });

  test('is a banner, the navigation and a main, with skip links first', async () => {
    scaffold('width=60rem');
    await expect.element(page.getByRole('banner')).toHaveTextContent('Inbox');
    await expect.element(page.getByRole('main')).toHaveAttribute('id', 'main');
    // The scaffold's first tab stops are the skip links, hidden until focused.
    (page.getByRole('button', { name: 'Width 80rem' }).element() as HTMLElement).focus();
    await keyboard.press('Tab');
    const toContent = page.getByRole('link', { name: 'Skip to content' });
    await isFocused(toContent);
    expect(box(toContent).width).toBeGreaterThan(20);
    await keyboard.press('Tab');
    await isFocused(page.getByRole('link', { name: 'Skip to navigation' }));
    // Skipping to the navigation focuses the form that shows, and Tab goes on inside it.
    await keyboard.press('Enter');
    await expect.poll(() => document.activeElement).toBe(slotOf('drawer'));
    await keyboard.press('Tab');
    await isFocused(page.getByTestId('drawer-form').getByRole('button', { name: 'Inbox' }));
    // Skipping to the content focuses the body without scrolling it.
    (toContent.element() as HTMLElement).focus();
    await keyboard.press('Enter');
    await isFocused(page.getByRole('main'));
    expect(page.getByRole('main').element().scrollTop).toBe(0);
    scaffold('landmarks=off');
    expect(page.getByRole('banner').elements()).toHaveLength(0);
    expect(page.getByRole('main').elements()).toHaveLength(0);
    // Without landmarks, as a preview inside another page, it has no skip links, and its body an
    // id of its own.
    expect(document.querySelectorAll('.env-scaffold-skip-link')).toHaveLength(0);
    const id = element('.env-scaffold-body').id;
    expect(id).toBeTruthy();
    expect(id).not.toBe('main');
  });

  test('the skip link to the navigation hides where no form shows', async () => {
    scaffold(
      `width=30rem&forms=${encodeURIComponent(JSON.stringify({ compact: 'none', medium: 'none' }))}`,
    );
    const toNavigation = element('.env-scaffold-skip-link[data-skip="navigation"]');
    await expect.poll(() => css(toNavigation, 'display')).toBe('none');
    await page.getByRole('button', { name: 'Width 45rem' }).click();
    await expect.poll(() => css(toNavigation, 'display')).toBe('none');
    await page.getByRole('button', { name: 'Width 60rem' }).click();
    await expect.poll(() => css(toNavigation, 'display')).not.toBe('none');
  });

  test('focus in a form that hides goes to the current item of the form that shows', async () => {
    scaffold('width=45rem');
    const frame = page.getByTestId('frame').element() as HTMLElement;
    const inbox = page.getByTestId('rail-form').getByRole('button', { name: 'Inbox' });
    (inbox.element() as HTMLElement).focus();
    // Narrower, the bar shows instead of the rail: focus goes to its current destination.
    frame.style.inlineSize = '30rem';
    await isFocused(page.getByTestId('bar-form').getByRole('button', { name: 'Settings' }));
    // Focus elsewhere stays where it is as the form changes.
    const search = page.getByRole('button', { name: 'Search' });
    (search.element() as HTMLElement).focus();
    frame.style.inlineSize = '60rem';
    await expect.poll(shownForms).toEqual(['drawer']);
    await isFocused(search);
  });

  test('the body scrolls under the top bar, which stays in place', async () => {
    scaffold('width=60rem');
    const body = element('.env-scaffold-body');
    const bar = element('.env-top-bar');
    const before = box(bar);
    body.scrollTo(0, 400);
    await expect.poll(() => body.scrollTop).toBe(400);
    expect(box(bar)).toEqual(before);
    // The document itself does not scroll.
    expect(document.scrollingElement!.scrollTop).toBe(0);
    expect({ overflowY: css(body, 'overflow-y'), gutter: css(body, 'scrollbar-gutter') }).toEqual({
      overflowY: 'auto',
      gutter: 'stable',
    });
  });

  test('topBarSpan="full" puts the top bar across the width, above the navigation', () => {
    scaffold('width=60rem&span=full');
    const bar = box(element('.env-top-bar'));
    const drawer = box(page.getByTestId('drawer-form'));
    const frame = box(page.getByTestId('frame'));
    expect(bar.x).toBeCloseTo(frame.x + 1, 0);
    expect(drawer.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1);
  });

  test('mirrors in right-to-left text', () => {
    scaffold('width=60rem&dir=rtl');
    expect(box(page.getByTestId('drawer-form')).x).toBeGreaterThan(box(page.getByRole('main')).x);
  });
});

/** The scroll position of an element once it has stayed still for a quarter of a second. */
function settledTop(scroller: Element) {
  return new Promise<number>((resolve) => {
    let last = scroller.scrollTop;
    let stillFrames = 0;
    const check = () => {
      stillFrames = scroller.scrollTop === last ? stillFrames + 1 : 0;
      last = scroller.scrollTop;
      if (stillFrames >= 15) resolve(last);
      else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

/** Holds a key: its first press and then repeats, as a held key sends them. */
async function hold(key: string, repeats: number) {
  await keyboard.down(key);
  for (let repeat = 0; repeat < repeats; repeat++) await keyboard.down(key);
  await keyboard.up(key);
}

/** Presses a key several times, faster than a smooth scroll settles. */
async function pressQuickly(key: string, times: number) {
  for (let press = 0; press < times; press++) await keyboard.press(key);
}

/** Scrolls the document once the page has rendered, and waits until it has. */
async function scrollDocument(top: number) {
  await expect.element(page.getByTestId('page-start')).toBeInTheDocument();
  await expect
    .poll(() => {
      window.scrollTo(0, top);
      return document.scrollingElement!.scrollTop;
    })
    .toBe(top);
}

describe('Scaffold document scroll', { tags: ['engines'] }, () => {
  test('the document scrolls, with the top bar, the drawer and a sticky header kept in view', async () => {
    await page.viewport(1100, 700);
    scaffold('width=60rem&scroll=document&header=sticky');
    const body = element('.env-scaffold-body');
    const bar = element('.env-top-bar');
    const drawer = slotOf('drawer');
    const header = element('.env-page-header');
    expect(css(body, 'overflow-y')).toBe('visible');
    // The Scaffold is at least as tall as the window, and grows with its content.
    expect(box(element('.env-scaffold')).height).toBeGreaterThan(700);
    await scrollDocument(2000);
    const top = box(bar);
    expect(top.y).toBeCloseTo(0, 0);
    // The drawer stays in view, as tall as the window.
    const side = box(drawer);
    expect(side.y).toBeCloseTo(0, 0);
    expect(side.height).toBeCloseTo(700, 0);
    // A sticky page header sits under the top bar.
    expect(box(header).y).toBeCloseTo(top.y + top.height, 0);
  });

  test('the bar sticks to the bottom, and a top bar across the width keeps the rail under it', async () => {
    await page.viewport(1100, 700);
    scaffold('width=30rem&scroll=document');
    await scrollDocument(1500);
    const bar = box(slotOf('bar'));
    expect(bar.y + bar.height).toBeCloseTo(700, 0);
    window.scrollTo(0, 0);
    scaffold('width=45rem&scroll=document&span=full');
    await scrollDocument(1500);
    const top = box(element('.env-top-bar'));
    const rail = box(slotOf('rail'));
    expect(rail.y).toBeGreaterThanOrEqual(top.y + top.height - 1);
    expect(rail.y + rail.height).toBeCloseTo(700, 0);
  });
});

describe('Scaffold document scroll, focus', { tags: ['engines'] }, () => {
  /**
   * Where the focused element sits against the top bar, the sticky header and the bar. Firefox
   * moves focus without scrolling while only the edge of the element, under about a fifth of it,
   * is behind a bar, counting it in view; Chromium and WebKit scroll it clear. So in Firefox an
   * element is clear with up to a quarter of it behind a bar.
   */
  const placement = () => {
    const active = document.activeElement!;
    const at = active.getBoundingClientRect();
    const slack = server.browser === 'firefox' ? at.height / 4 : 0.5;
    const top = element('.env-scaffold-top-bar').getBoundingClientRect();
    const header = element('.env-page-header').getBoundingClientRect();
    const slot = document.querySelector('.env-scaffold-bar');
    const bar =
      slot && getComputedStyle(slot).display !== 'none'
        ? slot.getBoundingClientRect().top
        : window.innerHeight;
    return {
      name: active.textContent,
      clearOfTop: at.top >= Math.max(top.bottom, header.bottom) - slack,
      clearOfBottom: at.bottom <= bar + slack,
    };
  };

  for (const [width, windowClass] of [
    [480, 'compact, with the bar at the bottom'],
    [1100, 'expanded, with the drawer'],
  ] as const)
    test(`Tab keeps focus clear of the bars and the sticky header, ${windowClass}`, async () => {
      await page.viewport(width, 640);
      mount(scaffoldPanes);
      (
        page.getByRole('button', { name: 'Message 1', exact: true }).element() as HTMLElement
      ).focus();
      // The document scrolls, and its scroll padding is the bars' heights.
      const root = document.documentElement;
      const topBar = box(element('.env-scaffold-top-bar'));
      expect(Number.parseFloat(css(root, 'scroll-padding-top'))).toBeCloseTo(topBar.height, 0);
      if (width === 480)
        expect(Number.parseFloat(css(root, 'scroll-padding-bottom'))).toBeCloseTo(
          box(element('.env-scaffold-bar')).height,
          0,
        );
      else expect(css(root, 'scroll-padding-bottom')).toBe('0px');
      for (let step = 2; step <= 40; step++) {
        await keyboard.press('Tab');
        await expect
          .poll(placement)
          .toEqual({ name: `Message ${step}`, clearOfTop: true, clearOfBottom: true });
      }
      // The document scrolled to keep focus in view.
      expect(document.scrollingElement!.scrollTop).toBeGreaterThan(0);
      for (let step = 39; step >= 1; step--) {
        await keyboard.press('Shift+Tab');
        await expect
          .poll(placement)
          .toEqual({ name: `Message ${step}`, clearOfTop: true, clearOfBottom: true });
      }
    });
});

describe('Scaffold body scroll', { tags: ['engines'] }, () => {
  test('the keyboard scrolls the body as it would the document', async () => {
    // Without motion the scroll positions are exact.
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    await openScrollKeys();
    const content = element('.env-scaffold-body');
    const step = content.clientHeight * 0.875;
    const end = content.scrollHeight - content.clientHeight;
    const expectTop = (top: number) =>
      expect.poll(() => Math.abs(content.scrollTop - top)).toBeLessThanOrEqual(1.5);

    // A fresh window: focus is on the document.
    await keyboard.press('PageDown');
    await expectTop(step);
    await keyboard.press('ArrowDown');
    await expectTop(step + 40);
    await keyboard.press('ArrowUp');
    await expectTop(step);
    await keyboard.press('Space');
    await expectTop(2 * step);
    await keyboard.press('Shift+Space');
    await expectTop(step);
    await keyboard.press('End');
    await expectTop(end);
    await keyboard.press('Home');
    await expectTop(0);

    // From a destination in the navigation: the page keys scroll, while Space activates it.
    (
      page
        .getByRole('navigation', { name: 'Keys navigation' })
        .getByRole('button')
        .element() as HTMLElement
    ).focus();
    await keyboard.press('PageDown');
    await expectTop(step);
    await keyboard.press('Home');
    await expectTop(0);
    await keyboard.press('Space');
    await nextFrames();
    expect(content.scrollTop).toBe(0);

    // Widgets that use the keys keep them, such as a menubar trigger.
    (page.getByRole('menuitem', { name: 'File', exact: true }).element() as HTMLElement).focus();
    await keyboard.press('PageDown');
    await nextFrames();
    expect(content.scrollTop).toBe(0);
  });

  test('quick presses and held keys scroll as far as the browser scrolls', async () => {
    await page.viewport(800, 600);
    await openScrollKeys();
    const content = element('.env-scaffold-body');
    const sequences = {
      page: () => keyboard.press('PageDown'),
      quickPages: () => pressQuickly('PageDown', 3),
      heldPage: () => hold('PageDown', 6),
      line: () => keyboard.press('ArrowDown'),
      heldLine: () => hold('ArrowDown', 15),
      quickSpaces: () => pressQuickly('Space', 2),
    };
    type Distances = Record<keyof typeof sequences, number>;
    async function distances(focus: () => void) {
      const result: Partial<Distances> = {};
      for (const [name, run] of Object.entries(sequences)) {
        content.scrollTo({ top: 0, behavior: 'instant' });
        await settledTop(content);
        focus();
        await run();
        result[name as keyof Distances] = await settledTop(content);
      }
      return result as Distances;
    }
    // With focus in the body the browser scrolls it; from the document the scaffold does.
    const native = await distances(() => page.getByTestId('page-start').element().focus());
    const emulated = await distances(() => (document.activeElement as HTMLElement | null)?.blur());
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
  }, 60_000);

  test('the browser keeps the keys in the body and in what the pointer last pressed', async () => {
    const taken = await openScrollKeys();
    const content = element('.env-scaffold-body');
    const notes = page.getByTestId('sidebar-notes').element();

    // A click in the page focuses the body, which the browser then scrolls.
    await page.getByText('Paragraph 2', { exact: true }).click();
    await expect.poll(() => document.activeElement).toBe(content);
    await keyboard.press('PageDown');
    expect(taken()).toBe('false');
    await expect.poll(() => content.scrollTop).toBeGreaterThan(0);
    await keyboard.press('Space');
    expect(taken()).toBe('false');
    const scrolled = await settledTop(content);

    // With focus on the document, the browser scrolls the list that the pointer last pressed.
    await page.getByTestId('sidebar-notes').getByText('Note 3', { exact: true }).click();
    await expect.poll(() => document.activeElement).toBe(document.body);
    await keyboard.press('PageDown');
    expect(taken()).toBe('false');
    await expect.poll(() => notes.scrollTop).toBeGreaterThan(0);
    expect(await settledTop(content)).toBe(scrolled);

    // After a press on the title, which does not scroll, the scaffold scrolls the body.
    await page.elementLocator(element('.env-top-bar-title')).click();
    await expect.poll(() => document.activeElement).toBe(document.body);
    await keyboard.press('PageDown');
    expect(taken()).toBe('true');
    await expect.poll(() => content.scrollTop).toBeGreaterThan(scrolled);
  });

  test('Space scrolls from a link, and fields in shadow roots and media controls keep their keys', async () => {
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    const taken = await openScrollKeys();
    const content = element('.env-scaffold-body');
    const step = content.clientHeight * 0.875;
    const expectTop = (expected: number) =>
      expect
        .poll(async () => Math.abs((await settledTop(content)) - expected))
        .toBeLessThanOrEqual(1.5);
    // Links follow Enter only, so Space scrolls from them as it would the document.
    (page.getByRole('link', { name: 'Settings' }).element() as HTMLElement).focus();
    await keyboard.press('Space');
    await expectTop(step);
    // A field in an open shadow root keeps Space and the page keys.
    const field = page.getByRole('textbox', { name: 'Quick note' });
    (field.element() as HTMLElement).focus();
    await keyboard.type('a b');
    await keyboard.press('PageDown');
    await expect.element(field).toHaveValue('a b');
    await expectTop(step);
    // The path of a key typed in a closed shadow root ends at its host, so the scaffold cannot
    // tell a field from a button there and leaves Space and Home to it.
    element('fixture-closed-field').focus();
    await keyboard.type('c d');
    expect(taken()).toBe('false');
    await keyboard.press('Home');
    expect(taken()).toBe('false');
    // Media controls use the keys too.
    (page.getByLabelText('Recording').element() as HTMLElement).focus();
    for (const key of ['Space', 'Home', 'ArrowDown']) {
      await keyboard.press(key);
      expect(taken()).toBe('false');
    }
    await expectTop(step);
  });
});
