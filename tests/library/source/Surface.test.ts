import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const read = (path: string) => readFile(join(repositoryRoot, path), 'utf8');
const [source, css, tokens] = await Promise.all([
  read('packages/ui/src/layout/Surface.tsx'),
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
      ['--_surface-container-default', ''],
      ['--_surface-hover', '-hover'],
      ['--_surface-pressed', '-pressed'],
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
