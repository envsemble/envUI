import { expect, test } from 'vitest';
import { cdp, commands, page, server, type Locator } from 'vitest/browser';
import { Button } from '@envsemble/envui';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as buttonCounts from '../fixture/ButtonCounts.fixture.tsx';
import * as colors from '../fixture/Colors.fixture.tsx';
import * as primitives from '../fixture/Primitives.fixture.tsx';
import { box, collectErrors, css, keyboard, mouse } from './Browser.ts';
import { mount } from './Mount.tsx';

const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const label = (locator: Locator) => locator.element().textContent;

/** Waits out ConfirmButton's guard against a double press, 400 ms, as a deliberate press does. */
const pastTheGuard = () => new Promise((resolve) => setTimeout(resolve, 450));

test('LinkProvider routes destinations and leaves disabled links native', async () => {
  const errors = collectErrors();
  mount(adoption);
  const projects = page.getByTestId('router-button');
  await expect.element(projects).toHaveAttribute('data-router-link', '');
  const address = location.href;
  await projects.click();
  await expect.poll(() => document.body.dataset.navigatedTo).toBe('/projects');
  expect(location.href).toBe(address);
  const disabled = page.getByTestId('disabled-link');
  await expect.element(disabled).not.toHaveAttribute('data-router-link');
  await expect.element(disabled).not.toHaveAttribute('href');
  await expect.element(disabled).toHaveAttribute('aria-disabled', 'true');
  expect(errors).toEqual([]);
});

test("a number within a label's words stays in their line, and a badge keeps the button's gap", async () => {
  mount(buttonCounts);
  const button = page.getByTestId('show-tasks-light');
  await expect.element(button).toHaveTextContent('Show 33 tasks');
  const element = button.element();
  const number = element.querySelector('.env-animated-number')!.getBoundingClientRect();
  const words = document.createRange();
  const run = element.querySelector('.env-button-text')!.firstChild!;
  words.setStart(run, 0);
  words.setEnd(run, run.textContent!.trimEnd().length);
  // The space between "Show" and the number: a word space, narrower than the button's gap.
  const space = number.left - words.getBoundingClientRect().right;
  expect(space).toBeGreaterThan(0);
  expect(space).toBeLessThan(Number.parseFloat(css(element, 'column-gap')));
  // A badge is an item of its own, the gap from the words before it: only the number's button
  // holds a run of text.
  expect(
    page
      .getByTestId('button-counts-light')
      .element()
      .querySelectorAll('.env-button .env-button-text'),
  ).toHaveLength(1);
  // A text button alone in a box as wide as its content keeps its words in a line: its margins
  // give its padding back, which its largest width allows for.
  const alone = page.getByTestId('text-alone-light');
  await expect.element(alone).toHaveTextContent('Alex Morgan');
  const lines = document.createRange();
  lines.selectNodeContents(alone.element());
  expect(new Set([...lines.getClientRects()].map((line) => Math.round(line.top))).size).toBe(1);
});

