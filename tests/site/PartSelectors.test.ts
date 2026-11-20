import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { partsFile, repositoryRoot } from '../../scripts/RepositoryPaths.ts';

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
