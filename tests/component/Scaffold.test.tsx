import { afterEach, describe, expect, test } from 'vitest';
import { commands, page, server, type Locator } from 'vitest/browser';
import * as scaffoldFixture from '../fixture/Scaffold.fixture.tsx';
import * as scaffoldPanes from '../fixture/ScaffoldPanes.fixture.tsx';
import * as scrollKeys from '../fixture/ScaffoldScrollKeys.fixture.tsx';
import { box, css, keyboard, nextFrames, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const scaffold = (search = '') => mount(scaffoldFixture, { search });

const shownForms = () =>
  [...document.querySelectorAll('[data-navigation-form]')]
    .filter((slot) => getComputedStyle(slot).display !== 'none')
    .map((slot) => slot.getAttribute('data-navigation-form'));

const element = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
const slotOf = (form: string) => page.getByTestId(`${form}-form`).element().parentElement!;

let listening: AbortController | undefined;
afterEach(() => {
  listening?.abort();
  listening = undefined;
});

async function openScrollKeys() {
  mount(scrollKeys);
  await expect.poll(() => shown(page.getByRole('main'))).toBe(true);
  await nextFrames();
  window.focus();
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
  test(
    'first in the file, as the module loads once: a key pressed before the scrolling code has loaded scrolls once it has',
    { tags: ['once'] },
    async () => {
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
    },
  );
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
      expect(page.getByRole('navigation').elements()).toHaveLength(1);
      expect(shown(page.getByRole('navigation', { name: `Main ${form}` }))).toBe(true);
      const navigation = box(page.getByTestId(`${form}-form`));
      const content = box(body);
      const outer = box(frame);
      if (form === 'bar') {
        expect(navigation.y).toBeGreaterThanOrEqual(content.y + content.height - 1);
        expect(navigation.width).toBeCloseTo(outer.width - 2, 0);
      } else {
        expect(navigation.x).toBeLessThan(content.x);
        expect(navigation.x).toBeCloseTo(outer.x + 1, 0);
        expect(navigation.y).toBeCloseTo(outer.y + 1, 0);
        expect(navigation.x + navigation.width).toBeCloseTo(content.x, 0);
      }
    }
    expect(innerWidth).toBeGreaterThanOrEqual(80 * 16);
  });

  test('the forms per window class are the application’s to choose', async () => {
    scaffold(
      `width=30rem&forms=${encodeURIComponent(JSON.stringify({ compact: 'none', large: 'rail' }))}`,
    );
    await expect.poll(shownForms).toEqual([]);
    await page.getByRole('button', { name: 'Width 80rem' }).click();
    await expect.poll(shownForms).toEqual(['rail']);
    scaffold('width=30rem&only=drawer');
    await expect.poll(shownForms).toEqual(['drawer']);
  });

  test('is a banner, the navigation and a main, with skip links first', async () => {
    scaffold('width=60rem');
    await expect.element(page.getByRole('banner')).toHaveTextContent('Inbox');
    await expect.element(page.getByRole('main')).toHaveAttribute('id', 'main');
    (page.getByRole('button', { name: 'Width 80rem' }).element() as HTMLElement).focus();
    await keyboard.press('Tab');
    const toContent = page.getByRole('link', { name: 'Skip to content' });
    await isFocused(toContent);
    expect(box(toContent).width).toBeGreaterThan(20);
    await keyboard.press('Tab');
    await isFocused(page.getByRole('link', { name: 'Skip to navigation' }));
    await keyboard.press('Enter');
    await expect.poll(() => document.activeElement).toBe(slotOf('drawer'));
    await keyboard.press('Tab');
    await isFocused(page.getByTestId('drawer-form').getByRole('button', { name: 'Inbox' }));
    (toContent.element() as HTMLElement).focus();
    await keyboard.press('Enter');
    await isFocused(page.getByRole('main'));
    expect(page.getByRole('main').element().scrollTop).toBe(0);
    scaffold('landmarks=off');
    expect(page.getByRole('banner').elements()).toHaveLength(0);
    expect(page.getByRole('main').elements()).toHaveLength(0);
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
    frame.style.inlineSize = '30rem';
    await isFocused(page.getByTestId('bar-form').getByRole('button', { name: 'Settings' }));
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
    expect(document.scrollingElement!.scrollTop).toBe(0);
    expect({ overflowY: css(body, 'overflow-y'), gutter: css(body, 'scrollbar-gutter') }).toEqual({
      overflowY: 'auto',
      gutter: 'stable',
    });
  });

  test('an end region sits beside the body under the top bar, and a bottom bar under both, as the body scrolls', async () => {
    scaffold('width=60rem&aside&status');
    const frame = box(page.getByTestId('frame'));
    const topBar = box(element('.env-scaffold-top-bar'));
    const main = box(page.getByRole('main'));
    const inspector = box(page.getByTestId('inspector'));
    const status = box(page.getByTestId('status-bar'));
    expect(inspector.x).toBeCloseTo(main.x + main.width, 0);
    expect(inspector.x + inspector.width).toBeCloseTo(frame.x + frame.width - 1, 0);
    expect(inspector.y).toBeCloseTo(topBar.y + topBar.height, 0);
    expect(topBar.x + topBar.width).toBeCloseTo(frame.x + frame.width - 1, 0);
    expect(status.y).toBeCloseTo(main.y + main.height, 0);
    expect(status.x).toBeCloseTo(main.x, 0);
    expect(status.x + status.width).toBeCloseTo(frame.x + frame.width - 1, 0);
    expect(status.y + status.height).toBeCloseTo(frame.y + frame.height - 1, 0);
    const body = element('.env-scaffold-body');
    body.scrollTo(0, 400);
    await expect.poll(() => body.scrollTop).toBe(400);
    expect(box(page.getByTestId('status-bar'))).toEqual(status);
    expect(css(element('.env-scaffold-aside'), 'overflow-y')).toBe('auto');
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

async function hold(key: string, repeats: number) {
  await keyboard.down(key);
  for (let repeat = 0; repeat < repeats; repeat++) await keyboard.down(key);
  await keyboard.up(key);
}

async function pressQuickly(key: string, times: number) {
  for (let press = 0; press < times; press++) await keyboard.press(key);
}

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
    expect(box(element('.env-scaffold')).height).toBeGreaterThan(700);
    await scrollDocument(2000);
    const top = box(bar);
    expect(top.y).toBeCloseTo(0, 0);
    const side = box(drawer);
    expect(side.y).toBeCloseTo(0, 0);
    expect(side.height).toBeCloseTo(700, 0);
    const region = box(element('.env-scaffold-top-bar'));
    expect(box(header).y).toBeCloseTo(region.y + region.height, 0);
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

describe('Scaffold document scroll, end region and bottom bar', { tags: ['engines'] }, () => {
  test('the end region and the bottom bar stay in view, the bottom bar above the bar, and focus scrolls clear of both', async () => {
    await page.viewport(1100, 700);
    scaffold('width=60rem&scroll=document&aside&status');
    await scrollDocument(2000);
    const topBar = box(element('.env-scaffold-top-bar'));
    const status = box(page.getByTestId('status-bar'));
    const end = box(element('.env-scaffold-aside'));
    expect(status.y + status.height).toBeCloseTo(700, 0);
    expect(end.y).toBeCloseTo(topBar.height, 0);
    expect(end.y + end.height).toBeCloseTo(status.y, 0);
    await expect
      .poll(() => Number.parseFloat(css(document.documentElement, 'scroll-padding-bottom')))
      .toBeCloseTo(status.height, 0);
    window.scrollTo(0, 0);
    scaffold('width=30rem&scroll=document&status');
    await scrollDocument(1500);
    const bar = box(slotOf('bar'));
    const above = box(page.getByTestId('status-bar'));
    expect(bar.y + bar.height).toBeCloseTo(700, 0);
    expect(above.y + above.height).toBeCloseTo(bar.y, 0);
    await expect
      .poll(() => Number.parseFloat(css(document.documentElement, 'scroll-padding-bottom')))
      .toBeCloseTo(bar.height + above.height, 0);
    window.scrollTo(0, 0);
  });
});

describe('Scaffold document scroll, focus', { tags: ['engines'] }, () => {
  const placement = () => {
    const active = document.activeElement!;
    const at = active.getBoundingClientRect();
    const firefoxCountsPartlyCoveredAsInView = server.browser === 'firefox';
    const slack = firefoxCountsPartlyCoveredAsInView ? at.height / 4 : 0.5;
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
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    await openScrollKeys();
    const content = element('.env-scaffold-body');
    const step = content.clientHeight * 0.875;
    const end = content.scrollHeight - content.clientHeight;
    const expectTop = (top: number) =>
      expect.poll(() => Math.abs(content.scrollTop - top)).toBeLessThanOrEqual(1.5);

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
    const native = await distances(() => page.getByTestId('page-start').element().focus());
    const emulated = await distances(() => (document.activeElement as HTMLElement | null)?.blur());
    expect(Math.abs(emulated.page - native.page)).toBeLessThanOrEqual(native.page / 3);
    expect(Math.abs(emulated.line - native.line)).toBeLessThanOrEqual(native.line / 2);
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

    await page.getByText('Paragraph 2', { exact: true }).click();
    await expect.poll(() => document.activeElement).toBe(content);
    await keyboard.press('PageDown');
    expect(taken()).toBe('false');
    await expect.poll(() => content.scrollTop).toBeGreaterThan(0);
    await keyboard.press('Space');
    expect(taken()).toBe('false');
    const scrolled = await settledTop(content);

    await page.getByTestId('sidebar-notes').getByText('Note 3', { exact: true }).click();
    await expect.poll(() => document.activeElement).toBe(document.body);
    await keyboard.press('PageDown');
    expect(taken()).toBe('false');
    await expect.poll(() => notes.scrollTop).toBeGreaterThan(0);
    expect(await settledTop(content)).toBe(scrolled);

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
    (page.getByRole('link', { name: 'Settings' }).element() as HTMLElement).focus();
    await keyboard.press('Space');
    await expectTop(step);
    const field = page.getByRole('textbox', { name: 'Quick note' });
    (field.element() as HTMLElement).focus();
    await keyboard.type('a b');
    await keyboard.press('PageDown');
    await expect.element(field).toHaveValue('a b');
    await expectTop(step);
    element('fixture-closed-field').focus();
    await keyboard.type('c d');
    expect(taken()).toBe('false');
    await keyboard.press('Home');
    expect(taken()).toBe('false');
    (page.getByLabelText('Recording').element() as HTMLElement).focus();
    for (const key of ['Space', 'Home', 'ArrowDown']) {
      await keyboard.press(key);
      expect(taken()).toBe('false');
    }
    await expectTop(step);
  });
});
