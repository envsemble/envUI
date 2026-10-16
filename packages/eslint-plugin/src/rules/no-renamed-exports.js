import {
  documentationUrl,
  findAttribute,
  moduleExportName,
  readData,
  resolveVariable,
  staticValue,
} from '../utilities.js';

const { modules } = readData('renames.json');

/**
 * What 1.0 has in place of a name an entry point no longer exports, if it is one: `to`, the
 * replacements, with the `use` hint of a removed name and the `prop` and `values` of a split.
 */
function renameOf(source, name) {
  if (!Object.hasOwn(modules, source)) return undefined;
  return Object.hasOwn(modules[source], name) ? modules[source][name] : undefined;
}

/**
 * Whether a name stays importable because 1.0 exports a namespace under it: Menu became Menu.Root
 * and the Menu namespace, and 1.0 reuses the removed manual Toast's name for Toast.Provider's.
 */
function isNamespace(name, rename) {
  return (
    rename.namespace === true || (rename.to.length === 1 && rename.to[0].startsWith(`${name}.`))
  );
}

/** An expression without the TypeScript `as`, `satisfies`, `!` and type assertion around it. */
function unwrap(expression) {
  let node = expression;
  while (
    node?.type === 'TSAsExpression' ||
    node?.type === 'TSSatisfiesExpression' ||
    node?.type === 'TSNonNullExpression' ||
    node?.type === 'TSTypeAssertion'
  )
    node = node.expression;
  return node;
}

/** The string a literal key holds: `'Input'` or `` `Input` `` without expressions. */
function literalKey(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  return undefined;
}

const isSplit = (rename) => typeof rename.prop === 'string' && Boolean(rename.values);

/** The parts of a split and the values that choose them: `Pager.Previous for direction="previous"`. */
function describeSplit(rename, prefix = '') {
  return Object.entries(rename.values)
    .map(([value, part]) => `${prefix}${part} for ${rename.prop}="${value}"`)
    .join(' or ');
}

/** The import bindings that the replacements of a name need. */
const importsOf = (targets) =>
  [...new Set(targets.map((target) => target.split('.')[0]))].join(', ');

const noHint = 'If you need what it did, propose it as public envUI API rather than copying it.';

/** Functions that create an element from a component, as createElement and the JSX runtime do. */
const elementFactories = new Set(['createElement', 'jsx', 'jsxs', 'jsxDEV']);

/** Whether a call creates an element: createElement(…), React.createElement(…) or jsx(…). */
function isElementFactory(call) {
  const { callee } = call;
  const name =
    callee.type === 'Identifier'
      ? callee.name
      : callee.type === 'MemberExpression' && !callee.computed
        ? callee.property.name
        : undefined;
  return elementFactories.has(name);
}

