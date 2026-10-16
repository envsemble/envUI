// v1-props: moves the props of envUI 0.x components to 1.0, as the rename map's `props` section
// lists them.
//
// - A prop whose literal value the map lists is replaced by the props that value maps to, in its
//   place among the element's attributes, so spreads keep their order around it. A replacement prop
//   the element already sets is left as the element sets it.
// - A value the map doesn't list, such as an expression, stays as it is and is reported, and so is
//   every use whose entry carries a report.
// Elements are matched by their import from @envsemble/envui, under their 0.x or their 1.0 name,
// including namespace parts such as `<Menu.Root>` and `import * as ui` accesses such as
// `<ui.Table.Root>`. Run it after v1-names, or before: both names are recognised.
import { loadMap } from '../map.mjs';
import { createReporter, keepByteOrderMark, parserFor, printOptions } from '../shared.mjs';

export const parser = 'tsx';

/** The name a JSX element's name spells: `TextField`, `Menu.Root` or `ui.Table.Root`. */
function jsxPath(name) {
  if (name.type === 'JSXIdentifier') return [name.name];
  if (name.type === 'JSXMemberExpression') {
    const object = jsxPath(name.object);
    return object && [...object, name.property.name];
  }
  return null;
}

/**
 * The literal value of an attribute, as the map's keys write it: `true` for a bare attribute or
 * `{true}`, `false` for `{false}`, a string for `"sm"`, `{'sm'}` or `` {`sm`} ``, and undefined
 * for anything else, such as an expression.
 */
function literalKey(value) {
  if (value == null) return 'true';
  const node = value.type === 'JSXExpressionContainer' ? value.expression : value;
  if (node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'))
    return node.value;
  if (
    node.type === 'BooleanLiteral' ||
    (node.type === 'Literal' && typeof node.value === 'boolean')
  )
    return String(node.value);
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  return undefined;
}

export default function transform(file, api, options = {}) {
  const { entries } = loadMap(options.map);
  if (![...entries.keys()].some((entry) => file.source.includes(entry))) return undefined;

  const j = api.jscodeshift.withParser(parserFor(file.path));
  const root = j(file.source);
  const reporter = createReporter(api);

  // Local names of the components imported from an entry point, with the 1.0 name each stands
  // for, and the namespace imports of the entry points.
  const components = new Map();
  const namespaceImports = new Map();
  root
    .find(j.ImportDeclaration)
    .filter((path) => entries.has(path.node.source.value))
    .forEach((path) => {
      const entry = entries.get(path.node.source.value);
      for (const specifier of path.node.specifiers ?? []) {
        if (specifier.type === 'ImportNamespaceSpecifier')
          namespaceImports.set(specifier.local.name, entry);
        else if (specifier.type === 'ImportSpecifier')
          components.set(specifier.local.name, { entry, imported: specifier.imported.name });
      }
    });
  if (components.size === 0 && namespaceImports.size === 0) return undefined;

  /**
   * The 1.0 name of an export and the parts accessed on it: `Input` is TextField, and `Menu` is
   * Menu.Root alone but the Menu namespace in `Menu.Item`, which is already 1.0 code.
   */
  const nameOf = (entry, imported, parts) => {
    const target = entry.renames.get(imported)?.to ?? imported;
    if (parts.length > 0 && target.startsWith(`${imported}.`))
      return [imported, ...parts].join('.');
    return [target, ...parts].join('.');
  };

  /** The entry and 1.0 component name of an element, or null for any other element. */
  function componentOf(path) {
    const names = jsxPath(path.node.name);
    if (!names) return null;
    const [first, ...rest] = names;
    // A local of the same name in an inner scope is another component.
    const scope = path.scope?.lookup(first);
    if (scope && !scope.isGlobal) return null;
    if (namespaceImports.has(first) && rest.length > 0) {
      const entry = namespaceImports.get(first);
      const [exported, ...parts] = rest;
      return { entry, name: nameOf(entry, exported, parts) };
    }
    const component = components.get(first);
    return component
      ? { entry: component.entry, name: nameOf(component.entry, component.imported, rest) }
      : null;
  }

  const attribute = (name, value) => {
    if (value === true) return j.jsxAttribute(j.jsxIdentifier(name));
    if (typeof value === 'string')
      return j.jsxAttribute(j.jsxIdentifier(name), j.stringLiteral(value));
    const expression =
      typeof value === 'number' ? j.numericLiteral(value) : j.booleanLiteral(value);
    return j.jsxAttribute(j.jsxIdentifier(name), j.jsxExpressionContainer(expression));
  };

  let changed = false;
  root.find(j.JSXOpeningElement).forEach((path) => {
    const component = componentOf(path);
    const rules = component && component.entry.props.get(component.name);
    if (!rules) return;
    const attributes = path.node.attributes;
    const own = (name) =>
      attributes.some((each) => each.type === 'JSXAttribute' && each.name.name === name);
    for (let index = 0; index < attributes.length; index += 1) {
      const node = attributes[index];
      if (node.type !== 'JSXAttribute' || node.name.type !== 'JSXIdentifier') continue;
      const rule = rules.get(node.name.name);
      if (!rule) continue;
      const where = `${component.name}'s ${node.name.name}`;
      const key = literalKey(node.value);
      const replacement = key === undefined ? undefined : rule.values[key];
      if (!replacement) {
        reporter.warn(
          node,
          `${where} has a value the codemod can't move: ${rule.report ?? 'change it by hand.'}`,
        );
        continue;
      }
      // Remove the old attribute first, so a replacement of the same name, such as density, is
      // written rather than counted as already set.
      attributes.splice(index, 1);
      const added = Object.entries(replacement.props ?? {})
        .filter(([name]) => !own(name))
        .map(([name, value]) => attribute(name, value));
      attributes.splice(index, 0, ...added);
      index += added.length - 1;
      changed = true;
      const report = replacement.report ?? (replacement.reportAlways ? rule.report : undefined);
      if (report) reporter.warn(node, `${where}: ${report}`);
    }
  });

  reporter.flush();
  if (!changed) return undefined;
  // The only strings the transform writes are JSX attributes, which take double quotes.
  return keepByteOrderMark(file.source, root.toSource(printOptions(file.source, 'double')));
}
