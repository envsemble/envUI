import { readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

export function readData(name) {
  return JSON.parse(readFileSync(new URL(`./data/${name}`, import.meta.url), 'utf8'));
}

export function documentationUrl(rule) {
  return `https://github.com/envsemble/envUI/blob/main/packages/eslint-plugin/README.md#${rule}`;
}

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

export function isIntrinsic(name) {
  return name.type === 'JSXIdentifier' && /^[a-z]/.test(name.name);
}

export function findAttribute(element, name) {
  return element.attributes.find(
    (attribute) => attribute.type === 'JSXAttribute' && jsxName(attribute.name) === name,
  );
}

export function insideAttribute(sourceCode, node, accepts) {
  return sourceCode
    .getAncestors(node)
    .some((ancestor) => ancestor.type === 'JSXAttribute' && accepts(jsxName(ancestor.name)));
}

export function enclosingPropName(sourceCode, node) {
  const ancestors = sourceCode.getAncestors(node);
  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    const ancestor = ancestors[index];
    if (ancestor.type === 'JSXAttribute') return jsxName(ancestor.name);
    if (ancestor.type === 'Property') return propertyName(ancestor);
  }
  return undefined;
}

export function spreadsProps(element) {
  return element.attributes.some((attribute) => attribute.type === 'JSXSpreadAttribute');
}

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

export function walk(node, visitorKeys, enter) {
  if (!node || typeof node.type !== 'string') return;
  if (enter(node) === false) return;
  for (const key of visitorKeys[node.type] ?? []) {
    const child = node[key];
    if (Array.isArray(child)) for (const item of child) walk(item, visitorKeys, enter);
    else walk(child, visitorKeys, enter);
  }
}

export function moduleExportName(node) {
  return node.type === 'Identifier' ? node.name : String(node.value);
}

export function resolveVariable(sourceCode, node, name) {
  for (let scope = sourceCode.getScope(node); scope; scope = scope.upper) {
    const variable = scope.set.get(name);
    if (variable) return variable;
  }
  return undefined;
}

export function importedComponent(sourceCode, name) {
  const members = [];
  let root = name;
  for (; root.type === 'JSXMemberExpression'; root = root.object)
    members.unshift(root.property.name);
  if (root.type !== 'JSXIdentifier') return undefined;
  const variable = resolveVariable(sourceCode, root, root.name);
  if (!variable?.defs.length) return undefined;
  const definition = variable.defs.find((candidate) => candidate.type === 'ImportBinding');
  if (!definition) return {};
  const source = definition.parent.source?.value;
  if (definition.node.type === 'ImportNamespaceSpecifier')
    return { source, name: members.join('.') };
  if (definition.node.type === 'ImportSpecifier')
    return { source, name: [moduleExportName(definition.node.imported), ...members].join('.') };
  return { source, name: undefined };
}

export function propertyName(property) {
  const { key } = property;
  if (!property.computed && key.type === 'Identifier') return key.name;
  if (key.type === 'Literal') return String(key.value);
  if (key.type === 'TemplateLiteral' && key.expressions.length === 0)
    return key.quasis[0].value.cooked;
  return undefined;
}

export function unwrapExpression(expression) {
  let node = expression;
  while (
    node?.type === 'TSAsExpression' ||
    node?.type === 'TSSatisfiesExpression' ||
    node?.type === 'TSNonNullExpression' ||
    node?.type === 'ChainExpression'
  )
    node = node.expression;
  return node;
}

export function isFunction(node) {
  return (
    node?.type === 'FunctionDeclaration' ||
    node?.type === 'FunctionExpression' ||
    node?.type === 'ArrowFunctionExpression'
  );
}

const settingNames = new Set(['reexportModules']);

const isRelative = (specifier) => /^\.\.?(?:\/|$)/.test(specifier);

const scriptExtensions = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];

const isFile = (path) => statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;

function moduleFile(path) {
  const candidates = [
    path,
    ...scriptExtensions.map((extension) => `${path}${extension}`),
    ...scriptExtensions.map((extension) => join(path, `index${extension}`)),
  ];
  return candidates.find(isFile);
}

const pathsIgnoreCase = process.platform === 'win32';

const modulePath = (path) => {
  const module = resolve(path)
    .replace(/\.[cm]?[jt]sx?$/, '')
    .replace(/[\\/]index$/, '');
  return pathsIgnoreCase ? module.toLowerCase() : module;
};

const realModulePath = (file) => modulePath(realpathSync.native(file));

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
      "envui: settings.envui.reexportModules must be an array of module specifiers, such as ['./src/ui', '@/components/ui'].",
    );
  const isPath = (entry) => isRelative(entry) || isAbsolute(entry);
  const writtenAndRealModulePaths = new Set();
  for (const entry of reexportModules.filter(isPath)) {
    const path = resolve(context.cwd, entry);
    const file = moduleFile(path);
    if (!file)
      throw new Error(
        `envui: settings.envui.reexportModules entry '${entry}' names no module: there is no file at ${path}, with a script extension or as its /index. ${
          isRelative(entry)
            ? `A relative entry is read from ESLint's working directory, ${context.cwd}, which changes with where ESLint runs; name the module outright with path.resolve(import.meta.dirname, '${entry}') in the configuration.`
            : 'Check the path, or remove the entry.'
        }`,
      );
    writtenAndRealModulePaths.add(modulePath(path));
    writtenAndRealModulePaths.add(realModulePath(file));
  }
  const specifiers = new Set(reexportModules.filter((entry) => !isPath(entry)));
  const directory = resolve(context.cwd, dirname(context.filename));
  return {
    isReexportModule(source) {
      if (typeof source !== 'string') return false;
      if (!isRelative(source)) return specifiers.has(source);
      if (writtenAndRealModulePaths.size === 0) return false;
      const path = resolve(directory, source);
      if (writtenAndRealModulePaths.has(modulePath(path))) return true;
      const file = moduleFile(path);
      return file !== undefined && writtenAndRealModulePaths.has(realModulePath(file));
    },
  };
}
