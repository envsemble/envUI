// v1-stack: rewrites Stack, which 1.0 replaces with the layout primitives Row and Column.
//
// - `<Stack direction="row" …>` becomes `<Row …>`, and a Stack without `direction`, or with
//   `direction="column"`, becomes `<Column …>`, without the prop. The other props keep their names
//   and values: `gap`, `align`, `justify`, `render`, Row's `wrap` and the native ones.
// - A Stack without `gap` gets `gap={4}`, Stack's default, as its first prop, so a spread after it
//   still wins; Row and Column have no gap of their own.
// - `wrap` on a column goes, as a column never wrapped, and is reported.
// - A `direction` that is an expression stays as it is, with the element, and is reported: write a
//   Row or a Column for each value. An element that spreads props becomes a Column or a Row by its
//   own `direction`, and is reported, as the spread may set `direction` too.
// - The import of Stack becomes the imports of Row and Column, as the file uses them; it stays, and
//   each use is reported, where Stack is used other than as an element, such as passed as a value.
//   Where the file already uses the name Row or Column for something else, such as a local type,
//   the primitive is imported under a free alias, such as `Column as EnvColumn`, and reported.
// - `StackProps` is reported: use RowProps or ColumnProps.
// Elements are matched by their import from @envsemble/envui, also through a namespace import
// (`<ui.Stack>` becomes `<ui.Row>`), and a local of the same name in an inner scope is another
// component. Only the changed text is replaced, so the file keeps its layout.
import { literalKey } from '../elements.mjs';
import { createReporter, parserFor, sourceRanges } from '../shared.mjs';

export const parser = 'tsx';

const entry = '@envsemble/envui';
/** Stack's gap when it set none, a step of the spacing scale. */
const stackGap = 4;

/** Whether an Identifier at `path` names a binding or a reference, rather than a property key. */
function isBindingName(path) {
  const { node, parent } = path;
  // ast-types counts JSX names as identifiers too; they are matched as elements.
  if (node.type !== 'Identifier') return false;
  const owner = parent?.node;
  if (!owner) return true;
  switch (owner.type) {
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      return owner.object === node || owner.computed;
    case 'TSQualifiedName':
      return owner.left === node;
    case 'Property':
    case 'ObjectProperty':
    case 'ObjectMethod':
    case 'ClassProperty':
    case 'ClassMethod':
    case 'ClassPrivateProperty':
    case 'MethodDefinition':
    case 'PropertyDefinition':
    case 'TSPropertySignature':
    case 'TSMethodSignature':
    case 'TSEnumMember':
      // A shorthand property's value is the reference; its key is the same name again.
      return path.name !== 'key' || owner.computed === true;
    case 'ExportSpecifier':
      return owner.local === node;
    case 'ImportSpecifier':
      return owner.local === node;
    default:
      return true;
  }
}

