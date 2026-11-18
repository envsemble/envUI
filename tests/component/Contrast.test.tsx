import { describe, expect, test } from 'vitest';
import { commands } from 'vitest/browser';
import { themes } from '../contrast/Themes.ts';
import tokenList from '../../packages/ui/src/generated/tokens.json';

function boundary(attributes: Readonly<Record<string, string>>) {
  const element = document.createElement('div');
  element.className = 'env-theme';
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  document.body.append(element);
  return element;
}

function resolveColors(
  attributes: Readonly<Record<string, string>>,
  colors: Readonly<Record<string, string>>,
) {
  const theme = boundary(attributes);
  const holder = document.createElement('div');
  const probe = document.createElement('span');
  holder.append(probe);
  theme.append(holder);
  const read = (value: string, inherited: string) => {
    holder.style.color = inherited;
    probe.style.color = value;
    return getComputedStyle(probe).color;
  };
  const resolved: Record<string, string | null> = {};
  for (const [name, value] of Object.entries(colors)) {
    probe.style.color = '';
    const first = read(value, 'rgb(1, 2, 3)');
    const second = read(value, 'rgb(4, 5, 6)');
    resolved[name] = probe.style.color !== '' && first === second ? first : null;
  }
  const canvas = getComputedStyle(theme).backgroundColor;
  theme.remove();
  return { resolved, canvas };
}

describe('contrast', () => {
  for (const theme of themes) {
    test(`every pair meets its minimum in the ${theme.name} theme`, async () => {
      if (theme.media) await commands.emulateMedia(theme.media);
      const colors = await commands.contrastColors(theme.name);
      const { resolved, canvas } = resolveColors(theme.attributes, colors);
      const { failures, message } = await commands.measureContrast(theme.name, resolved, canvas);
      expect(failures, message).toBe(0);
    });
  }

  test('prefers-contrast: more applies the high-contrast themes unless a boundary opts out', async () => {
    const names = tokenList.tokens.map((token) => token.cssVariable);
    for (const scheme of ['light', 'dark']) {
      const read = (attributes: Record<string, string>) => {
        const theme = boundary({ 'data-env-theme': scheme, ...attributes });
        const style = getComputedStyle(theme);
        const values = Object.fromEntries(
          names.map((name) => [name, style.getPropertyValue(name).trim()]),
        );
        theme.remove();
        return values;
      };
      await commands.emulateMedia({ contrast: 'no-preference' });
      const standard = read({});
      const high = read({ 'data-env-contrast': 'high' });
      expect(high, `${scheme}: high contrast changes colors`).not.toEqual(standard);
      await commands.emulateMedia({ contrast: 'more' });
      expect(read({}), `${scheme}: prefers-contrast: more`).toEqual(high);
      expect(read({ 'data-env-contrast': 'standard' }), `${scheme}: opted out`).toEqual(standard);
    }
  });
});
