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
 * for `{2}`, `null` for `{null}`, and undefined for anything else, such as an expression.
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
  if (node.type === 'NullLiteral' || (node.type === 'Literal' && node.value === null))
    return 'null';
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  return undefined;
}

/** An expression that leaves a prop unset: `undefined` or `null`. */
const unset = (node) =>
  node?.type === 'NullLiteral' ||
  (node?.type === 'Literal' && node.value === null) ||
  (node?.type === 'Identifier' && node.name === 'undefined');

/**
 * The values a conditional or logical expression can give, for a prop whose value is one, such as
 * `tone={failed ? 'error' : 'info'}` or `size={large && 'large'}`: `literals`, the literal values
 * among them, each as `{ node, parent, key }` so it can be replaced; `unset`, the `undefined` and
 * `null` among them; `opaque`, the other expressions, whose values the codemod can't see; and
 * `ternary`, whether only ternaries give them. A ternary gives its branches, nested ones included,
 * `a && b` gives `b` (`a` is a test, whose falsy value leaves the prop unset or invalid), and
 * `a || b` and `a ?? b` give both. Parentheses are followed. Returns undefined for an expression
 * that is neither a conditional nor a logical one.
 */
export function conditionalValues(expression) {
  let top = expression;
  while (top?.type === 'ParenthesizedExpression') top = top.expression;
  if (top?.type !== 'ConditionalExpression' && top?.type !== 'LogicalExpression') return undefined;
  const values = { literals: [], unset: [], opaque: [], ternary: true };
  const visit = (parent, key) => {
    let node = parent[key];
    while (node?.type === 'ParenthesizedExpression') {
      parent = node;
      key = 'expression';
      node = node.expression;
    }
    if (node.type === 'ConditionalExpression') {
      visit(node, 'consequent');
      visit(node, 'alternate');
    } else if (node.type === 'LogicalExpression') {
      values.ternary = false;
      if (node.operator !== '&&') visit(node, 'left');
      visit(node, 'right');
    } else if (unset(node)) values.unset.push(node);
    else if (expressionKey(node) !== undefined) values.literals.push({ node, parent, key });
    else values.opaque.push(node);
  };
  visit({ top }, 'top');
  return values;
}

/**
 * Whether a structure case's `when` matches a JSX element's attributes: true, false, or undefined
 * where a prop it tests is an expression. Per prop, `when` lists literal values, null for a prop the
 * element doesn't set; `[null]` alone doesn't match an element that sets the prop, whatever its value.
 */
