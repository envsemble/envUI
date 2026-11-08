// Surface's backgrounds are the background roles: each value of `background` takes its role's
// color, `--env-color-bg-<value>`, and the role's hover and pressed tokens for what is interactive on
// it, such as a Card, and each of those is a token of the themes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
const [source, css, tokens] = await Promise.all([
  read('packages/ui/src/foundations/Surface.tsx'),
  read('packages/ui/src/styles/Surface.css'),
  read('packages/ui/src/generated/Tokens.css'),
]);

const backgrounds = [
  ...(source.match(/export type SurfaceBackground =([^;]+);/)?.[1] ?? '').matchAll(/'([a-z-]+)'/g),
].map(([, name]) => name);

test('every Surface background takes its role and the role’s states', () => {
  assert.ok(backgrounds.includes('recessed'), `SurfaceBackground is ${backgrounds.join(', ')}`);
  for (const background of backgrounds) {
    const rule =
      background === 'default'
        ? css.match(/\.env-surface \{([^}]*)\}/)?.[1]
        : css.match(
            new RegExp(
              String.raw`\.env-surface:where\(\[data-background='${background}'\]\) \{([^}]*)\}`,
            ),
          )?.[1];
    assert.ok(rule, `Surface.css has no rule for background="${background}"`);
    for (const [property, suffix] of [
      ['--env-surface-container-default', ''],
      ['--env-surface-hover', '-hover'],
      ['--env-surface-pressed', '-pressed'],
    ]) {
      const token = `--env-color-bg-${background}${suffix}`;
      assert.match(
        rule,
        new RegExp(String.raw`${property}: var\(${token}\);`),
        `${background}: ${property}`,
      );
      assert.match(tokens, new RegExp(String.raw`${token}:`), `${token} is a token`);
    }
  }
});
