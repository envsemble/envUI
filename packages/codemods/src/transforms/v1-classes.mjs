// v1-classes: renames envUI 0.x class names and custom properties to their 1.0 names, as the
// `classes` section of the rename map lists them.
//
// - Style sheets (.css, .scss, .sass, .less, .pcss): `.env-*` class selectors, `--env-*` custom
//   properties and `[class…='env-*']` attribute selectors.
// - Scripts: class tokens in string and template literals inside JSX `className` and `class`
//   attributes, `className` properties and assignments, selector strings passed to
//   querySelector, querySelectorAll, closest and matches, classList methods,
//   getElementsByClassName; `--env-*` custom properties in `style` attributes, string property
//   keys and style.setProperty, getPropertyValue and removeProperty; and `var(--env-*)` in any
//   string.
// Scripts are edited in place, literal by literal, so everything else keeps its formatting.
import { extname } from 'node:path';
import { loadMap, renameClass } from '../map.mjs';
import { parserFor } from '../shared.mjs';

export const parser = 'tsx';

const styleSheets = new Set(['.css', '.scss', '.sass', '.less', '.pcss']);
const selectorMethods = new Set(['querySelector', 'querySelectorAll', 'closest', 'matches']);
const classListMethods = new Set(['add', 'remove', 'toggle', 'contains', 'replace']);
const propertyMethods = new Set(['setProperty', 'getPropertyValue', 'removeProperty']);

/** A `.env-*` class selector or a `--env-*` custom property in style sheet text. */
const styleToken = /(\.|(?<![A-Za-z0-9_-])--)(env-[a-z0-9][a-z0-9_-]*)(?![A-Za-z0-9_-])/g;
/** A `--env-*` custom property. */
const customProperty = /(?<![A-Za-z0-9_-])--(env-[a-z0-9][a-z0-9_-]*)(?![A-Za-z0-9_-])/g;
/** An attribute selector on `class`: `[class~='env-row']`, `[class*="env-notice-"]`. */
const classAttribute = /\[\s*class\s*[~|^$*]?=[^\]]*\]/g;
/** An `env-*` name inside an attribute selector's value. */
const attributeName = /(?<![A-Za-z0-9_-])env-[a-z0-9][a-z0-9_-]*(?![A-Za-z0-9_-])/g;
/** A whole whitespace-separated `env-*` class token. */
const classToken = /(?<!\S)env-[a-z0-9][a-z0-9_-]*(?!\S)/g;

/** Renames class selectors, attribute selectors and custom properties in style sheet text. */
export function renameInStyles(text, classes) {
  return text
    .replace(classAttribute, (selector) =>
      selector.replace(attributeName, (name) => renameClass(name, classes)),
    )
    .replace(styleToken, (match, prefix, name) => prefix + renameClass(name, classes));
}

const renameCustomProperties = (text, classes) =>
  text.replace(customProperty, (match, name) => `--${renameClass(name, classes)}`);

/** A `var(--env-*)` reference. */
const variable = /(var\(\s*--)(env-[a-z0-9][a-z0-9_-]*)(?![A-Za-z0-9_-])/g;
const renameVariables = (text, classes) =>
  text.replace(variable, (match, prefix, name) => prefix + renameClass(name, classes));

/**
 * Renames whole class tokens. `atStart` is false for a template quasi that follows an expression,
 * where a token at its very start continues the expression's value rather than starting a class.
 */
const renameClassTokens = (text, classes, atStart) =>
  text.replace(classToken, (name, offset) =>
    offset === 0 && !atStart ? name : renameClass(name, classes),
  );

/** Offsets of the start of each line, with the line breaks Babel counts. */
function lineStarts(source) {
  const starts = [0];
  const lineBreak = /\r\n?|\n|\u2028|\u2029/g;
  for (let match = lineBreak.exec(source); match; match = lineBreak.exec(source))
    starts.push(match.index + match[0].length);
  return starts;
}

export default function transform(file, api, options = {}) {
  const { classes } = loadMap(options.map);
  if (!file.source.includes('env-')) return undefined;
  if (styleSheets.has(extname(file.path).toLowerCase())) {
    const output = renameInStyles(file.source, classes);
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
    else if (key?.startsWith('--env-') && path.node.key.type === 'StringLiteral')
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

  const rewrite = (text, mode, atStart) =>
    mode === 'selector'
      ? renameInStyles(text, classes)
      : mode === 'property'
        ? renameCustomProperties(text, classes)
        : mode === 'var'
          ? renameVariables(text, classes)
          : renameClassTokens(text, classes, atStart);

  const edits = [];
  for (const [node, mode] of modes) {
    if (node.type === 'StringLiteral') {
      if (!node.loc || !node.extra?.raw) continue;
      const start = offset(node.loc.start) + 1;
      const end = offset(node.loc.end) - 1;
      const raw = file.source.slice(start - 1, end + 1);
      if (raw !== node.extra.raw) continue;
      const text = file.source.slice(start, end);
      const next = rewrite(text, mode, true);
      if (next !== text) edits.push({ start, end, text: next });
      continue;
    }
    node.quasis.forEach((quasi, index) => {
      if (!quasi.loc) return;
      const start = offset(quasi.loc.start);
      const end = offset(quasi.loc.end);
      const text = file.source.slice(start, end);
      if (text !== quasi.value.raw) return;
      const next = rewrite(text, mode, index === 0);
      if (next !== text) edits.push({ start, end, text: next });
    });
  }
  if (edits.length === 0) return file.source;

  let output = file.source;
  for (const { start, end, text } of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, start) + text + output.slice(end);
  return output;
}
