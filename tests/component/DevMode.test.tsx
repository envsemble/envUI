import { afterEach, beforeEach, expect, onTestFinished, test, vi } from 'vitest';
import { page, type Locator } from 'vitest/browser';
// The type brings dev mode's `window.envui` with it.
import type { LayoutProblem } from '@envsemble/envui/dev';
import * as fixture from '../fixture/DevMode.fixture.tsx';
import {
  box,
  css,
  keyboard,
  mouse,
  passTime,
  shown,
  stopTimers,
  waitOnRealTime,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const title = document.title;

beforeEach(() => {
  document.title = title;
});

afterEach(() => {
  vi.restoreAllMocks();
  document.title = title;
});

/** Mounts the fixture, as `?fixture=dev-mode&<search>`, once dev mode has installed its layout. */
async function open(search?: string) {
  mount(fixture, { search });
  await expect.poll(() => window.envui?.layout).toBeDefined();
}

const layout = () => window.envui!.layout!;
const panel = () => page.getByRole('region', { name: 'Dev mode' });
const planes = () => panel().element().querySelectorAll('.env-dev-plane[data-plane]');
const planeCount = () => expect.poll(() => planes().length).toBe(15);
const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);
const isGone = (locator: Locator) => expect.poll(() => locator.elements().length).toBe(0);
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
const themeRoot = () => document.querySelector<HTMLElement>('.env-theme')!;
const button = (scope: Pick<Locator, 'getByRole'>, name: string) =>
  scope.getByRole('button', { name, exact: true });

/**
 * Opens dev mode over the fixture's page, as `open()` does, for a test that needs no tab of its
 * own; Escape closes it again. Returns its panel.
 */
async function openOver() {
  await expect.poll(() => window.envuiDevMode).toBeDefined();
  window.envuiDevMode!.open();
  await isShown(panel());
  return panel();
}

/** Picks an angle in the toolbar's View dropdown, which also brings the whole page into view. */
async function turnTo(name: string) {
  await button(panel().getByRole('toolbar', { name: '3D view' }), 'View').click();
  await button(page.getByRole('dialog', { name: 'View' }), name).click();
}

/** Turns on the responsive frame and picks a device in the toolbar's Responsive dropdown. */
async function pickDevice(device: RegExp) {
  await button(panel(), 'Responsive').click();
  const frame = page.getByRole('menuitemcheckbox', { name: /^Responsive frame/ });
  await isShown(frame);
  if (frame.element().getAttribute('aria-checked') !== 'true') await frame.click();
  await page.getByRole('menuitem', { name: /^Device/ }).click();
  await page.getByRole('menuitemradio', { name: device }).click();
}

function centre(target: Locator | Element) {
  const { x, y, width, height } = box(target);
  return { x: x + width / 2, y: y + height / 2 };
}

/** The scene's style, which holds the view's turn and zoom. */
const sceneStyle = () =>
  panel().element().querySelector('.env-dev-scene')!.getAttribute('style') ?? '';
const zoom = () => Number(/scale\(([\d.]+)\)/.exec(sceneStyle())?.[1]);

const rules = (problems: LayoutProblem[]) =>
  problems.map(({ rule, node }) => `${rule} ${node}`).sort();

