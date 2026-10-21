// Generates docs/generated/parts.json, the public part contract: for each component its root class,
// its parts (class names with a one-line description) and its state attributes (`data-*`) with
// their values. The manifest, the docs' anatomy figures and dev mode read it.
//
//   node scripts/GenerateParts.mjs           rewrite docs/generated/parts.json
//   node scripts/GenerateParts.mjs --check   fail when it differs from its sources, or when a part
//                                            or state the base branch lists has gone without a
//                                            changeset that names it
//
// What it derives from the library's source (packages/ui/src):
// - the part classes: the `env-*` literals in class names (`className`, `classNames(…)`, a `class`
//   property, a variable named for a class), with `env-x-${value}` expanded over the value's type;
// - the state attributes: `data-*` attributes set in JSX on an element with a part class, their
//   values from the attribute's type, and the `[data-*]` selectors that the style sheets
//   (src/styles) put on a part class, with the values they compare;
// - the components: every component and namespace the public entries export, whose parts are the
//   classes that start with `env-<its name in kebab case>`.
//
// What it merges from packages/ui/src/parts.json, written by hand: the description of every part,
// the root of a component whose root is not `env-<name>`, the shared groups (anatomy that several
// components render, such as the list row of menus and selects) and where a class goes when no
// name places it. A part without a description, or a description without a part, fails.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Node, Project } from 'ts-morph';

const root = fileURLToPath(new URL('../', import.meta.url));
const libraryDirectory = resolve(root, 'packages/ui');
const sourceDirectory = resolve(libraryDirectory, 'src');
const stylesDirectory = resolve(sourceDirectory, 'styles');
export const partsFile = resolve(root, 'docs/generated/parts.json');
export const partsSourceFile = resolve(sourceDirectory, 'parts.json');
const partsPath = 'docs/generated/parts.json';
const propsFile = resolve(root, 'docs/generated/props.json');
const changesetDirectory = resolve(root, '.changeset');

export const partsSchemaVersion = 1;

