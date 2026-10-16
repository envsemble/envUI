// Helpers shared by the transforms.
import { extname } from 'node:path';

const typeScriptOnly = new Set(['.ts', '.mts', '.cts']);

/**
 * The parser for a file: `ts` for .ts, .mts and .cts, where `<T>value` is a type assertion rather
 * than JSX, and `tsx` for everything else (TSX, JSX and plain JavaScript).
 */
export const parserFor = (path) => (typeScriptOnly.has(extname(path).toLowerCase()) ? 'ts' : 'tsx');

/** Print options that keep the file's line endings and the quote style of its imports. */
export function printOptions(source, quote) {
  return { quote: quote ?? 'single', lineTerminator: source.includes('\r\n') ? '\r\n' : '\n' };
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
