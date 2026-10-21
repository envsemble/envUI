import { documentationUrl, jsxName, resolveVariable, walk } from '../utilities.js';

/** The display values that lay out a row, a column or a grid by hand, and the primitive for each. */
const layoutDisplays = new Map([
  ['flex', 'flex'],
  ['inline-flex', 'flex'],
  ['grid', 'grid'],
  ['inline-grid', 'grid'],
]);

/** The name a style object's property sets: `display`, `flexDirection` or `flex-direction`. */
function propertyName(property) {
  const { key } = property;
  if (!property.computed && key.type === 'Identifier') return key.name;
  if (key.type === 'Literal') return String(key.value);
  if (key.type === 'TemplateLiteral' && key.expressions.length === 0)
    return key.quasis[0].value.cooked;
  return undefined;
}

/**
 * The static strings a style value can take, each with its node: a string literal, a template
 * literal without expressions, and both branches of a condition or a logical expression, as in
 * `open ? 'flex' : 'none'` or `wide && 'grid'`.
 */
function staticStrings(node) {
  if (!node) return [];
  if (node.type === 'Literal' && typeof node.value === 'string')
    return [{ node, value: node.value }];
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return [{ node, value: node.quasis[0].value.cooked ?? '' }];
  if (node.type === 'ConditionalExpression')
    return [...staticStrings(node.consequent), ...staticStrings(node.alternate)];
  if (node.type === 'LogicalExpression')
    return [...staticStrings(node.left), ...staticStrings(node.right)];
  if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression')
    return staticStrings(node.expression);
  return [];
}

/** An expression without the TypeScript assertions around it: `{ … } as const` is the object. */
function unwrap(node) {
  let current = node;
  while (
    current &&
    (current.type === 'TSAsExpression' ||
      current.type === 'TSSatisfiesExpression' ||
      current.type === 'TSNonNullExpression')
  )
    current = current.expression;
  return current;
}

/**
 * The object literal a `const` of the file holds, when a name refers to one, as in
 * `const row = { display: 'flex' } as const`.
 */
function constantObject(sourceCode, identifier) {
  const variable = resolveVariable(sourceCode, identifier, identifier.name);
  const definition = variable?.defs.length === 1 ? variable.defs[0] : undefined;
  if (
    definition?.type !== 'Variable' ||
    definition.parent?.kind !== 'const' ||
    definition.node.id.type !== 'Identifier'
  )
    return null;
  const init = unwrap(definition.node.init);
  return init?.type === 'ObjectExpression' ? init : null;
}

/** The property of an object literal that sets a style, by its camelCase or kebab-case name. */
function findProperty(object, names) {
  return object.properties.find(
    (property) => property.type === 'Property' && names.includes(propertyName(property)),
  );
}

/**
 * The primitive that replaces a flex container: Column when the object's flex direction is a
 * column, Row when it is a row or left out, and either when it is computed.
 */
function flexPrimitive(object) {
  const direction = findProperty(object, ['flexDirection', 'flex-direction']);
  if (!direction) return 'row';
  const values = staticStrings(direction.value).map(({ value }) => value.trim());
  if (values.length === 0) return 'rowOrColumn';
  const columns = values.filter((value) => value.startsWith('column')).length;
  if (columns === values.length) return 'column';
  if (columns === 0) return 'row';
  return 'rowOrColumn';
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Warn on flex and grid layout in inline styles, which envUI's Row, Column and Grid provide",
      recommended: true,
      url: documentationUrl('no-hand-rolled-layout'),
    },
    schema: [],
    messages: {
      row: "Inline `display: {{display}}` lays out a row by hand: use envUI's Row instead, import { Row } from '@envsemble/envui', with its gap, padding and alignment props and `wrap` to wrap. Keep plain CSS only where Row can't do what you need.",
      column:
        "Inline `display: {{display}}` lays out a column by hand: use envUI's Column instead, import { Column } from '@envsemble/envui', with its gap, padding and alignment props. Keep plain CSS only where Column can't do what you need.",
      rowOrColumn:
        "Inline `display: {{display}}` lays out a row or a column by hand: use envUI's Row or Column instead, import { Row, Column } from '@envsemble/envui', with their gap, padding and alignment props. Keep plain CSS only where they can't do what you need.",
      grid: "Inline `display: {{display}}` lays out a grid by hand: use envUI's Grid instead, import { Grid } from '@envsemble/envui', with its columns, gap, padding and alignment props. Keep plain CSS only where Grid can't do what you need.",
    },
  },
  create(context) {
    const { sourceCode } = context;
    const { visitorKeys } = sourceCode;
    // An object is checked once, however many elements use it.
    const checked = new Set();

    /** Reports the layout displays an object literal sets. */
    function checkObject(object) {
      if (checked.has(object)) return;
      checked.add(object);
      const display = findProperty(object, ['display']);
      if (!display) return;
      for (const { node, value } of staticStrings(display.value)) {
        const kind = layoutDisplays.get(value.trim().toLowerCase());
        if (!kind) continue;
        context.report({
          node,
          messageId: kind === 'grid' ? 'grid' : flexPrimitive(object),
          data: { display: value.trim() },
        });
      }
    }

    /**
     * Checks every object literal in a style value, through conditions, spreads and calls, such
     * as useMemo(() => ({ display: 'grid' }), []), and the object a constant of the same file
     * holds: style={row} with `const row = { display: 'flex' }`, and style={styles.toolbar} with
     * `const styles = { toolbar: { display: 'flex' } }`.
     */
    function visit(root) {
      walk(root, visitorKeys, (node) => {
        if (node.type === 'ObjectExpression') checkObject(node);
        else if (node.type === 'Identifier') {
          const object = constantObject(sourceCode, node);
          if (object) checkObject(object);
        } else if (node.type === 'Property' && !node.computed) {
          // A key is a name, not a variable.
          visit(node.value);
          return false;
        } else if (node.type === 'MemberExpression' && !node.computed) {
          const object =
            node.object.type === 'Identifier' ? constantObject(sourceCode, node.object) : null;
          const member = object && findProperty(object, [node.property.name]);
          const value = member && unwrap(member.value);
          if (value?.type === 'ObjectExpression') checkObject(value);
          if (node.object.type !== 'Identifier') visit(node.object);
          return false;
        }
        return true;
      });
    }

    return {
      JSXAttribute(node) {
        if (jsxName(node.name) === 'style' && node.value?.type === 'JSXExpressionContainer')
          visit(node.value.expression);
      },
    };
  },
};
