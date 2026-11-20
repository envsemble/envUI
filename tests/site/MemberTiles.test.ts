import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { importSource } from '../support/ImportSource.ts';

const { shownByPageTile, memberExamples } = await importSource(
  'MemberTiles',
  'apps/site/src/tiles/MemberTiles.ts',
);
const { documents } = await importSource(
  'MemberTileDocuments',
  'apps/site/src/routes/PageModel.ts',
);

const site = join(repositoryRoot, 'apps/site/src');
const exportsFile = JSON.parse(
  readFileSync(join(repositoryRoot, 'docs/generated/exports.json'), 'utf8'),
);
const exported = new Set(Object.values(exportsFile).flatMap((entry) => Object.keys(entry)));
const pascal = (id: string) =>
  id.replace(/(^|-)([a-z\d])/g, (_, __: string, letter: string) => letter.toUpperCase());

test('each member tile and member table names an export the package has', () => {
  const memberTiles = readdirSync(join(site, 'tiles/members')).map((file) =>
    file.replace(/\.tsx$/, ''),
  );
  for (const name of [
    ...memberTiles,
    ...Object.keys(shownByPageTile),
    ...Object.keys(memberExamples),
  ])
    assert.ok(exported.has(name), `${name} is no export of the package; remove its member tile`);
});

test("each export a page's tile shows has that page's tile", () => {
  for (const [name, page] of Object.entries(shownByPageTile))
    assert.ok(existsSync(join(site, `tiles/${pascal(page)}.tsx`)), `${name}: ${page} has no tile`);
});

test('each member example is an example of the page that documents the export', () => {
  for (const [name, example] of Object.entries(memberExamples)) {
    const page = documents.find((document) =>
      document.metadata?.components.some((component) => component === name),
    );
    assert.ok(page, `no page documents ${name}`);
    assert.ok(
      existsSync(join(site, `examples/${page.id}/${example}.tsx`)),
      `${name}: examples/${page.id}/${example}.tsx is missing`,
    );
  }
});
