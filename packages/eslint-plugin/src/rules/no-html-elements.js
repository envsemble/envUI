import {
  documentationUrl,
  findAttribute,
  importedComponent,
  insideAttribute,
  isFunction,
  isIntrinsic,
  jsxName,
  moduleExportName,
  pluginSettings,
  readData,
  resolveVariable,
  spreadsProps,
  staticValue,
  unwrapExpression,
  walk,
} from '../utilities.js';

/** @typedef {{ component: string, when?: string }} Suggestion */

/** @typedef {boolean | (string | null)[]} AttributeCondition */

/**
 * @typedef {object} Entry
 * @property {string} id What the rule's `allow` option names the entry by.
 * @property {string} [role] The role a `role` attribute names, on any JSX element.
 * @property {string[]} [owners] The envUI components that render the role themselves.
 * @property {string} [element] The element's tag, or `*` for any element but those of `except`.
 * @property {string[]} [except] For `*`, the tags it leaves.
 * @property {Record<string, AttributeCondition>} [attributes] What the element's attributes must meet.
 * @property {Suggestion[] | null} use The component to render and its alternatives; null lets the element pass.
 * @property {string[]} [import] The bindings to import, by default the namespaces of `use`.
 * @property {string} [from] The entry point they come from, by default `@envsemble/envui`.
 * @property {string} [describe] How the message names what was found, `{tag}` standing for its tag.
 * @property {string} [note] A sentence the message adds.
 */

/** @type {{ roles: Entry[], elements: Entry[] }} */
const { roles, elements } = readData('elements.json');
const rolesByName = new Map(roles.map((entry) => [entry.role, entry]));
const knownIds = new Set([...roles, ...elements].flatMap((entry) => [entry.id, entry.element]));
knownIds.delete(undefined);
knownIds.delete('*');

function ownersOf(entry) {
  return new Set([...(entry.owners ?? []), ...entry.use.map(({ component }) => component)]);
}

const entryPoints = new Set(readData('entryPoints.json').entryPoints);

function bindings(entry) {
  return entry.import ?? [...new Set(entry.use.map(({ component }) => component.split('.')[0]))];
}

function valueMatches(value, item) {
  if (item === null) return false;
  const text = String(value).toLowerCase();
  const expected = item.toLowerCase();
  return expected.endsWith('*') ? text.startsWith(expected.slice(0, -1)) : text === expected;
}

function attributesMatch(element, conditions = {}) {
  const spreads = spreadsProps(element);
  return Object.entries(conditions).every(([name, condition]) => {
    const attribute = findAttribute(element, name);
    if (condition === true) return attribute !== undefined;
    if (condition === false) return attribute === undefined && !spreads;
    if (attribute === undefined) return condition.includes(null) && !spreads;
    const value = staticValue(attribute);
    return value !== undefined && condition.some((item) => valueMatches(value, item));
  });
}

function isDecoy(element) {
  const hidden = findAttribute(element, 'aria-hidden');
  const tabIndex = findAttribute(element, 'tabIndex');
  const hiddenValue = hidden && staticValue(hidden);
  return (
    (hiddenValue === true || hiddenValue === 'true') &&
    tabIndex !== undefined &&
    Number(staticValue(tabIndex)) === -1
  );
}

const adapterEntry = 'a[href]';

function namesLinkComponentProps(annotation, visitorKeys) {
  let found = false;
  walk(annotation, visitorKeys, (node) => {
    if (found) return false;
    if (node.type === 'TSTypeReference') {
      const { typeName } = node;
      const name = typeName.type === 'TSQualifiedName' ? typeName.right.name : typeName.name;
      found = name === 'LinkComponentProps';
    }
    return !found;
  });
  return found;
}

function hasLinkComponentProps(fn, visitorKeys) {
  const [props] = fn.params;
  const annotation = props?.typeAnnotation ?? props?.left?.typeAnnotation;
  if (annotation && namesLinkComponentProps(annotation, visitorKeys)) return true;
  let holder = fn.parent;
  while (holder?.type === 'CallExpression') {
    const typeArguments = holder.typeArguments ?? holder.typeParameters;
    if (typeArguments && namesLinkComponentProps(typeArguments, visitorKeys)) return true;
    holder = holder.parent;
  }
  return (
    holder?.type === 'VariableDeclarator' &&
    Boolean(holder.id.typeAnnotation) &&
    namesLinkComponentProps(holder.id.typeAnnotation, visitorKeys)
  );
}

function describeElement(entry, element, tag) {
  if (entry.describe) return entry.describe.replace('{tag}', tag);
  if (tag !== 'input') return `a raw <${tag}>`;
  const type = findAttribute(element, 'type');
  if (type === undefined) return 'a raw <input>';
  const value = staticValue(type);
  return value === undefined ? 'a raw <input type={…}>' : `a raw <input type="${value}">`;
}

