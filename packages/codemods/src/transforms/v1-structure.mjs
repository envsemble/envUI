// v1-structure: rewrites envUI 0.x elements whose 1.0 form is another element or another shape, as
// the rename map's `structure` section lists them, such as ActionGroup, which 1.0 lays out with
// Stack.
//
// Each component's entry has `cases`, tried in order; the first whose `when` matches the element's
// props applies:
// - `when`: per prop, the literal values the case is for; null stands for a prop the element
//   doesn't set, and "*" for one it sets to any value, an expression included. A prop of `when`
//   whose value is an expression can't be matched against literals, so the element stays as it is
//   and the entry's `report` is reported.
// - `element`: the component the element becomes, imported from the same entry point (under a free
//   alias where the file already uses the name); the old import goes once nothing else uses it.
// - `props`: per prop, null drops it, "render" turns `as="article"` into `render={<article />}`,
//   and `{ "to", "values" }` renames it and maps its literal values (null drops one).
// - `add`: props the element gets, unless it already sets them.
// - `children`: per component of a direct child element, props it gets (`add`, unless it sets one
//   of `unless`) or a `report`; `*` stands for any other child, text and expressions included.
// - `wrap`: an element the result is wrapped in, with its props.
// - `wrapChildren`: an element the element's children move into, with `props` naming the props
//   that move from the element onto it, each under its new name (null keeps the name).
// - `lift`: props whose values become the element's first children, in order, such as a title
//   bar passed as an element: an element stays an element, and another value an expression.
// - `report`: a note reported at every element the case rewrites.
// A dotted `element`, such as `WindowFrame.Content`, is a part of a namespace the entry exports.
// An element that spreads props, such as `<ActionGroup {...group}>`, may set any of them, so no case
// can be chosen for it: it stays as it is and the entry's `report` is reported. So does a child
// that spreads props where a case would add some, since it may already set them.
// Elements are matched by their import from @envsemble/envui, as v1-props matches them.
import { loadMap } from '../map.mjs';
import { componentResolver, envuiImports, jsxAttribute, literalKey } from '../elements.mjs';
import { createReporter, keepByteOrderMark, parserFor, printOptions } from '../shared.mjs';

export const parser = 'tsx';