test('the readout describes and checks the layout nodes, also at other widths', async () => {
  await page.viewport(1024, 720);
  await open();
  const text = layout().describe();
  // The tree: kinds and names, the container and the threshold its queries test, the resolved
  // grid columns, identical siblings folded, hidden nodes counted.
  expect(text).toMatch(
    /^scaffold "app" · [\d.]+×[\d.]+rem · expanded · container env-scaffold \(queried at 37\.5(?:, 52\.5, 75)?rem\)/m,
  );
  expect(text).toMatch(
    /^ {2}grid "frame" · .* · grid · gap 1rem · padding 1rem · columns 2 = 12 \| /m,
  );
  expect(text).toContain('row "cards" · ');
  expect(text).toContain('… and 2 more like "first" ("second", "third")');
  expect(text).toMatch(/box "hidden" · hidden \(display: none\) \(1 node inside\)/);
  expect(text).toMatch(/row "heading" · .* · sticky top, but nothing around it scrolls/);
  expect(text).not.toContain('env-dev');

  const problems = layout().check();
  expect(rules(problems)).toEqual([
    'layout-paints row "painted"',
    'sticky-without-scroll row "heading"',
  ]);
  expect(problems[0]!.path).toMatch(/^scaffold "app" > grid "frame" > page > /);

  // At 22rem the scaffold stacks and the 30rem content overflows its grid; at 60rem it fits. The
  // root gets its own width back after each, and no style attribute it didn't have.
  const before = box(themeRoot()).width;
  const results = layout().at(['22rem', 960]);
  expect(results.map(({ width, windowClass }) => `${width} ${windowClass}`)).toEqual([
    '22rem compact',
    '960 expanded',
  ]);
  expect(results[0]!.text).toMatch(/^scaffold "app" · 22×[\d.]+rem · compact/m);
  expect(rules(results[0]!.problems)).toContain('child-overflow grid "wide"');
  expect(rules(results[1]!.problems)).not.toContain('child-overflow grid "wide"');
  expect(box(themeRoot()).width).toBe(before);
  expect(themeRoot().hasAttribute('style')).toBe(false);
  // A height too, as a window of that size would show the page.
  const [sized] = layout().at([{ width: '22rem', height: '20rem' }]);
  expect(sized).toMatchObject({ width: '22rem', height: '20rem', windowClass: 'compact' });
  expect(sized!.text).toMatch(/^root .*· 22×20rem · compact/m);
  expect(themeRoot().hasAttribute('style')).toBe(false);

  // A dialog, in its positioner fixed over the window, is an open overlay.
  await page.getByRole('button', { name: 'Open the dialog' }).click();
  await isShown(page.getByRole('dialog', { name: 'Details' }));
  expect(layout().describe()).toMatch(/open overlays \(1\):\n {2}dialog\b/);
  await keyboard.press('Escape');
  await isGone(page.getByRole('dialog'));

  // An open overlay is listed with where it landed, and found off the window.
  await page.getByRole('button', { name: 'Open the popover' }).click();
  expect(layout().describe()).toMatch(
    /open overlays \(1\):\n {2}popover · 10×[\d.]+rem · .* · at -4,2rem in the window/,
  );
  expect(rules(layout().check())).toContain('overlay-off-window popover');
  (document.querySelector('.dev-off-window') as HTMLElement).hidePopover();
});

test('the button and the shortcut open dev mode in a new tab, which only closing ends', async () => {
  await page.viewport(1024, 720);
  await open();
  // The test stands in for the browser's new tab: it records the address and returns a window.
  const opened: string[] = [];
  vi.spyOn(window, 'open').mockImplementation((url) => {
    opened.push(String(url));
    return {} as Window;
  });
  const corner = button(page.elementLocator(document.body), 'Dev mode');
  await expect.element(corner).toHaveAttribute('aria-keyshortcuts', 'Alt+Shift+D');
  await corner.click();
  await expect.poll(() => opened.length).toBe(1);
  // The tab is the page's address, marked as dev mode's.
  const address = new URL(opened[0]!);
  expect(address.pathname).toBe(location.pathname);
  expect(address.searchParams.has('envui-dev')).toBe(true);
  // The page it came from stays as it was, with no dev mode over it.
  expect(panel().elements()).toHaveLength(0);
  expect(themeRoot().inert).toBe(false);
  // The shortcut opens another.
  await keyboard.press('Alt+Shift+D');
  await expect.poll(() => opened.length).toBe(2);

  // In the tab, dev mode is open at once, over the whole window, and says so in the tab's title.
  await open(address.search.slice(1));
  await isShown(panel());
  await expect.poll(() => document.title).toMatch(/^Dev mode/);
  expect(box(panel())).toEqual({ x: 0, y: 0, width: innerWidth, height: innerHeight });
  await planeCount();
  // Nothing in it leaves dev mode: no close button, no corner button, and Esc and the shortcut
  // leave it open.
  expect(page.getByRole('button', { name: /^(Dev mode|Close dev mode)$/ }).elements()).toHaveLength(
    0,
  );
  await isFocused(panel());
  await keyboard.press('Escape');
  await keyboard.press('Alt+Shift+D');
  expect(shown(panel())).toBe(true);
  expect(opened).toHaveLength(2);
});

