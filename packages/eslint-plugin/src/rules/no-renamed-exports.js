import { documentationUrl, moduleExportName, readData } from '../utilities.js';

const { modules } = readData('renames.json');

/** The 1.0 replacements of a name an entry point no longer exports, if it is one. */
function replacements(source, name) {
  if (!Object.hasOwn(modules, source)) return undefined;
  return Object.hasOwn(modules[source], name) ? modules[source][name] : undefined;
}

/** Whether a name became the Root part of its own namespace, as Menu became Menu.Root. */
function becameNamespace(name, targets) {
  return targets.length === 1 && targets[0].startsWith(`${name}.`);
}

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
      internal:
        '{{name}} is internal in envUI 1.0 and no longer exported. If you need what it did, propose it as public envUI API rather than copying it.',
      namespace:
        'In envUI 1.0 {{name}} is a namespace of parts, not a component: render <{{root}}> instead, and its other parts as {{local}}.*.',
    },
  },
  create(context) {
    /** Local names of `import * as envui` namespaces, with their sources. */
    const namespaceImports = new Map();
    /** Local bindings of names that became namespaces, such as Menu, with their Root part. */
    const namespaceBindings = new Map();

    function reportName(node, source, name, targets) {
      if (targets.length === 0) {
        context.report({ node, messageId: 'internal', data: { name } });
        return;
      }
      context.report({
        node,
        messageId: 'renamed',
        data: {
          name,
          source,
          replacement: targets.join(' or '),
          imports: [...new Set(targets.map((target) => target.split('.')[0]))].join(', '),
        },
      });
    }

    /** Checks a name read from a namespace import, as in envui.Input or <envui.Menu>. */
    function checkMember(node, namespace, name, rendered) {
      const source = namespaceImports.get(namespace);
      const targets = replacements(source, name);
      if (targets === undefined) return;
      if (!becameNamespace(name, targets)) reportName(node, source, name, targets);
      else if (rendered)
        context.report({
          node,
          messageId: 'namespace',
          data: {
            name,
            local: `${namespace}.${name}`,
            root: `${namespace}.${name}${targets[0].slice(name.length)}`,
          },
        });
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
          const targets = replacements(source, name);
          if (targets === undefined) continue;
          if (becameNamespace(name, targets))
            namespaceBindings.set(specifier.local.name, { name, root: targets[0] });
          else reportName(specifier, source, name, targets);
        }
      },
      ExportNamedDeclaration(node) {
        const source = node.source?.value;
        if (typeof source !== 'string' || !Object.hasOwn(modules, source)) return;
        for (const specifier of node.specifiers) {
          const name = moduleExportName(specifier.local);
          const targets = replacements(source, name);
          if (targets !== undefined && !becameNamespace(name, targets))
            reportName(specifier, source, name, targets);
        }
      },
      JSXOpeningElement(node) {
        const element = node.name;
        if (element.type === 'JSXIdentifier' && namespaceBindings.has(element.name)) {
          const { name, root } = namespaceBindings.get(element.name);
          context.report({
            node: element,
            messageId: 'namespace',
            data: { name, local: element.name, root: `${element.name}${root.slice(name.length)}` },
          });
        } else if (
          element.type === 'JSXMemberExpression' &&
          element.object.type === 'JSXIdentifier' &&
          namespaceImports.has(element.object.name)
        )
          checkMember(element, element.object.name, element.property.name, true);
      },
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          namespaceImports.has(node.object.name) &&
          !node.computed &&
          node.property.type === 'Identifier'
        )
          checkMember(node, node.object.name, node.property.name, false);
      },
      TSQualifiedName(node) {
        if (node.left.type === 'Identifier' && namespaceImports.has(node.left.name))
          checkMember(node, node.left.name, node.right.name, false);
      },
    };
  },
};
