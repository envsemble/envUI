// Reads the repository's files as text for the checks that read what code and comments say: which
// files a folder holds, and the comments and text of a module, as TypeScript parses them.
import { readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import ts from 'typescript';
import { repository } from './importSource.mjs';

/** The files under `directory`, a path from the repository's root, as sorted root paths. */
export async function listFiles(directory) {
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

/**
 * The comments, string and template literals and JSX text of a module, each `{ kind, start, text }`
 * with `kind` `comment` or `text`; module specifiers are file names and are left out.
 */
export function codeText(path, text) {
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
      segments.push({ kind: 'comment', start: pos, text: text.slice(pos, end) });
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
      segments.push({
        kind: 'text',
        start: node.getStart(sourceFile),
        text: node.getText(sourceFile),
      });
    ts.forEachChild(node, visit);
    comments(node.end);
  };
  visit(sourceFile);
  return segments;
}

/** The comments of a style sheet, each `{ kind, start, text }` as codeText() gives them. */
export function cssComments(text) {
  return [...text.matchAll(/\/\*[\s\S]*?\*\//g)].map((match) => ({
    kind: 'comment',
    start: match.index,
    text: match[0],
  }));
}
