import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// envUI is product agnostic: what it ships and documents names no application that uses it and no
// third-party product it is styled after. Names match as case-sensitive whole words, so the English
// words in `console.log`, `navigator.platform` or "forms" do not count.

const repository = fileURLToPath(new URL('../', import.meta.url));

/** Applications built on envUI and third-party products. Extend the list as products appear. */
const productNames = [
  'Atlas',
  'Chrome',
  'Console',
  'Coord',
  'Electron',
  'Figma',
  'Forms',
  'GitHub',
  'Google',
  'Jira',
  'Linear',
  'Notion',
  'Platform',
  'Slack',
];

/**
 * Uses of a listed word that do not name a product envUI is for. A hit passes when one of its
 * name's patterns matches on the same line and covers it.
 */
const allowed = {
  // envUI is distributed through GitHub Packages and released by GitHub Actions; setup says so.
  // The hosted catalogue's readers sign in with GitHub login; the README's hosting section says so.
  GitHub: [/GitHub (?:Packages|Actions|release|token|login)/g],
  // The English word: the name of the family of form components, and a list of what to preserve.
  Forms: [/Forms & selection/g, /^#{2,} Forms$/g, /^- Forms, validation/g],
};

/** Text that ships with the package or documents it: Markdown whole, code by comments and strings. */
const sources = [
  { path: 'README.md', read: 'whole' },
  { path: 'packages/ui/CHANGELOG.md', read: 'whole' },
  { directory: '.changeset', extensions: ['.md'], read: 'whole' },
  { directory: 'docs', extensions: ['.md'], read: 'whole' },
  { directory: '.agents/skills', extensions: ['.md'], read: 'whole' },
  { directory: 'packages/ui/src', extensions: ['.css'], read: 'whole' },
  { directory: 'packages/ui/src', extensions: ['.ts', '.tsx'], read: 'code' },
  // The catalogue's sample data and copy.
  { directory: 'apps/catalogue/src', extensions: ['.ts', '.tsx'], read: 'code' },
];

/** Generated from pinned inputs: Material Symbols names its own icons, such as ChromeMaximize. */
const generated = [
  'packages/ui/src/icons/',
  'packages/ui/src/EnvUILogo.tsx',
  'apps/catalogue/src/generated/',
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
  const kind = path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
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
    for (const name of productNames) {
      for (const hit of line.matchAll(new RegExp(`\\b${name}\\b`, 'g'))) {
        const covered = (allowed[name] ?? []).some((pattern) =>
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
