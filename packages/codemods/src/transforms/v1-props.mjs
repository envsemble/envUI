// v1-props: moves the props of envUI 0.x components to 1.0, as the rename map's `props` section
// lists them, and the properties of the objects some calls take, as its `calls` section does.
//
// - A prop whose literal value the map lists is replaced by the props that value maps to, in its
//   place among the element's attributes, so spreads keep their order around it. A replacement prop
//   the element already sets is left as the element sets it.
// - A prop with `to` takes its new name whatever its value: `<Text tone="muted">` becomes
//   `<Text emphasis="muted">`, and a listed literal its replacement, as above.
// - A conditional whose values are literals, such as `tone={failed ? 'error' : 'info'}`, has each
//   literal mapped, where each maps to one prop of the same name (see mapConditional).
// - A value the map doesn't list, such as another expression, stays as it is and is reported, and
//   so is every use whose entry carries a report.
// - A call the `calls` section lists, such as `useToast().show({ variant: 'error' })`, has the
//   properties of its object literal moved by the same rules. The call is found through the
//   function's import: `useToast().show(…)`, `const toast = useToast(); toast.show(…)` and
//   `const { show } = useToast(); show(…)`. An argument that is not an object literal is reported.
// Elements are matched by their import from @envsemble/envui, under their 0.x or their 1.0 name,
// including namespace parts such as `<Menu.Root>` and `import * as ui` accesses such as
// `<ui.Table.Root>`. Run it after v1-names, or before: both names are recognised.
import { loadMap } from '../map.mjs';
import {
  applyPropRules,
  componentResolver,
  envuiImports,
  expressionKey,
  jsxAttribute,
  literalExpression,
  literalKey,
} from '../elements.mjs';
import { createReporter, keepByteOrderMark, parserFor, printOptions } from '../shared.mjs';

export const parser = 'tsx';

/** The name of an object property with a plain key, or undefined. */
function propertyName(node) {
  if (node.type !== 'ObjectProperty' && node.type !== 'Property') return undefined;
  if (node.computed) return undefined;
  if (node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'StringLiteral' || node.key.type === 'Literal')
    return String(node.key.value);
  return undefined;
}

