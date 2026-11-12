import { readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

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

/**
 * Whether a node sits in the value of a JSX attribute whose name `accepts` takes, such as a part's
 * `render` prop.
 */
export function insideAttribute(sourceCode, node, accepts) {
  return sourceCode
    .getAncestors(node)
    .some((ancestor) => ancestor.type === 'JSXAttribute' && accepts(jsxName(ancestor.name)));
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

/**
 * What a JSX element name stands for when its first name is imported: the import's source, and
 * the name that module exports, `Popover` for `<Popover>` or `<P>` imported as `Popover as P`,
 * `Menu.Submenu` for `<Menu.Submenu>` or `<ui.Menu.Submenu>`. `name` is undefined for an import
 * that names no export, such as a default import. `{}` for a local, and undefined for a name that
 * nothing in the file declares.
 */
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

/** The name a style object's property sets: `display`, `backgroundColor` or `--accent`. */
export function propertyName(property) {
  const { key } = property;
  if (!property.computed && key.type === 'Identifier') return key.name;
  if (key.type === 'Literal') return String(key.value);
  if (key.type === 'TemplateLiteral' && key.expressions.length === 0)
    return key.quasis[0].value.cooked;
  return undefined;
}

/**
 * An expression without what wraps it but leaves its value as it is: the TypeScript `as`,
 * `satisfies` and `!`, as in `{ … } as const`, and the chain that optional chaining wraps around
 * `adapters?.link`.
 */
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

/** Whether a module specifier is a path relative to where it is written: `./ui` or `../ui`. */
const isRelative = (specifier) => /^\.\.?(?:\/|$)/.test(specifier);

/** The extensions a module's file may have when an import or a setting leaves it out. */
const scriptExtensions = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];

/** Whether a path is a file. */
const isFile = (path) => statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;

/**
 * The file a module path names, as resolving an import finds it: the path itself, with a script
 * extension, or its `/index` with one. Undefined when there is none.
 */
function moduleFile(path) {
  const candidates = [
    path,
    ...scriptExtensions.map((extension) => `${path}${extension}`),
    ...scriptExtensions.map((extension) => join(path, `index${extension}`)),
  ];
  return candidates.find(isFile);
}

/**
 * A module's file without the script extension or the trailing `/index` that resolving it may
 * add: `src/ui`, `src/ui.ts` and `src/ui/index.tsx` are the same module. On Windows, where paths
 * ignore case, it is lowercased too, since an editor may write `c:\` where ESLint's cwd is `C:\`.
 */
const modulePath = (path) => {
  const module = resolve(path)
    .replace(/\.[cm]?[jt]sx?$/, '')
    .replace(/[\\/]index$/, '');
  return process.platform === 'win32' ? module.toLowerCase() : module;
};

/** The file's real path, through symbolic links and in the file system's own case. */
const realModulePath = (file) => modulePath(realpathSync.native(file));

/**
 * The plugin's shared settings, from `settings.envui` in the ESLint configuration:
 * `reexportModules`, the modules of the application that re-export envUI's components under
 * envUI's names, such as `path.resolve(import.meta.dirname, 'src/ui')` or `'@/components/ui'`.
 * `isReexportModule` tells whether an import's source in the file being linted is one of them. An
 * absolute entry names a module's file outright, and a relative entry names it from ESLint's
 * working directory, `context.cwd`; either must name an existing module, with or without its
 * extension or `/index`, and matches a relative import that resolves to that module from the
 * importing file. Any other entry, an alias or a package, matches an import that writes it exactly.
 * Throws on a malformed or unknown setting, and on a path entry that names no module.
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
      "envui: settings.envui.reexportModules must be an array of module specifiers, such as ['./src/ui', '@/components/ui'].",
    );
  const isPath = (entry) => isRelative(entry) || isAbsolute(entry);
  // Each module by its path as written and by its real path, so either spelling of an import
  // matches.
  const files = new Set();
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
    files.add(modulePath(path));
    files.add(realModulePath(file));
  }
  const specifiers = new Set(reexportModules.filter((entry) => !isPath(entry)));
  const directory = resolve(context.cwd, dirname(context.filename));
  return {
    isReexportModule(source) {
      if (typeof source !== 'string') return false;
      if (!isRelative(source)) return specifiers.has(source);
      if (files.size === 0) return false;
      const path = resolve(directory, source);
      if (files.has(modulePath(path))) return true;
      const file = moduleFile(path);
      return file !== undefined && files.has(realModulePath(file));
    },
  };
}
