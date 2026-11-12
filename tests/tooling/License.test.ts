// envUI is MIT-licensed. npm packs the LICENSE of a package's own folder, so each package keeps a
// copy of the repository's, which must stay the same text, under the license its package.json names.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const read = (path: string) => readFileSync(join(repositoryRoot, path), 'utf8');

test("each package ships the repository's MIT license, word for word", () => {
  const license = read('LICENSE');
  assert.match(license, /^MIT License\n/);
  for (const folder of ['packages/ui', 'packages/eslint-plugin', 'packages/stylelint-config']) {
    assert.equal(read(`${folder}/LICENSE`), license, `${folder}/LICENSE differs from LICENSE`);
    const { license: named, publishConfig } = JSON.parse(read(`${folder}/package.json`));
    assert.equal(named, 'MIT', folder);
    assert.deepEqual(publishConfig, { registry: 'https://registry.npmjs.org/', access: 'public' });
  }
});
