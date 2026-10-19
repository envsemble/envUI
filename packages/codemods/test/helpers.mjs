// Shared by the codemod tests: runs transforms in process as jscodeshift's worker does, and reads
// the input and output fixture pairs.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readMap } from '../src/map.mjs';

const require = createRequire(import.meta.url);
const jscodeshift = require('jscodeshift');
export const { applyTransform } = require('jscodeshift/src/testUtils.js');

export const packageDirectory = fileURLToPath(new URL('../', import.meta.url));
export const fixturesDirectory = fileURLToPath(new URL('./fixtures/', import.meta.url));
export const map = readMap();

/**
 * Runs a transform module on one file with the API jscodeshift's worker passes, and returns its
 * output (the source when it changes nothing), whether it skipped the file and its reports.
 */
export function runTransform(module, path, source, options = {}) {
  const reports = [];
  const j = jscodeshift.withParser(module.parser);
  const output = module.default(
    { path, source },
    { j, jscodeshift: j, stats: () => {}, report: (message) => reports.push(message) },
    options,
  );
  return { output: output ?? source, skipped: output == null, reports };
}

const crlf = (text) => text.replaceAll('\n', '\r\n');
const bom = (text) => `\uFEFF${text}`;
/** Each two spaces of a line's indentation as a tab. */
const tabs = (text) => text.replace(/^(?: {2})+/gm, (indent) => '\t'.repeat(indent.length / 2));

/**
 * How editors may save a fixture, each as a function from its LF text: CRLF line endings, a byte
 * order mark, both, or tab indentation. The fixtures are LF, as .gitattributes checks them out.
 */
export const encodings = [
  ['CRLF line endings', crlf],
  ['a byte order mark', bom],
  ['a byte order mark and CRLF line endings', (text) => bom(crlf(text))],
  ['tab indentation', tabs],
];

const reportsOf = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : []);

/**
 * The fixture pairs of a transform: `<case>.input.<ext>` with `<case>.output.<ext>`, and the
 * reports it expects, in `<case>.reports.<ext>.json`, or none.
 */
export function fixtures(transform) {
  const directory = join(fixturesDirectory, transform);
  return readdirSync(directory)
    .filter((file) => file.includes('.input.'))
    .sort()
    .map((file) => ({
      name: file.replace('.input.', '.'),
      path: join(directory, file),
      input: readFileSync(join(directory, file), 'utf8'),
      output: readFileSync(join(directory, file.replace('.input.', '.output.')), 'utf8'),
      // What the transform reports for the input, where a fixture expects reports.
      reports: reportsOf(join(directory, `${file.replace('.input.', '.reports.')}.json`)),
    }));
}