const buttonEntry = 'button';

const passedThrough =
  /^(?:aria-[\w-]+|data-[\w-]+|on[A-Z]\w*|id|key|ref|name|value|form|formAction|formMethod|formNoValidate|formTarget|formEncType|title|disabled|type|tabIndex|autoFocus)$/;

const isBaseUi = (source) =>
  typeof source === 'string' && /^@base-ui(?:-components)?\/react(?:\/|$)/.test(source);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Disallow raw HTML elements and widget roles that envUI already provides as components',
      recommended: false,
      url: documentationUrl('no-html-elements'),
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            description: 'Entries of the mapping table to allow, by id or element name.',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
          renderProps: {
            description: 'Props whose value an envUI or Base UI part renders in place of its own.',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ allow: [], renderProps: ['render'] }],
    messages: {
      useComponent:
        "Use envUI's {{use}} instead of {{found}}{{alternatives}}: import { {{imports}} } from '{{source}}'.{{note}}",
    },
  },
  create(context) {
    const [{ allow, renderProps }] = context.options;
    const { sourceCode } = context;
    const { isReexportModule } = pluginSettings(context);
    const isEnvuiSource = (source) => entryPoints.has(source) || isReexportModule(source);
    const unknown = allow.filter((id) => !knownIds.has(id));
    if (unknown.length > 0)
      throw new Error(
        `envui/no-html-elements: unknown allow ${unknown.length === 1 ? 'entry' : 'entries'} ${unknown.map((id) => `"${id}"`).join(', ')}. Known entries: ${[...knownIds].join(', ')}.`,
      );
    const allowed = new Set(allow);
    const isAllowed = (entry) => allowed.has(entry.id) || allowed.has(entry.element);
    const insideRenderProp = (node) =>
      insideAttribute(sourceCode, node, (name) => renderProps.includes(name));

    function report(node, entry, found) {
      const [primary, ...alternatives] = entry.use;
      const fix = entry.id === buttonEntry ? buttonFix(node) : undefined;
      context.report({
        ...(fix ? { fix } : {}),
        node: node.name,
        messageId: 'useComponent',
        data: {
          use: primary.component,
          found,
          alternatives: alternatives
            .map(({ component, when }) => `, or ${component} ${when}`)
            .join(''),
          imports: bindings(entry).join(', '),
          source: entry.from ?? '@envsemble/envui',
          note: entry.note ? ` ${entry.note}` : '',
        },
      });
    }

    function buttonFix(node) {
      const element = node.parent;
      if (!element.closingElement || spreadsProps(node)) return undefined;
      if (!node.attributes.every((attribute) => passedThrough.test(jsxName(attribute.name))))
        return undefined;
      const type = findAttribute(node, 'type');
      if (!type || !['button', 'submit', 'reset'].includes(String(staticValue(type))))
        return undefined;
      const labelled = element.children.some(
        (child) => child.type === 'JSXText' && child.value.trim() !== '',
      );
      if (!labelled) return undefined;
      const bound = resolveVariable(sourceCode, node, 'Button');
      const envuiButton = (definition) =>
        definition.type === 'ImportBinding' &&
        definition.node.type === 'ImportSpecifier' &&
        moduleExportName(definition.node.imported) === 'Button' &&
        isEnvuiSource(definition.parent.source.value);
      if (bound?.defs.length && !bound.defs.every(envuiButton)) return undefined;
      return (fixer) => {
        const fixes = [
          fixer.replaceText(node.name, 'Button'),
          fixer.replaceText(element.closingElement.name, 'Button'),
        ];
        if (bound?.defs.length) return fixes;
        const program = sourceCode.ast;
        const envuiImport = program.body.find(
          (statement) =>
            statement.type === 'ImportDeclaration' &&
            statement.source.value === '@envsemble/envui' &&
            /** @type {{ importKind?: string }} */ (statement).importKind !== 'type' &&
            statement.specifiers.length > 0 &&
            statement.specifiers.every((specifier) => specifier.type === 'ImportSpecifier'),
        );
        if (envuiImport)
          fixes.push(
            fixer.insertTextAfter(/** @type {any} */ (envuiImport).specifiers.at(-1), ', Button'),
          );
        else {
          const first = program.body.find(
            (statement) => !('directive' in statement && statement.directive),
          );
          const line = "import { Button } from '@envsemble/envui';\n";
          fixes.push(
            first ? fixer.insertTextBefore(first, line) : fixer.insertTextAfterRange([0, 0], line),
          );
        }
        return fixes;
      };
    }

    const adapters = new Set();
    const anchors = [];

    function valuesOf(identifier) {
      const variable = resolveVariable(sourceCode, identifier, identifier.name);
      return (variable?.defs ?? []).flatMap((definition) =>
        definition.type === 'FunctionName'
          ? [definition.node]
          : definition.type === 'Variable' && definition.node.init
            ? [definition.node.init]
            : [],
      );
    }

    function membersOf(member, seen) {
      const { property } = member;
      const name = member.computed
        ? property.type === 'Literal'
          ? String(property.value)
          : property.type === 'TemplateLiteral' && property.expressions.length === 0
            ? property.quasis[0].value.cooked
            : undefined
        : property.name;
      if (name === undefined) return [];
      return objectsOf(member.object, seen).flatMap((object) =>
        object.properties
          .filter(
            (candidate) =>
              candidate.type === 'Property' &&
              (candidate.computed ? candidate.key.type === 'Literal' : true) &&
              moduleExportName(candidate.key) === name,
          )
          .map((candidate) => candidate.value),
      );
    }

    function objectsOf(expression, seen) {
      const node = unwrapExpression(expression);
      if (!node || seen.has(node)) return [];
      seen.add(node);
      if (node.type === 'ObjectExpression') return [node];
      if (node.type === 'Identifier')
        return valuesOf(node).flatMap((value) => objectsOf(value, seen));
      if (node.type === 'MemberExpression')
        return membersOf(node, seen).flatMap((value) => objectsOf(value, seen));
      return [];
    }

    function functionsOf(expression, seen = new Set()) {
      const node = unwrapExpression(expression);
      if (!node || seen.has(node)) return [];
      seen.add(node);
      if (isFunction(node)) return [node];
      if (node.type === 'CallExpression')
        return node.arguments.flatMap((argument) => functionsOf(argument, seen));
      if (node.type === 'Identifier')
        return valuesOf(node).flatMap((value) => functionsOf(value, seen));
      if (node.type === 'MemberExpression')
        return membersOf(node, seen).flatMap((value) => functionsOf(value, seen));
      if (node.type === 'ConditionalExpression')
        return [node.consequent, node.alternate].flatMap((branch) => functionsOf(branch, seen));
      if (node.type === 'LogicalExpression')
        return [node.left, node.right].flatMap((side) => functionsOf(side, seen));
      return [];
    }

    const isAdapter = (fn) => adapters.has(fn) || hasLinkComponentProps(fn, sourceCode.visitorKeys);

    function ownsRole(node, entry) {
      const owners = ownersOf(entry);
      const imported = importedComponent(sourceCode, node.name);
      if (!imported) return owners.has(jsxName(node.name));
      return isEnvuiSource(imported.source) && owners.has(imported.name);
    }

    return {
      'Program:exit'() {
        for (const { node, entry, found, functions } of anchors)
          if (!functions.some(isAdapter)) report(node, entry, found);
      },
      JSXOpeningElement(node) {
        if (isDecoy(node)) return;
        const name = jsxName(node.name);
        if (name === 'LinkProvider' || name.endsWith('.LinkProvider')) {
          const component = findAttribute(node, 'component')?.value;
          if (component?.type === 'JSXExpressionContainer')
            for (const fn of functionsOf(component.expression)) adapters.add(fn);
        }
        const roleAttribute = findAttribute(node, 'role');
        const role = roleAttribute && staticValue(roleAttribute);
        const roleEntry =
          typeof role === 'string'
            ? rolesByName.get(role.trim().split(/\s+/)[0].toLowerCase())
            : null;
        if (roleEntry && !isIntrinsic(node.name) && ownsRole(node, roleEntry)) return;
        if (!isIntrinsic(node.name) && isBaseUi(importedComponent(sourceCode, node.name)?.source))
          return;
        if (roleEntry) {
          if (isAllowed(roleEntry)) return;
          if (insideRenderProp(node)) return;
          report(node, roleEntry, `<${name} role="${role}">`);
          return;
        }
        if (!isIntrinsic(node.name)) return;
        const entry = elements.find(
          (candidate) =>
            (candidate.element === name ||
              (candidate.element === '*' && !(candidate.except ?? []).includes(name))) &&
            attributesMatch(node, candidate.attributes),
        );
        if (!entry || entry.use === null || isAllowed(entry) || insideRenderProp(node)) return;
        const found = describeElement(entry, node, name);
        const functions =
          entry.id === adapterEntry ? sourceCode.getAncestors(node).filter(isFunction) : [];
        if (functions.length > 0) anchors.push({ node, entry, found, functions });
        else report(node, entry, found);
      },
    };
  },
};