test('opened over the page, it covers it until Escape, and shows the nodes and the inspector, each control in one place', async () => {
  await open();
  await openOver();
  // Focus moves into the panel, and the page under it is inert.
  await isFocused(panel());
  expect(themeRoot().inert).toBe(true);
  // A plane for every shown node, each carrying copies of what the node holds.
  await planeCount();
  // The copies fill in after their planes, a frame later on a slow machine.
  await expect
    .poll(() => panel().element().querySelectorAll('.env-dev-plane[data-problems]').length)
    .toBe(2);
  await expect
    .poll(
      () =>
        [...panel().element().querySelectorAll('.env-dev-surface')].filter((surface) =>
          surface.textContent?.includes('Painted'),
        ).length,
    )
    .toBe(1);

  // Each control has one place: no two controls share a name, nor with a dropdown open, where
  // the View dropdown's angles are named once and nothing else in it repeats one.
  const host = document.querySelector('[data-env-dev-host]')!;
  const roles = ['button', 'menuitem', 'menuitemcheckbox', 'menuitemradio'];
  const names = () =>
    [...host.querySelectorAll('button, [role]')]
      .filter((element) => roles.includes(element.getAttribute('role') ?? element.localName))
      .filter((element) => element.getClientRects().length > 0)
      .map(
        (element) =>
          element.getAttribute('aria-label') ??
          element.textContent?.replace(/\s+/g, ' ').trim() ??
          '',
      );
  const unique = (list: string[]) => expect(list.length).toBe(new Set(list).size);
  unique(names());
  const popups = () => host.querySelectorAll(':is([role=dialog], [role=menu])');
  for (const dropdown of ['View', 'Show', 'Responsive', 'View settings']) {
    await button(panel(), dropdown).click();
    await expect
      .poll(() =>
        [...popups()].some(
          (popup) =>
            popup.getAttribute('aria-label') === dropdown ||
            document.getElementById(popup.getAttribute('aria-labelledby') ?? '')?.textContent ===
              dropdown,
        ),
      )
      .toBe(true);
    unique(names());
    await keyboard.press('Escape');
    // The next dropdown opens once this one has closed, so the two are never counted together.
    await expect.poll(() => popups().length).toBe(0);
  }

  // The tree, in its sidebar, lists the nodes; the inspector shows the selected one.
  await panel()
    .getByRole('complementary', { name: 'Layout nodes' })
    .getByRole('treeitem', { name: /row "painted"/ })
    .click();
  const details = panel()
    .getByRole('complementary', { name: 'Dev mode inspector' })
    .getByRole('region', { name: 'Details of row "painted"' });
  await expect.poll(() => details.query()?.textContent).toContain('Layout never paints');
  await panel().getByRole('tab', { name: 'Readout' }).click();
  await expect
    .poll(
      () =>
        panel().getByRole('tabpanel', { name: 'Readout' }).element().querySelector('pre')
          ?.textContent,
    )
    .toContain('scaffold "app"');
  // The readout leaves dev mode's own UI out, also while it is open.
  expect(layout().describe()).not.toContain('env-dev');
  // Escape closes it and gives the page back.
  (panel().element() as HTMLElement).focus();
  await keyboard.press('Escape');
  await isHidden(panel());
  expect(themeRoot().inert).toBe(false);
  await isShown(button(page.elementLocator(document.body), 'Dev mode'));
});

test(
  'the View dropdown turns the view to each angle, and fits it; the toolbar names its buttons at once',
  { tags: ['engines'] },
  async () => {
    await open();
    await openOver();
    const toolbar = panel().getByRole('toolbar', { name: '3D view' });
    await planeCount();
    const rotation = (rx: number, ry: number) => `rotateX(${rx}deg) rotateY(${ry}deg)`;
    const angles: [string, string][] = [
      ['Front', rotation(0, 0)],
      ['Top', rotation(-70, 0)],
      ['Left', rotation(0, 70)],
      ['Right', rotation(0, -70)],
      ['Tilted', rotation(38, -22)],
    ];
    for (const [name, turned] of angles) {
      await turnTo(name);
      await expect.poll(sceneStyle).toContain(turned);
      // The dropdown closes; opened again, it marks the angle the view is at.
      await expect.poll(() => shown(page.getByRole('group', { name: 'Angles' }))).toBe(false);
    }
    await button(toolbar, 'View').click();
    await expect.element(button(page, 'Tilted')).toHaveAttribute('aria-pressed', 'true');
    await expect.element(button(page, 'Front')).toHaveAttribute('aria-pressed', 'false');
    // Picking the angle the view is at again brings the whole page back after zooming.
    await keyboard.press('Escape');
    const fittedZoom = zoom();
    const view = box(panel().element().querySelector('.env-dev-view')!);
    await mouse.move(view.x + 40, view.y + view.height - 40);
    await keyboard.down('Control');
    for (let turn = 0; turn < 3; turn += 1) await mouse.wheel(0, -100);
    await keyboard.up('Control');
    await expect.poll(zoom).toBeGreaterThan(fittedZoom * 1.2);
    await turnTo('Tilted');
    await expect.poll(zoom).toBeCloseTo(fittedZoom, 3);
    // The toolbar's buttons show their names at once, with no wait: the clock stands still but
    // for a millisecond.
    stopTimers();
    const show = centre(button(toolbar, 'Show'));
    await mouse.move(show.x, show.y);
    await passTime(1);
    await expect.poll(() => page.getByRole('tooltip').query()?.textContent).toBe('Show');
    vi.useRealTimers();
    // The arrow keys move between the toolbar's dropdowns.
    (button(toolbar, 'View').element() as HTMLElement).focus();
    await keyboard.press('ArrowRight');
    await isFocused(button(toolbar, 'Show'));
    await keyboard.press('ArrowRight');
    await isFocused(button(toolbar, 'Responsive'));
  },
);

