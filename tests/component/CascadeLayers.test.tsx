import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as layers from '../fixture/CascadeLayers.fixture.tsx';
import { addStyle, animationsDone, box, css, mouse, nextFrames } from './Browser.ts';
import { mount } from './Mount.tsx';

/**
 * The boundary between an application's CSS and envUI's. envUI's style sheet puts every rule in a
 * cascade layer of env, so an application's CSS outside cascade layers overrides it without
 * !important or a heavier selector. tests/fixture/CascadeLayers.css is such an application style
 * sheet: each of its rules is less specific than envUI's rule for the same element and state.
 */

/** Adds a style sheet before every other of the page, for the rest of the test. */
function prependStyle(content: string) {
  const style = document.createElement('style');
  style.dataset.testStyle = '';
  style.textContent = content;
  document.head.prepend(style);
  return style;
}

/**
 * The body type and the medium control height of the adoption fixture's scale, which follows the
 * pointer by default (compact under a fine one), so the tests measure the type the theme sets.
 */
function adoptionMeasures() {
  const probe = document.createElement('span');
  probe.style.cssText =
    'position: absolute; display: block; font: var(--env-type-body); height: var(--env-control-height-md)';
  document.querySelector('.fixture-adoption')!.append(probe);
  const { fontSize, lineHeight, height } = getComputedStyle(probe);
  probe.remove();
  return { fontSize, lineHeight, control: Number.parseFloat(height) };
}

/**
 * Expects an element's line height to be the body type's. WebKit computes the same line height a
 * hair apart on different elements, such as 18.199999px on one and 18.200001px on another, so it
 * is compared as a number rather than as text.
 */
const expectBodyLineHeight = (element: Element, lineHeight: string) =>
  expect
    .poll(() => Number.parseFloat(css(element, 'line-height')))
    .toBeCloseTo(Number.parseFloat(lineHeight), 3);

const byTestId = (id: string) => page.getByTestId(id).element();

test("an application's CSS outside cascade layers overrides envUI's without !important, and the guide's per-theme token override applies in each theme and contrast", async () => {
  mount(layers);
  const override = page.getByTestId('override');
  // A single class beats envUI's variant rules for a primary button, at rest and under the pointer.
  expect(css(override, 'background-color')).toBe('rgb(102, 51, 153)');
  expect(css(byTestId('library'), 'background-color')).not.toBe('rgb(102, 51, 153)');
  await override.hover();
  // Once the hover's transition, if any, has run.
  await nextFrames();
  await animationsDone(override);
  expect(css(override, 'background-color')).toBe('rgb(102, 51, 153)');
  // A link's color, and a bare element selector over envUI's base and Text rules.
  expect(css(byTestId('link'), 'color')).toBe('rgb(0, 100, 0)');
  expect(css(byTestId('text'), 'margin-block-start')).toBe('12px');
  // A token set on a region of the application re-themes envUI's components inside it.
  expect(css(byTestId('region'), 'background-color')).toBe('rgb(0, 90, 90)');
  expect(css(document.querySelector('.app-region .env-checkbox-input')!, 'background-color')).toBe(
    'rgb(0, 90, 90)',
  );

  // The example in docs/customizing.md, as written, so the guide can't drift from the cascade.
  const guide = await commands.readFile('docs/customizing.md');
  const example = [...guide.matchAll(/```css\n([\s\S]*?)```/g)]
    .map(([, sheet]) => sheet!)
    .find((sheet) => sheet.includes('--env-color-fg-link') && sheet.includes('prefers-contrast'));
  expect(example, 'the token override example').toBeDefined();
  const [light, dark, lightHigh, darkHigh] = [
    ...example!.matchAll(/--env-color-fg-link:\s*([^;]+);/g),
  ].map(([, value]) => value!.trim());
  let guideStyle: HTMLStyleElement | undefined;
  const read = (scheme: string, contrast?: string) => {
    // Added afresh each time: one engine evaluates an emulated media feature only in style sheets
    // added after it changes.
    guideStyle?.remove();
    guideStyle = document.createElement('style');
    guideStyle.dataset.testStyle = '';
    guideStyle.textContent = example!;
    document.head.append(guideStyle);
    const boundary = document.createElement('div');
    boundary.className = 'env-theme';
    boundary.setAttribute('data-env-theme', scheme);
    if (contrast) boundary.setAttribute('data-env-contrast', contrast);
    document.body.append(boundary);
    const value = getComputedStyle(boundary).getPropertyValue('--env-color-fg-link').trim();
    boundary.remove();
    return value;
  };
  await commands.emulateMedia({ contrast: 'no-preference' });
  expect(read('light')).toBe(light);
  expect(read('dark')).toBe(dark);
  expect(read('light', 'high')).toBe(lightHigh);
  expect(read('dark', 'high')).toBe(darkHigh);
  await commands.emulateMedia({ contrast: 'more' });
  expect(matchMedia('(prefers-contrast: more)').matches).toBe(true);
  expect(read('light')).toBe(lightHigh);
  expect(read('dark')).toBe(darkHigh);
  expect(read('light', 'standard')).toBe(light);
  expect(read('dark', 'standard')).toBe(dark);
});

