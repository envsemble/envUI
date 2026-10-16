// Helpers for the transforms that rewrite JSX elements of envUI components (v1-props, v1-render
// and v1-structure): which elements are envUI's, the literal value of an attribute, and attributes
// written anew.

/** The name a JSX element's name spells: `TextField`, `Menu.Root` or `ui.Table.Root`. */
export function jsxPath(name) {
  if (name.type === 'JSXIdentifier') return [name.name];
  if (name.type === 'JSXMemberExpression') {
    const object = jsxPath(name.object);
    return object && [...object, name.property.name];
  }
  return null;
}

/**
 * The literal value of an attribute, as the map's keys write it: `true` for a bare attribute or
 * `{true}`, `false` for `{false}`, a string for `"sm"`, `{'sm'}` or `` {`sm`} ``, a number's text
 * for `{2}`, and undefined for anything else, such as an expression.
 */
export function literalKey(value) {
  if (value == null) return 'true';
  const node = value.type === 'JSXExpressionContainer' ? value.expression : value;
  return expressionKey(node);
}

/** The literal value of an expression, as literalKey gives it, or undefined. */
export function expressionKey(node) {
  if (!node) return undefined;
  if (node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'))
    return node.value;
  if (
    node.type === 'BooleanLiteral' ||
    (node.type === 'Literal' && typeof node.value === 'boolean')
  )
    return String(node.value);
  if (node.type === 'NumericLiteral' || (node.type === 'Literal' && typeof node.value === 'number'))
    return String(node.value);
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  return undefined;
}

/** A JSX attribute with a literal: bare for true, a string in quotes, else in braces. */
export function jsxAttribute(j, name, value) {
  if (value === true) return j.jsxAttribute(j.jsxIdentifier(name));
  if (typeof value === 'string')
    return j.jsxAttribute(j.jsxIdentifier(name), j.stringLiteral(value));
  const expression = typeof value === 'number' ? j.numericLiteral(value) : j.booleanLiteral(value);
  return j.jsxAttribute(j.jsxIdentifier(name), j.jsxExpressionContainer(expression));
}

/** A literal expression for an object property's value. */
export function literalExpression(j, value) {
  if (typeof value === 'string') return j.stringLiteral(value);
  if (typeof value === 'number') return j.numericLiteral(value);
  return j.booleanLiteral(value);
}

/**
 * The envUI imports of a file: `components`, each local name with its entry and the name it
 * imports, and `namespaceImports`, each `import * as ui` name with its entry.
 */
export function envuiImports(j, root, entries) {
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
          components.set(specifier.local.name, {
            entry,
            imported: specifier.imported.name,
            declaration: path,
          });
      }
    });
  return { components, namespaceImports };
}

/**
 * A function from a JSX element's path to its entry and 1.0 component name, or null for an element
 * that is not envUI's. Elements are matched under their 0.x or 1.0 names, as namespace parts
 * (`<Menu.Root>`) and through a namespace import (`<ui.Table.Root>`). A local of the same name in
 * an inner scope is another component.
 */
export function componentResolver({ components, namespaceImports }) {
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
  return (path) => {
    const names = jsxPath(path.node.name);
    if (!names) return null;
    const [first, ...rest] = names;
    const scope = path.scope?.lookup(first);
    if (scope && !scope.isGlobal) return null;
    if (namespaceImports.has(first) && rest.length > 0) {
      const entry = namespaceImports.get(first);
      const [exported, ...parts] = rest;
      return { entry, name: nameOf(entry, exported, parts), namespace: first, local: null };
    }
    const component = components.get(first);
    return component
      ? {
          entry: component.entry,
          name: nameOf(component.entry, component.imported, rest),
          namespace: null,
          local: first,
        }
      : null;
  };
}

/**
 * Applies prop rules (the map's `props` rules of one component, or the `calls` rules of one call)
 * to a list of named items, such as a JSX element's attributes or an object's properties, in
 * place. `item` describes the list: `name(node)` the item's name or undefined, `key(node)` its
 * literal value or undefined, `make(name, value)` a new item, `rename(node, name)` renames it.
 * Returns whether anything changed; `report(node, message)` receives what can't move.
 */
export function applyPropRules(items, rules, where, item, report) {
  let changed = false;
  const own = (name) => items.some((each) => item.name(each) === name);
  for (let index = 0; index < items.length; index += 1) {
    const node = items[index];
    const name = item.name(node);
    if (name === undefined) continue;
    const rule = rules.get(name);
    if (!rule) continue;
    const at = `${where}'s ${name}`;
    const key = item.key(node);
    // A 1.0 value, such as density="sm" on a Table, is already moved: no change, no report.
    if (key !== undefined && rule.current.has(key)) continue;
    const replacement = key === undefined ? undefined : rule.values[key];
    if (!replacement) {
      if (rule.to !== undefined) {
        // A renamed prop keeps a value that doesn't change, and an expression, under its new name.
        if (own(rule.to)) {
          report(
            node,
            `${at} is ${rule.to} in 1.0, which the element already sets: ${rule.report}`,
          );
          continue;
        }
        item.rename(node, rule.to);
        changed = true;
        if (key === undefined && Object.keys(rule.values).length > 0)
          report(
            node,
            `${at} is ${rule.to} now, with a value the codemod can't check: ${rule.report}`,
          );
        continue;
      }
      report(
        node,
        `${at} has a value the codemod can't move: ${rule.report ?? 'change it by hand.'}`,
      );
      continue;
    }
    // Remove the old item first, so a replacement of the same name, such as density, is written
    // rather than counted as already set.
    items.splice(index, 1);
    const added = Object.entries(replacement.props ?? {})
      .filter(([newName]) => !own(newName))
      .map(([newName, value]) => item.make(newName, value, node));
    items.splice(index, 0, ...added);
    index += added.length - 1;
    changed = true;
    const message = replacement.report ?? (replacement.reportAlways ? rule.report : undefined);
    if (message) report(node, `${at}: ${message}`);
  }
  return changed;
}