test(
  'dragging turns the view, also over a selection, and never drags a picture',
  { tags: ['engines'] },
  async () => {
    await open();
    await openOver();
    await planeCount();
    const seen = { drags: 0, cancels: 0 };
    const listening = new AbortController();
    document.addEventListener('dragstart', () => (seen.drags += 1), {
      capture: true,
      signal: listening.signal,
    });
    document.addEventListener('pointercancel', () => (seen.cancels += 1), {
      capture: true,
      signal: listening.signal,
    });
    const view = centre(panel().element().querySelector('.env-dev-view')!);
    /** Drags across the view's middle, 150px right and 50px down, and returns the rotation. */
    const drag = async () => {
      await mouse.move(view.x, view.y);
      await mouse.down();
      await mouse.move(view.x + 150, view.y + 50, { steps: 10 });
      await mouse.up();
      return /rotateX\((-?[\d.]+)deg\) rotateY\((-?[\d.]+)deg\)/
        .exec(sceneStyle())!
        .slice(1)
        .map(Number);
    };
    // From the tilted view, 38 and -22 degrees, a drag turns it 0.3 degrees a pixel.
    expect(await drag()).toEqual([23, 23]);
    // Text selected across the view, as by Ctrl+A or a selection dragged out of a sidebar, used
    // to be dragged as a picture, which cancelled the pointer and stopped the view turning.
    await panel().getByRole('heading', { name: 'Nodes' }).click();
    await keyboard.press('ControlOrMeta+A');
    expect(String(getSelection()).length).toBeGreaterThan(0);
    expect(await drag()).toEqual([8, 68]);
    listening.abort();
    expect(seen).toEqual({ drags: 0, cancels: 0 });
  },
);

test('"only the selected" shows the selected node and what is inside it', async () => {
  await open();
  await openOver();
  const show = button(panel(), 'Show');
  const only = page.getByRole('menuitemcheckbox', { name: /^Only the selected/ });
  const count = (expected: number) => expect.poll(() => planes().length).toBe(expected);
  /** Turns Only the selected on or off in the Show dropdown, which stays open, and closes it. */
  const toggleOnly = async (checked: boolean) => {
    await show.click();
    await only.click();
    await expect.element(only).toHaveAttribute('aria-checked', String(checked));
    await keyboard.press('Escape');
    await isHidden(only);
  };
  await count(15);
  // On, with nothing selected, every plane shows, also under the pointer.
  await toggleOnly(true);
  const first = centre(planes()[0]!);
  await mouse.move(first.x, first.y);
  await count(15);
  // Selecting the cards' row shows it and its three cards; another node, that one alone.
  const tree = (name: RegExp) => panel().getByRole('treeitem', { name });
  await tree(/row "cards"/).click();
  await count(4);
  expect(panel().element().querySelectorAll('.env-dev-plane[data-selected]')).toHaveLength(1);
  await tree(/row "painted"/).click();
  await count(1);
  // Clicking the selected row again clears the selection, and everything shows.
  await tree(/row "painted"/).click();
  await count(15);
  // Off, the selection no longer filters.
  await tree(/row "cards"/).click();
  await toggleOnly(false);
  await count(15);
  // Escape closed only the dropdown each time: dev mode is still open.
  expect(shown(panel())).toBe(true);
});

