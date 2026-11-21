import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join, posix } from 'node:path';
import { test } from 'node:test';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { importSource } from '../support/ImportSource.ts';

const { groupedPages, densityShots, exampleShots, openLists, surfaceShots } = await importSource<
  typeof import('../../apps/site/src/routes/SiteRoutes.ts') &
    typeof import('../visual/VisualShots.ts')
>('VisualSnapshots', [
  "export { groupedPages } from './apps/site/src/routes/SiteRoutes.ts';",
  "export { densityShots, exampleShots, openLists, surfaceShots } from './tests/visual/VisualShots.ts';",
]);

const snapshots = join(repositoryRoot, 'tests/visual/snapshots');
const examples = join(repositoryRoot, 'apps/site/src/examples');
const exampleShot = /-example-([a-z0-9]+)(?:-\d+)?\.png$/;

const entries = (folder: string) =>
  existsSync(join(snapshots, folder))
    ? readdirSync(join(snapshots, folder), { withFileTypes: true })
    : [];

const exampleSlugs = (page: string) =>
  new Set(
    existsSync(join(examples, page))
      ? readdirSync(join(examples, page)).map((file) => file.replace(/\.tsx$/, '').toLowerCase())
      : [],
  );

test('every visual snapshot belongs to a catalogue page, its example, a density section, a surface, an example or an open list', () => {
  const pages = new Set(groupedPages.map(({ document }) => document.id));
  const files = (shots: string[]) => new Set(shots.map((shot) => `${shot}.png`));
  const belongs: Record<string, ReadonlySet<string>> = {
    density: files(densityShots.map(({ section, theme }) => `${theme}-${section}`)),
    open: files(openLists.flatMap((list) => list.themes.map((theme) => `${theme}-${list.name}`))),
    surfaces: files(surfaceShots.map((theme) => `${theme}-rows`)),
    examples: files(exampleShots.map(({ name, theme }) => `${theme}-${name}`)),
  };
  const stale = [
    ...entries('')
      .filter(
        (entry) => !entry.isDirectory() || !(entry.name in belongs || entry.name === 'catalogue'),
      )
      .map((entry) => entry.name),
    ...Object.entries(belongs).flatMap(([folder, shots]) =>
      entries(folder)
        .filter((entry) => !entry.isFile() || !shots.has(entry.name))
        .map((entry) => posix.join(folder, entry.name)),
    ),
    ...entries('catalogue').flatMap((entry) => {
      const folder = posix.join('catalogue', entry.name);
      if (!entry.isDirectory() || !pages.has(entry.name)) return [folder];
      const slugs = exampleSlugs(entry.name);
      return entries(folder)
        .filter((file) => {
          const example = exampleShot.exec(file.name)?.[1];
          return example !== undefined && !slugs.has(example);
        })
        .map((file) => posix.join(folder, file.name));
    }),
  ];
  assert.deepEqual(
    stale,
    [],
    'Snapshots of pages, examples or sections that no longer exist under tests/visual/snapshots: delete them',
  );
});
