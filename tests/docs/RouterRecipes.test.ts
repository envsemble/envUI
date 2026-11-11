import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { marked, type Tokens } from 'marked';
import ts from 'typescript';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

// The setup page's "Connect your router" recipes, the ```tsx recipe fences in docs/setup.md, are
// type-checked against envUI's source and minimal declarations of the routers
// (tests/docs/router-shims.d.ts), so a recipe can't drift from LinkComponentProps.

const directory = join(repositoryRoot, '.cache/router-recipes');

/** The recipe fences of a Markdown page, in order. */
function recipes(markdown: string) {
  return marked
    .lexer(markdown)
    .filter((token) => token.type === 'code' && /^tsx\s+recipe\s*$/.test(token.lang ?? ''))
    .map((token) => (token as Tokens.Code).text);
}

test('the setup page has a recipe for each router', () => {
  const found = recipes(readFileSync(join(repositoryRoot, 'docs/setup.md'), 'utf8'));
  const imports = found.join('\n');
  for (const router of ['@tanstack/react-router', 'react-router', 'next/link'])
    assert.match(imports, new RegExp(`from '${router}'`), `a recipe for ${router}`);
  assert.match(imports, /history|location\.origin/, 'a recipe for a router on the History API');
});

test('the router recipes type-check against LinkComponentProps', () => {
  const found = recipes(readFileSync(join(repositoryRoot, 'docs/setup.md'), 'utf8'));
  rmSync(directory, { recursive: true, force: true });
  mkdirSync(directory, { recursive: true });
  // Each recipe is a module of its own, beside the router declarations.
  const files = found.map((source, index) => {
    const file = join(directory, `Recipe${index + 1}.tsx`);
    writeFileSync(file, source);
    return file;
  });
  const program = ts.createProgram(
    [...files, join(repositoryRoot, 'tests/docs/router-shims.d.ts')],
    {
      target: ts.ScriptTarget.ES2022,
      lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      customConditions: ['envui-source'],
      types: [],
    },
  );
  const own = new Set(files.map((file) => file.replaceAll('\\', '/')));
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    // Only the recipes' own errors: npm run typecheck checks envUI's source.
    .filter((diagnostic) => diagnostic.file && own.has(diagnostic.file.fileName))
    .map((diagnostic) => {
      const file = diagnostic.file;
      assert.ok(file, ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      const { line } = file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      const recipe = file.fileName.match(/Recipe\d+/)?.[0];
      return `${recipe}:${line + 1} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;
    });
  assert.deepEqual(diagnostics, []);
});