export function matchesWhen(attributes, when) {
  for (const [prop, values] of Object.entries(when ?? {})) {
    if (prop.startsWith('$')) continue;
    const attribute = attributes.find(
      (node) => node.type === 'JSXAttribute' && node.name.name === prop,
    );
    if (!attribute) {
      if (!values.includes(null)) return false;
      continue;
    }
    if (values.every((value) => value === null)) return false;
    const key = literalKey(attribute.value);
    if (key === undefined) return undefined;
    if (!values.some((value) => value !== null && String(value) === key)) return false;
  }
  return true;
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
 * literal value or undefined, `make(name, value)` a new item, `rename(node, name)` renames it, and,
 * optionally, `expression(node)` its value's expression and `literal(value, old)` a literal that
 * replaces `old` there, so that a conditional whose values are literals, such as
 * `tone={failed ? 'error' : 'info'}`, has each value mapped, as mapConditional says.
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
    // A report-only rule: the prop stays as it is, and what changed about it is reported.
    if (rule.to === undefined && Object.keys(rule.values).length === 0) {
      report(node, rule.report);
      continue;
    }
    const key = item.key(node);
    // A 1.0 value, such as density="sm" on a Table, is already moved: no change, no report.
    if (key !== undefined && rule.current.has(key)) continue;
    const replacement = key === undefined ? undefined : rule.values[key];
    const mapped =
      key === undefined && item.expression
        ? mapConditional(item.expression(node), rule, name)
        : undefined;
    if (mapped) {
      if (mapped.name !== name && own(mapped.name)) {
        report(
          node,
          `${at} is ${mapped.name} in 1.0, which the element already sets: ${rule.report}`,
        );
        continue;
      }
      // A removed prop with an expression beside its literals, such as
      // `appearance={dark ? 'dark' : level}`, stays whole: emptying its literals alone would leave
      // a prop 1.0 doesn't have, half edited.
      if (mapped.removed && mapped.opaque) {
        report(
          node,
          `${at} has a value the codemod can't move: ${rule.report ?? 'change it by hand.'}`,
        );
        continue;
      }
      if (mapped.dropped) {
        items.splice(index, 1);
        index -= 1;
        changed = true;
        for (const { message, unless } of mapped.reports)
          if (!unless.some(own)) report(node, `${at}: ${message}`);
        continue;
      }
      if (mapped.name !== name) item.rename(node, mapped.name);
      for (const { leaf, value } of mapped.edits)
        leaf.parent[leaf.key] = item.literal(value, leaf.node);
      if (mapped.name !== name || mapped.edits.length > 0) changed = true;
      for (const { message, unless } of mapped.reports)
        if (!unless.some(own)) report(node, `${at}: ${message}`);
      // An expression beside the literals, such as `tone ?? 'error'`, may give 0.x values too.
      // A renamed prop whose values all stay, such as List.Item's detail, has nothing to check.
      if (mapped.opaque && (mapped.name === name || Object.keys(rule.values).length > 0))
        report(
          node,
          mapped.name !== name
            ? `${at} is ${mapped.name} now, with a value the codemod can't check: ${rule.report}`
            : `${at} has a value the codemod can't move: ${rule.report ?? 'change it by hand.'}`,
        );
      continue;
    }
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
    // A value's report can hold only where the element sets none of `unless`, such as actions.
    if (message && !(replacement.unless ?? []).some(own)) report(node, `${at}: ${message}`);
  }
  return changed;
}

/**
 * How a conditional or logical value of a prop maps, its values read as conditionalValues reads
 * them: each literal value as the rule maps it, where every value maps to one prop of the same name.
 * A 1.0 value stays; a listed value takes the value of the one prop it maps to, such as Alert's
 * `error`, which is tone `danger`; a value that maps to no prop, such as Avatar's `standard`, the
 * default, becomes `undefined`, which leaves the prop unset as dropping it does; and a renamed
 * prop's other values stay under its new name. Returns `{ name, edits, reports, opaque, removed, dropped }`: the
 * prop's name, each literal to replace with its new value, the values' own reports, each with the
 * props whose presence on the element silences it (`unless`), whether some values are
 * expressions the codemod can't see, whether every literal leaves the prop unset, and whether every value does, so it goes. Returns undefined where none of the values is
 * a literal, a literal maps to several props or is one the rule doesn't know, or the values map to
 * props of different names.
 */
export function mapConditional(expression, rule, name) {
  const values = expression && conditionalValues(expression);
  if (!values || values.literals.length === 0) return undefined;
  const names = new Set();
  const edits = [];
  const reports = [];
  for (const leaf of values.literals) {
    const key = expressionKey(leaf.node);
    if (rule.current.has(key)) {
      names.add(rule.to ?? name);
      continue;
    }
    const replacement = Object.hasOwn(rule.values, key) ? rule.values[key] : undefined;
    if (!replacement) {
      if (rule.to === undefined) return undefined;
      names.add(rule.to);
      continue;
    }
    const props = Object.entries(replacement.props ?? {});
    if (props.length > 1) return undefined;
    if (props.length === 1) {
      const [newName, value] = props[0];
      names.add(newName);
      if (String(value) !== key) edits.push({ leaf, value });
    } else edits.push({ leaf, value: undefined });
    const message = replacement.report ?? (replacement.reportAlways ? rule.report : undefined);
    if (message && !reports.some((each) => each.message === message))
      reports.push({ message, unless: replacement.unless ?? [] });
  }
  if (names.size > 1) return undefined;
  return {
    name: [...names][0] ?? rule.to ?? name,
    edits,
    reports,
    opaque: values.opaque.length > 0,
    // Every literal leaves the prop unset: a prop 1.0 removes.
    removed: names.size === 0,
    // Every value leaves the prop unset, as `layout={wide ? 'action' : 'content'}` on a Card does.
    dropped: names.size === 0 && values.opaque.length === 0,
  };
}
