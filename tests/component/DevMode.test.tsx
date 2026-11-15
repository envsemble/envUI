import { afterEach, beforeEach, expect, onTestFinished, test, vi } from 'vitest';
import { page, type Locator } from 'vitest/browser';
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

async function openOver() {
  await expect.poll(() => window.envuiDevMode).toBeDefined();
  window.envuiDevMode!.open();
  await isShown(panel());
  return panel();
}

async function turnTo(name: string) {
  await button(panel().getByRole('toolbar', { name: '3D view' }), 'View').click();
  await button(page.getByRole('dialog', { name: 'View' }), name).click();
}

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

const sceneStyle = () =>
  panel().element().querySelector('.env-dev-scene')!.getAttribute('style') ?? '';
const zoom = () => Number(/scale\(([\d.]+)\)/.exec(sceneStyle())?.[1]);

const rules = (problems: LayoutProblem[]) =>
  problems.map(({ rule, node }) => `${rule} ${node}`).sort();

test('the readout describes and checks the layout nodes, also at other widths', async () => {
  await page.viewport(1024, 720);
  await open();
  const text = layout().describe();
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
  const [sized] = layout().at([{ width: '22rem', height: '20rem' }]);
  expect(sized).toMatchObject({ width: '22rem', height: '20rem', windowClass: 'compact' });
  expect(sized!.text).toMatch(/^root .*· 22×20rem · compact/m);
  expect(themeRoot().hasAttribute('style')).toBe(false);

  await page.getByRole('button', { name: 'Open the dialog' }).click();
  await isShown(page.getByRole('dialog', { name: 'Details' }));
  expect(layout().describe()).toMatch(/open overlays \(1\):\n {2}dialog\b/);
  await keyboard.press('Escape');
  await isGone(page.getByRole('dialog'));

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
  const opened: string[] = [];
  vi.spyOn(window, 'open').mockImplementation((url) => {
    opened.push(String(url));
    return {} as Window;
  });
  const corner = button(page.elementLocator(document.body), 'Dev mode');
  await expect.element(corner).toHaveAttribute('aria-keyshortcuts', 'Alt+Shift+D');
  await corner.click();
  await expect.poll(() => opened.length).toBe(1);
  const address = new URL(opened[0]!);
  expect(address.pathname).toBe(location.pathname);
  expect(address.searchParams.has('envui-dev')).toBe(true);
  expect(panel().elements()).toHaveLength(0);
  expect(themeRoot().inert).toBe(false);
  await keyboard.press('Alt+Shift+D');
  await expect.poll(() => opened.length).toBe(2);

  await open(address.search.slice(1));
  await isShown(panel());
  await expect.poll(() => document.title).toMatch(/^Dev mode/);
  expect(box(panel())).toEqual({ x: 0, y: 0, width: innerWidth, height: innerHeight });
  await planeCount();
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
  await isFocused(panel());
  expect(themeRoot().inert).toBe(true);
  await planeCount();
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
    await expect.poll(() => popups().length).toBe(0);
  }

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
  expect(layout().describe()).not.toContain('env-dev');
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
      await expect.poll(() => shown(page.getByRole('group', { name: 'Angles' }))).toBe(false);
    }
    await button(toolbar, 'View').click();
    await expect.element(button(page, 'Tilted')).toHaveAttribute('aria-pressed', 'true');
    await expect.element(button(page, 'Front')).toHaveAttribute('aria-pressed', 'false');
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
    stopTimers();
    const show = centre(button(toolbar, 'Show'));
    await mouse.move(show.x, show.y);
    await passTime(1);
    await expect.poll(() => page.getByRole('tooltip').query()?.textContent).toBe('Show');
    vi.useRealTimers();
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
    const rotationAfterDragAcrossView = async () => {
      await mouse.move(view.x, view.y);
      await mouse.down();
      await mouse.move(view.x + 150, view.y + 50, { steps: 10 });
      await mouse.up();
      return /rotateX\((-?[\d.]+)deg\) rotateY\((-?[\d.]+)deg\)/
        .exec(sceneStyle())!
        .slice(1)
        .map(Number);
    };
    expect(await rotationAfterDragAcrossView()).toEqual([23, 23]);
    await panel().getByRole('heading', { name: 'Nodes' }).click();
    await keyboard.press('ControlOrMeta+A');
    expect(String(getSelection()).length).toBeGreaterThan(0);
    expect(await rotationAfterDragAcrossView()).toEqual([8, 68]);
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
  const toggleOnly = async (checked: boolean) => {
    await show.click();
    await only.click();
    await expect.element(only).toHaveAttribute('aria-checked', String(checked));
    await keyboard.press('Escape');
    await isHidden(only);
  };
  await count(15);
  await toggleOnly(true);
  const first = centre(planes()[0]!);
  await mouse.move(first.x, first.y);
  await count(15);
  const tree = (name: RegExp) => panel().getByRole('treeitem', { name });
  await tree(/row "cards"/).click();
  await count(4);
  expect(panel().element().querySelectorAll('.env-dev-plane[data-selected]')).toHaveLength(1);
  await tree(/row "painted"/).click();
  await count(1);
  await tree(/row "painted"/).click();
  await count(15);
  await tree(/row "cards"/).click();
  await toggleOnly(false);
  await count(15);
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
    await responsive.click();
    await expect.element(toggle).toHaveAttribute('aria-checked', 'false');
    await expect.element(deviceMenu).toHaveAttribute('aria-disabled', 'true');
    await expect.element(portrait).toHaveAttribute('aria-disabled', 'true');
    expect(frames()).toBe(0);
    expect(right.elements()).toHaveLength(0);
    await toggle.click();
    await expect.element(toggle).toHaveAttribute('aria-checked', 'true');
    await expect.element(right).toHaveAttribute('aria-valuenow', String(Math.round(ownWidth)));
    expect(rootSize()).toBe(own);
    await toggle.click();
    await expect.poll(frames).toBe(0);
    await expect.poll(rootSize).toBe(own);

    await toggle.click();
    await deviceMenu.click();
    await page.getByRole('menuitemradio', { name: /^iPhone SE/ }).click();
    await expect.poll(rootSize).toBe('375×667');
    await expect.poll(() => css(scene(), 'width')).toBe('375px');
    await expect.poll(label).toBe('iPhone SE · 375×667px · 23.44×41.69rem · compact');
    expect(right.element().getAttribute('aria-valuetext')).toMatch(/^iPhone SE · 375×667px/);
    expect([innerWidth, innerHeight]).toEqual([1280, 720]);
    expect(box(view())).toEqual(viewBox);
    await scope.getByRole('tab', { name: 'Readout' }).click();
    await expect
      .poll(
        () =>
          scope.getByRole('tabpanel', { name: 'Readout' }).element().querySelector('pre')
            ?.textContent,
      )
      .toContain('scaffold "app" · 23.44×');
    await responsive.click();
    await expect.element(portrait).toHaveAttribute('aria-checked', 'true');
    await landscape.click();
    await expect.poll(rootSize).toBe('667×375');
    await expect.poll(label).toContain('iPhone SE · 667×375px · 41.69×23.44rem · medium');

    (bottom.element() as HTMLElement).focus();
    await keyboard.press('ArrowUp');
    await expect.poll(rootSize).toBe('667×391');
    await expect.poll(label).toBe('667×391px · 41.69×24.44rem · medium');
    (right.element() as HTMLElement).focus();
    await keyboard.press('Shift+ArrowLeft');
    await expect.poll(rootWidth).toBe(587);
    await turnTo('Tilted');
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

    await responsive.click();
    await toggle.click();
    await keyboard.press('Escape');
    await expect.poll(rootSize).toBe(own);
    expect(frames()).toBe(0);
    expect(themeRoot().hasAttribute('style')).toBe(false);

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
  await keyboard.press('Escape');
  await isHidden(page.getByRole('menu'));
  expect(pageAttributes()).toBe(pageBefore);

  await open();
  await openOver();
  await expect.poll(() => editor().getAttribute('data-env-theme')).toBe(other.toLowerCase());
  expect(editor().getAttribute('data-env-contrast')).toBe('high');
  expect(pageAttributes()).toBe(pageBefore);
  await themeButton().click();
  await page.getByRole('menuitemradio', { name: 'Same as the page' }).click();
  await expect.poll(() => editor().getAttribute('data-env-theme')).toBe(pageTheme);

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
  expect(
    panel()
      .getByRole('toolbar', { name: '3D view' })
      .getByRole('button', { name: /nodes|inspector/i })
      .elements(),
  ).toHaveLength(0);

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
    const scroll = (element: Element) => [
      element.scrollTop,
      element.scrollHeight - element.clientHeight,
    ];
    const wheelOver = async (target: Locator) => {
      const { x, y, width, height } = box(target);
      await mouse.move(x + width / 2, (y + Math.min(y + height, 300)) / 2);
      for (let turn = 0; turn < 12; turn += 1) await mouse.wheel(0, 200);
    };
    const atEnd = (target: Locator) =>
      expect
        .poll(() => {
          const [top, most] = scroll(target.element());
          return most! > 0 && top! >= most! - 1;
        })
        .toBe(true);

    const tree = panel().getByRole('tree', { name: 'Layout nodes' });
    await wheelOver(tree);
    await atEnd(tree);
    await expect.element(tree.getByRole('treeitem', { name: /box "hidden"/ })).toBeInViewport();
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
    await button(panel(), 'Responsive').click();
    await page.getByRole('menuitemcheckbox', { name: /^Responsive frame/ }).click();
    await page.getByRole('menuitem', { name: /^Device/ }).click();
    const menu = page.getByRole('menu', { name: 'Device' });
    await isShown(menu);
    await wheelOver(menu);
    await atEnd(menu);
    await expect.element(menu.getByRole('menuitemradio').last()).toBeInViewport();
    await keyboard.press('Escape');
    await isHidden(menu);
    if (page.getByRole('menu').elements().length) await keyboard.press('Escape');
    await isGone(page.getByRole('menu'));
    expect(shown(panel())).toBe(true);
    await wheelOver(panel().getByRole('heading', { name: 'Nodes' }));
    await wheelOver(panel().getByRole('toolbar', { name: '3D view' }));
    expect(scrollY()).toBe(0);

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
    await open('root=.dev-page');
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
    const restOn = (name: string) =>
      expect
        .poll(async () => {
          const { x, y, height } = box(plane(name));
          await mouse.move(x + 6, y + height - 4);
          await mouse.move(x + 8, y + height - 6);
          return plane(name).hasAttribute('data-hovered');
        })
        .toBe(true);

    await restOn('column "clipped"');
    await mouse.wheel(0, 100);
    await expect.poll(() => clip.scrollTop).toBeGreaterThan(0);
    const before = zoom();
    await restOn('row "painted"');
    await mouse.wheel(0, 100);
    await expect.poll(zoom).toBeLessThan(before);
    expect(scaffold.scrollTop).toBe(0);
    const out = zoom();
    await restOn('column "clipped"');
    await keyboard.down('Control');
    await mouse.wheel(0, -100);
    await keyboard.up('Control');
    await expect.poll(zoom).toBeGreaterThan(out);

    await pickDevice(/^iPhone SE/);
    await expect.poll(() => css(root, 'overflow-y')).toBe('auto');
    await turnTo('Tilted');
    await restOn('row "painted"');
    await mouse.wheel(0, 200);
    await expect.poll(() => root.scrollTop).toBeGreaterThan(0);
    expect(scaffold.scrollTop).toBe(0);

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
