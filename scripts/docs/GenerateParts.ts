// Generates docs/generated/parts.json, the public part contract: for each component its root class,
// its parts (class names with a one-line description) and its state attributes (`data-*`) with
// their values. The manifest, the docs' anatomy figures and dev mode read it.
//
//   node scripts/docs/GenerateParts.ts           rewrite docs/generated/parts.json
//   node scripts/docs/GenerateParts.ts --check [--base <ref>]
//                                            fail when it differs from its sources, or when a part
//                                            or state the base branch lists has gone without a
//                                            major changeset of @envsemble/envui that names it
//                                            (a value with its attribute). The base is --base, else
//                                            ENVUI_BASE, else the first of the check tiers' default
//                                            bases whose merge-base has the file.
//
// What it derives from the library's source (packages/ui/src):
// - the part classes: the `env-*` literals in class names (`className`, `classNames(…)`, a `class`
//   property, a variable named for a class), with `env-x-${value}` expanded over the value's type;
// - the state attributes: `data-*` attributes set in JSX on an element with a part class, their
//   values from the attribute's type, and the `[data-*]` selectors that the style sheets
//   (src/styles) put on a part class, with the values they compare; their values completed from
//   what the component's modules write in objects of props and an element's dataset;
//   attributes named data-env-ssr-* are private and left out: server markup carries them only until
//   a component reads its layout in the browser; so is data-env-theme-switching, which a theme
//   switch sets on the themed root for a frame;
// - the components: every component and namespace the public entries export, whose parts are the
//   classes that start with `env-<its name in kebab case>`.
//
// What it merges from packages/ui/src/parts.json, written by hand: the description of every part,
// the root of a component whose root is not `env-<name>`, the shared groups (anatomy that several
// components render, such as the list row of menus and selects) and where a class goes when no
// name places it. A part without a description, or a description without a part, fails.
//
// The color properties: each component's public custom properties for its colors, such as
// --env-button-container, from `colors` in packages/ui/src/parts.json, with what each colors. Each
// must be registered in the style sheets as a property that doesn't inherit
// (`@property --env-… { syntax: '*'; inherits: false; }`), and every property registered so must
// be listed; they are public and versioned like the parts.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Node,
  Project,
  type JsxAttribute,
  type TemplateExpression,
  type TemplateSpan,
  type Type,
} from 'ts-morph';

/** A data attribute a part takes: its values, the classes of its element, and where it is set. */
/** A component's or shared anatomy's entry in docs/generated/parts.json. */
interface PartsEntry {
  root: string | null;
  source?: string;
  parts: { class: string; description: string | null }[];
  states: { attribute: string; values: string[]; parts: string[] }[];
  uses?: string[];
  usedBy?: string[];
  colors?: { property: string; description: string }[];
  properties?: { property: string; use: 'set' | 'read'; description: string }[];
}

/** docs/generated/parts.json: the part contract. */
export interface PartsContract {
  $comment?: string;
  schemaVersion?: number;
  components: Record<string, PartsEntry>;
  shared: Record<string, PartsEntry>;
}

/** A name of a contract: a part, a color property, a state attribute, or one of its values. */
interface ContractItem {
  name: string;
  part?: string;
  color?: string;
  attribute?: string;
  parts?: string[];
  value?: string;
}

interface StateRecord {
  attribute: string;
  /** Undefined where its values can't be listed, such as a number. */
  values?: Set<string>;
  classes?: string[];
  path: string;
}
import { baseCandidates } from '../test/TestScope.ts';
import { kebab, type PropsFile } from './Schema.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const libraryDirectory = resolve(root, 'packages/ui');
const sourceDirectory = resolve(libraryDirectory, 'src');
const stylesDirectory = resolve(sourceDirectory, 'styles');
export const partsFile = resolve(root, 'docs/generated/parts.json');
export const partsSourceFile = resolve(sourceDirectory, 'parts.json');
const partsPath = 'docs/generated/parts.json';
const propsFile = resolve(root, 'docs/generated/props.json');
const changesetDirectory = resolve(root, '.changeset');

export const partsSchemaVersion = 1;

