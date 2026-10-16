// v1-classes: renames envUI 0.x class names and custom properties to their 1.0 names, as the
// `classes` and `tokens` sections of the rename map list them.
//
// - Style sheets (.css, .scss, .sass, .less, .pcss): `.env-*` class selectors, `--env-*` custom
//   properties, the tokens' custom properties before 1.0 (`--color-text-muted` becomes
//   `--env-color-fg-muted`) and `[class…='env-*']` attribute selectors. A token that 1.0 removes,
//   or a fixed color no token replaces, stays and is reported.
// - Scripts: class tokens in string and template literals inside JSX `className` and `class`
//   attributes, `className` properties and assignments, selector strings passed to
//   querySelector, querySelectorAll, closest and matches, classList methods,
//   getElementsByClassName; `--env-*` custom properties and the tokens' names before 1.0 in
//   `style` attributes, string property keys and style.setProperty, getPropertyValue and
//   removeProperty; and `var(--env-*)` and `var()` of a token's name before 1.0 in any string.
// Scripts are edited in place, literal by literal, so everything else keeps its formatting.
import { extname } from 'node:path';
import { loadMap, renameClass } from '../map.mjs';
import { createReporter, parserFor } from '../shared.mjs';

export const parser = 'tsx';

const styleSheets = new Set(['.css', '.scss', '.sass', '.less', '.pcss']);
const selectorMethods = new Set(['querySelector', 'querySelectorAll', 'closest', 'matches']);
const classListMethods = new Set(['add', 'remove', 'toggle', 'contains', 'replace']);
const propertyMethods = new Set(['setProperty', 'getPropertyValue', 'removeProperty']);

/** A `.env-*` class selector or a `--env-*` custom property in style sheet text. */
const styleToken = /(\.|(?<![A-Za-z0-9_-])--)(env-[a-z0-9][a-z0-9_-]*)(?![A-Za-z0-9_-])/g;
/**
 * A custom property without the --env- prefix, which the tokens section may list. A name followed
 * by a hyphen, as in a template literal's `--space-${size}`, is not one.
 */