test('a pending button keeps its label and name, reports busy and ignores presses', async () => {
  mount(adoption);
  const button = page.getByTestId('pending-button');
  await expect.element(button).toHaveAttribute('aria-busy', 'true');
  const element = button.element();
  const spinner = element.querySelector<HTMLElement>('.env-spinner')!;
  await expect.element(page.elementLocator(spinner)).toBeVisible();
  // The label stays in place, transparent, and the spinner turns in the label's color centred over
  // the button, as an arc alone rather than a labelled status line.
  const content = element.querySelector('.env-button-content')!;
  expect(content.textContent).toBe('Save changes');
  expect(css(content, 'color')).toBe('rgba(0, 0, 0, 0)');
  expect(css(spinner, 'color')).toBe(css(element, 'color'));
  expect(spinner.hasAttribute('data-label-hidden')).toBe(true);
  const [frame, arc] = [box(element), box(spinner)];
  expect(arc.x + arc.width / 2).toBeCloseTo(frame.x + frame.width / 2, 0);
  expect(arc.y + arc.height / 2).toBeCloseTo(frame.y + frame.height / 2, 0);
  // The button is as wide as the same button at rest, so the buttons beside it stay put.
  const rest = element.cloneNode(true) as HTMLElement;
  rest.removeAttribute('data-pending');
  rest.querySelector(':scope > .env-button-spinner')?.remove();
  element.after(rest);
  const widths = [element.getBoundingClientRect().width, rest.getBoundingClientRect().width];
  rest.remove();
  expect(widths[0]).toBeCloseTo(widths[1]!, 1);
  await button.click({ force: true });
  expect(text('pending-presses')()).toBe('0');
  await expect.element(page.getByRole('progressbar', { name: 'Refreshing seats' })).toBeVisible();
  if (server.browser === 'chromium') {
    // The browser's own accessibility tree, which drops visually hidden text, still names it.
    const session = cdp();
    // The document with the test's frame in it, whose node the button's is found among.
    const { root } = await session.send('DOM.getDocument', { depth: -1, pierce: true });
    type Node = {
      nodeId: number;
      attributes?: string[];
      children?: Node[];
      contentDocument?: Node;
    };
    const find = (node: Node): Node | undefined => {
      const attributes = node.attributes ?? [];
      if (attributes[attributes.indexOf('data-testid') + 1] === 'pending-button') return node;
      for (const child of [
        ...(node.children ?? []),
        ...(node.contentDocument ? [node.contentDocument] : []),
      ]) {
        const found = find(child);
        if (found) return found;
      }
      return undefined;
    };
    const { nodes } = await session.send('Accessibility.getPartialAXTree', {
      nodeId: find(root as Node)!.nodeId,
      fetchRelatives: false,
    });
    const name = nodes[0]?.name?.value;
    expect(name).toBe('Save changes');
  }
});

