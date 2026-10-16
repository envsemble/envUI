import { readFileSync } from 'node:fs';

/** Reads one of the plugin's data files from src/data. */
export function readData(name) {
  return JSON.parse(readFileSync(new URL(`./data/${name}`, import.meta.url), 'utf8'));
}

/** Where a rule's documentation lives: its section in the package README. */
export function documentationUrl(rule) {
  return `https://github.com/envsemble/envUI/blob/main/packages/eslint-plugin/README.md#${rule}`;
}

/** The written name of a JSX element or attribute: `button`, `Menu.Item` or `xlink:href`. */
export function jsxName(name) {
  switch (name.type) {
    case 'JSXIdentifier':
      return name.name;
    case 'JSXMemberExpression':
      return `${jsxName(name.object)}.${name.property.name}`;
    case 'JSXNamespacedName':
      return `${name.namespace.name}:${name.name.name}`;
    default:
      return '';
  }
}

/** Whether a JSX element name is an HTML or SVG element, such as `button`, not a component. */
export function isIntrinsic(name) {
  return name.type === 'JSXIdentifier' && /^[a-z]/.test(name.name);
}

/** The attribute of a JSX opening element with the given name, if it is written out. */
export function findAttribute(element, name) {
  return element.attributes.find(
    (attribute) => attribute.type === 'JSXAttribute' && jsxName(attribute.name) === name,
  );
}

/** Whether a JSX opening element spreads props, which may supply any attribute. */
export function spreadsProps(element) {
  return element.attributes.some((attribute) => attribute.type === 'JSXSpreadAttribute');
}

/**
 * A JSX attribute's static value: a string, number or boolean, `true` for an attribute without a
 * value, and undefined when it is computed.
 */
export function staticValue(attribute) {
  const { value } = attribute;
  if (value === null) return true;
  if (value.type === 'Literal') return value.value;
  if (value.type !== 'JSXExpressionContainer') return undefined;
  const { expression } = value;
  if (expression.type === 'Literal') return expression.value ?? undefined;
  if (expression.type === 'TemplateLiteral' && expression.expressions.length === 0)
    return expression.quasis[0].value.cooked;
  if (
    expression.type === 'UnaryExpression' &&
    expression.operator === '-' &&
    expression.argument.type === 'Literal' &&
    typeof expression.argument.value === 'number'
  )
    return -expression.argument.value;
  return undefined;
}

/**
 * Visits a node and everything below it, depth first. `enter` returns false to skip a node's
 * children.
 */
export function walk(node, visitorKeys, enter) {
  if (!node || typeof node.type !== 'string') return;
  if (enter(node) === false) return;
  for (const key of visitorKeys[node.type] ?? []) {
    const child = node[key];
    if (Array.isArray(child)) for (const item of child) walk(item, visitorKeys, enter);
    else walk(child, visitorKeys, enter);
  }
}

/**
 * The string pieces under a node: string literals, and the parts of template literals between their
 * expressions. `open` marks a template part that an expression continues.
 */
export function stringParts(node, visitorKeys, { skip = () => false } = {}) {
  const parts = [];
  walk(node, visitorKeys, (child) => {
    if (skip(child)) return false;
    if (child.type === 'Literal' && typeof child.value === 'string')
      parts.push({ node: child, text: child.value, open: false });
    else if (child.type === 'TemplateElement')
      parts.push({ node: child, text: child.value.cooked ?? child.value.raw, open: !child.tail });
    return true;
  });
  return parts;
}

/** The name an import or export specifier refers to: an identifier, or a string literal name. */
export function moduleExportName(node) {
  return node.type === 'Identifier' ? node.name : String(node.value);
}

/**
 * The variable a name resolves to where a node is, through the scope chain: an import, a local or
 * a parameter. Undefined for a global that nothing declares.
 */
export function resolveVariable(sourceCode, node, name) {
  for (let scope = sourceCode.getScope(node); scope; scope = scope.upper) {
    const variable = scope.set.get(name);
    if (variable) return variable;
  }
  return undefined;
}

/** Whether a node is a function: a declaration, an expression or an arrow function. */
export function isFunction(node) {
  return (
    node?.type === 'FunctionDeclaration' ||
    node?.type === 'FunctionExpression' ||
    node?.type === 'ArrowFunctionExpression'
  );
}

/** The settings the plugin reads from `settings.envui`, shared by its rules. */
const settingNames = new Set(['reexportModules']);

/**
 * The plugin's shared settings, from `settings.envui` in the ESLint configuration:
 * `reexportModules`, the modules of the application that re-export envUI's components under
 * envUI's names, such as `'./ui'` or `'@/components/ui'`. A module is matched by its specifier
 * exactly as an import writes it. Throws on a malformed or unknown setting.
 */
export function pluginSettings(context) {
  const settings = context.settings?.envui ?? {};
  if (typeof settings !== 'object' || Array.isArray(settings))
    throw new Error('envui: settings.envui must be an object, such as { reexportModules: [] }.');
  const unknown = Object.keys(settings).filter((name) => !settingNames.has(name));
  if (unknown.length > 0)
    throw new Error(
      `envui: unknown setting ${unknown.map((name) => `settings.envui.${name}`).join(', ')}. Known settings: ${[...settingNames].join(', ')}.`,
    );
  const { reexportModules = [] } = settings;
  if (
    !Array.isArray(reexportModules) ||
    reexportModules.some((module) => typeof module !== 'string' || module === '')
  )
    throw new Error(
      "envui: settings.envui.reexportModules must be an array of module specifiers, such as ['./ui', '@/components/ui'].",
    );
  return { reexportModules: new Set(reexportModules) };
}
