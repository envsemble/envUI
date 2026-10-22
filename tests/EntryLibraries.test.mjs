import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  documentedLibraries,
  importedLibraries,
  libraryEntries,
} from '../scripts/EntryLibraries.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(
  await readFile(new URL('../packages/ui/package.json', import.meta.url), 'utf8'),
);

test('the main entry imports no library beyond React and Base UI', async function () {
  assert.deepEqual([...(await importedLibraries(repository, 'main'))], []);
});

test("the setup guide's install commands name exactly the libraries each entry imports", async function () {
  const documented = await documentedLibraries(repository);
  for (const entry of libraryEntries) {
    assert.deepEqual(
      documented[entry].map(({ name }) => name).sort(),
      [...(await importedLibraries(repository, entry))].sort(),
      entry,
    );
  }
});

test('the documented versions start at the versions envUI is built and tested with', async function () {
  for (const libraries of Object.values(await documentedLibraries(repository)))
    for (const { name, range } of libraries)
      assert.equal(range, `^${manifest.devDependencies[name]}`, name);
});

test('the entries’ libraries are neither dependencies nor peers', function () {
  assert.deepEqual(Object.keys(manifest.peerDependencies).sort(), ['react', 'react-dom']);
  assert.equal(manifest.peerDependenciesMeta, undefined);
  assert.deepEqual(Object.keys(manifest.dependencies), ['@base-ui/react']);
});