test('a themed document root keeps the browser font size and its body the body type; an application body rule styles the body, while envUI keeps its type inside its boundaries', async () => {
  mount(adoption);
  const root = document.documentElement;
  await expect.poll(() => root.classList.contains('env-theme')).toBe(true);
  const type = adoptionMeasures();
  // 1 rem stays the browser's 16 px, so rem measures keep their designed size.
  expect(css(root, 'font-size')).toBe('16px');
  expect(box(page.getByTestId('router-button')).height).toBeCloseTo(type.control, 1);
  // Text takes the body type in the document body, the application and portals alike.
  expect(css(document.body, 'font-size')).toBe(type.fontSize);
  await expectBodyLineHeight(document.body, type.lineHeight);
  expect(css(document.querySelector('.fixture-adoption')!, 'font-size')).toBe(type.fontSize);
  const portal = document.createElement('div');
  portal.textContent = 'Another library’s popup';
  document.body.append(portal);
  expect(css(portal, 'font-size')).toBe(type.fontSize);
  expect(css(portal, 'font-family')).toContain('envUI Geist');
  portal.remove();
  await page.getByRole('button', { name: 'Open pending dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Save project' });
  await expect.element(dialog).toBeVisible();
  expect(css(dialog, 'font-size')).toBe(type.fontSize);
  expect(css(dialog.getByRole('button', { name: 'Toggle pending' }), 'height')).toBe(
    `${type.control}px`,
  );
  // Afresh, with the dialog closed.
  mount(adoption);

  const inside = ['adoption-plain-text', 'adoption-paragraph', 'adoption-nested-theme'].map(
    byTestId,
  );
  // A rule inside a cascade layer loses to envUI's unlayered style sheet, whatever its specificity.
  const layered = prependStyle('@layer application { body { font-size: 18px; } }');
  expect(css(document.body, 'font-size')).toBe(type.fontSize);
  layered.remove();
  // An application's unlayered body rule, before envUI's style sheet, styles the body itself.
  prependStyle('body { font-family: "Fixture Serif"; font-size: 18px; line-height: 27px; }');
  expect(css(document.body, 'font-family')).toMatch(/Fixture Serif/);
  expect(css(document.body, 'font-size')).toBe('18px');
  expect(css(document.body, 'line-height')).toBe('27px');
  // Inside the provider's boundary, text, paragraphs and a Theme around content keep envUI's type,
  // and so do the components and the popups, each in a boundary of its own.
  for (const element of [...inside, byTestId('router-button')]) {
    expect(css(element, 'font-family')).toMatch(/envUI Geist/);
    expect(css(element, 'font-size')).not.toBe('18px');
  }
  for (const element of inside) {
    expect(css(element, 'font-size')).toBe(type.fontSize);
    await expectBodyLineHeight(element, type.lineHeight);
  }
  await page.getByRole('button', { name: 'Assign seat' }).hover();
  await expect
    .poll(() => document.querySelector('.env-tooltip')?.textContent)
    .toBe('All seats are assigned');
  expect(css(document.querySelector('.env-tooltip')!, 'font-family')).toMatch(/envUI Geist/);
  await mouse.move(0, 0);
  await page.getByRole('button', { name: 'Open pending dialog' }).click();
  await expect.element(dialog).toBeVisible();
  expect(css(dialog, 'font-family')).toMatch(/envUI Geist/);
  expect(css(dialog, 'font-size')).toBe(type.fontSize);
  // envUI's font tokens change its typeface wherever it applies.
  addStyle('.env-theme { --env-font-family: "Fixture Serif", serif; }');
  expect(css(byTestId('adoption-paragraph'), 'font-family')).toMatch(/^"?Fixture Serif/);
  expect(css(dialog, 'font-family')).toMatch(/^"?Fixture Serif/);
  // Text in another size inside a boundary keeps its lines in proportion to it.
  const large = document.createElement('div');
  large.textContent = 'A larger line';
  large.style.fontSize = '2rem';
  byTestId('adoption-plain-text').after(large);
  expect(Number.parseFloat(css(large, 'line-height'))).toBeCloseTo(44.8, 1);
  // --env-line-height-body sets the boundary's line height.
  addStyle('.env-theme { --env-line-height-body: 2; }');
  expect(css(byTestId('adoption-plain-text'), 'line-height')).toBe(
    `${Number.parseFloat(type.fontSize) * 2}px`,
  );
  // The root keeps the browser's size, so rem measures keep theirs.
  expect(css(root, 'font-size')).toBe('16px');
});
