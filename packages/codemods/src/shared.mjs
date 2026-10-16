// Helpers shared by the transforms.
import { extname } from 'node:path';

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
