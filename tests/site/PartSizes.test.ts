import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { partKinds } from '../../apps/site/src/documentation/PartKeys.ts';

const site = join(repositoryRoot, 'apps/site/src');
const read = (path: string) => readFileSync(join(site, path), 'utf8');

function registeredFigures() {
  const figures = new Map<string, Set<string>>();
  for (const [, page, module] of read('figures/foundations/FoundationFigures.ts').matchAll(
    /(\w+): \(\) => import\('\.\/(\w+)'\)/g,
  )) {
    const registry = /Figures: Record<string, FoundationFigureEntry> = \{([\s\S]*?)\n\};/.exec(
      read(`figures/foundations/${module}.tsx`),
    )?.[1];
    figures.set(
      page,
      new Set([...(registry ?? '').matchAll(/^ {2}(\w+):/gm)].map(([, name]) => name)),
    );
  }
  return figures;
}

test('each recorded part size is of a part the site still has', () => {
  const { $comment: _comment, ...sizes } = JSON.parse(read('generated/PartSizes.json'));
  const figures = registeredFigures();
  const key = new RegExp(`^(${partKinds.join('|')}):([^/]+)/(.+)$`);
  const stale = Object.keys(sizes).filter((part) => {
    const [, kind, page, name] = key.exec(part) ?? [];
    if (!kind) return false;
    if (kind === 'figure') return !figures.get(page)?.has(name);
    const folder = kind === 'specimen' ? 'specimens' : 'examples';
    return !existsSync(join(site, folder, page, `${name}.tsx`));
  });
  assert.deepEqual(
    stale,
    [],
    'apps/site/src/generated/PartSizes.json keeps sizes of parts the site no longer has: run `npm run site:part-sizes` against a local server',
  );
});