const intrinsic = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** The JSX name for a dotted name, such as `Stack` or `ui.Stack`. */
function jsxName(j, name) {
  const [first, ...rest] = name.split('.');
  return rest.reduce(
    (object, part) => j.jsxMemberExpression(object, j.jsxIdentifier(part)),
    j.jsxIdentifier(first),
  );
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

  /** Names bound at the top of the module, which a new import may not take. */
  const topNames = new Set();
  root
    .find(j.Program)
    .forEach((path) => Object.keys(path.scope.getBindings()).forEach((name) => topNames.add(name)));

  /** The local name under which the file imports `name` from `entry`, adding the import. */
  const imported = new Map();
  function localFor(entry, name) {
    const key = `${entry.name} ${name}`;
    if (imported.has(key)) return imported.get(key);
    for (const [local, each] of imports.components)
      if (each.entry === entry && each.imported === name) {
        imported.set(key, local);
        return local;
      }
    let local = name;
    for (let index = 2; topNames.has(local); index += 1)
      local = index === 2 ? `Env${name}` : `Env${name}${index}`;
    topNames.add(local);
    const declaration = root
      .find(j.ImportDeclaration)
      .filter(
        (path) =>
          path.node.source.value === entry.name &&
          path.node.importKind !== 'type' &&
          (path.node.specifiers ?? []).every((specifier) => specifier.type === 'ImportSpecifier'),
      )
      .paths()[0];
    const specifier =
      local === name
        ? j.importSpecifier(j.identifier(name))
        : j.importSpecifier(j.identifier(name), j.identifier(local));
    if (declaration) declaration.node.specifiers.push(specifier);
    else {
      const last = root.find(j.ImportDeclaration).paths().at(-1);
      last.insertAfter(j.importDeclaration([specifier], j.stringLiteral(entry.name)));
    }
    imports.components.set(local, { entry, imported: name });
    imported.set(key, local);
    return local;
  }

  /**
   * The JSX name of `name` from the entry the element came from; a dotted name is a part of the
   * namespace its first name exports.
   */
  const nameFor = (component, name) => {
    const [head, ...parts] = name.split('.');
    const base = component.namespace
      ? `${component.namespace}.${head}`
      : localFor(component.entry, head);
    return [base, ...parts].join('.');
  };

  const attributeIndex = (attributes, name) =>
    attributes.findIndex((node) => node.type === 'JSXAttribute' && node.name.name === name);
  const hasAttribute = (attributes, name) => attributeIndex(attributes, name) !== -1;
  const spreads = (attributes) => attributes.some((node) => node.type === 'JSXSpreadAttribute');

  /** Whether a case's `when` matches the element: true, false, or undefined for an expression. */
  function matches(attributes, when) {
    for (const [prop, values] of Object.entries(when ?? {})) {
      if (prop.startsWith('$')) continue;
      const index = attributeIndex(attributes, prop);
      if (values === '*') {
        if (index === -1) return false;
        continue;
      }
      if (index === -1) {
        if (!values.includes(null)) return false;
        continue;
      }
      const key = literalKey(attributes[index].value);
      if (key === undefined) return undefined;
      if (!values.some((value) => value !== null && String(value) === key)) return false;
    }
    return true;
  }

  /** Applies a case's prop operations to the attributes; returns the reports it leaves. */
  function applyProps(attributes, operations, where) {
    const reports = [];
    for (const [prop, operation] of Object.entries(operations ?? {})) {
      if (prop.startsWith('$')) continue;
      const index = attributeIndex(attributes, prop);
      if (index === -1) continue;
      const node = attributes[index];
      if (operation === null) {
        attributes.splice(index, 1);
        continue;
      }
      if (operation === 'render') {
        const value = literalKey(node.value);
        if (value === undefined || !intrinsic.test(value) || hasAttribute(attributes, 'render')) {
          reports.push([
            node,
            `${where}'s ${prop} is gone in 1.0: pass the element to render, such as render={<footer />}.`,
          ]);
          continue;
        }
        const element = j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier(value), [], true));
        attributes.splice(
          index,
          1,
          j.jsxAttribute(j.jsxIdentifier('render'), j.jsxExpressionContainer(element)),
        );
        continue;
      }
      const values = operation.values ?? {};
      const key = literalKey(node.value);
      if (key !== undefined && Object.hasOwn(values, key)) {
        if (values[key] === null) {
          attributes.splice(index, 1);
          continue;
        }
        attributes.splice(index, 1, jsxAttribute(j, operation.to ?? prop, values[key]));
        continue;
      }
      if (key === undefined && Object.keys(values).length > 0)
        reports.push([
          node,
          `${where}'s ${prop} has a value the codemod can't move${operation.to ? ` to ${operation.to}` : ''}: change it by hand.`,
        ]);
      if (operation.to) node.name = j.jsxIdentifier(operation.to);
    }
    return reports;
  }

  let changed = false;
  // Inner elements first, so an outer rewrite sees its children's final form.
  const elements = root.find(j.JSXElement).paths().reverse();
  for (const path of elements) {
    const opening = path.get('openingElement');
    const component = componentOf(opening);
    const rule = component && component.entry.structure.get(component.name);
    if (!rule) continue;
    const { attributes } = path.node.openingElement;
    const where = component.name;
    if (spreads(attributes)) {
      reporter.warn(
        path.node,
        `${where}: its spread props may set what decides its 1.0 form, so it stays. ${rule.report}`,
      );
      continue;
    }
    let chosen;
    for (const each of rule.cases) {
      const result = matches(attributes, each.when);
      if (result === undefined) {
        chosen = null;
        break;
      }
      if (result) {
        chosen = each;
        break;
      }
    }
    // No case matches an element already in its 1.0 form; an undecided one is reported.
    if (chosen === undefined) continue;
    if (chosen === null) {
      reporter.warn(path.node, `${where}: ${rule.report}`);
      continue;
    }
    const reports = applyProps(attributes, chosen.props, where);
    const added = Object.entries(chosen.add ?? {})
      .filter(([prop]) => !hasAttribute(attributes, prop))
      .map(([prop, value]) => jsxAttribute(j, prop, value));
    attributes.unshift(...added);

    for (const [index, child] of (path.node.children ?? []).entries()) {
      if (child.type === 'JSXText' && child.value.trim() === '') continue;
      const childPath = path.get('children', index);
      const childComponent =
        child.type === 'JSXElement' ? componentOf(childPath.get('openingElement')) : null;
      const childRule =
        (childComponent && chosen.children?.[childComponent.name.split('.').at(-1)]) ??
        chosen.children?.['*'];
      if (!childRule) continue;
      if (childRule.report) {
        reporter.warn(child, `${where}: ${childRule.report}`);
        continue;
      }
      if (child.type !== 'JSXElement') continue;
      const childAttributes = child.openingElement.attributes;
      if ((childRule.unless ?? []).some((prop) => hasAttribute(childAttributes, prop))) continue;
      const adding = Object.keys(childRule.add ?? {}).filter(
        (prop) => !hasAttribute(childAttributes, prop),
      );
      if (adding.length > 0 && spreads(childAttributes)) {
        const props = [...new Set([...(childRule.unless ?? []), ...adding])].join(' or ');
        reporter.warn(
          child,
          `${where}: this child's spread props may set ${props}, so it doesn't get ${adding.join(', ')}: add ${adding.length > 1 ? 'them' : 'it'} if it should.`,
        );
        continue;
      }
      for (const [prop, value] of Object.entries(childRule.add ?? {}))
        if (!hasAttribute(childAttributes, prop))
          childAttributes.push(jsxAttribute(j, prop, value));
    }

    if (chosen.wrapChildren || chosen.lift) {
      const { node } = path;
      const content = (node.children ?? []).filter(
        (child) => !(child.type === 'JSXText' && child.value.trim() === ''),
      );
      let children = content.length > 0 ? node.children : [];
      if (chosen.wrapChildren) {
        const moved = [];
        for (const [prop, to] of Object.entries(chosen.wrapChildren.props ?? {})) {
          const index = attributeIndex(attributes, prop);
          if (index === -1) continue;
          const [attribute] = attributes.splice(index, 1);
          if (to) attribute.name = j.jsxIdentifier(to);
          moved.push(attribute);
        }
        const wrapName = nameFor(component, chosen.wrapChildren.element);
        const empty = children.length === 0;
        children = [
          j.jsxElement(
            j.jsxOpeningElement(jsxName(j, wrapName), moved, empty),
            empty ? null : j.jsxClosingElement(jsxName(j, wrapName)),
            children,
          ),
        ];
      }
      const lifted = [];
      for (const prop of chosen.lift ?? []) {
        const index = attributeIndex(attributes, prop);
        if (index === -1) continue;
        const [{ value }] = attributes.splice(index, 1);
        if (!value) continue;
        const expression = value.type === 'JSXExpressionContainer' ? value.expression : value;
        if (expression.type === 'JSXEmptyExpression') continue;
        lifted.push(
          expression.type === 'JSXElement' || expression.type === 'JSXFragment'
            ? expression
            : j.jsxExpressionContainer(expression),
        );
      }
      const parts = [
        ...lifted,
        ...children.filter((child) => child.type !== 'JSXText' || child.value.trim() !== ''),
      ];
      node.children = parts.flatMap((part) => [j.jsxText('\n'), part]).concat(j.jsxText('\n'));
      if (node.openingElement.selfClosing) {
        node.openingElement.selfClosing = false;
        node.closingElement = j.jsxClosingElement(node.openingElement.name);
      }
    }

    if (chosen.element) {
      const name = jsxName(j, nameFor(component, chosen.element));
      path.node.openingElement.name = name;
      if (path.node.closingElement)
        path.node.closingElement.name = jsxName(j, nameFor(component, chosen.element));
    }
    if (chosen.wrap) {
      const wrapName = nameFor(component, chosen.wrap.element);
      const wrapAttributes = Object.entries(chosen.wrap.props ?? {}).map(([prop, value]) =>
        jsxAttribute(j, prop, value),
      );
      // The parentheses around the element, as in `return (…)`, go around the wrapper instead.
      const { extra } = path.node;
      path.node.extra = { ...extra, parenthesized: false };
      const wrapped = j.jsxElement(
        j.jsxOpeningElement(jsxName(j, wrapName), wrapAttributes),
        j.jsxClosingElement(jsxName(j, wrapName)),
        [j.jsxText('\n'), path.node, j.jsxText('\n')],
      );
      if (extra?.parenthesized) wrapped.extra = { parenthesized: true };
      path.replace(wrapped);
    }
    for (const [node, message] of reports) reporter.warn(node, message);
    if (chosen.report) reporter.warn(path.node, `${where}: ${chosen.report}`);
    changed = true;
  }

  if (changed) {
    // An import that nothing uses any more, such as ActionGroup's, goes.
    for (const [local, each] of imports.components) {
      if (!each.declaration) continue;
      const uses =
        root.find(j.JSXIdentifier, { name: local }).size() +
        root
          .find(j.Identifier, { name: local })
          .filter((path) => path.parent.node.type !== 'ImportSpecifier')
          .size();
      if (uses > 0) continue;
      const declaration = each.declaration.node;
      declaration.specifiers = declaration.specifiers.filter(
        (specifier) => specifier.local?.name !== local,
      );
      if (declaration.specifiers.length === 0) j(each.declaration).remove();
    }
  }

  reporter.flush();
  if (!changed) return undefined;
  return keepByteOrderMark(file.source, root.toSource(printOptions(file.source, 'double')));
}