const posix = (path: string) => path.split(sep).join('/');
const repositoryPath = (file: string) => posix(relative(root, file));
const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Whether a state attribute is private: data-env-ssr-*, which server markup carries only until a
 * component reads its layout in the browser, such as a dock that stacks before it hydrates. Neither
 * the contract nor the docs list them, and they may change in any release. So is
 * data-env-theme-switching, which ThemePreferenceProvider sets on the themed root for the frame a
 * theme switch restyles, pausing transitions.
 */
export function isPrivateState(attribute: string) {
  return attribute.startsWith('data-env-ssr-') || attribute === 'data-env-theme-switching';
}

/** An `env-*` class in a string, not part of a selector, custom property or data attribute. */
const classPattern = /(?<![\w.#-])env-[a-z\d]+(?:-[a-z\d]+)*(-?)/g;
/** Attribute and property names whose values are class names. */
const isClassName = (name: string) => /^(?:class|className|\w+ClassName)$/.test(name);

/** The string values a type can take, or undefined when it takes any string or number. */
function literalValues(type: Type): Set<string> | undefined {
  const values = new Set<string>();
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
  const classes = new Map<string, { files: Set<string> }>();
  const warnings: string[] = [];
  /** The JSX element whose attribute holds a node, if any. */
  const elementOf = (node: Node) => {
    const attribute = node.getFirstAncestor(
      (ancestor) => Node.isJsxAttribute(ancestor) && isClassName(ancestor.getNameNode().getText()),
    );
    return attribute?.getParent()?.getParent();
  };
  const classesOnElement = new Map<Node, Set<string>>();
  const statesOnElement = new Map<Node, StateRecord[]>();
  // Every data attribute each file writes, with its values, wherever it writes it: on an element of
  // another component, in an object of props, or through an element's dataset. They complete the
  // values of a state its parts take, such as a variant set through a component's props.
  const written = new Map<string, Map<string, Set<string> | undefined>>();
  // The same, written through an element's dataset alone, which only the element's own code does.
  const writtenToDataset = new Map<string, Map<string, Set<string> | undefined>>();
  const write = (
    path: string,
    attribute: string,
    values: Set<string> | undefined,
    into = written,
  ) => {
    if (!attribute.startsWith('data-') || isPrivateState(attribute)) return;
    const byAttribute = into.get(path) ?? new Map<string, Set<string> | undefined>();
    const known = byAttribute.get(attribute);
    byAttribute.set(
      attribute,
      byAttribute.has(attribute) && (known === undefined || values === undefined)
        ? undefined
        : new Set([...(known ?? []), ...(values ?? [])]),
    );
    into.set(path, byAttribute);
  };
  // The elements whose class name reads a variable, by the variable's declaration, such as
  // `const className = 'env-x'` before `<span className={className}>`.
  const elementsOfVariable = new Map<Node, Set<Node>>();
  const elementsOf = (node: Node): Node[] => {
    const element = elementOf(node);
    if (element) return [element];
    const declaration = node.getFirstAncestor(Node.isVariableDeclaration);
    return declaration ? [...(elementsOfVariable.get(declaration) ?? [])] : [];
  };
  // Dev mode (dev.ts and dev/) is development tooling: its own UI's classes are no contract.
  const files = project
    .getSourceFiles()
    .filter(
      (file) =>
        !/^dev(?:\.ts$|[\\/])|[\\/](?:generated|icons)[\\/]/.test(
          relative(sourceDirectory, file.getFilePath()),
        ),
    );
  for (const file of files) {
    const path = repositoryPath(file.getFilePath());
    const anchors: (Node | undefined)[] = [];
    file.forEachDescendant((node) => {
      if (Node.isJsxAttribute(node)) {
        const name = node.getNameNode().getText();
        if (isClassName(name) && node.getInitializer()) {
          anchors.push(node.getInitializer());
          const element = node.getParent().getParent()!;
          for (const identifier of node.getInitializer()!.getDescendants())
            if (Node.isIdentifier(identifier))
              for (const declaration of identifier.getSymbol()?.getDeclarations() ?? [])
                if (Node.isVariableDeclaration(declaration))
                  elementsOfVariable.set(
                    declaration,
                    new Set([...(elementsOfVariable.get(declaration) ?? []), element]),
                  );
        } else if (name.startsWith('data-') && !isPrivateState(name)) {
          const element = node.getParent().getParent()!;
          const list = statesOnElement.get(element) ?? [];
          list.push({ attribute: name, values: attributeValues(node), path });
          statesOnElement.set(element, list);
        }
        if (name.startsWith('data-')) write(path, name, attributeValues(node));
      } else if (Node.isPropertyAssignment(node) && Node.isStringLiteral(node.getNameNode())) {
        // `{ 'data-variant': variant }`, props spread onto an element or passed to a component.
        const initializer = node.getInitializer();
        if (initializer)
          write(
            path,
            node.getNameNode().getText().slice(1, -1),
            literalValues(initializer.getType()),
          );
      } else if (Node.isBinaryExpression(node) && node.getOperatorToken().getText() === '=') {
        // `row.dataset.moving = mode`.
        const left = node.getLeft();
        if (
          Node.isPropertyAccessExpression(left) &&
          /\.dataset$/.test(left.getExpression().getText())
        )
          write(
            path,
            `data-${kebab(left.getName())}`,
            literalValues(node.getRight().getType()),
            writtenToDataset,
          );
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
    const seen = new Set<Node>();
    const add = (name: string, node: Node) => {
      const entry = classes.get(name) ?? { files: new Set<string>() };
      entry.files.add(path);
      classes.set(name, entry);
      for (const element of elementsOf(node)) {
        const set = classesOnElement.get(element) ?? new Set<string>();
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
        let text: string;
        let next: Node | undefined;
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
            next = (node.getParent() as TemplateExpression).getTemplateSpans()[0]?.getExpression();
          else {
            const span = node.getParent() as TemplateSpan;
            const spans = (span.getParent() as TemplateExpression).getTemplateSpans();
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
  const states: StateRecord[] = [];
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
        .filter((imported) => imported !== undefined)
        .map((imported) => repositoryPath(imported.getFilePath())),
    ]),
  );
  // The components each file imports as values, by their module: the names it imports, or every
  // export of the module for a namespace import, such as Bar's `import * as Menu`.
  const renders = new Map(
    files.map((file) => [
      repositoryPath(file.getFilePath()),
      file
        .getImportDeclarations()
        .filter(
          (declaration) => !declaration.isTypeOnly() && declaration.getModuleSpecifierSourceFile(),
        )
        .map((declaration) => ({
          source: repositoryPath(declaration.getModuleSpecifierSourceFile()!.getFilePath()),
          names: declaration
            .getNamedImports()
            .filter((specifier) => !specifier.isTypeOnly())
            .map((specifier) => specifier.getName()),
          namespace: declaration.getNamespaceImport() !== undefined,
        })),
    ]),
  );
  return { classes, states, imports, renders, warnings, written, writtenToDataset };
}

/** The values a JSX data attribute takes: its literal, or the string values of its type. */
function attributeValues(attribute: JsxAttribute): Set<string> | undefined {
  const initializer = attribute.getInitializer();
  // `<div data-open>` renders data-open="true".
  if (!initializer) return new Set(['true']);
  if (Node.isStringLiteral(initializer)) return new Set([initializer.getLiteralText()]);
  const expression = Node.isJsxExpression(initializer) ? initializer.getExpression() : undefined;
  return expression ? literalValues(expression.getType()) : undefined;
}

/** Splits a selector list or a selector at `separators` outside brackets, parentheses and strings. */
function splitTopLevel(text: string, separators: RegExp) {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
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
  const states: StateRecord[] = [];
  const files = readdirSync(stylesDirectory).filter((name) => name.endsWith('.css'));
  const visit = (selector: string, path: string) => {
    const inner: string[] = [];
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
        if (isPrivateState(match[1])) continue;
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

/**
 * The color properties the style sheets register, as the public color properties are: each
 * `@property` that doesn't inherit, with the file that registers it.
 */
function readColorProperties() {
  const properties = new Map();
  for (const name of readdirSync(stylesDirectory).filter((file) => file.endsWith('.css'))) {
    const css = readFileSync(resolve(stylesDirectory, name), 'utf8').replace(
      /\/\*[\s\S]*?\*\//g,
      '',
    );
    for (const match of css.matchAll(/@property\s+(--env-[a-z\d-]+)\s*\{([^}]*)\}/g))
      if (/inherits\s*:\s*false/.test(match[2]))
        properties.set(match[1], repositoryPath(resolve(stylesDirectory, name)));
  }
  return properties;
}

/** packages/ui/src/parts.json: the hand-written part of the contract. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- hand-written JSON, checked as buildParts reads it
export type PartsSource = Record<string, any>;

/** The hand-written part of the contract. */
export function readPartsSource(file = partsSourceFile): PartsSource {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** The part contract, from the library's source, its style sheets and packages/ui/src/parts.json. */
export function buildParts({
  source = readPartsSource(),
  props = JSON.parse(readFileSync(propsFile, 'utf8')),
}: { source?: PartsSource; props?: PropsFile } = {}) {
  const {
    classes,
    states: sourceStates,
    imports,
    renders,
    warnings,
    written,
    writtenToDataset,
  } = readSource();
  const styleStates = readStyles();
  const problems = [...warnings];

  // The groups: every exported component and namespace, and the shared anatomy.
  const groups = new Map<
    string,
    { name: string; prefix: string; source?: string; root?: string | null; shared: boolean }
  >();
  for (const [name, entry] of Object.entries(props.exports)) {
    if (name.includes('.') || !['component', 'namespace'].includes(entry.kind)) continue;
    // A component's classes take its name, unless `prefixes` gives it another, as ToastProvider's
    // notifications are env-toast.
    const prefix = source.prefixes?.[name] ?? `env-${kebab(name)}`;
    groups.set(name, { name, prefix, source: entry.source, shared: false });
  }
  for (const [name, entry] of Object.entries<{ prefix: string; root?: string }>(
    source.shared ?? {},
  ))
    groups.set(name, { name, prefix: entry.prefix, root: entry.root ?? null, shared: true });
  const byPrefix = [...groups.values()].sort((a, b) => b.prefix.length - a.prefix.length);
  const groupOf = (name: string): string | undefined =>
    source.placed?.[name] ??
    byPrefix.find((group) => name === group.prefix || name.startsWith(`${group.prefix}-`))?.name;

  const members = new Map<string, string[]>();
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
  const groupStates = new Map<
    string,
    Map<string, { values: Set<string>; free: boolean; parts: Set<string> }>
  >();
  for (const state of [...sourceStates, ...styleStates]) {
    for (const name of state.classes ?? []) {
      if (!classes.has(name)) continue;
      const group = groupOf(name)!;
      const byAttribute =
        groupStates.get(group) ??
        new Map<string, { values: Set<string>; free: boolean; parts: Set<string> }>();
      const entry = byAttribute.get(state.attribute) ?? {
        values: new Set<string>(),
        free: false,
        parts: new Set<string>(),
      };
      if (state.values === undefined) entry.free = true;
      else for (const value of state.values) entry.values.add(value);
      entry.parts.add(name);
      byAttribute.set(state.attribute, entry);
      groupStates.set(group, byAttribute);
    }
  }

  // Which groups each group's files render: its own files and the internal modules they import.
  const filesOf = new Map<string, Set<string>>();
  for (const [name, list] of members)
    for (const className of list)
      for (const file of classes.get(className)!.files)
        filesOf.set(file, new Set([...(filesOf.get(file) ?? []), name]));
  const componentSources = new Set(
    [...groups.values()].map((group) => group.source).filter(Boolean),
  );
  // The groups whose parts each component module renders, by the module.
  const groupsBySource = new Map<string, string[]>();
  for (const group of groups.values())
    if (group.source && (members.get(group.name)?.length ?? 0) > 0)
      groupsBySource.set(group.source, [...(groupsBySource.get(group.source) ?? []), group.name]);
  const reachable = (start: string) => {
    const found = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const file = queue.shift()!;
      for (const next of imports.get(file) ?? [])
        if (!found.has(next) && !componentSources.has(next)) {
          found.add(next);
          queue.push(next);
        }
    }
    return found;
  };

  // A state's values, completed from what the group's code writes: its own module and the modules
  // its classes occur in, which set its attributes on its parts, and, through an element's dataset,
  // the internal modules it imports, such as List's reordering. An internal module that renders
  // several components' elements, such as the one under Button and Link, writes values that may be
  // another's, so it counts only where the group's classes occur in it.
  for (const group of groups.values()) {
    const states = groupStates.get(group.name);
    if (!states) continue;
    const own = new Set([
      ...(group.source ? [group.source] : []),
      ...(members.get(group.name) ?? []).flatMap((name) => [...classes.get(name)!.files]),
    ]);
    const imported = group.source ? reachable(group.source) : own;
    for (const [attribute, entry] of states) {
      if (entry.free) continue;
      const found = [
        ...[...own].map((file) => written.get(file)?.get(attribute)),
        ...[...imported].map((file) => writtenToDataset.get(file)?.get(attribute)),
      ];
      for (const values of found) if (values) for (const value of values) entry.values.add(value);
    }
  }

  // The public custom properties that are neither tokens nor color properties: knobs an
  // application sets, such as a popup's opacity, or values it reads, such as Scaffold's sticky top.
  const properties = source.properties ?? {};
  const styleText = readdirSync(stylesDirectory)
    .filter((name) => name.endsWith('.css'))
    .map((name) => readFileSync(resolve(stylesDirectory, name), 'utf8'))
    .join('\n');
  for (const [group, list] of Object.entries<Record<string, { use: string; description: string }>>(
    properties,
  ))
    for (const [property, { use, description }] of Object.entries(list)) {
      if (!new RegExp(`${property}(?![\\w-])`).test(styleText))
        problems.push(`${group}: its property ${property} is in none of the style sheets`);
      if (use !== 'set' && use !== 'read')
        problems.push(
          `${group}: ${property} needs a use, set or read, in packages/ui/src/parts.json`,
        );
      if (typeof description !== 'string' || !description.trim())
        problems.push(`${group}: ${property} has no description in packages/ui/src/parts.json`);
    }
  const descriptions = source.descriptions ?? {};
  const colors = source.colors ?? {};
  const registered = readColorProperties();
  const listedColors = new Set<string>();
  for (const [group, list] of Object.entries<Record<string, string>>(colors))
    for (const [property, description] of Object.entries(list)) {
      listedColors.add(property);
      if (!registered.has(property))
        problems.push(
          `${group}: its color property ${property} is not registered in the style sheets as a property that doesn't inherit`,
        );
      if (typeof description !== 'string' || !description.trim())
        problems.push(`${group}: ${property} has no description in packages/ui/src/parts.json`);
    }
  for (const property of registered.keys())
    if (!listedColors.has(property))
      problems.push(
        `${property}, registered in ${registered.get(property)}, is listed under no component's colors in packages/ui/src/parts.json`,
      );
  const output: Pick<PartsContract, 'components' | 'shared'> = { components: {}, shared: {} };
  const usedBy = new Map<string, Set<string>>();
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
    const uses = new Set<string>();
    if (group.source)
      for (const file of reachable(group.source)) {
        for (const other of filesOf.get(file) ?? [])
          if (groups.get(other)!.source !== group.source) uses.add(other);
        // The components its files import and render, such as Bar's Menu and Badge.
        for (const { source: next, names, namespace } of renders.get(file) ?? [])
          if (next !== group.source)
            for (const other of groupsBySource.get(next) ?? [])
              if (namespace || names.includes(other)) uses.add(other);
      }
    for (const name of uses) usedBy.set(name, new Set([...(usedBy.get(name) ?? []), group.name]));
    const entry: PartsEntry = {
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
      ...(colors[group.name] && {
        colors: Object.entries<string>(colors[group.name]).map(([property, description]) => ({
          property,
          description,
        })),
      }),
      ...(properties[group.name] && {
        properties: Object.entries<{ use: 'set' | 'read'; description: string }>(
          properties[group.name],
        ).map(([property, { use, description }]) => ({ property, use, description })),
      }),
    };
    (group.shared ? output.shared : output.components)[group.name] = entry;
  }
  for (const [name, entry] of Object.entries(output.shared))
    entry.usedBy = [...(usedBy.get(name) ?? [])].sort(byText);
  for (const name of Object.keys(properties))
    if (!(name in output.components) && !(name in output.shared))
      problems.push(
        `packages/ui/src/parts.json lists properties of ${name}, which is no component`,
      );
  for (const name of Object.keys(colors))
    if (!(name in output.components))
      problems.push(`packages/ui/src/parts.json lists colors of ${name}, which is no component`);
  for (const name of Object.keys(descriptions))
    if (!(name in output.components) && !(name in output.shared))
      problems.push(`packages/ui/src/parts.json describes ${name}, which has no parts`);

  return {
    parts: {
      $comment:
        'Generated by scripts/docs/GenerateParts.ts from packages/ui/src and the descriptions in packages/ui/src/parts.json; do not edit. Part classes, state attributes and color properties are public and versioned. In a state, values lists what the attribute takes; "" is an attribute set without a value, and an empty list one that takes any value or is selected by its presence alone. colors lists the custom properties that set a component’s colors on one instance, through style or CSS; they don’t inherit.',
      schemaVersion: partsSchemaVersion,
      ...output,
    },
    problems,
  };
}

export function serializeParts(parts: PartsContract) {
  return `${JSON.stringify(parts, null, 2)}\n`;
}

export function readParts(file = partsFile): PartsContract {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/**
 * Every part class, state attribute value and color property of a contract, as `Group: name`
 * labels, with the class, attribute or property each names, the value of a state value, and the
 * parts that carry a state.
 */
function contractNames(parts: PartsContract | undefined) {
  const names = new Map<string, ContractItem>();
  for (const kind of ['components', 'shared'] as const)
    for (const [group, entry] of Object.entries(parts?.[kind] ?? {})) {
      for (const part of entry.parts)
        names.set(`${group}: .${part.class}`, { name: part.class, part: part.class });
      for (const { property } of [...(entry.colors ?? []), ...(entry.properties ?? [])])
        names.set(`${group}: ${property}`, { name: property, color: property });
      for (const state of entry.states) {
        const carried = { name: state.attribute, attribute: state.attribute, parts: state.parts };
        names.set(`${group}: [${state.attribute}]`, carried);
        for (const value of state.values)
          names.set(`${group}: [${state.attribute}='${value}']`, { ...carried, value });
      }
    }
  return names;
}

/**
 * Each class of a contract, the values each class's state attributes take (null: any) and its color
 * properties.
 */
function contractClasses(parts: PartsContract | undefined) {
  const classes = new Set<string>();
  /** Each part's state attribute and the values it takes, null for any. */
  const states = new Map<string, Set<string> | null>();
  const colors = new Set<string>();
  for (const kind of ['components', 'shared'] as const)
    for (const entry of Object.values(parts?.[kind] ?? {})) {
      for (const part of entry.parts) classes.add(part.class);
      for (const { property } of [...(entry.colors ?? []), ...(entry.properties ?? [])])
        colors.add(property);
      for (const state of entry.states)
        for (const part of state.parts ?? []) {
          const key = `${part} ${state.attribute}`;
          const known = states.get(key);
          states.set(
            key,
            known === null || !state.values.length
              ? null
              : new Set([...(known ?? []), ...state.values]),
          );
        }
    }
  return { classes, states, colors };
}

/** Whether a changeset's front matter makes it a major change of @envsemble/envui. */
const isMajor = (changeset: string) =>
  /^---\r?\n[\s\S]*?^\s*['"]?@envsemble\/envui['"]?\s*:\s*major\s*$[\s\S]*?^---/m.test(changeset);
/** Whether a text names a name whole, so a changeset about env-card-header doesn't name env-card. */
const names = (text: string, name: string) =>
  new RegExp(String.raw`(?<![\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\w-])`).test(
    text,
  );

/**
 * What a contract lost against an older one: each part, state attribute or value, or color property
 * that is gone, with whether a major changeset of @envsemble/envui names it: the class; the
 * attribute; the property; or, for a value, the attribute and the value. A part that moved to another group, or a state value whose
 * attribute now takes any value, is not gone. Pure, for the tests; `changesets` is the text of each
 * pending changeset.
 */
export function removedParts(
  before: PartsContract | undefined,
  after: PartsContract,
  changesets: string | string[] = [],
) {
  const now = contractNames(after);
  const kept = contractClasses(after);
  const major = (Array.isArray(changesets) ? changesets : [changesets]).filter(isMajor);
  /** Whether a part, attribute or value is still there, in this group or another. */
  const stays = (item: ContractItem) => {
    if (item.part) return kept.classes.has(item.part);
    if (item.color) return kept.colors.has(item.color);
    return (item.parts ?? []).some((part) => {
      const values = kept.states.get(`${part} ${item.attribute}`);
      if (values === undefined) return false;
      return item.value === undefined || values === null || values.has(item.value);
    });
  };
  const removed: { label: string; name: string; recorded: boolean }[] = [];
  for (const [label, item] of contractNames(before))
    if (!now.has(label) && !stays(item))
      removed.push({
        label,
        name: item.name,
        recorded: major.some(
          (text) =>
            names(text, item.name) &&
            // A value takes its attribute and the value; "" is the attribute set without one.
            (item.value === undefined || item.value === '' || names(text, item.value)),
        ),
      });
  return removed;
}

function git(args: string[]) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/**
 * The contract at the merge-base with the integration branch, from the first of the check tiers'
 * bases whose merge-base has it, and what each base skipped lacked.
 */
function baseParts(base: string | undefined): {
  ref: string | undefined;
  parts: PartsContract | undefined;
  skipped: string[];
} {
  const skipped: string[] = [];
  for (const ref of baseCandidates(base)) {
    let mergeBase: string;
    try {
      mergeBase = git(['merge-base', 'HEAD', ref]).trim();
    } catch {
      skipped.push(`${ref} does not exist here`);
      continue;
    }
    try {
      return { ref, parts: JSON.parse(git(['show', `${mergeBase}:${partsPath}`])), skipped };
    } catch {
      skipped.push(`${ref} has no ${partsPath} at the merge-base ${mergeBase.slice(0, 10)}`);
    }
  }
  return { ref: undefined, parts: undefined, skipped };
}

/** The pending changesets' text, one per changeset, of which a major one must name a removal. */
function pendingChangesets() {
  if (!existsSync(changesetDirectory)) return [];
  return readdirSync(changesetDirectory)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => readFileSync(resolve(changesetDirectory, name), 'utf8'));
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
    const option = process.argv.indexOf('--base');
    const base = baseParts(option === -1 ? undefined : process.argv[option + 1]);
    if (!base.parts) {
      console.log(`${partsPath} matches its sources.`);
      console.warn(
        `[33mwarning: no part or state removal was checked: ${base.skipped.join('; ')}. Fetch the integration branch, or pass --base <ref> or set ENVUI_BASE.[0m`,
      );
    } else {
      if (base.skipped.length)
        console.log(`Compared with ${base.ref}: ${base.skipped.join('; ')}.`);
      const removed = removedParts(base.parts, parts, pendingChangesets());
      const unrecorded = removed.filter((item) => !item.recorded);
      if (removed.length)
        console.log(
          `Gone since ${base.ref}:\n${removed.map((item) => `  ${item.label}${item.recorded ? ' (in a major changeset)' : ''}`).join('\n')}`,
        );
      if (unrecorded.length) {
        console.error(
          `Part classes, state attributes and color properties are public: one that goes is a breaking change. Name each one above that no major changeset of @envsemble/envui names (a value with its attribute) in such a changeset, with what replaces it.`,
        );
        process.exit(1);
      }
      console.log(
        `${partsPath} matches its sources, and every part or state gone since ${base.ref} is in a major changeset.`,
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
