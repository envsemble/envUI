import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as layers from '../fixture/CascadeLayers.fixture.tsx';
import { addStyle, animationsDone, box, css, mouse, nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

function prependStyle(content: string) {
  const style = document.createElement('style');
  style.dataset.testStyle = '';
  style.textContent = content;
  document.head.prepend(style);
  return style;
}

function adoptionMeasures() {
  const probe = document.createElement('span');
  probe.style.cssText =
    'position: absolute; display: block; font: var(--env-type-body); height: var(--env-control-height-md)';
  document.querySelector('.fixture-adoption')!.append(probe);
  const { fontSize, lineHeight, height } = getComputedStyle(probe);
  probe.remove();
  return { fontSize, lineHeight, control: Number.parseFloat(height) };
}

const expectBodyLineHeight = (element: Element, lineHeight: string) =>
  expect
    .poll(() => Number.parseFloat(css(element, 'line-height')))
    .toBeCloseTo(Number.parseFloat(lineHeight), 3);

const byTestId = (id: string) => page.getByTestId(id).element();

test("an application's CSS outside cascade layers overrides envUI's without !important, and the guide's per-theme token override applies in each theme and contrast", async () => {
  mount(layers);
  const override = page.getByTestId('override');
  expect(css(override, 'background-color')).toBe('rgb(102, 51, 153)');
  expect(css(byTestId('library'), 'background-color')).not.toBe('rgb(102, 51, 153)');
  await override.hover();
  await nextFrames();
  await animationsDone(override);
  expect(css(override, 'background-color')).toBe('rgb(102, 51, 153)');
  expect(css(byTestId('link'), 'color')).toBe('rgb(0, 100, 0)');
  expect(css(byTestId('text'), 'margin-block-start')).toBe('12px');
  expect(css(byTestId('region'), 'background-color')).toBe('rgb(0, 90, 90)');
  expect(css(document.querySelector('.app-region .env-checkbox-input')!, 'background-color')).toBe(
    'rgb(0, 90, 90)',
  );

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
  expect(css(root, 'font-size')).toBe('16px');
  expect(box(page.getByTestId('router-button')).height).toBeCloseTo(type.control, 1);
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
  mount(adoption);

  const inside = ['adoption-plain-text', 'adoption-paragraph', 'adoption-nested-theme'].map(
    byTestId,
  );
  const layered = prependStyle('@layer application { body { font-size: 18px; } }');
  expect(css(document.body, 'font-size')).toBe(type.fontSize);
  layered.remove();
  prependStyle('body { font-family: "Fixture Serif"; font-size: 18px; line-height: 27px; }');
  expect(css(document.body, 'font-family')).toMatch(/Fixture Serif/);
  expect(css(document.body, 'font-size')).toBe('18px');
  expect(css(document.body, 'line-height')).toBe('27px');
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
  addStyle('.env-theme { --env-font-family: "Fixture Serif", serif; }');
  expect(css(byTestId('adoption-paragraph'), 'font-family')).toMatch(/^"?Fixture Serif/);
  expect(css(dialog, 'font-family')).toMatch(/^"?Fixture Serif/);
  const large = document.createElement('div');
  large.textContent = 'A larger line';
  large.style.fontSize = '2rem';
  byTestId('adoption-plain-text').after(large);
  expect(Number.parseFloat(css(large, 'line-height'))).toBeCloseTo(44.8, 1);
  addStyle('.env-theme { --env-line-height-body: 2; }');
  expect(css(byTestId('adoption-plain-text'), 'line-height')).toBe(
    `${Number.parseFloat(type.fontSize) * 2}px`,
  );
  expect(css(root, 'font-size')).toBe('16px');
});