export default function transform(file, api, options = {}) {
  const { entries } = loadMap(options.map);
  if (![...entries.keys()].some((entry) => file.source.includes(entry))) return undefined;

  const j = api.jscodeshift.withParser(parserFor(file.path));
  const root = j(file.source);
  const reporter = createReporter(api);

  const imports = envuiImports(j, root, entries);
  if (imports.components.size === 0 && imports.namespaceImports.size === 0) return undefined;
  const componentOf = componentResolver(imports);

  /**
   * A literal for a value, in the quotes of the literal it replaces, whatever the file's JSX
   * takes, or `undefined` for none: recast prints a Literal from its raw text, and a StringLiteral
   * in the file's quotes.
   */
  const literalLike = (value, old) => {
    if (value === undefined) return j.identifier('undefined');
    const raw = old?.extra?.raw;
    if (typeof value === 'string' && typeof raw === 'string' && /^['"]/.test(raw)) {
      const quote = raw[0];
      const escaped = value.replaceAll('\\', '\\\\').replaceAll(quote, `\\${quote}`);
      const literal = j.literal(value);
      literal.extra = { rawValue: value, raw: `${quote}${escaped}${quote}` };
      return literal;
    }
    return literalExpression(j, value);
  };

  let changed = false;
  let changedAttributes = false;
  const attributes = {
    name: (node) =>
      node.type === 'JSXAttribute' && node.name.type === 'JSXIdentifier'
        ? node.name.name
        : undefined,
    key: (node) => literalKey(node.value),
    make: (name, value) => jsxAttribute(j, name, value),
    rename: (node, name) => {
      node.name = j.jsxIdentifier(name);
    },
    expression: (node) =>
      node.value?.type === 'JSXExpressionContainer' ? node.value.expression : undefined,
    literal: literalLike,
  };
  root.find(j.JSXOpeningElement).forEach((path) => {
    const component = componentOf(path);
    const rules = component && component.entry.props.get(component.name);
    if (!rules) return;
    if (
      applyPropRules(path.node.attributes, rules, component.name, attributes, (node, message) =>
        reporter.warn(node, message),
      )
    ) {
      changed = true;
      changedAttributes = true;
    }
  });

  const properties = {
    name: propertyName,
    key: (node) => expressionKey(node.value),
    // A string keeps the quotes of the property it replaces.
    make: (name, value, old) =>
      j.objectProperty(j.identifier(name), literalLike(value, old?.value)),
    rename: (node, name) => {
      node.key = j.identifier(name);
      node.shorthand = false;
    },
    expression: (node) => node.value,
    literal: literalLike,
  };
  for (const entry of entries.values()) {
    for (const [call, { callee, method, rules }] of entry.calls) {
      // The local names of the function: imported by name, or read from a namespace import.
      const locals = new Set(
        [...imports.components]
          .filter(([, each]) => each.entry === entry && each.imported === callee)
          .map(([local]) => local),
      );
      const namespaces = new Set(
        [...imports.namespaceImports].filter(([, each]) => each === entry).map(([local]) => local),
      );
      if (locals.size === 0 && namespaces.size === 0) continue;
      /** Whether an expression calls the function: `useToast()` or `ui.useToast()`. */
      const callsFunction = (node) =>
        node?.type === 'CallExpression' &&
        ((node.callee.type === 'Identifier' && locals.has(node.callee.name)) ||
          (node.callee.type === 'MemberExpression' &&
            !node.callee.computed &&
            node.callee.object.type === 'Identifier' &&
            namespaces.has(node.callee.object.name) &&
            node.callee.property.name === callee));
      const targets = [];
      if (method === undefined) {
        root
          .find(j.CallExpression)
          .filter((path) => callsFunction(path.node))
          .forEach((path) => targets.push(path));
      } else {
        // Variables that hold what the hook returns, and the method destructured from it.
        const holders = new Set();
        const methods = new Set();
        root
          .find(j.VariableDeclarator)
          .filter((path) => callsFunction(path.node.init))
          .forEach((path) => {
            const { id } = path.node;
            if (id.type === 'Identifier') holders.add(id.name);
            else if (id.type === 'ObjectPattern')
              for (const property of id.properties)
                if (propertyName(property) === method && property.value.type === 'Identifier')
                  methods.add(property.value.name);
          });
        root.find(j.CallExpression).forEach((path) => {
          const target = path.node.callee;
          if (target.type === 'Identifier' && methods.has(target.name)) targets.push(path);
          else if (
            target.type === 'MemberExpression' &&
            !target.computed &&
            target.property.name === method &&
            (callsFunction(target.object) ||
              (target.object.type === 'Identifier' && holders.has(target.object.name)))
          )
            targets.push(path);
        });
      }
      for (const path of targets) {
        const [argument] = path.node.arguments;
        if (argument?.type !== 'ObjectExpression') {
          if (argument)
            reporter.warn(
              argument,
              `${call} takes an object the codemod can't read: ${[...rules.values()].map((rule) => rule.report).join(' ')}`,
            );
          continue;
        }
        if (
          applyPropRules(argument.properties, rules, call, properties, (node, message) =>
            reporter.warn(node, message),
          )
        )
          changed = true;
      }
    }
  }

  reporter.flush();
  if (!changed) return undefined;
  // JSX attributes take double quotes; where only objects changed, strings follow the quotes of
  // the file's envUI imports.
  const importQuote = root
    .find(j.ImportDeclaration)
    .filter((path) => entries.has(path.node.source.value))
    .paths()[0]
    ?.node.source.extra?.raw?.startsWith("'");
  const quote = changedAttributes || !importQuote ? 'double' : 'single';
  return keepByteOrderMark(file.source, root.toSource(printOptions(file.source, quote)));
}