const posix = (path) => path.split(sep).join('/');
const repositoryPath = (file) => posix(relative(root, file));
/** `AvatarGroup` is `avatar-group`, `CodeDiff` `code-diff`. */
const kebab = (name) =>
  name
    .replace(/(?<=[a-z\d])(?=[A-Z])/g, '-')
    .replace(/(?<=[A-Z])(?=[A-Z][a-z])/g, '-')
    .toLowerCase();
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** An `env-*` class in a string, not part of a selector, custom property or data attribute. */
const classPattern = /(?<![\w.#-])env-[a-z\d]+(?:-[a-z\d]+)*(-?)/g;
/** Attribute and property names whose values are class names. */
const isClassName = (name) => /^(?:class|className|\w+ClassName)$/.test(name);

/** The string values a type can take, or undefined when it takes any string or number. */
function literalValues(type) {
  const values = new Set();
  for (const member of type.isUnion() ? type.getUnionTypes() : [type]) {
    if (member.isUndefined() || member.isNull() || member.isNever()) continue;
    if (member.isStringLiteral() || member.isNumberLiteral())
      values.add(String(member.getLiteralValue()));
    else if (member.isBooleanLiteral()) values.add(member.getText());
    else if (member.isBoolean()) values.add('true').add('false');
    else return undefined;
  }
  return values;
}

/**
 * The part classes and the state attributes the library's TypeScript sets: each class with the
 * files it occurs in, and each element's data attributes with the classes on that element.
 */
function readSource() {
  const project = new Project({ tsConfigFilePath: resolve(libraryDirectory, 'tsconfig.json') });
  const classes = new Map();
  const warnings = [];
  /** The JSX element whose attribute holds a node, if any. */
  const elementOf = (node) => {
    const attribute = node.getFirstAncestor(
      (ancestor) => Node.isJsxAttribute(ancestor) && isClassName(ancestor.getNameNode().getText()),
    );
    return attribute?.getParent()?.getParent();
  };
  const classesOnElement = new Map();
  const statesOnElement = new Map();
  const files = project
    .getSourceFiles()
    .filter(
      (file) =>
        !/[\\/](?:generated|icons)[\\/]/.test(relative(sourceDirectory, file.getFilePath())),
    );
  for (const file of files) {
    const path = repositoryPath(file.getFilePath());
    const anchors = [];
    file.forEachDescendant((node) => {
      if (Node.isJsxAttribute(node)) {
        const name = node.getNameNode().getText();
        if (isClassName(name) && node.getInitializer()) anchors.push(node.getInitializer());
        else if (name.startsWith('data-')) {
          const element = node.getParent().getParent();
          const list = statesOnElement.get(element) ?? [];
          list.push({ attribute: name, values: attributeValues(node), path });
          statesOnElement.set(element, list);
        }
      } else if (Node.isCallExpression(node) && node.getExpression().getText() === 'classNames')
        anchors.push(...node.getArguments());
      else if (Node.isPropertyAssignment(node) && isClassName(node.getName()))
        anchors.push(node.getInitializer());
      else if (
        Node.isVariableDeclaration(node) &&
        /class/i.test(node.getName()) &&
        node.getInitializer()
      )
        anchors.push(node.getInitializer());
    });
    const seen = new Set();
    const add = (name, node) => {
      const entry = classes.get(name) ?? { files: new Set() };
      entry.files.add(path);
      classes.set(name, entry);
      const element = elementOf(node);
      if (element) {
        const set = classesOnElement.get(element) ?? new Set();
        set.add(name);
        classesOnElement.set(element, set);
      }
    };
    for (const anchor of anchors) {
      if (!anchor) continue;
      const pieces = [anchor, ...anchor.getDescendants()];
      for (const node of pieces) {
        if (seen.has(node)) continue;
        seen.add(node);
        let text;
        let next;
        if (
          Node.isStringLiteral(node) ||
          Node.isNoSubstitutionTemplateLiteral(node) ||
          Node.isTemplateTail(node)
        )
          text = node.getLiteralText();
        else if (Node.isTemplateHead(node) || Node.isTemplateMiddle(node)) {
          text = node.getLiteralText();
          // The expression that follows the piece completes a class that ends in `-`.
          if (Node.isTemplateHead(node))
            next = node.getParent().getTemplateSpans()[0]?.getExpression();
          else {
            const span = node.getParent();
            const spans = span.getParent().getTemplateSpans();
            next = spans[spans.indexOf(span) + 1]?.getExpression();
          }
        } else continue;
        for (const match of text.matchAll(classPattern)) {
          const [token, dash] = match;
          if (!dash) {
            add(token, node);
            continue;
          }
          const ends = match.index + token.length === text.length;
          const values = ends && next ? literalValues(next.getType()) : undefined;
          if (!values?.size) {
            warnings.push(`${path}: ${token}… takes a value that is not a list of strings`);
            continue;
          }
          for (const value of values) add(`${token}${value}`, node);
        }
      }
    }
  }
  const states = [];
  for (const [element, list] of statesOnElement) {
    const names = classesOnElement.get(element);
    if (!names) continue;
    for (const state of list) states.push({ ...state, classes: [...names] });
  }
  // A component's files: its own and the internal modules it imports, so shared anatomy, such as
  // the list row of menus, counts as used by the components that render it.
  const imports = new Map(
    files.map((file) => [
      repositoryPath(file.getFilePath()),
      file
        .getImportDeclarations()
        .map((declaration) => declaration.getModuleSpecifierSourceFile())
        .filter(Boolean)
        .map((imported) => repositoryPath(imported.getFilePath())),
    ]),
  );
  return { classes, states, imports, warnings };
}

/** The values a JSX data attribute takes: its literal, or the string values of its type. */
function attributeValues(attribute) {
  const initializer = attribute.getInitializer();
  // `<div data-open>` renders data-open="true".
  if (!initializer) return new Set(['true']);
  if (Node.isStringLiteral(initializer)) return new Set([initializer.getLiteralText()]);
  const expression = initializer.getExpression?.();
  return expression ? literalValues(expression.getType()) : undefined;
}

/** Splits a selector list or a selector at `separators` outside brackets, parentheses and strings. */
function splitTopLevel(text, separators) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (character === '(' || character === '[') depth += 1;
    else if (character === ')' || character === ']') depth -= 1;
    else if (depth === 0 && separators.test(character)) {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

/**
 * The state attributes the style sheets select on a part class: `.env-x[data-y='z']` and
 * `.env-x:not([data-y])` put data-y on env-x. Selectors inside `:has()` describe other elements and
 * are read as selectors of their own.
 */
function readStyles() {
  const states = [];
  const files = readdirSync(stylesDirectory).filter((name) => name.endsWith('.css'));
  const visit = (selector, path) => {
    const inner = [];
    const own = selector.replace(/:has\(((?:[^()]|\((?:[^()]|\([^()]*\))*\))*)\)/g, (_, body) => {
      inner.push(body);
      return '';
    });
    for (const body of inner) for (const part of splitTopLevel(body, /,/)) visit(part, path);
    for (const compound of splitTopLevel(own, /[\s>+~]/)) {
      const names = [...compound.matchAll(/\.(env-[a-z\d]+(?:-[a-z\d]+)*)(?![\w-])/g)].map(
        (match) => match[1],
      );
      if (!names.length) continue;
      for (const match of compound.matchAll(
        /\[\s*(data-[\w-]+)\s*(?:[~|^$*]?=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*(?:[is]\s*)?\]/g,
      )) {
        const value = match[2] ?? match[3] ?? match[4];
        states.push({
          attribute: match[1],
          values: new Set(value === undefined ? [] : [value]),
          classes: names,
          path,
        });
      }
    }
  };
  for (const name of files) {
    const path = repositoryPath(resolve(stylesDirectory, name));
    const css = readFileSync(resolve(stylesDirectory, name), 'utf8').replace(
      /\/\*[\s\S]*?\*\//g,
      '',
    );
    for (const match of css.matchAll(/(?:^|[;{}])\s*([^;{}@][^;{}]*)\{/g))
      for (const selector of splitTopLevel(match[1], /,/)) visit(selector, path);
  }
  return states;
}

/** The hand-written part of the contract. */
export function readPartsSource(file = partsSourceFile) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** The part contract, from the library's source, its style sheets and packages/ui/src/parts.json. */
export function buildParts({
  source = readPartsSource(),
  props = JSON.parse(readFileSync(propsFile, 'utf8')),
} = {}) {
  const { classes, states: sourceStates, imports, warnings } = readSource();
  const styleStates = readStyles();
  const problems = [...warnings];

  // The groups: every exported component and namespace, and the shared anatomy.
  const groups = new Map();
  for (const [name, entry] of Object.entries(props.exports)) {
    if (name.includes('.') || !['component', 'namespace'].includes(entry.kind)) continue;
    groups.set(name, { name, prefix: `env-${kebab(name)}`, source: entry.source, shared: false });
  }
  for (const [name, entry] of Object.entries(source.shared ?? {}))
    groups.set(name, { name, prefix: entry.prefix, root: entry.root ?? null, shared: true });
  const byPrefix = [...groups.values()].sort((a, b) => b.prefix.length - a.prefix.length);
  const groupOf = (name) =>
    source.placed?.[name] ??
    byPrefix.find((group) => name === group.prefix || name.startsWith(`${group.prefix}-`))?.name;

  const members = new Map();
  for (const name of [...classes.keys()].sort(byText)) {
    const group = groupOf(name);
    if (!group || !groups.has(group)) {
      problems.push(
        `${name} belongs to no component: add it to "placed" in packages/ui/src/parts.json`,
      );
      continue;
    }
    members.set(group, [...(members.get(group) ?? []), name]);
  }

  // States, by group and attribute.
  const groupStates = new Map();
  for (const state of [...sourceStates, ...styleStates]) {
    for (const name of state.classes) {
      if (!classes.has(name)) continue;
      const group = groupOf(name);
      const byAttribute = groupStates.get(group) ?? new Map();
      const entry = byAttribute.get(state.attribute) ?? {
        values: new Set(),
        free: false,
        parts: new Set(),
      };
      if (state.values === undefined) entry.free = true;
      else for (const value of state.values) entry.values.add(value);
      entry.parts.add(name);
      byAttribute.set(state.attribute, entry);
      groupStates.set(group, byAttribute);
    }
  }

  // Which groups each group's files render: its own files and the internal modules they import.
  const filesOf = new Map();
  for (const [name, list] of members)
    for (const className of list)
      for (const file of classes.get(className).files)
        filesOf.set(file, new Set([...(filesOf.get(file) ?? []), name]));
  const componentSources = new Set(
    [...groups.values()].map((group) => group.source).filter(Boolean),
  );
  const reachable = (start) => {
    const found = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const file = queue.shift();
      for (const next of imports.get(file) ?? [])
        if (!found.has(next) && !componentSources.has(next)) {
          found.add(next);
          queue.push(next);
        }
    }
    return found;
  };

  const descriptions = source.descriptions ?? {};
  const output = { components: {}, shared: {} };
  const usedBy = new Map();
  for (const group of [...groups.values()].sort((a, b) => byText(a.name, b.name))) {
    const list = members.get(group.name) ?? [];
    const rootClass =
      group.name in (source.roots ?? {})
        ? source.roots[group.name]
        : group.shared
          ? group.root
          : list.includes(group.prefix)
            ? group.prefix
            : null;
    if (!list.length && !rootClass) continue;
    if (rootClass && !classes.has(rootClass))
      problems.push(`${group.name}: its root ${rootClass} is not a class of the library`);
    const written = descriptions[group.name] ?? {};
    for (const name of list)
      if (typeof written[name] !== 'string' || !written[name].trim())
        problems.push(`${group.name}: ${name} has no description in packages/ui/src/parts.json`);
    for (const name of Object.keys(written))
      if (!list.includes(name))
        problems.push(
          `${group.name}: ${name} is described in packages/ui/src/parts.json but is not one of its parts`,
        );
    const ordered = [...list].sort((a, b) =>
      a === rootClass ? -1 : b === rootClass ? 1 : byText(a, b),
    );
    const uses = new Set();
    if (group.source)
      for (const file of reachable(group.source))
        for (const other of filesOf.get(file) ?? [])
          if (groups.get(other).source !== group.source) uses.add(other);
    for (const name of uses) usedBy.set(name, new Set([...(usedBy.get(name) ?? []), group.name]));
    const entry = {
      root: rootClass,
      ...(group.source && { source: group.source }),
      parts: ordered.map((name) => ({ class: name, description: written[name] ?? null })),
      states: [...(groupStates.get(group.name) ?? new Map())]
        .sort(([a], [b]) => byText(a, b))
        .map(([attribute, { values, free, parts }]) => ({
          attribute,
          values: free ? [] : [...values].sort(byText),
          parts: [...parts].sort(byText),
        })),
      ...(uses.size && { uses: [...uses].sort(byText) }),
    };
    (group.shared ? output.shared : output.components)[group.name] = entry;
  }
  for (const [name, entry] of Object.entries(output.shared))
    entry.usedBy = [...(usedBy.get(name) ?? [])].sort(byText);
  for (const name of Object.keys(descriptions))
    if (!(name in output.components) && !(name in output.shared))
      problems.push(`packages/ui/src/parts.json describes ${name}, which has no parts`);

  return {
    parts: {
      $comment:
        'Generated by scripts/GenerateParts.mjs from packages/ui/src and the descriptions in packages/ui/src/parts.json; do not edit. Part classes and state attributes are public and versioned. In a state, values lists what the attribute takes; "" is an attribute set without a value, and an empty list one that takes any value or is selected by its presence alone.',
      schemaVersion: partsSchemaVersion,
      ...output,
    },
    problems,
  };
}

export function serializeParts(parts) {
  return `${JSON.stringify(parts, null, 2)}\n`;
}

export function readParts(file = partsFile) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Every part class and every state attribute value of a contract, as `Group: name` lines. */
function contractNames(parts) {
  const names = new Map();
  for (const kind of ['components', 'shared'])
    for (const [group, entry] of Object.entries(parts?.[kind] ?? {})) {
      for (const part of entry.parts) names.set(`${group}: .${part.class}`, part.class);
      for (const state of entry.states) {
        names.set(`${group}: [${state.attribute}]`, state.attribute);
        for (const value of state.values)
          names.set(`${group}: [${state.attribute}='${value}']`, state.attribute);
      }
    }
  return names;
}

/**
 * What a contract lost against an older one: each part, state attribute or value that is gone,
 * with whether a changeset names it (the class, or the attribute for a state). Pure, for the tests.
 */
export function removedParts(before, after, changesets = '') {
  const now = contractNames(after);
  const removed = [];
  for (const [label, name] of contractNames(before))
    if (!now.has(label))
      removed.push({
        label,
        name,
        // The whole name, so a changeset about env-card-header doesn't record env-card.
        recorded: new RegExp(`(?<![\w-])${name}(?![\w-])`).test(changesets),
      });
  return removed;
}

function git(args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/** The contract at the merge-base with the integration branch, as the check tiers pick it. */
function baseParts() {
  const candidates = process.env.ENVUI_BASE
    ? [process.env.ENVUI_BASE]
    : ['origin/envui-1.0', 'origin/dev'];
  for (const ref of candidates) {
    try {
      const mergeBase = git(['merge-base', 'HEAD', ref]).trim();
      try {
        return { ref, parts: JSON.parse(git(['show', `${mergeBase}:${partsPath}`])) };
      } catch {
        return { ref, parts: undefined };
      }
    } catch {
      // Try the next branch.
    }
  }
  return { ref: undefined, parts: undefined };
}

/** The pending changesets' text, which a removal must name. */
function pendingChangesets() {
  if (!existsSync(changesetDirectory)) return '';
  return readdirSync(changesetDirectory)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => readFileSync(resolve(changesetDirectory, name), 'utf8'))
    .join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const { parts, problems } = buildParts();
  const output = serializeParts(parts);
  if (problems.length) {
    console.error(
      `The part contract has problems:\n${problems.map((line) => `  ${line}`).join('\n')}`,
    );
    process.exit(1);
  }
  const current = existsSync(partsFile) ? readFileSync(partsFile, 'utf8') : undefined;
  if (check) {
    if (current !== output) {
      console.error(
        `${partsPath} differs from the library's source. Run \`npm run docs:parts\` and commit the result.`,
      );
      process.exit(1);
    }
    const base = baseParts();
    if (!base.parts) {
      console.log(
        `${partsPath} matches its sources.${base.ref ? ` ${base.ref} has no ${partsPath} to compare with.` : ''}`,
      );
    } else {
      const removed = removedParts(base.parts, parts, pendingChangesets());
      const unrecorded = removed.filter((item) => !item.recorded);
      if (removed.length)
        console.log(
          `Gone since ${base.ref}:\n${removed.map((item) => `  ${item.label}${item.recorded ? ' (in a changeset)' : ''}`).join('\n')}`,
        );
      if (unrecorded.length) {
        console.error(
          `Part classes and state attributes are public: a part or state that goes is a breaking change. Name each one above that no changeset mentions in a major changeset, with what replaces it.`,
        );
        process.exit(1);
      }
      console.log(
        `${partsPath} matches its sources, and every part or state gone since ${base.ref} is in a changeset.`,
      );
    }
  } else {
    mkdirSync(dirname(partsFile), { recursive: true });
    if (current !== output) writeFileSync(partsFile, output);
    console.log(
      `Generated ${partsPath}: ${Object.keys(parts.components).length} components and ${Object.keys(parts.shared).length} shared groups.`,
    );
  }
}
