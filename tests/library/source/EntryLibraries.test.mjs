import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { documentedLibraries, importedLibraries } from '../../../scripts/build/EntryLibraries.ts';
import { libraryEntryPoints } from '../../../scripts/docs/LibraryEntryPoints.ts';
import { libraryPackageFile, repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const entryPoints = libraryEntryPoints();
const entryFile = (specifier) => entryPoints.find((entry) => entry.specifier === specifier).file;
const manifest = JSON.parse(await readFile(libraryPackageFile, 'utf8'));

test('the main entry imports no library beyond React and Base UI', async function () {
  assert.deepEqual([...(await importedLibraries(entryFile('@envsemble/envui')))], []);
});

test("the setup guide's install commands name exactly the libraries each entry point imports", async function () {
  const documented = await documentedLibraries(repositoryRoot);
  for (const { specifier, file } of entryPoints)
    assert.deepEqual(
      (documented[specifier] ?? []).map(({ name }) => name).sort(),
      [...(await importedLibraries(file))].sort(),
      specifier,
    );
  const listed = new Set(entryPoints.map(({ specifier }) => specifier));
  assert.deepEqual(
    Object.keys(documented).filter((specifier) => !listed.has(specifier)),
    [],
    'Install commands for entry points the package does not export.',
  );
});

test('the documented versions start at the versions envUI is built and tested with', async function () {
  for (const libraries of Object.values(await documentedLibraries(repositoryRoot)))
    for (const { name, range } of libraries)
      assert.equal(range, `^${manifest.devDependencies[name]}`, name);
});

test('the entries’ libraries are neither dependencies nor peers', function () {
  assert.deepEqual(Object.keys(manifest.peerDependencies).sort(), ['react', 'react-dom']);
  assert.equal(manifest.peerDependenciesMeta, undefined);
  assert.deepEqual(Object.keys(manifest.dependencies), ['@base-ui/react']);
});

test('the color entry imports React Aria’s color hooks and nothing else', async function () {
  assert.deepEqual([...(await importedLibraries(entryFile('@envsemble/envui/color')))].sort(), [
    '@react-aria/color',
    '@react-aria/i18n',
    '@react-stately/color',
  ]);
});
