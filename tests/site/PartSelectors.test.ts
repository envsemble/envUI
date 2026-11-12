// The site selects the library's parts by their classes, in its scripts, its fitting and its style
// sheets, such as `.env-button` in a tile's script: nothing else fails when a class it names is
// renamed, as the tile just stops moving, so every class it names is one the library documents
// (docs/generated/parts.json).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { partsFile } from '../../scripts/docs/parts/Contract.ts';

test("every part class the site selects is one of the library's", () => {
  type Parts = Record<string, { parts: { class: string }[] }>;
  const { components, shared } = JSON.parse(readFileSync(partsFile, 'utf8')) as {
    components: Parts;
    shared: Parts;
  };
  const classes = new Set(
    [...Object.values(components), ...Object.values(shared)].flatMap(({ parts }) =>
      parts.map((part) => part.class),
    ),
  );
  const site = resolve(repositoryRoot, 'apps/site/src');
  const unknown = readdirSync(site, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.(tsx?|css)$/.test(file) && !file.startsWith('generated'))
    .flatMap((file) =>
      [...readFileSync(resolve(site, file), 'utf8').matchAll(/\.(env-[a-z0-9-]+)/g)]
        .filter(([, name]) => !classes.has(name))
        .map(([, name]) => `${file.replaceAll('\\', '/')}: .${name}`),
    );
  assert.deepEqual([...new Set(unknown)], []);
});