const tokenProperty =
  /(?<![A-Za-z0-9_-])(--)((?!env-)[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?![A-Za-z0-9_-])/g;
/** A `var()` of a custom property without the --env- prefix. */
const tokenVariable = /(var\(\s*--)((?!env-)[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?![A-Za-z0-9_-])/g;

/**
 * Renames the tokens' custom properties before 1.0 in `text`, as the map's tokens section lists
 * them, and calls `report` with the offset and message of each that 1.0 removes. `pattern` finds
 * the names: every custom property, or only those in `var()`.
 */
function renameTokens(text, tokens, report, pattern = tokenProperty) {
  return text.replace(pattern, (match, prefix, name, offset) => {
    const entry = tokens.get(name);
    if (!entry) return match;
    if (entry.to) return prefix + entry.to;
    report?.(offset, entry.report);
    return match;
  });
}

/** A `--env-*` custom property. */
const customProperty = /(?<![A-Za-z0-9_-])--(env-[a-z0-9][a-z0-9_-]*)(?![A-Za-z0-9_-])/g;
/** An attribute selector on `class`: `[class~='env-row']`, `[class*="env-notice-"]`. */
const classAttribute = /\[\s*class\s*[~|^$*]?=[^\]]*\]/g;
/** An `env-*` name inside an attribute selector's value. */
const attributeName = /(?<![A-Za-z0-9_-])env-[a-z0-9][a-z0-9_-]*(?![A-Za-z0-9_-])/g;
/** A whole whitespace-separated `env-*` class token. */
const classToken = /(?<!\S)env-[a-z0-9][a-z0-9_-]*(?!\S)/g;

/**
 * Renames the classes that depend on an ancestor first: in one selector, a `.from` class after the
 * `.ancestor` class, as in `.env-diff-count > .env-counter-label`, becomes `.to`.
 */
function renameWithin(text, classesWithin) {
  let output = text;
  for (const { ancestor, from, to } of classesWithin) {
    const inside = new RegExp(String.raw`(\.${ancestor}(?![\w-])[^{},;]*?\.)${from}(?![\w-])`, 'g');
    output = output.replace(inside, (match, before) => before + to);
  }
  return output;
}

/**
 * Renames class selectors, attribute selectors and custom properties in style sheet text. A
 * custom property that a 1.0 token has, such as --env-row-height, is no class's: the class renames
 * leave it alone. `report` receives the offset and message of each token that 1.0 removes.
 */
export function renameInStyles(
  text,
  classes,
  classesWithin = [],
  tokens = new Map(),
  tokenNames = new Set(),
  report = undefined,
) {
  const renamed = renameWithin(text, classesWithin)
    .replace(classAttribute, (selector) =>
      selector.replace(attributeName, (name) => renameClass(name, classes)),
    )
    .replace(styleToken, (match, prefix, name) =>
      prefix === '--' && tokenNames.has(name) ? match : prefix + renameClass(name, classes),
    );
  return renameTokens(renamed, tokens, report);
}

const renameCustomProperties = (text, classes, tokens, tokenNames, report) =>
  renameTokens(
    text.replace(customProperty, (match, name) =>
      tokenNames.has(name) ? match : `--${renameClass(name, classes)}`,
    ),
    tokens,
    report,
  );

/** A `var(--env-*)` reference. */
const variable = /(var\(\s*--)(env-[a-z0-9][a-z0-9_-]*)(?![A-Za-z0-9_-])/g;
const renameVariables = (text, classes, tokens, tokenNames, report) =>
  renameTokens(
    text.replace(variable, (match, prefix, name) =>
      tokenNames.has(name) ? match : prefix + renameClass(name, classes),
    ),
    tokens,
    report,
    tokenVariable,
  );

/**
 * Renames whole class tokens. `atStart` is false for a template quasi that follows an expression,
 * where a token at its very start continues the expression's value rather than starting a class.
 */
const renameClassTokens = (text, classes, atStart) =>
  text.replace(classToken, (name, offset) =>
    offset === 0 && !atStart ? name : renameClass(name, classes),
  );

/**
 * Offsets of the start of each line, with the line breaks Babel counts. Babel reads a byte order
 * mark as no column, so the first line starts after it.
 */
function lineStarts(source) {
  const starts = [source.startsWith('\uFEFF') ? 1 : 0];
  const lineBreak = /\r\n?|\n|\u2028|\u2029/g;
  for (let match = lineBreak.exec(source); match; match = lineBreak.exec(source))
    starts.push(match.index + match[0].length);
  return starts;
}

export default function transform(file, api, options = {}) {
  const { classes, classesWithin, tokens, tokenNames } = loadMap(options.map);
  if (!file.source.includes('env-') && !file.source.includes('--')) return undefined;
  const reporter = createReporter(api);
  /** Reports at the line of `offset` in `text`, which starts on line `first`. */
  const reportAt = (text, first) => (offset, message) =>
    reporter.warn(
      { loc: { start: { line: first + (text.slice(0, offset).match(/\r\n?|\n/g)?.length ?? 0) } } },
      message,
    );
  if (styleSheets.has(extname(file.path).toLowerCase())) {
    const output = renameInStyles(
      file.source,
      classes,
      classesWithin,
      tokens,
      tokenNames,
      reportAt(file.source, 1),
    );
    reporter.flush();
    return output === file.source ? file.source : output;
  }

  const j = api.jscodeshift.withParser(parserFor(file.path));
  const root = j(file.source);
  const starts = lineStarts(file.source);
  const offset = (position) => starts[position.line - 1] + position.column;

  /** How each literal is rewritten: `class` tokens, a `selector` or `property` names. */
  const modes = new Map();
  const mark = (node, mode) => {
    if (node && !modes.has(node)) modes.set(node, mode);
  };
  /** Marks every string and template literal in an expression, the expression included. */
  const markWithin = (path, mode) => {
    const node = path.node ?? path;
    if (node.type === 'StringLiteral' || node.type === 'TemplateLiteral') mark(node, mode);
    if (!path.node) return;
    j(path)
      .find(j.StringLiteral)
      .forEach((literal) => mark(literal.node, mode));
    j(path)
      .find(j.TemplateLiteral)
      .forEach((literal) => mark(literal.node, mode));
  };
  const keyName = (property) =>
    property.computed
      ? undefined
      : property.key.type === 'Identifier'
        ? property.key.name
        : property.key.type === 'StringLiteral'
          ? property.key.value
          : undefined;

  root.find(j.JSXAttribute).forEach((path) => {
    const { name, value } = path.node;
    if (name.type !== 'JSXIdentifier' || !value) return;
    const mode =
      name.name === 'className' || name.name === 'class'
        ? 'class'
        : name.name === 'style'
          ? 'property'
          : undefined;
    if (mode) markWithin(path.get('value'), mode);
  });
  root.find(j.ObjectProperty).forEach((path) => {
    const key = keyName(path.node);
    if (key === 'className') markWithin(path.get('value'), 'class');
    else if (key?.startsWith('--') && path.node.key.type === 'StringLiteral')
      mark(path.node.key, 'property');
  });
  root.find(j.AssignmentExpression).forEach((path) => {
    const { left } = path.node;
    if (
      (left.type === 'MemberExpression' || left.type === 'OptionalMemberExpression') &&
      !left.computed &&
      left.property.name === 'className'
    )
      markWithin(path.get('right'), 'class');
  });
  const calls = (path) => {
    const { callee } = path.node;
    if (
      (callee.type !== 'MemberExpression' && callee.type !== 'OptionalMemberExpression') ||
      callee.computed ||
      callee.property.type !== 'Identifier'
    )
      return;
    const method = callee.property.name;
    const object = callee.object;
    const argument = (index) => path.get('arguments', index);
    if (selectorMethods.has(method) && path.node.arguments[0]) markWithin(argument(0), 'selector');
    else if (method === 'getElementsByClassName' && path.node.arguments[0])
      markWithin(argument(0), 'class');
    else if (propertyMethods.has(method) && path.node.arguments[0])
      markWithin(argument(0), 'property');
    else if (
      classListMethods.has(method) &&
      (object.type === 'MemberExpression' || object.type === 'OptionalMemberExpression') &&
      !object.computed &&
      object.property.name === 'classList'
    )
      path.node.arguments.forEach((_argument, index) => markWithin(argument(index), 'class'));
  };
  root.find(j.CallExpression).forEach(calls);
  root.find(j.OptionalCallExpression).forEach(calls);
  // `var(--env-*)` is a custom property in any string, such as a style object's value.
  root.find(j.StringLiteral).forEach((path) => mark(path.node, 'var'));
  root.find(j.TemplateLiteral).forEach((path) => mark(path.node, 'var'));

  const rewrite = (text, mode, atStart, report) =>
    mode === 'selector'
      ? renameInStyles(text, classes, classesWithin, tokens, tokenNames, report)
      : mode === 'property'
        ? renameCustomProperties(text, classes, tokens, tokenNames, report)
        : mode === 'var'
          ? renameVariables(text, classes, tokens, tokenNames, report)
          : renameClassTokens(text, classes, atStart);

  // Babel gives a template's raw text with its line breaks as \n, whatever the file's are.
  const sameText = (source, raw) => source === raw || source.replace(/\r\n?/g, '\n') === raw;

  const edits = [];
  for (const [node, mode] of modes) {
    if (node.type === 'StringLiteral') {
      if (!node.loc || !node.extra?.raw) continue;
      const start = offset(node.loc.start) + 1;
      const end = offset(node.loc.end) - 1;
      const raw = file.source.slice(start - 1, end + 1);
      if (!sameText(raw, node.extra.raw)) continue;
      const text = file.source.slice(start, end);
      const next = rewrite(text, mode, true, reportAt(text, node.loc.start.line));
      if (next !== text) edits.push({ start, end, text: next });
      continue;
    }
    node.quasis.forEach((quasi, index) => {
      if (!quasi.loc) return;
      const start = offset(quasi.loc.start);
      const end = offset(quasi.loc.end);
      const text = file.source.slice(start, end);
      if (!sameText(text, quasi.value.raw)) return;
      const next = rewrite(text, mode, index === 0, reportAt(text, quasi.loc.start.line));
      if (next !== text) edits.push({ start, end, text: next });
    });
  }
  reporter.flush();
  if (edits.length === 0) return file.source;

  let output = file.source;
  for (const { start, end, text } of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, start) + text + output.slice(end);
  return output;
}
