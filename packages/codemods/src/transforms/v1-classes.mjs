// v1-classes: renames envUI 0.x class names and custom properties to their 1.0 names, as the
// `classes` and `tokens` sections of the rename map list them, and turns the modifier classes of
// its `classAttributes` section into attribute selectors.
//
// - A modifier class becomes the attributes its root class now carries: `.env-button-important`
//   becomes `.env-button[data-variant='primary'][data-tone='accent']`, without the root class where
//   the compound selector already has it. In markup, such a class is reported: set the component's
//   props instead.
//
// - Style sheets (.css, .scss, .sass, .less, .pcss): `.env-*` class selectors, `--env-*` custom
//   properties, the tokens' custom properties before 1.0 (`--color-text-muted` becomes
//   `--env-color-fg-muted`), the names 1.0's development gave some (`--env-topbar-height` becomes
//   `--env-app-shell-header-height`) and `[class…='env-*']` attribute selectors. A token that 1.0 removes,
//   or a fixed color no token replaces, stays and is reported.
// - Scripts: class tokens in string and template literals inside JSX `className` and `class`
//   attributes, `className` properties and assignments, selector strings passed to
//   querySelector, querySelectorAll, closest and matches, classList methods,
//   getElementsByClassName; `--env-*` custom properties and the tokens' names before 1.0 in
//   `style` attributes, string property keys and style.setProperty, getPropertyValue and
//   removeProperty; and `var(--env-*)` and `var()` of a token's name before 1.0 in any string.
// - CSS-in-JS templates tagged css, keyframes, createGlobalStyle, injectGlobal or styled, as style
//   sheets; selectors in test locators (locator, waitForSelector, $, $) and class names in
//   toHaveClass and expect(el.classList) assertions.
// - Test files: a string that is exactly one 0.x class passed to a call that names classes, or one
//   class selector passed to any call; another exact class string, such as a test id, and a 0.x
//   class or token in a regular expression or a longer string are reported.
// - A declaration of a token's name before 1.0 is renamed only where the name is the one that
//   becomes its token; where 1.0 merges several names into one token, as --control-height-small
//   and --icon-button-size into --env-control-height, a declaration of another stays and is
//   reported, and so does one beside its 1.0 name in the same block. Uses are always renamed.
// Scripts are edited in place, literal by literal, so everything else keeps its formatting.
import { existsSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { loadMap, renameClass } from '../map.mjs';
import { createReporter, parserFor, sourceRanges } from '../shared.mjs';

export const parser = 'tsx';

const styleSheets = new Set(['.css', '.scss', '.sass', '.less', '.pcss']);
/** Methods that take a selector: the DOM's, and the locators of test runners such as Playwright. */
const selectorMethods = new Set([
  'querySelector',
  'querySelectorAll',
  'closest',
  'matches',
  'locator',
  'waitForSelector',
  '$',
  '$$',
  '$eval',
  '$$eval',
]);
/** Assertions on an element's classes, such as `expect(row).toHaveClass('env-tree-item')`. */
const classAssertions = new Set(['toHaveClass']);
/** Assertions on a value, which take a class where the value is `classList` or `className`. */
const valueAssertions = new Set(['toContain', 'toBe', 'toEqual', 'toMatch']);
/** Tags of CSS-in-JS templates: css`…`, keyframes`…`, createGlobalStyle`…` and styled.div`…`. */
const styleTags = new Set(['css', 'keyframes', 'createGlobalStyle', 'injectGlobal', 'styled']);
/**
 * A test file, where a string that is a 0.x class is renamed in more contexts: `*.test.*`,
 * `*.spec.*`, or a file in a `tests`, `__tests__`, `e2e`, `playwright` or `cypress` folder.
 */
const testFile =
  /(?:^|[\\/])(?:__tests__|tests|e2e|playwright|cypress)[\\/]|\.(?:test|spec|e2e)\.[cm]?[jt]sx?$/i;

/**
 * Whether `path` is a test file, judged by its path below its project: the deepest of `roots`, the
 * projects of the folders the CLI scans, that holds it, or else the nearest folder with a
 * package.json, so the folders above the project, and the working folder, don't count.
 */
export function isTestFile(path, roots = []) {
  const file = resolve(path);
  const below = (folder) => {
    if (folder === undefined) return undefined;
    const part = relative(folder, file);
    return part && !part.startsWith('..') && !isAbsolute(part) ? part : undefined;
  };
  const scanned = roots
    .map((root) => below(resolve(root)))
    .filter((part) => part !== undefined)
    .sort((a, b) => a.length - b.length)[0];
  return testFile.test(scanned ?? below(projectRoot(dirname(file))) ?? basename(file));
}

const projectRoots = new Map();
/** The nearest folder at or above `folder` that has a package.json, or undefined. */
export function projectRoot(folder) {
  if (!projectRoots.has(folder)) {
    const parent = dirname(folder);
    projectRoots.set(
      folder,
      existsSync(join(folder, 'package.json'))
        ? folder
        : parent === folder
          ? undefined
          : projectRoot(parent),
    );
  }
  return projectRoots.get(folder);
}

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
/** Any custom property, for reports. */
const anyCustomProperty = /(?<![A-Za-z0-9_-])--([a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?![A-Za-z0-9_-])/g;
/** A `var()` of a custom property without the --env- prefix. */
const tokenVariable = /(var\(\s*--)((?!env-)[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?![A-Za-z0-9_-])/g;

/** Whether the custom property at `offset` in `text`, `length` long, is declared: a colon follows. */
const declaredAt = (text, offset, length) => /^\s*:/.test(text.slice(offset + length));

/** Whether the innermost block around `offset` in `text` declares the custom property `--name`. */
function blockDeclares(text, offset, name) {
  const start = Math.max(text.lastIndexOf('{', offset), text.lastIndexOf('}', offset)) + 1;
  const after = text.slice(offset).search(/[{}]/);
  const block = text.slice(start, after === -1 ? text.length : offset + after);
  return new RegExp(String.raw`(?<![A-Za-z0-9_-])--${name}\s*:`).test(block);
}

/**
 * The 1.0 name of the token `name` at `offset` in `text`, or undefined where it stays, after
 * `report` has its reason: a removed name; or a declaration of a name that shares its target with others and isn't the
 * target's own, or one whose block already declares the target, which two declarations of one
 * property would leave to their order. `declared` is undefined in style sheet text, where a colon
 * after the name makes a declaration; false for a use; or, for a style key or setProperty's name,
 * a function telling whether the same object declares another property too.
 */
function tokenTarget(name, tokens, text, offset, length, report, declared) {
  const entry = tokens.get(name);
  if (!entry.to) {
    report?.(offset, entry.report);
    return undefined;
  }
  if (declared === undefined ? !declaredAt(text, offset, length) : declared === false)
    return entry.to;
  if (entry.declaration) {
    report?.(offset, entry.declaration);
    return undefined;
  }
  if (declared ? declared(`--${entry.to}`) : blockDeclares(text, offset, entry.to)) {
    report?.(
      offset,
      `--${name} is declared here next to --${entry.to}, which replaces it in 1.0. The codemod ` +
        `leaves it rather than declare --${entry.to} twice: keep one of the two.`,
    );
    return undefined;
  }
  return entry.to;
}

/**
 * Renames the tokens' custom properties before 1.0 in `text`, as the map's tokens section lists
 * them, and calls `report` with the offset and message of each that stays (see tokenTarget).
 * `pattern` finds the names: every custom property, or only those in `var()`.
 */
function renameTokens(text, tokens, report, pattern = tokenProperty, declared = undefined) {
  return text.replace(pattern, (match, prefix, name, offset) => {
    if (!tokens.has(name)) return match;
    const to = tokenTarget(name, tokens, text, offset, match.length, report, declared);
    return to ? prefix + to : match;
  });
}

/**
 * A `--env-*` custom property that the tokens section lists, a name of 1.0's development such as
 * --env-topbar-height: its 1.0 name, or the name itself where it stays (see tokenTarget).
 */
const renameDevelopmentToken = (name, tokens, report, text, offset, length, declared) =>
  tokenTarget(name, tokens, text, offset, length, report, declared) ?? name;

/**
 * The 1.0 name of the `--env-*` custom property `name` at `offset` in `text`: a development
 * token's (see renameDevelopmentToken); a token's own, which stays; or its class rename's, followed
 * by the token rename of the name that gives, so --env-notice-tone becomes --env-alert-tone and then
 * --env-alert-icon in one run.
 */
function renameEnvProperty(
  name,
  classes,
  tokens,
  tokenNames,
  report,
  text,
  offset,
  length,
  declared,
) {
  if (tokens.has(name))
    return renameDevelopmentToken(name, tokens, report, text, offset, length, declared);
  if (tokenNames.has(name)) return name;
  const renamed = renameClass(name, classes);
  return renamed !== name && tokens.has(renamed)
    ? renameDevelopmentToken(renamed, tokens, report, text, offset, length, declared)
    : renamed;
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

/** A class selector in style sheet text. */
const classSelector = /\.(env-[a-z0-9][a-z0-9_-]*)(?![A-Za-z0-9_-])/g;
/** What ends a compound selector: a combinator, a list or a parenthesis. */
const compoundBoundary = /[\s>+~,(){};]/;

/**
 * The attribute selectors for a modifier's attributes; an empty value tests presence alone. In a
 * script's string, whose quotes the codemod doesn't know, a value is an unquoted identifier.
 */
const attributeList = (attributes, quote = "'") =>
  Object.entries(attributes).map(([name, value]) =>
    value === '' ? `[${name}]` : `[${name}=${quote}${value}${quote}]`,
  );
const attributeSelectors = (attributes) => attributeList(attributes).join('');

/**
 * Turns modifier classes into attribute selectors on their root class, as the map's
 * classAttributes list them, keeping each selector's specificity: a modifier class counted as one
 * class, and so does what replaces it. In a compound selector that has the root class, the first
 * attribute stands for it and the others are in :where(), as `.env-button.env-button-important`
 * becomes `.env-button[data-variant='primary']:where([data-tone='accent'])`; in one without it,
 * the root class does, once, as `.env-button-important` becomes
 * `.env-button:where([data-variant='primary'][data-tone='accent'])`.
 */
export function attributesInStyles(text, classAttributes = new Map(), quote = "'") {
  if (classAttributes.size === 0) return text;
  const inserted = new Set();
  return text.replace(classSelector, (match, name, offset) => {
    const rule = classAttributes.get(name);
    if (!rule) return match;
    let start = offset;
    while (start > 0 && !compoundBoundary.test(text[start - 1])) start -= 1;
    let end = offset + match.length;
    while (end < text.length && !compoundBoundary.test(text[end])) end += 1;
    // Inside :is(), :not() or :where(), the compound before the pseudo-class is the same element's.
    let compound = text.slice(start, end);
    let outer = start;
    while (text[outer - 1] === '(' && /:(?:is|not|where|matches)$/.test(text.slice(0, outer - 1))) {
      let before = text.lastIndexOf(':', outer - 1);
      while (before > 0 && !compoundBoundary.test(text[before - 1])) before -= 1;
      compound = text.slice(before, outer) + compound;
      outer = before;
    }
    const root = new RegExp(String.raw`\.${rule.class}(?![A-Za-z0-9_-])`);
    const key = `${start} ${rule.class}`;
    const [first, ...others] = attributeList(rule.attributes, quote);
    if (root.test(compound) || inserted.has(key))
      return others.length > 0 ? `${first}:where(${others.join('')})` : first;
    inserted.add(key);
    return `.${rule.class}:where(${first}${others.join('')})`;
  });
}

/** The selector of the rule whose block holds `offset` in `text`, or undefined outside a rule. */
function selectorAt(text, offset) {
  const open = text.lastIndexOf('{', offset);
  if (open === -1 || text.lastIndexOf('}', offset) > open) return undefined;
  const before = text.slice(0, open);
  const start =
    Math.max(before.lastIndexOf('}'), before.lastIndexOf('{'), before.lastIndexOf(';')) + 1;
  return before
    .slice(start)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
}

/**
 * Reports each declaration of a component token that becomes a color property, which doesn't
 * inherit, in a rule whose selector doesn't end at the component: in prerelease.1 the token, set on
 * a wrapper, reached the component inside it; its color property, set there, colors nothing. A
 * selector that ends with `&` or none, such as a style object's, is the component's own as far as
 * the codemod can tell.
 */
function reportInheritance(text, classes, tokens, report) {
  for (const match of text.matchAll(/(?<![A-Za-z0-9_-])--([a-z][a-z0-9_-]*)\s*:/g)) {
    const name = match[1];
    const entry = tokens.get(name) ?? tokens.get(renameClass(name, classes));
    if (!entry?.colorPropertyOf) continue;
    const selector = selectorAt(text, match.index);
    if (!selector) continue;
    const own = new RegExp(String.raw`\.${entry.colorPropertyOf}(?![A-Za-z0-9_-])`);
    const wrappers = selector
      .split(',')
      .map((part) =>
        part
          .trim()
          .split(/\s*[\s>+~]\s*/)
          .at(-1),
      )
      .filter(
        (subject) =>
          !subject.includes('&') &&
          !own.test(
            subject.replace(/\.(env-[a-z0-9_-]+)/g, (_, n) => `.${renameClass(n, classes)}`),
          ),
      );
    if (wrappers.length === 0) continue;
    report(
      match.index,
      `--${name} becomes --${entry.to}, a color property that doesn't inherit: where ` +
        `${wrappers.join(', ')} matches a wrapper rather than the .${entry.colorPropertyOf} itself, it ` +
        `no longer reaches the one inside. Set it on the component, such as with ` +
        `"${wrappers[0]} .${entry.colorPropertyOf}", its className or its style.`,
    );
  }
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
  classAttributes = new Map(),
  quote = "'",
) {
  if (report) reportInheritance(text, classes, tokens, report);
  const renamed = renameWithin(attributesInStyles(text, classAttributes, quote), classesWithin)
    .replace(classAttribute, (selector) =>
      selector.replace(attributeName, (name) => renameClass(name, classes)),
    )
    .replace(styleToken, (match, prefix, name, offset, whole) =>
      prefix === '--'
        ? prefix +
          renameEnvProperty(name, classes, tokens, tokenNames, report, whole, offset, match.length)
        : prefix + renameClass(name, classes),
    );
  return renameTokens(renamed, tokens, report);
}

/**
 * Reports the classes and selectors that the map's classReports list, in renamed text: a class 1.0
 * neither keeps nor renames, in a selector or a class string, and in a selector only, a class
 * inside another that no longer holds it, or a class with an attribute that it no longer has.
 */
export function reportClasses(text, classReports, report, selectors = true) {
  for (const rule of classReports) {
    if ((rule.within || rule.attributes) && !selectors) continue;
    if (rule.attributes) {
      // The attribute in the same compound selector as the class, such as .env-x:not(:hover)[data-y],
      // or negated there, as .env-x:not([data-y]). A whole pseudo-class's parentheses, or another
      // attribute, is skipped, so a class inside :has() or :is() is no part of the compound.
      const attributes = new RegExp(
        String.raw`\.${rule.name}(?![\w-])(?:[^{},;\s+~>()[\]]|\([^(){}]*\)|\[[^\]{}]*\])*?` +
          String.raw`(:not\(\s*)?\[\s*(${rule.attributes.join('|')})(?![\w-])`,
        'g',
      );
      for (const match of text.matchAll(attributes))
        report(
          match.index,
          match[1]
            ? `.${rule.name} has no ${match[2]} in 1.0, so .${rule.name}:not([${match[2]}]) now ` +
                `matches every .${rule.name}: ${rule.report}`
            : `.${rule.name}[${match[2]}] matches nothing in 1.0: ${rule.report}`,
        );
      continue;
    }
    const pattern = rule.within
      ? new RegExp(
          String.raw`\.${rule.within}(?![\w-])[^{},;+~]*?[\s>][^{},;+~]*?\.${rule.name}(?![\w-])`,
          'g',
        )
      : new RegExp(String.raw`(?<![\w-])${rule.name}(?:-[a-z0-9_-]*)?(?![\w-])`, 'g');
    for (const match of text.matchAll(pattern))
      if (rule.within)
        report(
          match.index + match[0].length - rule.name.length,
          `.${rule.name} inside .${rule.within} matches nothing in 1.0: ${rule.report}`,
        );
      else report(match.index, `${match[0]} has no 1.0 class: ${rule.report}`);
  }
}

const renameCustomProperties = (text, classes, tokens, tokenNames, report, declared) =>
  renameTokens(
    text.replace(
      customProperty,
      (match, name, offset) =>
        `--${renameEnvProperty(name, classes, tokens, tokenNames, report, text, offset, match.length, declared)}`,
    ),
    tokens,
    report,
    tokenProperty,
    declared,
  );

/** A `var(--env-*)` reference. */
const variable = /(var\(\s*--)(env-[a-z0-9][a-z0-9_-]*)(?![A-Za-z0-9_-])/g;
const renameVariables = (text, classes, tokens, tokenNames, report) =>
  renameTokens(
    text.replace(
      variable,
      (match, prefix, name, offset) =>
        prefix +
        renameEnvProperty(
          name,
          classes,
          tokens,
          tokenNames,
          report,
          text,
          offset,
          match.length,
          false,
        ),
    ),
    tokens,
    report,
    tokenVariable,
    false,
  );

/**
 * Renames whole class tokens. `atStart` is false for a template quasi that follows an expression,
 * where a token at its very start continues the expression's value rather than starting a class.
 */
const renameClassTokens = (text, classes, atStart) =>
  text.replace(classToken, (name, offset) =>
    offset === 0 && !atStart ? name : renameClass(name, classes),
  );

export default function transform(file, api, options = {}) {
  const { classes, classAttributes, classesWithin, classReports, tokens, tokenNames } = loadMap(
    options.map,
  );
  if (!file.source.includes('env-') && !file.source.includes('--')) return undefined;
  const reporter = createReporter(api);
  /**
   * What became of a 0.x class that the codemod leaves where it is, or undefined for a name that
   * is no 0.x class: its 1.0 name, the attributes that replace a modifier, or the classReports
   * entry's text.
   */
  const oldClass = (name) => {
    const attributes = classAttributes.get(name);
    if (attributes)
      return `a 0.x modifier class, which the codemod leaves here: .${attributes.class} carries ${attributeSelectors(attributes.attributes)} instead in 1.0.`;
    const reported = classReports.find(
      (rule) =>
        !rule.within &&
        !rule.attributes &&
        (name === rule.name || name.startsWith(`${rule.name}-`)),
    );
    if (reported)
      return `a 0.x class, which the codemod leaves here and 1.0 has none for: ${reported.report}`;
    const renamed = renameClass(name, classes);
    return renamed === name
      ? undefined
      : `a 0.x class, which the codemod leaves here: it is ${renamed} in 1.0.`;
  };
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
      classAttributes,
    );
    reportClasses(output, classReports, reportAt(output, 1));
    reporter.flush();
    return output === file.source ? file.source : output;
  }

  const j = api.jscodeshift.withParser(parserFor(file.path));
  const root = j(file.source);
  // Where each literal's text is: recast's lines and columns aren't offsets in the text.
  const stringRange = sourceRanges(file, j, root, 'StringLiteral');
  const quasiRange = sourceRanges(file, j, root, 'TemplateElement');

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
  /**
   * The custom property names that are declared, style keys and setProperty's, each with whether
   * its object declares another property too, or false for getPropertyValue's, which is a use.
   */
  const declarations = new Map();
  root.find(j.ObjectProperty).forEach((path) => {
    const key = keyName(path.node);
    if (key === 'className') markWithin(path.get('value'), 'class');
    else if (key?.startsWith('--') && path.node.key.type === 'StringLiteral') {
      mark(path.node.key, 'property');
      const object = path.parent.node;
      declarations.set(path.node.key, (name) =>
        (object.properties ?? []).some(
          (property) => property !== path.node && property.key && keyName(property) === name,
        ),
      );
    }
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
  /** Whether a member expression is an element's classes: `x.classList` or `x.className`. */
  const isClasses = (node) =>
    (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression') &&
    !node.computed &&
    (node.property.name === 'classList' || node.property.name === 'className');
  /**
   * Whether an assertion's object asserts on an element's classes: `expect(x.classList)`, also
   * with modifiers such as `.not`, or `expect(x.className)`.
   */
  const assertsClasses = (object) => {
    let node = object;
    while (
      (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression') &&
      !node.computed &&
      ['not', 'resolves', 'rejects', 'soft'].includes(node.property.name)
    )
      node = node.object;
    return node?.type === 'CallExpression' && isClasses(node.arguments[0]);
  };
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
    if (classAssertions.has(method))
      path.node.arguments.forEach((_argument, index) => markWithin(argument(index), 'class'));
    else if (valueAssertions.has(method) && path.node.arguments[0] && assertsClasses(object))
      markWithin(argument(0), 'class');
    else if (selectorMethods.has(method) && path.node.arguments[0])
      markWithin(argument(0), 'selector');
    else if (method === 'getElementsByClassName' && path.node.arguments[0])
      markWithin(argument(0), 'class');
    else if (propertyMethods.has(method) && path.node.arguments[0]) {
      markWithin(argument(0), 'property');
      declarations.set(path.node.arguments[0], method === 'getPropertyValue' ? false : () => false);
    } else if (
      classListMethods.has(method) &&
      (object.type === 'MemberExpression' || object.type === 'OptionalMemberExpression') &&
      !object.computed &&
      object.property.name === 'classList'
    )
      path.node.arguments.forEach((_argument, index) => markWithin(argument(index), 'class'));
  };
  root.find(j.CallExpression).forEach(calls);
  root.find(j.OptionalCallExpression).forEach(calls);
  // A CSS-in-JS template is a style sheet: css`…`, styled.div`…`, styled(Button)`…`.
  const isStyleTag = (tag) =>
    tag.type === 'Identifier'
      ? styleTags.has(tag.name)
      : tag.type === 'MemberExpression'
        ? isStyleTag(tag.object)
        : tag.type === 'CallExpression'
          ? isStyleTag(tag.callee)
          : false;
  root
    .find(j.TaggedTemplateExpression)
    .filter((path) => isStyleTag(path.node.tag))
    .forEach((path) => mark(path.node.quasi, 'styles'));

  // In a test file, a string that is one 0.x class, or one class selector, is renamed in a class
  // context the passes above don't know: a call that names classes, such as
  // `findByClass(root, 'env-app-sidebar')`, and for a class selector, such as `cy.get('.env-row')`,
  // any call. Elsewhere, such as a test id, an id or an object key, the string may not be a class,
  // so it stays and is reported, as does a 0.x class or token inside a longer string or a regular
  // expression: the codemod can't tell a class there from other text, or rewrite a pattern.
  if (isTestFile(file.path, options.roots)) {
    const oneClass = /^\s*(\.?)(env-[a-z0-9][a-z0-9_-]*)\s*$/;
    const literalText = (node) =>
      node.type === 'StringLiteral'
        ? node.value
        : node.expressions.length === 0
          ? node.quasis[0].value.cooked
          : undefined;
    const reportIn = (node, text, where) => {
      for (const match of text.matchAll(attributeName)) {
        const message = oldClass(match[0]);
        if (message) reporter.warn(node, `${match[0]} in ${where}: ${message}`);
      }
    };
    /** Reports the tokens' custom properties before 1.0, and the --env-* names they list. */
    const reportTokensIn = (node, text, where) => {
      for (const match of text.matchAll(anyCustomProperty)) {
        const entry = tokens.get(match[1]);
        if (entry)
          reporter.warn(
            node,
            `--${match[1]} in ${where}: ${
              entry.to
                ? `a 0.x custom property, which the codemod leaves here: it is --${entry.to} in 1.0.`
                : entry.report
            }`,
          );
      }
    };
    /** The name a call calls: `findByClass` in findByClass(…) and in page.findByClass(…). */
    const calleeName = (callee) =>
      callee.type === 'Identifier'
        ? callee.name
        : (callee.type === 'MemberExpression' || callee.type === 'OptionalMemberExpression') &&
            !callee.computed &&
            callee.property.type === 'Identifier'
          ? callee.property.name
          : '';
    const inTests = (path) => {
      const { node } = path;
      if (modes.has(node) || path.parent.node.type === 'ImportDeclaration') return;
      const text = literalText(node);
      const one = text?.match(oneClass);
      if (one && oldClass(one[2])) {
        const call = path.parent.node;
        const argument =
          (call.type === 'CallExpression' || call.type === 'OptionalCallExpression') &&
          call.arguments.includes(node);
        if (argument && one[1]) mark(node, 'selector');
        else if (argument && /class/i.test(calleeName(call.callee))) mark(node, 'class');
        else reportIn(node, text, 'a string outside a class context, such as a test id or a key');
      } else if (text !== undefined) reportIn(node, text, 'a string');
      else for (const quasi of node.quasis) reportIn(quasi, quasi.value.cooked ?? '', 'a string');
    };
    root.find(j.StringLiteral).forEach(inTests);
    root.find(j.TemplateLiteral).forEach(inTests);
    root.find(j.RegExpLiteral).forEach((path) => {
      reportIn(path.node, path.node.pattern, 'a regular expression');
      reportTokensIn(path.node, path.node.pattern, 'a regular expression');
    });
  }

  // `var(--env-*)` is a custom property in any string, such as a style object's value.
  root.find(j.StringLiteral).forEach((path) => mark(path.node, 'var'));
  root.find(j.TemplateLiteral).forEach((path) => mark(path.node, 'var'));

  /** Reports the modifier classes in a class string, which only the component's props set now. */
  const reportModifiers = (text, report) => {
    for (const match of text.matchAll(classToken)) {
      const rule = classAttributes.get(match[0]);
      if (rule)
        report(
          match.index,
          `${match[0]} is gone in 1.0: .${rule.class} carries ${attributeSelectors(rule.attributes)} instead, which the component's props set.`,
        );
    }
  };
  const rewrite = (text, mode, atStart, report, declared) =>
    mode === 'selector' || mode === 'styles'
      ? renameInStyles(
          text,
          classes,
          classesWithin,
          tokens,
          tokenNames,
          report,
          classAttributes,
          // A template's text takes quotes; a selector string's quotes are the string's own.
          mode === 'styles' ? "'" : '',
        )
      : mode === 'property'
        ? renameCustomProperties(text, classes, tokens, tokenNames, report, declared)
        : mode === 'var'
          ? renameVariables(text, classes, tokens, tokenNames, report)
          : (reportModifiers(text, report), renameClassTokens(text, classes, atStart));

  /** Reports the classReports in a literal's renamed text: selectors, and classes in class strings. */
  const reportRemaining = (text, mode, line) => {
    if (mode === 'selector' || mode === 'styles' || mode === 'class')
      reportClasses(text, classReports, reportAt(text, line), mode !== 'class');
  };

  // Babel gives a template's raw text with its line breaks as \n, whatever the file's are.
  const sameText = (source, raw) => source === raw || source.replace(/\r\n?/g, '\n') === raw;

  const edits = [];
  for (const [node, mode] of modes) {
    if (node.type === 'StringLiteral') {
      const range = stringRange(node);
      if (!node.loc || !range?.node.extra?.raw) continue;
      const start = range.start + 1;
      const end = range.end - 1;
      const raw = file.source.slice(start - 1, end + 1);
      if (!sameText(raw, range.node.extra.raw)) continue;
      const text = file.source.slice(start, end);
      const next = rewrite(
        text,
        mode,
        true,
        reportAt(text, node.loc.start.line),
        declarations.get(node),
      );
      reportRemaining(next, mode, node.loc.start.line);
      if (next !== text) edits.push({ start, end, text: next });
      continue;
    }
    node.quasis.forEach((quasi, index) => {
      const range = quasiRange(quasi);
      if (!quasi.loc || !range) return;
      const { start, end } = range;
      const text = file.source.slice(start, end);
      if (!sameText(text, range.node.value.raw)) return;
      const next = rewrite(text, mode, index === 0, reportAt(text, quasi.loc.start.line));
      reportRemaining(next, mode, quasi.loc.start.line);
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
