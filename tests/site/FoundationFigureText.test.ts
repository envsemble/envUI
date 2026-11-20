import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import ts from 'typescript';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const site = join(repositoryRoot, 'apps/site/src');
const figures = join(site, 'figures/foundations');

const words = (text: string) => text.replace(/\s+/g, ' ').trim();

function textsOf(file: string, { everyString }: { everyString: boolean }) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const texts = new Set<string>();
  const add = (text: string) => {
    if (/[A-Za-z]/.test(text)) texts.add(words(text));
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) add(node.text);
    else if (everyString && ts.isStringLiteral(node) && !ts.isImportDeclaration(node.parent))
      add(node.text);
    else if (
      ts.isJsxAttribute(node) &&
      node.name.getText(source) === 'title' &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    )
      add(node.initializer.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return texts;
}

function withRelativeImports(file: string, found = new Set<string>()): Set<string> {
  if (found.has(file)) return found;
  found.add(file);
  for (const [, path] of readFileSync(file, 'utf8').matchAll(/from '(\.{1,2}\/[^']+)'/g)) {
    const module = ['.tsx', '.ts']
      .map((extension) => resolve(dirname(file), path + extension))
      .find(existsSync);
    if (module?.startsWith(figures) || module?.startsWith(join(site, 'examples')))
      withRelativeImports(module, found);
  }
  return found;
}

const figureModule = (page: string) =>
  join(figures, `${page[0].toUpperCase()}${page.slice(1)}.tsx`);

test('a foundation figure shows the words of the examples whose code it shows', () => {
  const drifted = readdirSync(join(site, 'examples'))
    .filter((page) => existsSync(figureModule(page)))
    .flatMap((page) => {
      const shown = new Set(
        [...withRelativeImports(figureModule(page))].flatMap((module) => [
          ...textsOf(module, { everyString: true }),
        ]),
      );
      return readdirSync(join(site, 'examples', page)).flatMap((example) => {
        const missing = [
          ...textsOf(join(site, 'examples', page, example), { everyString: false }),
        ].filter((text) => !shown.has(text));
        return missing.length ? [`${page}/${example}: ${missing.join(' | ')}`] : [];
      });
    });
  assert.deepEqual(
    drifted,
    [],
    "Words of a foundation's example that its figure no longer shows: change the figure in apps/site/src/figures/foundations with the example",
  );
});
