import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// envUI is product agnostic: what it ships and documents names no application that uses it and no
// third-party product it is styled after. Names match as whole words. Distinctive names match in any
// case; names that are also English words or code match only as written, so `console.log`,
// `navigator.platform`, "forms" or an application's "chrome" do not count.

const repository = fileURLToPath(new URL('../', import.meta.url));

/** Applications built on envUI and third-party products. Extend the lists as products appear. */
const productNames = [
  // In any case: `atlas` or `COORD` name the product as surely as the capitalized name.
  ...['Atlas', 'Coord', 'Electron', 'Figma', 'Google', 'Jira', 'Slack'].map((name) => ({
    name,
    flags: 'gi',
  })),
  // Only as written: lowercase, they are English words, CSS keywords or host names in URLs.
  ...['Chrome', 'Console', 'Forms', 'GitHub', 'Linear', 'Notion', 'Platform'].map((name) => ({
    name,
    flags: 'g',
  })),
];

/**
 * Uses of a listed word that do not name a product envUI is for. A hit passes when one of its
 * name's patterns matches on the same line and covers it.
 */
const allowed = {
  // envUI is distributed through GitHub Packages and installed with a GitHub token, also in GitHub
  // Actions; setup says so.
  GitHub: [/GitHub (?:Packages|Actions|token)/g],
  // The English word: the name of the family of form components, and a list of what to preserve.
  Forms: [/Forms & selection/g, /^#{2,} Forms$/g, /^- Forms, validation/g],
};

/** Uses allowed in one file only, by path and name. */
const allowedIn = {
  // The maintainers' guide, which does not ship: releases are GitHub releases, and the hosted
  // catalogue's readers sign in with GitHub login.
  'CONTRIBUTING.md': { GitHub: [/GitHub (?:release|login)/g] },
};

/**
 * Text that ships with the package or documents it, and the maintainers' guide: Markdown whole,
 * code by comments and strings.
 */
const sources = [
  { path: 'README.md', read: 'whole' },
  { path: 'CONTRIBUTING.md', read: 'whole' },
  { path: 'packages/ui/CHANGELOG.md', read: 'whole' },
  { directory: '.changeset', extensions: ['.md'], read: 'whole' },
  { directory: 'docs', extensions: ['.md'], read: 'whole' },
  { directory: '.agents/skills', extensions: ['.md'], read: 'whole' },
  // The agent plugin and the marketplaces that list it.
  { directory: 'plugin', extensions: ['.md', '.json'], read: 'whole' },
  { path: '.claude-plugin/marketplace.json', read: 'whole' },
  { path: '.agents/plugins/marketplace.json', read: 'whole' },
  { directory: 'packages/ui/src', extensions: ['.css'], read: 'whole' },
  { directory: 'packages/ui/src', extensions: ['.ts', '.tsx'], read: 'code' },
  // The catalogue's sample data, copy and styles, and the hosted catalogue's Worker and headers.
  { directory: 'apps/catalogue/src', extensions: ['.ts', '.tsx'], read: 'code' },
  { directory: 'apps/catalogue/src', extensions: ['.css'], read: 'whole' },
  { directory: 'apps/catalogue/site', extensions: ['.mjs'], read: 'code' },
  { path: 'apps/catalogue/site/_headers', read: 'whole' },
  // The test fixtures' sample data and copy.
  { directory: 'tests/fixture', extensions: ['.ts', '.tsx'], read: 'code' },
  { directory: 'tests/fixture', extensions: ['.css', '.html'], read: 'whole' },
  // The agent benchmark: its tasks, the app the agents work in, and its runner.
  { path: 'bench/README.md', read: 'whole' },
  { path: 'bench/tasks.json', read: 'whole' },
  { directory: 'bench/fixture', extensions: ['.md', '.css', '.html', '.json'], read: 'whole' },
  { directory: 'bench/fixture', extensions: ['.ts', '.tsx'], read: 'code' },
  { directory: 'bench', extensions: ['.mjs'], read: 'code' },
  // The codemods package, its rename map and the code its fixtures show.
  { path: 'packages/codemods/README.md', read: 'whole' },
  { directory: 'packages/codemods/src', extensions: ['.json'], read: 'whole' },
  { directory: 'packages/codemods/src', extensions: ['.mjs'], read: 'code' },
  { directory: 'packages/codemods/bin', extensions: ['.mjs'], read: 'code' },
  {
    directory: 'packages/codemods/test/fixtures',
    extensions: ['.ts', '.tsx', '.jsx'],
    read: 'code',
  },
  { directory: 'packages/codemods/test/fixtures', extensions: ['.css', '.scss'], read: 'whole' },
  // The lint packages: their READMEs, the rules with their messages, the data they ship, and the
  // code their tests lint.
  { path: 'packages/eslint-plugin/README.md', read: 'whole' },
  { path: 'packages/eslint-plugin/index.d.ts', read: 'code' },
  { directory: 'packages/eslint-plugin/src', extensions: ['.js'], read: 'code' },
  { directory: 'packages/eslint-plugin/src/data', extensions: ['.json'], read: 'whole' },
  { directory: 'packages/eslint-plugin/data', extensions: ['.json'], read: 'whole' },
  { directory: 'packages/eslint-plugin/scripts', extensions: ['.mjs'], read: 'code' },
  { directory: 'packages/eslint-plugin/test', extensions: ['.mjs'], read: 'code' },
  { path: 'packages/stylelint-config/README.md', read: 'whole' },
  { path: 'packages/stylelint-config/index.js', read: 'code' },
  { path: 'packages/stylelint-config/tokens.js', read: 'code' },
  { directory: 'packages/stylelint-config/plugins', extensions: ['.js'], read: 'code' },
  { directory: 'packages/stylelint-config/data', extensions: ['.json'], read: 'whole' },
  { directory: 'packages/stylelint-config/scripts', extensions: ['.mjs'], read: 'code' },
  { directory: 'packages/stylelint-config/test', extensions: ['.mjs'], read: 'code' },
];

/** Generated from pinned inputs: Material Symbols names its own icons, such as ChromeMaximize. */
const generated = [
  'packages/ui/src/icons/',
  'apps/catalogue/src/brand/EnvUILogo.tsx',
  'apps/catalogue/src/generated/',
  // Results of benchmark runs, and the lists of third-party packages its scorer recognizes.
  'bench/results/',
  'bench/scoring/',
];

test('shipped text, documentation and sample data name no products', async () => {
  const findings = [];
  for (const file of await sourceFiles()) {
    const text = await readFile(join(repository, file.path), 'utf8');
    const segments = file.read === 'code' ? codeText(file.path, text) : [{ start: 0, text }];
    for (const segment of segments) findings.push(...productMentions(file.path, text, segment));
  }
  assert.deepEqual(findings, [], 'Name no products; describe the pattern instead.');
});

test('the check finds a product name and lets its allowed uses pass', () => {
  const text = '- Lay it out as Console does.\n- Publish to GitHub Packages; read GitHub Docs.\n';
  assert.deepEqual(productMentions('example.md', text, { start: 0, text }), [
    'example.md:1: Console in "- Lay it out as Console does."',
    'example.md:2: GitHub in "- Publish to GitHub Packages; read GitHub Docs."',
  ]);
  const release = '- Attach it to the GitHub release.\n';
  assert.deepEqual(productMentions('README.md', release, { start: 0, text: release }), [
    'README.md:1: GitHub in "- Attach it to the GitHub release."',
  ]);
  assert.deepEqual(productMentions('CONTRIBUTING.md', release, { start: 0, text: release }), []);
  const cases = '- Plans live in ~/.atlas; ask in slack.\n- The window chrome, linear easing.\n';
  assert.deepEqual(productMentions('example.md', cases, { start: 0, text: cases }), [
    'example.md:1: Atlas in "- Plans live in ~/.atlas; ask in slack."',
    'example.md:1: Slack in "- Plans live in ~/.atlas; ask in slack."',
  ]);
  const code = "// Unlike Slack.\nconsole.log('Coord');\nimport { Forms } from './Forms';\n";
  const segments = codeText('example.ts', code);
  assert.deepEqual(
    segments.flatMap((segment) => productMentions('example.ts', code, segment)),
    ['example.ts:1: Slack in "// Unlike Slack."', `example.ts:2: Coord in "'Coord'"`],
  );
});

async function sourceFiles() {
  const files = [];
  for (const source of sources) {
    if (source.path) {
      files.push({ path: source.path, read: source.read });
      continue;
    }
    for (const path of await listFiles(source.directory)) {
      if (!source.extensions.some((extension) => path.endsWith(extension))) continue;
      if (generated.some((prefix) => path.startsWith(prefix))) continue;
      // Installed packages and builds, such as the benchmark app's.
      if (/(?:^|\/)(?:node_modules|dist)\//.test(path)) continue;
      files.push({ path, read: source.read });
    }
  }
  return files;
}

async function listFiles(directory) {
  let entries;
  try {
    entries = await readdir(join(repository, directory), { recursive: true, withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(repository, join(entry.parentPath, entry.name)).split(sep).join('/'))
    .sort();
}

/** Comments, string and template literals and JSX text; module specifiers are file names. */
function codeText(path, text) {
  const kind = path.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : /\.[cm]?js$/.test(path)
      ? ts.ScriptKind.JS
      : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
  const segments = [];
  const commentStarts = new Set();
  const comments = (position) => {
    const ranges = [
      ...(ts.getLeadingCommentRanges(text, position) ?? []),
      ...(ts.getTrailingCommentRanges(text, position) ?? []),
    ];
    for (const { pos, end } of ranges) {
      if (commentStarts.has(pos)) continue;
      commentStarts.add(pos);
      segments.push({ start: pos, text: text.slice(pos, end) });
    }
  };
  const visit = (node) => {
    comments(node.getFullStart());
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined
    ) {
      comments(node.end);
      return;
    }
    if (
      ts.isStringLiteralLike(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node) ||
      ts.isJsxText(node)
    )
      segments.push({ start: node.getStart(sourceFile), text: node.getText(sourceFile) });
    ts.forEachChild(node, visit);
    comments(node.end);
  };
  visit(sourceFile);
  return segments;
}

/** Each listed name in a segment, as `path:line: Name in "excerpt"`, unless an allowed use covers it. */
function productMentions(path, fileText, segment) {
  const mentions = [];
  const firstLine = fileText.slice(0, segment.start).split('\n').length;
  segment.text.split('\n').forEach((line, index) => {
    for (const { name, flags } of productNames) {
      for (const hit of line.matchAll(new RegExp(`\\b${name}\\b`, flags))) {
        const patterns = [...(allowed[name] ?? []), ...(allowedIn[path]?.[name] ?? [])];
        const covered = patterns.some((pattern) =>
          [...line.matchAll(pattern)].some(
            (use) => use.index <= hit.index && hit.index < use.index + use[0].length,
          ),
        );
        if (covered) continue;
        const excerpt = line
          .slice(Math.max(0, hit.index - 40), hit.index + name.length + 40)
          .trim();
        mentions.push(`${path}:${firstLine + index}: ${name} in "${excerpt}"`);
      }
    }
  });
  return mentions;
}