test('ConfirmButton names the consequence and runs only on a deliberate second press', async () => {
  const errors = collectErrors();
  // The fixture's buttons disarm after 800 ms.
  mount(adoption);
  const button = page.getByTestId('confirm-button');
  const confirmed = text('confirmed');
  const status = () => document.querySelector('.env-confirm-button-status')!.textContent;
  expect(label(button)).toBe('Remove');
  await expect.element(button).toHaveAttribute('data-variant', 'outline');

  await button.click();
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  await expect.element(button).toHaveAttribute('data-tone', 'danger');
  expect(status()).toBe('Remove Morgan. Press again to confirm.');
  await pastTheGuard();
  await button.click();
  await expect.poll(confirmed).toBe('1');
  expect(label(button)).toBe('Remove');
  expect(status()).toBe('');

  // A double click only arms it.
  await button.dblClick();
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  expect(confirmed()).toBe('1');
  // Escape, leaving the button and waiting all disarm it.
  await keyboard.press('Escape');
  await expect.poll(() => label(button)).toBe('Remove');
  (button.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  await keyboard.press('Tab');
  await expect.poll(() => label(button)).toBe('Remove');
  (button.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.poll(() => label(button)).toBe('Remove Morgan');
  await expect.poll(() => label(button), { timeout: 3_000 }).toBe('Remove');
  expect(confirmed()).toBe('1');

  // An icon-only ConfirmButton is round at rest and names the consequence when armed.
  const icon = page.getByTestId('confirm-icon-button');
  await expect.element(icon).toHaveAccessibleName('Remove Morgan');
  await expect.element(icon).toHaveClass(/env-icon-button/);
  await expect.element(icon).toHaveAttribute('data-variant', 'secondary');
  // The adoption fixture takes the default scale, compact under the fine pointer of the tests.
  const rest = box(icon);
  expect(rest.width).toBeCloseTo(36, 0);
  expect(rest.height).toBeCloseTo(36, 0);
  // Round like IconButton: the corners take at least half the height.
  expect(Number.parseFloat(css(icon, 'border-top-left-radius'))).toBeGreaterThanOrEqual(18);
  // Keyboard arming keeps focus on the button while it grows to name the consequence.
  (icon.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.element(icon).toHaveAccessibleName('Remove');
  expect(label(icon)).toBe('Remove');
  await expect.element(icon).toHaveAttribute('data-tone', 'danger');
  await expect.element(icon).not.toHaveClass(/env-icon-button/);
  await expect.element(icon).toHaveFocus();
  expect(icon.element().querySelectorAll('.env-icon')).toHaveLength(1);
  expect(box(icon).width).toBeGreaterThan(rest.width + 40);
  expect(document.querySelectorAll('.env-confirm-button-status')[1]!.textContent).toBe(
    'Remove. Press again to confirm.',
  );
  await pastTheGuard();
  await keyboard.press('Enter');
  await expect.poll(confirmed).toBe('2');
  await expect.element(icon).toHaveAccessibleName('Remove Morgan');
  await expect.element(icon).toHaveClass(/env-icon-button/);
  await expect.element(icon).toHaveFocus();
  await icon.click();
  await expect.poll(() => label(icon)).toBe('Remove');
  await keyboard.press('Escape');
  await expect.element(icon).toHaveClass(/env-icon-button/);
  expect(confirmed()).toBe('2');
  expect(errors).toEqual([]);
});

const variants = ['primary', 'secondary', 'outline', 'ghost', 'text'] as const;

/** A button of each variant beside the edge of the text, and a text button alone in a row. */
function FocusRings() {
  return (
    <div style={{ padding: '2rem' }}>
      <p id="edge" tabIndex={-1} style={{ margin: 0 }}>
        Edge
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {variants.map((variant) => (
          <Button key={variant} variant={variant} data-testid={variant}>
            Learn more
          </Button>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <Button variant="text" data-testid="aligned">
          Learn more
        </Button>
      </div>
    </div>
  );
}

test(
  'every variant keeps its focus ring clear of its label, and a text button lines up with the text',
  { tags: ['engines'] },
  async () => {
    mount({ default: FocusRings, mount: 'standalone' });
    document.getElementById('edge')!.focus();
    const rings: Record<string, { outer: number }> = {};
    for (const variant of variants) {
      const button = page.getByTestId(variant);
      // Keyboard focus, so :focus-visible draws the ring: the buttons are the page's tab stops.
      await keyboard.press('Tab');
      await expect.element(button).toHaveFocus();
      const element = button.element();
      const style = getComputedStyle(element);
      const offset = Number.parseFloat(style.outlineOffset);
      const frame = element.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(element);
      const words = range.getBoundingClientRect();
      // The ring's inner edge is the border box grown by the offset; the label must keep 2 px
      // from it on every side, also where the pill's round ends curve in at the label's corners.
      const radius = (frame.height + 2 * offset) / 2;
      const rise = Math.max(0, words.height / 2);
      const curve = radius - Math.sqrt(Math.max(0, radius ** 2 - rise ** 2));
      expect(style.outlineStyle, variant).toBe('solid');
      expect(
        Math.min(words.left - frame.left, frame.right - words.right) + offset - curve,
        variant,
      ).toBeGreaterThanOrEqual(2);
      expect(
        Math.min(words.top - frame.top, frame.bottom - words.bottom) + offset,
        variant,
      ).toBeGreaterThanOrEqual(2);
      rings[variant] = {
        outer: frame.height + 2 * (offset + Number.parseFloat(style.outlineWidth)),
      };
    }
    // A ghost button's ring traces its state layer: no bigger than a filled button's.
    expect(rings.ghost!.outer).toBeLessThanOrEqual(rings.secondary!.outer);
    // The text button's padding is taken back by its margin: its label starts where the text does.
    const edge = box(document.getElementById('edge')!).x;
    const range = document.createRange();
    range.selectNodeContents(page.getByTestId('aligned').element());
    expect(Math.abs(range.getBoundingClientRect().left - edge)).toBeLessThan(0.5);
  },
);

/** The sRGB channels, 0 to 255, and alpha of a computed color, rgb() or color(srgb …). */
function channels(color: string) {
  const srgb = /^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)$/.exec(color);
  if (srgb) return [...srgb.slice(1, 4).map((value) => Number(value) * 255), Number(srgb[4] ?? 1)];
  const rgb = /^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/.exec(color);
  if (!rgb) throw new Error(`Cannot read the color ${color}`);
  return [...rgb.slice(1, 4).map(Number), Number(rgb[4] ?? 1)];
}

test('a button given its own colors lays state layers of its content color over its container', async () => {
  mount(colors);
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  const container = [11, 110, 79];
  const content = [255, 255, 255];
  // The state opacities are tokens: 8% under the pointer and 10% pressed in the light theme.
  const area = page.getByTestId('color-overrides').element() as HTMLElement;
  const opacity = {
    hover: Number(css(area, '--env-state-hover-opacity')),
    pressed: Number(css(area, '--env-state-pressed-opacity')),
  };
  expect(opacity).toEqual({ hover: 0.08, pressed: 0.1 });
  const layered = (share: number) =>
    container.map((channel, index) => channel * (1 - share) + content[index]! * share);
  /** Waits until the button's fill is `expected`, within rounding. */
  const expectFill = (button: Element, expected: number[]) =>
    expect
      .poll(() => {
        const [r, g, b, alpha] = channels(css(button, 'background-color'));
        return Math.max(...[r!, g!, b!].map((value, index) => Math.abs(value - expected[index]!))) <
          1 && alpha === 1
          ? 'matches'
          : `${r} ${g} ${b} / ${alpha}`;
      })
      .toBe('matches');
  const center = (element: Element) => {
    // The pointer moves in the viewport, so the button must be in it.
    element.scrollIntoView({ block: 'center' });
    const { x, y, width, height } = box(element);
    return [x + width / 2, y + height / 2] as const;
  };
  // Every variant takes the container in place of its designed fills, whose states give way to
  // the state layers.
  for (const variant of ['primary', 'secondary', 'outline'] as const) {
    const button = page.getByTestId(`custom-button-${variant}`).element() as HTMLElement;
    button.style.setProperty('--env-button-container', 'rgb(11 110 79)');
    button.style.setProperty('--env-button-content', 'rgb(255 255 255)');
    expect(css(button, 'color'), variant).toBe('rgb(255, 255, 255)');
    await expectFill(button, container);
    await mouse.move(...center(button));
    await expectFill(button, layered(opacity.hover));
    await mouse.down();
    await expectFill(button, layered(opacity.pressed));
    await mouse.up();
    await mouse.move(0, 0);
    await expectFill(button, container);
  }
  // Its content alone set, a button keeps its own fill at rest and lays the content over it.
  const tinted = page.getByTestId('light-button-secondary').element() as HTMLElement;
  tinted.style.setProperty('--env-button-content', 'rgb(11 110 79)');
  const rest = css(tinted, 'background-color');
  await mouse.move(...center(tinted));
  const probe = document.createElement('span');
  probe.style.backgroundColor =
    'color-mix(in srgb, var(--env-color-bg-neutral-muted), rgb(11 110 79) calc(var(--env-state-hover-opacity) * 100%))';
  tinted.append(probe);
  const expected = getComputedStyle(probe).backgroundColor;
  probe.remove();
  // Within rounding: the gate that tells a set content mixes in 0% of it.
  await expect
    .poll(() => {
      const actual = channels(css(tinted, 'background-color'));
      return channels(expected).every((value, index) => Math.abs(value - actual[index]!) < 0.01);
    })
    .toBe(true);
  expect(expected).not.toBe(rest);
  await mouse.move(0, 0);
  // The color properties don't inherit: set on an element around a button, they color nothing.
  const outside = page.getByTestId('override-outside').element();
  const before = css(outside, 'background-color');
  area.style.setProperty('--env-button-container', 'rgb(11 110 79)');
  expect(css(outside, 'background-color')).toBe(before);
});

test("a toolbar's and a field's ghost default stays outside their popovers", async () => {
  mount(primitives);
  const trigger = page.getByTestId('toolbar-popover-trigger');
  await expect.element(trigger).toHaveAttribute('data-variant', 'ghost');
  await trigger.click();
  await expect
    .element(page.getByTestId('toolbar-popover-button'))
    .toHaveAttribute('data-variant', 'primary');
  await keyboard.press('Escape');
  const fieldTrigger = page.getByRole('button', { name: 'Link options' });
  await expect.element(fieldTrigger).toHaveAttribute('data-variant', 'ghost');
  await fieldTrigger.click();
  await expect
    .element(page.getByTestId('field-popover-button'))
    .toHaveAttribute('data-variant', 'primary');
});
