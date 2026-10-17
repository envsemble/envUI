// Helpers shared by the transforms.
import { createRequire } from 'node:module';
import { extname } from 'node:path';

const require = createRequire(import.meta.url);

const typeScriptOnly = new Set(['.ts', '.mts', '.cts']);

/**
 * The parser for a file: `ts` for .ts, .mts and .cts, where `<T>value` is a type assertion rather
 * than JSX, and `tsx` for everything else (TSX, JSX and plain JavaScript).
 */
export const parserFor = (path) => (typeScriptOnly.has(extname(path).toLowerCase()) ? 'ts' : 'tsx');

/**
 * Whether a file indents with tabs: more of its lines start with a tab than with two or more
 * spaces. A single space, as before the `*` of a block comment's lines, is not indentation.
 */
export function indentsWithTabs(source) {
  let tabs = 0;
  let spaces = 0;
  for (const line of source.split('\n')) {
    if (line.startsWith('\t')) tabs += 1;
    else if (/^ {2,}\S/.test(line)) spaces += 1;
  }
  return tabs > spaces;
}

/**
 * Print options that keep the file's line endings, its indentation with tabs or spaces, and the
 * quote style of its imports. Recast indents what it reprints with these; the rest keeps its text.
 */
export function printOptions(source, quote) {
  return {
    quote: quote ?? 'single',
    lineTerminator: source.includes('\r\n') ? '\r\n' : '\n',
    useTabs: indentsWithTabs(source),
  };
}

/** A printed file with the byte order mark of its source, which recast leaves out when it prints. */
export function keepByteOrderMark(source, output) {
  const mark = '\uFEFF';
  return source.startsWith(mark) && !output.startsWith(mark) ? mark + output : output;
}

/**
 * Collects warnings about nodes and reports them through jscodeshift's `api.report` in line order,
 * each prefixed with the line of its node.
 */
export function createReporter(api) {
  const report = typeof api.report === 'function' ? api.report : () => {};
  const warnings = [];
  return {
    warn(node, message) {
      warnings.push({ line: node?.loc?.start.line ?? 0, message });
    },
    flush() {
      warnings.sort((a, b) => a.line - b.line);
      for (const { line, message } of warnings.splice(0)) report(`line ${line || '?'}: ${message}`);
    },
  };
}

/** Whether node `a` starts before node `b` in recast's lines and columns. */
const byPosition = (a, b) =>
  a.loc.start.line - b.loc.start.line || a.loc.start.column - b.loc.start.column;

/**
 * The exact offsets in the file's text of the nodes of one type, such as JSXAttribute, for a
 * transform that replaces their text rather than printing the file again. Recast's positions are
 * not offsets in the text: it parses a copy with tabs expanded, and counts U+2028 and U+2029 as line
 * breaks. So the text is parsed again, as it is, with the same parser, and its nodes of the type are
 * paired with recast's in the order they appear. Returns a function from a recast node to its
 * `{ start, end }` and the `node` of that parse, whose raw text is the file's, or undefined where
 * the two parses disagree.
 */
export function sourceRanges(file, j, root, type) {
  const parser = require(`jscodeshift/parser/${parserFor(file.path)}.js`)();
  const found = [];
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
    if (node.type === type) found.push(node);
    for (const [key, value] of Object.entries(node))
      if (key !== 'loc' && key !== 'extra' && value && typeof value === 'object') walk(value);
  };
  walk(parser.parse(file.source).program);
  found.sort((a, b) => a.start - b.start);
  const ours = root.find(j[type]).nodes().sort(byPosition);
  if (ours.length !== found.length) return () => undefined;
  const ranges = new Map(ours.map((node, index) => [node, found[index]]));
  return (node) => {
    const raw = ranges.get(node);
    return raw && { start: raw.start, end: raw.end, node: raw };
  };
}
