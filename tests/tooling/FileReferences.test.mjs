// Comments name the files they lean on, such as "(Tokens.css)" or scripts/test/TestScope.ts, so a
// reader can follow them. Each name has to match a file of the repository: one written with its
// folders has to end a file's path, a bare name to be some file's name. A file that moves takes its
// comments with it, or this fails.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { codeText, cssComments, listFiles } from '../support/sourceText.mjs';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

/** The folders whose comments are checked. */
const checked = ['packages/ui/src', 'apps/site/src', 'scripts', 'tests'];

/** Generated from pinned inputs, and the fixtures' sample code: no comments of the repository's. */
const skipped = ['packages/ui/src/icons/', 'apps/site/src/generated/', 'tests/visual/snapshots/'];

/** Names that are no file of the repository on purpose, by name, each with its reason. */
const exceptions = new Map([
  ['Foo.css', "a made-up style sheet, the input of the token tests' examples"],
  ['styles.css', "the package's whole style sheet, which the build makes of styles/index.css"],
  [
    'Documentation.ts',
    "the site's documentation, which scripts/docs/GenerateDocumentation.ts writes and git ignores",
  ],
]);

const extensions = /\.(?:tsx|ts|css|mjs)$/;

/**
 * The file names in a comment: a name with one of the checked extensions, with the folders written
 * before it. A name after `#` or `@` is an import alias; one with `<` or `*` a pattern.
 */
const fileName =
  /(?<![\w$.\-/#@<>*])((?:\.{1,2}\/)*(?:[\w.-]+\/)*[\w.-]*\w\.(?:tsx|ts|css|mjs))(?![\w-])/g;

const repositoryFiles = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard'],
  { cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
)
  .split('\n')
  .filter(Boolean);
const fileNames = new Set(repositoryFiles.map((path) => path.slice(path.lastIndexOf('/') + 1)));

/** Whether `name`, as a comment writes it, matches a file of the repository. */
function exists(name) {
  const path = name.replace(/^(?:\.{1,2}\/)+/, '');
  // Build output and installed packages, which the repository doesn't hold.
  if (/^(?:dist|node_modules|\.cache)\/|\/(?:dist|node_modules)\//.test(path)) return true;
  if (!path.includes('/')) return fileNames.has(path);
  return repositoryFiles.some((file) => file === path || file.endsWith(`/${path}`));
}

/** The names in `file`'s comments that match no file, as `path:line: name`. */
function danglingNames(path, text) {
  const comments = path.endsWith('.css') ? cssComments(text) : codeText(path, text);
  const found = [];
  for (const comment of comments) {
    if (comment.kind !== 'comment') continue;
    for (const match of comment.text.matchAll(fileName)) {
      const name = match[1];
      if (exceptions.has(name.slice(name.lastIndexOf('/') + 1)) || exists(name)) continue;
      const line = text.slice(0, comment.start + match.index).split('\n').length;
      found.push(`${path}:${line}: ${name}`);
    }
  }
  return found;
}

async function checkedFiles() {
  const files = [];
  for (const directory of checked)
    for (const path of await listFiles(directory))
      if (
        (extensions.test(path) || path.endsWith('.js')) &&
        !skipped.some((prefix) => path.startsWith(prefix)) &&
        !/(?:^|\/)(?:node_modules|dist)\//.test(path)
      )
        files.push(path);
  return files;
}

test('comments name only files that exist', async () => {
  const found = [];
  for (const path of await checkedFiles())
    found.push(...danglingNames(path, await readFile(join(repositoryRoot, path), 'utf8')));
  assert.deepEqual(found, [], 'Update the comment to where the file is now, or drop the name.');
});

test('the check finds a moved file and passes one that is there', () => {
  const text = [
    '// Built by scripts/build/BuildTokens.ts into styles/Tokens.css (Missing.tsx).',
    "/* The base (Base.css), as the pattern src/styles/<Name>.css and '*.css' say. */",
    "import './Foo.css';",
  ].join('\n');
  assert.deepEqual(danglingNames('example.ts', text), [
    'example.ts:1: styles/Tokens.css',
    'example.ts:1: Missing.tsx',
  ]);
});