test(
  'the Responsive dropdown lays the page out at another size, not the viewport, and wider than the window',
  { tags: ['engines'] },
  async () => {
    await page.viewport(1280, 720);
    await open();
    await openOver();
    const scope = panel();
    const view = () => scope.element().querySelector('.env-dev-view')!;
    const scene = () => scope.element().querySelector('.env-dev-scene')!;
    const right = scope.getByRole('slider', { name: 'Page width, right edge' });
    const bottom = scope.getByRole('slider', { name: 'Page height, bottom edge' });
    const label = () => scope.element().querySelector('.env-dev-frame-label')?.textContent;
    const rootSize = () => {
      const { width, height } = themeRoot().getBoundingClientRect();
      return `${width}×${height}`;
    };
    const rootWidth = () => themeRoot().getBoundingClientRect().width;
    const own = rootSize();
    const ownWidth = rootWidth();
    const viewBox = box(view());
    const frames = () => scope.element().querySelectorAll('.env-dev-frame').length;
    const responsive = button(scope, 'Responsive');
    const toggle = page.getByRole('menuitemcheckbox', { name: /^Responsive frame/ });
    const deviceMenu = page.getByRole('menuitem', { name: /^Device/ });
    const portrait = page.getByRole('menuitemradio', { name: 'Portrait' });
    const landscape = page.getByRole('menuitemradio', { name: 'Landscape' });
    // Off by default: the page at its own size, with no frame, handles or label, and the device
    // and the orientation wait until it is on.
    await responsive.click();
    await expect.element(toggle).toHaveAttribute('aria-checked', 'false');
    await expect.element(deviceMenu).toHaveAttribute('aria-disabled', 'true');
    await expect.element(portrait).toHaveAttribute('aria-disabled', 'true');
    expect(frames()).toBe(0);
    expect(right.elements()).toHaveLength(0);
    // Turned on, the frame starts at the page's own size; turned off, it goes again.
    await toggle.click();
    await expect.element(toggle).toHaveAttribute('aria-checked', 'true');
    await expect.element(right).toHaveAttribute('aria-valuenow', String(Math.round(ownWidth)));
    expect(rootSize()).toBe(own);
    await toggle.click();
    await expect.poll(frames).toBe(0);
    await expect.poll(rootSize).toBe(own);

    // On, a device lays the page out at its size, and the planes follow; the window and the view
    // keep theirs.
    await toggle.click();
    await deviceMenu.click();
    await page.getByRole('menuitemradio', { name: /^iPhone SE/ }).click();
    await expect.poll(rootSize).toBe('375×667');
    await expect.poll(() => css(scene(), 'width')).toBe('375px');
    await expect.poll(label).toBe('iPhone SE · 375×667px · 23.44×41.69rem · compact');
    expect(right.element().getAttribute('aria-valuetext')).toMatch(/^iPhone SE · 375×667px/);
    expect([innerWidth, innerHeight]).toEqual([1280, 720]);
    expect(box(view())).toEqual(viewBox);
    // The inspector's readout follows the size.
    await scope.getByRole('tab', { name: 'Readout' }).click();
    await expect
      .poll(
        () =>
          scope.getByRole('tabpanel', { name: 'Readout' }).element().querySelector('pre')
            ?.textContent,
      )
      .toContain('scaffold "app" · 23.44×');
    // Landscape swaps the width and the height, and keeps the device.
    await responsive.click();
    await expect.element(portrait).toHaveAttribute('aria-checked', 'true');
    await landscape.click();
    await expect.poll(rootSize).toBe('667×375');
    await expect.poll(label).toContain('iPhone SE · 667×375px · 41.69×23.44rem · medium');

    // The arrow keys on an edge step by 1rem, with Shift by 5rem; stepping makes it a free frame.
    (bottom.element() as HTMLElement).focus();
    await keyboard.press('ArrowUp');
    await expect.poll(rootSize).toBe('667×391');
    await expect.poll(label).toBe('667×391px · 41.69×24.44rem · medium');
    (right.element() as HTMLElement).focus();
    await keyboard.press('Shift+ArrowLeft');
    await expect.poll(rootWidth).toBe(587);
    // Dragging the right edge to the left narrows it, with the whole frame in view, once the view
    // has turned there.
    await turnTo('Tilted');
    // The View menu gone, and the view at rest: unchanged across a few frames, which a busy
    // machine spaces further apart.
    await expect.poll(() => page.getByRole('dialog', { name: 'View' }).query()).toBeNull();
    await expect
      .poll(async () => {
        const before = sceneStyle();
        await waitOnRealTime(200);
        return before === sceneStyle();
      })
      .toBe(true);
    const edge = centre(right);
    await mouse.move(edge.x, edge.y);
    await mouse.down();
    await mouse.move(edge.x - 40, edge.y, { steps: 5 });
    await mouse.up();
    await expect.poll(rootWidth).toBeLessThan(587);

    // Responsive frame off: the frame goes, and the root's style is as it was.
    await responsive.click();
    await toggle.click();
    await keyboard.press('Escape');
    await expect.poll(rootSize).toBe(own);
    expect(frames()).toBe(0);
    expect(themeRoot().hasAttribute('style')).toBe(false);

    // A device wider than the window lays the root out whole: its planes are as wide, cut off by
    // nothing around the root, and once the page settles every plane carries a copy of its node
    // at the node's size.
    await pickDevice(/^Full HD/);
    const widest = () =>
      Math.max(
        ...[...planes()].map((plane) => Number.parseFloat((plane as HTMLElement).style.width)),
      );
    await expect.poll(widest).toBe(1920);
    await expect
      .poll(
        () =>
          [...planes()].filter((plane) => {
            const surface = plane.querySelector<HTMLElement>('.env-dev-surface');
            return (
              surface &&
              Math.abs(
                Number.parseFloat(surface.style.width) -
                  Number.parseFloat((plane as HTMLElement).style.width),
              ) > 1
            );
          }).length,
      )
      .toBe(0);
    // Closing dev mode with a size set puts it back too.
    (panel().element() as HTMLElement).focus();
    await keyboard.press('Escape');
    await isHidden(panel());
    expect(rootSize()).toBe(own);
    expect(themeRoot().hasAttribute('style')).toBe(false);
  },
);

