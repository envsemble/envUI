import {
  documentationUrl,
  findAttribute,
  moduleExportName,
  readData,
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
    /** Local names of `import * as envui` namespaces, with their sources. */
    const namespaceImports = new Map();
    /** Local bindings of names that are namespaces in 1.0, such as Menu, with their entries. */
    const namespaceBindings = new Map();
    /** Local bindings of split names, such as DirectionLink, with their entries. */
    const splitBindings = new Map();

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
     * Reports a rendered element of a name that changed: the part a split's prop chooses, the Root
     * part of a namespace, or what to use instead of a component whose name 1.0 reuses.
     */
    function reportElement(opening, local, name, rename, prefix = '') {
      const element = opening.name;
      if (isSplit(rename)) {
        const attribute = findAttribute(opening, rename.prop);
        const value = attribute && staticValue(attribute);
        const part = typeof value === 'string' ? rename.values[value] : undefined;
        if (part)
          context.report({
            node: element,
            messageId: 'splitElement',
            data: { local, prop: rename.prop, value, part: `${prefix}${part}` },
          });
        else
          context.report({
            node: element,
            messageId: 'splitDynamic',
            data: { local, prop: rename.prop, choices: describeSplit(rename, prefix) },
          });
        return;
      }
      if (rename.namespace) {
        context.report({
          node: element,
          messageId: 'reusedNamespace',
          data: { name, use: rename.use ?? noHint },
        });
        return;
      }
      context.report({
        node: element,
        messageId: 'namespace',
        data: { name, local, root: `${local}${rename.to[0].slice(name.length)}` },
      });
    }

    /** Checks a name read from a namespace import, as in envui.Input or <envui.Menu>. */
    function checkMember(node, namespace, name, opening) {
      const source = namespaceImports.get(namespace);
      const rename = renameOf(source, name);
      if (rename === undefined) return;
      if (opening && (isNamespace(name, rename) || isSplit(rename)))
        reportElement(opening, `${namespace}.${name}`, name, rename, `${namespace}.`);
      else if (!isNamespace(name, rename)) reportName(node, source, name, rename);
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (!Object.hasOwn(modules, source)) return;
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            namespaceImports.set(specifier.local.name, source);
            continue;
          }
          if (specifier.type !== 'ImportSpecifier') continue;
          const name = moduleExportName(specifier.imported);
          const rename = renameOf(source, name);
          if (rename === undefined) continue;
          if (isNamespace(name, rename)) {
            namespaceBindings.set(specifier.local.name, { name, rename });
            continue;
          }
          if (isSplit(rename)) splitBindings.set(specifier.local.name, { name, rename });
          reportName(specifier, source, name, rename);
        }
      },
      ExportNamedDeclaration(node) {
        const source = node.source?.value;
        if (typeof source !== 'string' || !Object.hasOwn(modules, source)) return;
        for (const specifier of node.specifiers) {
          const name = moduleExportName(specifier.local);
          const rename = renameOf(source, name);
          if (rename !== undefined && !isNamespace(name, rename))
            reportName(specifier, source, name, rename);
        }
      },
      JSXOpeningElement(node) {
        const element = node.name;
        if (element.type === 'JSXIdentifier') {
          const binding =
            namespaceBindings.get(element.name) ?? splitBindings.get(element.name) ?? undefined;
          if (binding) reportElement(node, element.name, binding.name, binding.rename);
        } else if (
          element.type === 'JSXMemberExpression' &&
          element.object.type === 'JSXIdentifier' &&
          namespaceImports.has(element.object.name)
        )
          checkMember(element, element.object.name, element.property.name, node);
      },
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          namespaceImports.has(node.object.name) &&
          !node.computed &&
          node.property.type === 'Identifier'
        )
          checkMember(node, node.object.name, node.property.name, undefined);
      },
      TSQualifiedName(node) {
        if (node.left.type === 'Identifier' && namespaceImports.has(node.left.name))
          checkMember(node, node.left.name, node.right.name, undefined);
      },
    };
  },
};