/** A static string prop of createElement's props object, by name. */
const objectProp = (object) => (name) => {
  if (object?.type !== 'ObjectExpression') return undefined;
  const property = object.properties.find(
    (entry) =>
      entry.type === 'Property' &&
      !entry.computed &&
      (entry.key.type === 'Identifier' ? entry.key.name : entry.key.value) === name,
  );
  const value = property?.value;
  return value?.type === 'Literal' && typeof value.value === 'string' ? value.value : undefined;
};

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow names that envUI 0.x exported and 1.0 renamed or made internal',
      recommended: true,
      url: documentationUrl('no-renamed-exports'),
    },
    schema: [],
    messages: {
      renamed:
        "{{name}} is not exported by envUI 1.0: use {{replacement}} instead (import { {{imports}} } from '{{source}}'). The v1-names codemod in @envsemble/envui-codemods rewrites the old names.",
      split:
        "{{name}} is not exported by envUI 1.0: use {{choices}} instead, without the {{prop}} prop (import { {{imports}} } from '{{source}}'). The v1-names codemod in @envsemble/envui-codemods rewrites the old names.",
      splitElement:
        '<{{local}} {{prop}}="{{value}}"> is {{part}} in envUI 1.0: render <{{part}}> without the {{prop}} prop.',
      splitDynamic:
        '<{{local}}> is one of several parts in envUI 1.0, chosen by its {{prop}}: render {{choices}}, without the {{prop}} prop.',
      internal: '{{name}} is internal in envUI 1.0 and no longer exported. {{use}}',
      namespace:
        'In envUI 1.0 {{name}} is a namespace of parts, not a component: render <{{root}}> instead, and its other parts as {{local}}.*.',
      reusedNamespace:
        'In envUI 1.0 {{name}} is a namespace, not the 0.x component, which is internal. {{use}}',
    },
  },
  create(context) {
    const { sourceCode } = context;
    /** Variables bound to an envUI entry point's module object, with its source. */
    const namespaceVariables = new Map();
    /** Variables bound to a name that changed (Menu, DirectionLink, Toast), with its entry. */
    const changedVariables = new Map();

    const resolve = (node, name) => resolveVariable(sourceCode, node, name);

    /** The variable that a declaration binds to an identifier. */
    const declared = (declaration, identifier) =>
      sourceCode
        .getDeclaredVariables(declaration)
        .find((variable) => variable.name === identifier.name);

    /**
     * The envUI entry point a module object identifier stands for where it is used, if any, also
     * through `as`, `satisfies` and `!`: `(envui as any).Input`.
     */
    const namespaceOf = (node) => {
      const object = unwrap(node);
      return object?.type === 'Identifier' || object?.type === 'JSXIdentifier'
        ? namespaceVariables.get(resolve(object, object.name))
        : undefined;
    };

    /** The literal source of `import('…')` or `require('…')`, when it names an envUI entry point. */
    function moduleSource(node) {
      const call = node?.type === 'AwaitExpression' ? node.argument : node;
      let argument;
      if (call?.type === 'ImportExpression') argument = call.source;
      else if (
        call?.type === 'CallExpression' &&
        call.callee.type === 'Identifier' &&
        call.callee.name === 'require' &&
        call.arguments.length === 1
      )
        [argument] = call.arguments;
      const value =
        argument?.type === 'Literal'
          ? argument.value
          : argument?.type === 'TemplateLiteral' && argument.expressions.length === 0
            ? argument.quasis[0].value.cooked
            : undefined;
      return typeof value === 'string' && Object.hasOwn(modules, value) ? value : undefined;
    }

    function reportName(node, source, name, rename) {
      if (rename.to.length === 0) {
        context.report({ node, messageId: 'internal', data: { name, use: rename.use ?? noHint } });
        return;
      }
      if (isSplit(rename)) {
        context.report({
          node,
          messageId: 'split',
          data: {
            name,
            source,
            prop: rename.prop,
            choices: describeSplit(rename),
            imports: importsOf(rename.to),
          },
        });
        return;
      }
      context.report({
        node,
        messageId: 'renamed',
        data: { name, source, replacement: rename.to.join(' or '), imports: importsOf(rename.to) },
      });
    }

    /**
     * Reports one name taken from an entry point, by import, destructuring or re-export, and
     * remembers the variable it binds when later uses decide: a namespace rendered as a component,
     * or a split, whose rendered elements are told their part.
     */
    function bindName(node, source, name, variable) {
      const rename = renameOf(source, name);
      if (rename === undefined) return;
      if (variable && (isNamespace(name, rename) || isSplit(rename)))
        changedVariables.set(variable, { name, rename });
      if (!isNamespace(name, rename)) reportName(node, source, name, rename);
    }

    /**
     * Binds what a pattern takes from an entry point's module object: the whole object, as in
     * `const envui = require(…)`, or names, as in `const { Input } = await import(…)`. A pattern
     * that declares takes its `declaration`; one that assigns, as in `({ Input } = envui)`, binds
     * the variables its names resolve to.
     */
    function bindModule(pattern, source, declaration) {
      const variableOf = (identifier) =>
        declaration ? declared(declaration, identifier) : resolve(identifier, identifier.name);
      if (pattern?.type === 'Identifier') {
        const variable = variableOf(pattern);
        if (variable) namespaceVariables.set(variable, source);
        return;
      }
      if (pattern?.type !== 'ObjectPattern') return;
      for (const property of pattern.properties) {
        if (property.type !== 'Property') continue;
        // `{ Input }`, `{ 'Input': field }` and `{ ['Input']: field }`.
        const name = property.computed
          ? literalKey(property.key)
          : property.key.type === 'Identifier'
            ? property.key.name
            : String(property.key.value);
        if (name === undefined) continue;
        const local =
          property.value.type === 'AssignmentPattern' ? property.value.left : property.value;
        const variable = local.type === 'Identifier' ? variableOf(local) : undefined;
        bindName(property.key, source, name, variable);
      }
    }

    /**
     * Reports a rendered element of a name that changed, given how to read its static props: the
     * part a split's prop chooses, the Root part of a namespace, or what to use instead of the
     * component whose name 1.0 reuses.
     */
    function reportElement(node, local, { name, rename }, propValue, prefix = '') {
      if (isSplit(rename)) {
        const value = propValue(rename.prop);
        const part = typeof value === 'string' ? rename.values[value] : undefined;
        if (part)
          context.report({
            node,
            messageId: 'splitElement',
            data: { local, prop: rename.prop, value, part: `${prefix}${part}` },
          });
        else
          context.report({
            node,
            messageId: 'splitDynamic',
            data: { local, prop: rename.prop, choices: describeSplit(rename, prefix) },
          });
        return;
      }
      if (rename.namespace) {
        context.report({
          node,
          messageId: 'reusedNamespace',
          data: { name, use: rename.use ?? noHint },
        });
        return;
      }
      context.report({
        node,
        messageId: 'namespace',
        data: { name, local, root: `${local}${rename.to[0].slice(name.length)}` },
      });
    }

    /**
     * Checks a name read from an entry point's module object, as in envui.Input or <envui.Menu>;
     * `propValue` reads the static props of a rendered name.
     */
    function checkMember(node, source, local, name, propValue) {
      const rename = renameOf(source, name);
      if (rename === undefined) return;
      if (propValue && (isNamespace(name, rename) || isSplit(rename)))
        reportElement(node, `${local}.${name}`, { name, rename }, propValue, `${local}.`);
      else if (!isNamespace(name, rename)) reportName(node, source, name, rename);
    }

    /**
     * Checks what is rendered, a JSX element's name or createElement's first argument: a changed
     * name bound to an import or a destructuring, or a member of a module object.
     */
    function checkComponent(node, propValue) {
      if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
        const binding = changedVariables.get(resolve(node, node.name));
        if (binding) reportElement(node, node.name, binding, propValue);
        return;
      }
      // <envui.Menu>, createElement(envui.Menu) and createElement(envui['Menu']).
      const name =
        node.type === 'JSXMemberExpression'
          ? node.property.name
          : node.type === 'MemberExpression'
            ? memberName(node)
            : undefined;
      const source = name === undefined ? undefined : namespaceOf(node.object);
      if (source) checkMember(node, source, unwrap(node.object).name, name, propValue);
    }

    /** The name a member reads: `Input` in `envui.Input` and `envui['Input']`. */
    function memberName(node) {
      if (!node.computed)
        return node.property.type === 'Identifier' ? node.property.name : undefined;
      return literalKey(node.property);
    }

    return {
      Program(program) {
        // Imports bind before any code runs, so they are read first, wherever they are written.
        for (const node of program.body) {
          if (node.type !== 'ImportDeclaration') continue;
          const source = node.source.value;
          if (!Object.hasOwn(modules, source)) continue;
          for (const specifier of node.specifiers) {
            const variable = declared(specifier, specifier.local);
            if (specifier.type === 'ImportNamespaceSpecifier') {
              if (variable) namespaceVariables.set(variable, source);
            } else if (specifier.type === 'ImportSpecifier')
              bindName(specifier, source, moduleExportName(specifier.imported), variable);
          }
        }
        // import envui = require('@envsemble/envui') in TypeScript binds the module object too.
        for (const node of program.body) {
          const declaration = node.type === 'ExportNamedDeclaration' ? node.declaration : node;
          if (declaration?.type !== 'TSImportEqualsDeclaration') continue;
          const reference = declaration.moduleReference;
          const source =
            reference.type === 'TSExternalModuleReference' ? reference.expression.value : undefined;
          if (typeof source !== 'string' || !Object.hasOwn(modules, source)) continue;
          const variable = declared(declaration, declaration.id);
          if (variable) namespaceVariables.set(variable, source);
        }
      },
      ExportNamedDeclaration(node) {
        const source = node.source?.value;
        if (typeof source !== 'string' || !Object.hasOwn(modules, source)) return;
        for (const specifier of node.specifiers)
          bindName(specifier, source, moduleExportName(specifier.local), undefined);
      },
      VariableDeclarator(node) {
        // const envui = require('@envsemble/envui'), const { Input } = await import('…'), and
        // const { Input } = envui, from a module object bound before.
        if (!node.init) return;
        const source = moduleSource(node.init) ?? namespaceOf(node.init);
        if (source) bindModule(node.id, source, node);
      },
      AssignmentExpression(node) {
        // ({ Input } = require('@envsemble/envui')) and envui = await import('…').
        if (node.operator !== '=') return;
        const source = moduleSource(node.right) ?? namespaceOf(node.right);
        if (source) bindModule(node.left, source, undefined);
      },
      CallExpression(node) {
        const { callee } = node;
        // import('@envsemble/envui').then((envui) => …), also with .then(({ Input }) => …).
        if (
          callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'then'
        ) {
          const source = moduleSource(callee.object);
          const [callback] = node.arguments;
          if (
            source &&
            (callback?.type === 'ArrowFunctionExpression' ||
              callback?.type === 'FunctionExpression')
          )
            bindModule(callback.params[0], source, callback);
        }
        // createElement(Menu), React.createElement(envui.Menu) and the JSX runtime's jsx(Toast).
        if (isElementFactory(node) && node.arguments[0])
          checkComponent(node.arguments[0], objectProp(node.arguments[1]));
      },
      JSXOpeningElement(node) {
        const propValue = (name) => {
          const attribute = findAttribute(node, name);
          return attribute && staticValue(attribute);
        };
        if (node.name.type === 'JSXIdentifier' || node.name.object?.type === 'JSXIdentifier')
          checkComponent(node.name, propValue);
      },
      MemberExpression(node) {
        const name = memberName(node);
        if (name === undefined) return;
        // A member that is rendered is checked as a component, above.
        const { parent } = node;
        if (
          parent.type === 'CallExpression' &&
          parent.arguments[0] === node &&
          isElementFactory(parent)
        )
          return;
        // envui.Input and (envui as any).Input, and require('@envsemble/envui').Input or
        // (await import('…')).Input.
        const object = unwrap(node.object);
        const local = object?.type === 'Identifier' ? object.name : undefined;
        const source = local ? namespaceOf(object) : moduleSource(node.object);
        if (source) checkMember(node, source, local ?? 'envui', name, undefined);
      },
      TSQualifiedName(node) {
        const source = node.left.type === 'Identifier' ? namespaceOf(node.left) : undefined;
        if (source) checkMember(node, source, node.left.name, node.right.name, undefined);
      },
      TSIndexedAccessType(node) {
        // (typeof envui)['InputProps'] and (typeof envui)['Input'].
        const { objectType, indexType } = node;
        if (objectType.type !== 'TSTypeQuery' || objectType.exprName.type !== 'Identifier') return;
        const source = namespaceOf(objectType.exprName);
        const name = indexType.type === 'TSLiteralType' ? literalKey(indexType.literal) : undefined;
        if (source && name !== undefined)
          checkMember(node, source, objectType.exprName.name, name, undefined);
      },
      TSImportType(node) {
        // import('@envsemble/envui').InputProps, and typeof import('@envsemble/envui').Menu.
        const source = node.argument?.literal?.value;
        if (typeof source !== 'string' || !Object.hasOwn(modules, source)) return;
        let name = node.qualifier;
        while (name?.type === 'TSQualifiedName') name = name.left;
        if (name?.type === 'Identifier') checkMember(name, source, 'envui', name.name, undefined);
      },
    };
  },
};