test("dev mode's own theme switches at the tree's foot, persists, leaves the page's alone and starts from its root's", async () => {
  await open();
  await openOver();
  const editor = () => document.querySelector('.env-dev')!;
  const boundary = () => document.querySelector('.env-theme:not([data-env-dev] *)')!;
  const pageAttributes = () =>
    ['data-env-theme', 'data-env-contrast'].map((name) => boundary().getAttribute(name)).join();
  const pageBefore = pageAttributes();
  const pageTheme = boundary().getAttribute('data-env-theme')!;
  const other = pageTheme === 'dark' ? 'Light' : 'Dark';
  // By default dev mode takes the page's theme.
  expect(editor().getAttribute('data-env-theme')).toBe(pageTheme);
  const themeButton = () =>
    panel()
      .getByRole('complementary', { name: 'Layout nodes' })
      .getByRole('button', { name: 'Dev mode theme' });

  await themeButton().click();
  await page.getByRole('menuitemradio', { name: other }).click();
  await expect.poll(() => editor().getAttribute('data-env-theme')).toBe(other.toLowerCase());
  await themeButton().click();
  await page.getByRole('menuitemcheckbox', { name: 'High contrast' }).click();
  await expect.poll(() => editor().getAttribute('data-env-contrast')).toBe('high');
  // The check item leaves its menu open; Escape closes the menu first.
  await keyboard.press('Escape');
  await isHidden(page.getByRole('menu'));
  // The page keeps its own theme.
  expect(pageAttributes()).toBe(pageBefore);

  // The choice outlasts a reload.
  await open();
  await openOver();
  await expect.poll(() => editor().getAttribute('data-env-theme')).toBe(other.toLowerCase());
  expect(editor().getAttribute('data-env-contrast')).toBe('high');
  expect(pageAttributes()).toBe(pageBefore);
  // Same as the page goes back to the page's theme.
  await themeButton().click();
  await page.getByRole('menuitemradio', { name: 'Same as the page' }).click();
  await expect.poll(() => editor().getAttribute('data-env-theme')).toBe(pageTheme);

  // The root sits in a nested theme boundary of the other theme, such as a dark region of a light
  // page: dev mode takes the root's theme, not the document's.
  await open('root=.dev-page');
  const nested = other.toLowerCase();
  const scaffold = document.querySelector('.dev-scaffold')!;
  scaffold.classList.add('env-theme');
  scaffold.setAttribute('data-env-theme', nested);
  await openOver();
  await expect.poll(() => editor().getAttribute('data-env-theme')).toBe(nested);
});