export default function transform(file, api) {
  if (!file.source.includes('Stack')) return undefined;
  const j = api.jscodeshift.withParser(parserFor(file.path));
  const root = j(file.source);
  const reporter = createReporter(api);

  // The file's imports from envUI: Stack's specifier, namespace imports and the other value names.
  let stack = null;
  const namespaces = new Set();
  const imported = new Map();
  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value === entry)
    .forEach((path) => {
      const typeOnly = path.node.importKind === 'type';
      for (const specifier of path.node.specifiers ?? []) {
        if (specifier.type === 'ImportNamespaceSpecifier') {
          if (!typeOnly) namespaces.add(specifier.local.name);
          continue;
        }
        if (specifier.type !== 'ImportSpecifier') continue;
        const name = specifier.imported.name;
        if (name === 'StackProps')
          reporter.warn(specifier, 'StackProps is gone in 1.0: use RowProps or ColumnProps.');
        if (typeOnly || specifier.importKind === 'type') continue;
        if (name === 'Stack') stack = { specifier, declaration: path.node };
        else imported.set(name, specifier.local.name);
      }
    });
  if (!stack && namespaces.size === 0) {
    reporter.flush();
    return undefined;
  }
  const stackLocal = stack?.specifier.local.name;

  /** Whether the file already uses a name, other than for envUI's export of that name. */
  const taken = (name) =>
    root
      .find(j.Identifier, { name })
      .filter(
        (path) =>
          isBindingName(path) &&
          !(path.parent.node.type === 'ImportSpecifier' && imported.get(name) === name),
      )
      .size() > 0 ||
    root
      .find(j.JSXIdentifier, { name })
      .filter(
        (path) =>
          path.parent.node.type !== 'JSXMemberExpression' &&
          path.parent.node.type !== 'JSXAttribute',
      )
      .size() > 0;
  const locals = new Map();
  /** The local name of Row or Column, importing it under a free alias where the name is taken. */
  const localOf = (target, node) => {
    if (imported.has(target)) return imported.get(target);
    if (!locals.has(target)) {
      let local = target;
      if (taken(target)) {
        local = `Env${target}`;
        for (let index = 2; taken(local); index += 1) local = `Env${target}${index}`;
        reporter.warn(
          node,
          `the file uses the name ${target} for something else, so ${target} is imported as ${local}.`,
        );
      }
      locals.set(target, local);
    }
    return locals.get(target);
  };

  const openingRange = sourceRanges(file, j, root, 'JSXOpeningElement');
  const closingRange = sourceRanges(file, j, root, 'JSXClosingElement');
  const attributeRange = sourceRanges(file, j, root, 'JSXAttribute');
  const edits = [];
  /** Removes an attribute with the space before it. */
  const removeAttribute = (attribute) => {
    const range = attributeRange(attribute);
    if (!range) return false;
    let start = range.start;
    while (start > 0 && /\s/.test(file.source[start - 1])) start -= 1;
    edits.push({ start, end: range.end, text: '' });
    return true;
  };
  // Stack elements left as they are, which keep the import.
  let kept = 0;

  root.find(j.JSXElement).forEach((path) => {
    const { openingElement, closingElement } = path.node;
    const { name } = openingElement;
    let namespace = null;
    if (name.type === 'JSXIdentifier' && stackLocal && name.name === stackLocal) {
      const scope = path.scope?.lookup(stackLocal);
      if (scope && !scope.isGlobal) return;
    } else if (
      name.type === 'JSXMemberExpression' &&
      name.object.type === 'JSXIdentifier' &&
      namespaces.has(name.object.name) &&
      name.property.name === 'Stack'
    ) {
      const scope = path.scope?.lookup(name.object.name);
      if (scope && !scope.isGlobal) return;
      namespace = name.object.name;
    } else return;

    const attributes = openingElement.attributes;
    const named = (prop) =>
      attributes.find((node) => node.type === 'JSXAttribute' && node.name.name === prop);
    const direction = named('direction');
    let target = 'Column';
    if (direction) {
      const value = literalKey(direction.value);
      if (value === 'row') target = 'Row';
      else if (value !== 'column') {
        reporter.warn(
          direction,
          'Stack is gone in 1.0, and its direction is an expression: write a Row for direction="row" and a Column for a column.',
        );
        kept += 1;
        return;
      }
    }
    const opening = openingRange(openingElement);
    const closing = closingElement && closingRange(closingElement);
    if (!opening || (closingElement && !closing)) {
      reporter.warn(openingElement, `Stack is gone in 1.0: change it to a ${target} by hand.`);
      kept += 1;
      return;
    }
    const local = namespace ? `${namespace}.${target}` : localOf(target, openingElement);
    edits.push({ start: opening.node.name.start, end: opening.node.name.end, text: local });
    if (closing)
      edits.push({ start: closing.node.name.start, end: closing.node.name.end, text: local });
    if (!named('gap'))
      edits.push({
        start: opening.node.name.end,
        end: opening.node.name.end,
        text: ` gap={${stackGap}}`,
      });
    if (direction) removeAttribute(direction);
    const wrap = named('wrap');
    if (target === 'Column' && wrap) {
      removeAttribute(wrap);
      reporter.warn(wrap, 'a Column has no wrap, which a column of a Stack never needed: it goes.');
    }
    if (attributes.some((node) => node.type === 'JSXSpreadAttribute'))
      reporter.warn(
        openingElement,
        `Stack is a ${target} now, and the element spreads props too: check they set no direction, and no wrap on a Column.`,
      );
  });

  // Other uses of Stack, such as a value passed on, keep the import.
  if (stackLocal)
    root
      .find(j.Identifier, { name: stackLocal })
      .filter((path) => isBindingName(path) && path.parent.node.type !== 'ImportSpecifier')
      .forEach((path) => {
        const scope = path.scope?.lookup(stackLocal);
        if (scope && !scope.isGlobal) return;
        kept += 1;
        reporter.warn(path.node, 'Stack is gone in 1.0: use Row or Column.');
      });

  // The import: Stack's specifier becomes Row and Column, as the file uses them.
  if (stack) {
    const specifiers = sourceRanges(file, j, root, 'ImportSpecifier');
    const range = specifiers(stack.specifier);
    const declaration = sourceRanges(file, j, root, 'ImportDeclaration')(stack.declaration);
    const added = [...locals]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([target, local]) => (local === target ? target : `${target} as ${local}`));
    if (range && declaration) {
      const raw = declaration.node.specifiers;
      const index = raw.findIndex((node) => node.start === range.start);
      const multiline = /\n/.test(file.source.slice(declaration.start, raw[0].start));
      const lineStart = file.source.lastIndexOf('\n', range.start) + 1;
      const indent = file.source.slice(lineStart, range.start);
      const separator = multiline && /^\s*$/.test(indent) ? `,\n${indent}` : ', ';
      const names = kept > 0 ? [file.source.slice(range.start, range.end), ...added] : added;
      if (names.length > 0) edits.push({ ...range, text: names.join(separator) });
      else if (raw.length === 1) {
        let end = declaration.end;
        if (file.source[end] === '\r') end += 1;
        if (file.source[end] === '\n') end += 1;
        edits.push({ start: declaration.start, end, text: '' });
      } else if (index < raw.length - 1)
        edits.push({ start: range.start, end: raw[index + 1].start, text: '' });
      else edits.push({ start: raw[index - 1].end, end: range.end, text: '' });
    } else if (added.length > 0)
      reporter.warn(stack.specifier, `import ${added.join(' and ')} in place of Stack by hand.`);
  }

  reporter.flush();
  if (edits.length === 0) return undefined;
  let output = file.source;
  for (const { start, end, text } of edits.sort((a, b) => b.start - a.start || b.end - a.end))
    output = output.slice(0, start) + text + output.slice(end);
  return output;
}
