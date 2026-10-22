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
 * literal without expressions, both branches of a condition or a logical expression, as in
 * `open ? 'flex' : 'none'` or `wide && 'grid'`, and the string a `const` of the file holds, as in
 * `display: d` with `const d = 'flex'`, reported where the style names it.
 */
function staticStrings(sourceCode, node, seen = new Set()) {
  if (!node) return [];
  const strings = (child) => staticStrings(sourceCode, child, seen);
  if (node.type === 'Literal' && typeof node.value === 'string')
    return [{ node, value: node.value }];
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return [{ node, value: node.quasis[0].value.cooked ?? '' }];
  if (node.type === 'ConditionalExpression')
    return [...strings(node.consequent), ...strings(node.alternate)];
  if (node.type === 'LogicalExpression') return [...strings(node.left), ...strings(node.right)];
  if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression')
    return strings(node.expression);
  if (node.type === 'Identifier') {
    const init = constantInit(sourceCode, node);
    if (!init || seen.has(init)) return [];
    seen.add(init);
    return strings(init).map(({ value }) => ({ node, value }));
  }
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

/** The value a `const` of the file holds, when a name refers to one, without `as const`. */
function constantInit(sourceCode, identifier) {
  const variable = resolveVariable(sourceCode, identifier, identifier.name);
  const definition = variable?.defs.length === 1 ? variable.defs[0] : undefined;
  if (
    definition?.type !== 'Variable' ||
    definition.parent?.kind !== 'const' ||
    definition.node.id.type !== 'Identifier'
  )
    return null;
  return unwrap(definition.node.init) ?? null;
}

/**
 * The object literal a `const` of the file holds, when a name refers to one, as in
 * `const row = { display: 'flex' } as const`.
 */
function constantObject(sourceCode, identifier) {
  const init = constantInit(sourceCode, identifier);
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
function flexPrimitive(sourceCode, object) {
  const direction = findProperty(object, ['flexDirection', 'flex-direction']);
  if (!direction) return 'row';
  const values = staticStrings(sourceCode, direction.value).map(({ value }) => value.trim());
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
      for (const { node, value } of staticStrings(sourceCode, display.value)) {
        const kind = layoutDisplays.get(value.trim().toLowerCase());
        if (!kind) continue;
        context.report({
          node,
          messageId: kind === 'grid' ? 'grid' : flexPrimitive(sourceCode, object),
          data: { display: value.trim() },
        });
      }
    }

    /**
     * Checks the object a constant of the same file holds where a style takes it as it is:
     * style={row} with `const row = { display: 'flex' }`, style={styles.toolbar} with
     * `const styles = { toolbar: { display: 'flex' } }`, either branch of a condition, and a
     * spread into a style object. A constant passed to a call, as in style={css(config)}, is an
     * argument the call may turn into anything, and is not checked.
     */
    function visitDirect(node) {
      const value = unwrap(node);
      if (value?.type === 'Identifier') {
        const object = constantObject(sourceCode, value);
        if (object) checkObject(object);
      } else if (
        value?.type === 'MemberExpression' &&
        !value.computed &&
        value.object.type === 'Identifier'
      ) {
        const object = constantObject(sourceCode, value.object);
        const member = object && findProperty(object, [value.property.name]);
        const memberValue = member && unwrap(member.value);
        if (memberValue?.type === 'ObjectExpression') checkObject(memberValue);
      } else if (value?.type === 'ConditionalExpression') {
        visitDirect(value.consequent);
        visitDirect(value.alternate);
      } else if (value?.type === 'LogicalExpression') {
        visitDirect(value.left);
        visitDirect(value.right);
      }
    }

    /**
     * Checks every object literal in a style value, through conditions, spreads and calls, such
     * as useMemo(() => ({ display: 'grid' }), []), with the constants spread into it, and the
     * constants the style takes as they are (visitDirect).
     */
    function visit(root) {
      visitDirect(root);
      walk(root, visitorKeys, (node) => {
        if (node.type === 'ObjectExpression') {
          checkObject(node);
          for (const property of node.properties)
            if (property.type === 'SpreadElement') visitDirect(property.argument);
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