test('each sidebar hides from its header, comes back from its corner, resizes by its edge and widens well past half the window', async () => {
  await page.viewport(1440, 720);
  await open();
  await openOver();
  const tree = () => panel().getByRole('complementary', { name: 'Layout nodes' });
  const inspector = () => panel().getByRole('complementary', { name: 'Dev mode inspector' });
  const view = () => panel().element().querySelector('.env-dev-view')!;
  const width = (target: Locator | Element) => box(target).width;
  const both = width(view());
  // No toolbar button shows or hides a sidebar.
  expect(
    panel()
      .getByRole('toolbar', { name: '3D view' })
      .getByRole('button', { name: /nodes|inspector/i })
      .elements(),
  ).toHaveLength(0);

  // Hidden, a sidebar leaves its button in the same top corner of the window.
  const hideTree = tree().getByRole('button', { name: 'Hide the nodes' });
  const hideInspector = inspector().getByRole('button', { name: 'Hide the inspector' });
  const treeCorner = box(hideTree);
  const inspectorCorner = box(hideInspector);
  await hideTree.click();
  await hideInspector.click();
  await isHidden(tree());
  await isHidden(inspector());
  expect(width(view())).toBe(innerWidth);
  const showTree = button(panel(), 'Show the nodes');
  const showInspector = button(panel(), 'Show the inspector');
  const near = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.abs(a.x - b.x) <= 8 && Math.abs(a.y - b.y) <= 8;
  expect(near(box(showTree), treeCorner)).toBe(true);
  expect(near(box(showInspector), inspectorCorner)).toBe(true);
  await showTree.click();
  await showInspector.click();
  await isShown(tree());
  await isShown(inspector());
  expect(width(view())).toBe(both);

  // Each resizes by its inner edge, as a resizable Drawer does: by dragging, the arrow keys and a
  // double click back to its width.
  const treeHandle = panel().getByRole('separator', { name: 'Resize the nodes' });
  const inspectorHandle = panel().getByRole('separator', { name: 'Resize the inspector' });
  const treeWidth = width(tree());
  const handle = centre(treeHandle);
  await mouse.move(handle.x, handle.y);
  await mouse.down();
  await mouse.move(handle.x + 80, handle.y, { steps: 5 });
  await mouse.up();
  await expect.poll(() => width(tree())).toBeGreaterThan(treeWidth + 60);
  await treeHandle.dblClick();
  await expect.poll(() => width(tree())).toBe(treeWidth);
  const inspectorWidth = width(inspector());
  (inspectorHandle.element() as HTMLElement).focus();
  await keyboard.press('ArrowLeft');
  await expect.poll(() => width(inspector())).toBeGreaterThan(inspectorWidth);

  // A sidebar widens well past half the window; narrowed again, the readout's lines wrap inside
  // it, and nothing runs past its edge.
  const edge = centre(inspectorHandle);
  await mouse.move(edge.x, edge.y);
  await mouse.down();
  await mouse.move(300, edge.y, { steps: 8 });
  await mouse.up();
  await expect.poll(() => width(inspector())).toBeGreaterThan(720);
  await inspectorHandle.dblClick();
  await panel().getByRole('tab', { name: 'Readout' }).click();
  const readout = () =>
    panel().getByRole('tabpanel', { name: 'Readout' }).element().querySelector('pre')!;
  await expect.poll(() => readout().textContent).toContain('scaffold "app"');
  expect({
    overflow: readout().scrollWidth - readout().clientWidth,
    inside:
      readout().getBoundingClientRect().right <=
      readout().closest('aside')!.getBoundingClientRect().right,
  }).toEqual({ overflow: 0, inside: true });

  // The widths and what is hidden outlast a reload.
  (inspectorHandle.element() as HTMLElement).focus();
  await keyboard.press('ArrowLeft');
  const kept = width(inspector());
  await tree().getByRole('button', { name: 'Hide the nodes' }).click();
  await open();
  await openOver();
  await isHidden(tree());
  expect(width(inspector())).toBe(kept);
});

test(
  'in a short window the wheel scrolls the tree to its last node, the inspector and the device menu, and the page once dev mode closes',
  { tags: ['engines'] },
  async () => {
    await page.viewport(1280, 300);
    await open();
    const scrollY = () => document.scrollingElement!.scrollTop;
    await openOver();
    /** Where an element's scroll is: its offset and the most it takes. */
    const scroll = (element: Element) => [
      element.scrollTop,
      element.scrollHeight - element.clientHeight,
    ];
    /** Turns the wheel down over the visible middle of an element, more than it can scroll. */
    const wheelOver = async (target: Locator) => {
      const { x, y, width, height } = box(target);
      await mouse.move(x + width / 2, (y + Math.min(y + height, 300)) / 2);
      for (let turn = 0; turn < 12; turn += 1) await mouse.wheel(0, 200);
    };
    /** Scrolled to its end, which is further than it shows. */
    const atEnd = (target: Locator) =>
      expect
        .poll(() => {
          const [top, most] = scroll(target.element());
          return most! > 0 && top! >= most! - 1;
        })
        .toBe(true);

    // The tree scrolls itself, to its last node.
    const tree = panel().getByRole('tree', { name: 'Layout nodes' });
    await wheelOver(tree);
    await atEnd(tree);
    await expect.element(tree.getByRole('treeitem', { name: /box "hidden"/ })).toBeInViewport();
    // The inspector's column scrolls the details, and the readout.
    await tree.getByRole('treeitem', { name: /row "painted"/ }).click();
    const details = panel().getByRole('tabpanel', { name: 'Details' });
    await isShown(details.getByRole('region', { name: 'Details of row "painted"' }));
    await wheelOver(details);
    await atEnd(details);
    await panel().getByRole('tab', { name: 'Readout' }).click();
    const readout = panel().getByRole('tabpanel', { name: 'Readout' });
    await expect
      .poll(() => readout.element().querySelector('pre')?.textContent)
      .toContain('problems (2):');
    readout.element().scrollTo(0, 0);
    await wheelOver(readout);
    await atEnd(readout);
    // The device menu, taller than the window, scrolls to its last device.
    await button(panel(), 'Responsive').click();
    await page.getByRole('menuitemcheckbox', { name: /^Responsive frame/ }).click();
    await page.getByRole('menuitem', { name: /^Device/ }).click();
    const menu = page.getByRole('menu', { name: 'Device' });
    await isShown(menu);
    await wheelOver(menu);
    await atEnd(menu);
    await expect.element(menu.getByRole('menuitemradio').last()).toBeInViewport();
    // Escape closes the device menu, then the Responsive one, or both at once in some engines;
    // dev mode stays open.
    await keyboard.press('Escape');
    await isHidden(menu);
    if (page.getByRole('menu').elements().length) await keyboard.press('Escape');
    await isGone(page.getByRole('menu'));
    expect(shown(panel())).toBe(true);
    // The wheel past the columns' ends, or where nothing in dev mode scrolls, leaves the page
    // under it where it was.
    await wheelOver(panel().getByRole('heading', { name: 'Nodes' }));
    await wheelOver(panel().getByRole('toolbar', { name: '3D view' }));
    expect(scrollY()).toBe(0);

    // Closed, dev mode leaves nothing that stops the page scrolling. Focus leaves the Responsive
    // button first, whose tooltip Escape would close before dev mode.
    await mouse.move(640, 290);
    (panel().element() as HTMLElement).focus();
    await isGone(page.getByRole('tooltip'));
    await keyboard.press('Escape');
    await isHidden(panel());
    expect(
      [document.documentElement, document.body, themeRoot()].map((element) => {
        const style = getComputedStyle(element);
        return `${style.overflow} ${style.pointerEvents} ${style.touchAction} ${(element as HTMLElement).inert}`;
      }),
    ).toEqual(Array(3).fill('visible auto auto false'));
    await mouse.move(640, 150);
    await mouse.wheel(0, 200);
    await expect.poll(scrollY).toBeGreaterThan(0);
  },
);

test(
  'the wheel in the 3D view scrolls what is under the pointer in the root, and Ctrl+wheel zooms',
  { tags: ['engines'] },
  async () => {
    await page.viewport(1280, 720);
    // The page is the root, inside a scaffold that scrolls; its clipped column scrolls too.
    await open('root=.dev-page');
    // After the fixture's own style sheet, which is in the body, so these rules win.
    const style = document.createElement('style');
    style.textContent =
      '.dev-scaffold { block-size: 20rem; overflow: auto; } .dev-clip { overflow: auto; }';
    document.body.append(style);
    onTestFinished(() => style.remove());
    const tall = (rem: number) => {
      const spacer = document.createElement('div');
      spacer.style.flex = 'none';
      spacer.style.blockSize = `${rem}rem`;
      return spacer;
    };
    const scaffold = document.querySelector('.dev-scaffold')!;
    const root = document.querySelector('.dev-page')!;
    const clip = document.querySelector('.dev-clip')!;
    clip.append(tall(20));
    root.append(tall(40));
    await openOver();
    const plane = (name: string) =>
      [...planes()].find((each) =>
        each.querySelector(':scope > .env-dev-name')?.textContent?.includes(name),
      )!;
    await turnTo('Front');
    /**
     * Rests the pointer on a plane, near its bottom edge, clear of the planes above it; again
     * while the planes still move to where the page now is.
     */
    const restOn = (name: string) =>
      expect
        .poll(async () => {
          const { x, y, height } = box(plane(name));
          await mouse.move(x + 6, y + height - 4);
          await mouse.move(x + 8, y + height - 6);
          return plane(name).hasAttribute('data-hovered');
        })
        .toBe(true);

    // Over a node in a scroller, the wheel scrolls it.
    await restOn('column "clipped"');
    await mouse.wheel(0, 100);
    await expect.poll(() => clip.scrollTop).toBeGreaterThan(0);
    // Over a node nothing in the root scrolls, the wheel zooms; what is outside the root stays.
    const before = zoom();
    await restOn('row "painted"');
    await mouse.wheel(0, 100);
    await expect.poll(zoom).toBeLessThan(before);
    expect(scaffold.scrollTop).toBe(0);
    // Ctrl+wheel zooms anywhere.
    const out = zoom();
    await restOn('column "clipped"');
    await keyboard.down('Control');
    await mouse.wheel(0, -100);
    await keyboard.up('Control');
    await expect.poll(zoom).toBeGreaterThan(out);

    // With a height from a device, the root scrolls in it, as a window would.
    await pickDevice(/^iPhone SE/);
    await expect.poll(() => css(root, 'overflow-y')).toBe('auto');
    await turnTo('Tilted');
    await restOn('row "painted"');
    await mouse.wheel(0, 200);
    await expect.poll(() => root.scrollTop).toBeGreaterThan(0);
    expect(scaffold.scrollTop).toBe(0);

    // Closed, the root is as it was, and the page scrolls again.
    (panel().element() as HTMLElement).focus();
    await keyboard.press('Escape');
    await isHidden(panel());
    expect(root.hasAttribute('style')).toBe(false);
    const middle = centre(scaffold);
    await mouse.move(middle.x, middle.y);
    await mouse.wheel(0, 200);
    await expect.poll(() => scaffold.scrollTop).toBeGreaterThan(0);
  },
);
