import {
  documentationUrl,
  findAttribute,
  importedComponent,
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

const { roles, elements } = readData('elements.json');
const rolesByName = new Map(roles.map((entry) => [entry.role, entry]));
const knownIds = new Set([...roles, ...elements].flatMap((entry) => [entry.id, entry.element]));
knownIds.delete(undefined);
knownIds.delete('*');

/**
 * The envUI components that render a role themselves, so that the role on one refines its own:
 * the entry's owners and the components it suggests.
 */
function ownersOf(entry) {
  return new Set([...(entry.owners ?? []), ...entry.use.map(({ component }) => component)]);
}

/**
 * The envUI entry points that export components. The others export icons, assets and a script,
 * which are not components whatever their local name.
 */
const componentEntryPoints = new Set([
  '@envsemble/envui',
  '@envsemble/envui/content',
  '@envsemble/envui/diff',
  '@envsemble/envui/color',
  '@envsemble/envui/rich-text',
]);

/** The bindings an entry imports: its own list, or the namespaces of the components it uses. */
function bindings(entry) {
  return entry.import ?? [...new Set(entry.use.map(({ component }) => component.split('.')[0]))];
}

/** Whether a static attribute value meets one item of a value list, `prefix*` matching a prefix. */
function valueMatches(value, item) {
  if (item === null) return false;
  const text = String(value).toLowerCase();
  const expected = item.toLowerCase();
  return expected.endsWith('*') ? text.startsWith(expected.slice(0, -1)) : text === expected;
}

/** Whether an element meets an entry's attribute conditions; see the comment in elements.json. */
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

/** An element hidden from assistive technology and out of the tab order is not a control. */
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

/**
 * The entry that a link adapter, the component LinkProvider renders for envUI's destinations,
 * renders itself: it receives native anchor props and draws the anchor, so envUI's Link, which
 * would render the adapter again, cannot replace it.
 */
const adapterEntry = 'a[href]';

/** Whether a type annotation names envUI's LinkComponentProps, as an adapter's props are typed. */
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

/**
 * Whether a function's props are typed as LinkComponentProps: `({ href }: LinkComponentProps)`,
 * `const RouterLink: ComponentType<LinkComponentProps> = …` or `forwardRef<…, LinkComponentProps>(…)`.
 */
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

/** How the message names what was found, such as `a raw <input type="email">`. */
function describeElement(entry, element, tag) {
  if (entry.describe) return entry.describe.replace('{tag}', tag);
  if (tag !== 'input') return `a raw <${tag}>`;
  const type = findAttribute(element, 'type');
  if (type === undefined) return 'a raw <input>';
  const value = staticValue(type);
  return value === undefined ? 'a raw <input type={…}>' : `a raw <input type="${value}">`;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow raw HTML elements and widget roles that envUI already provides as components',
      recommended: true,
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
        "Use envUI's {{use}} instead of {{found}}{{alternatives}}: import { {{imports}} } from '{{source}}'.{{note}} If envUI can't do what you need, propose an addition to envUI instead of a local copy.",
    },
  },
  create(context) {
    const [{ allow, renderProps }] = context.options;
    const { sourceCode } = context;
    const { isReexportModule } = pluginSettings(context);
    /** Whether names from a module are envUI's: an entry point, or a module that re-exports one. */
    const isEnvuiSource = (source) => componentEntryPoints.has(source) || isReexportModule(source);
    const unknown = allow.filter((id) => !knownIds.has(id));
    if (unknown.length > 0)
      throw new Error(
        `envui/no-html-elements: unknown allow ${unknown.length === 1 ? 'entry' : 'entries'} ${unknown.map((id) => `"${id}"`).join(', ')}. Known entries: ${[...knownIds].join(', ')}.`,
      );
    const allowed = new Set(allow);
    const isAllowed = (entry) => allowed.has(entry.id) || allowed.has(entry.element);
    const insideRenderProp = (node) =>
      context.sourceCode
        .getAncestors(node)
        .some(
          (ancestor) =>
            ancestor.type === 'JSXAttribute' && renderProps.includes(jsxName(ancestor.name)),
        );

    function report(node, entry, found) {
      const [primary, ...alternatives] = entry.use;
      context.report({
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

    /** The functions that LinkProvider elements in this file render as their link component. */
    const adapters = new Set();
    /** Raw anchors inside functions, decided at the end, once every LinkProvider is known. */
    const anchors = [];

    /** The expressions a variable is set to where it is declared, and its function declarations. */
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

    /**
     * The expressions a member such as `adapters.link` or `config.adapters['link']` stands for: the
     * values of that property in the object literals its object stands for.
     */
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

    /** The object literals an expression stands for, through variables and members. */
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

    /** The functions an expression stands for: itself, a wrapped one, a variable's or a member's. */
    function functionsOf(expression, seen = new Set()) {
      const node = unwrapExpression(expression);
      if (!node || seen.has(node)) return [];
      seen.add(node);
      if (isFunction(node)) return [node];
      // memo(forwardRef(function RouterLink(…) {…}))
      if (node.type === 'CallExpression')
        return node.arguments.flatMap((argument) => functionsOf(argument, seen));
      if (node.type === 'Identifier')
        return valuesOf(node).flatMap((value) => functionsOf(value, seen));
      // component={adapters.link}
      if (node.type === 'MemberExpression')
        return membersOf(node, seen).flatMap((value) => functionsOf(value, seen));
      // component={external ? ExternalLink : RouterLink} and component={custom ?? RouterLink}:
      // either may be rendered, so each is an adapter.
      if (node.type === 'ConditionalExpression')
        return [node.consequent, node.alternate].flatMap((branch) => functionsOf(branch, seen));
      if (node.type === 'LogicalExpression')
        return [node.left, node.right].flatMap((side) => functionsOf(side, seen));
      return [];
    }

    const isAdapter = (fn) => adapters.has(fn) || hasLinkComponentProps(fn, sourceCode.visitorKeys);

    /**
     * Whether a component element renders a role itself, so that a role on it refines its own: an
     * envUI component of the role's owners, by the name its entry point, or a module listed in
     * `settings.envui.reexportModules`, exports when it is imported, or by its written name when
     * nothing in the file declares it, as in `<Menu.Root role="menu">` without its import.
     */
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
        // An envUI component that renders the role itself, such as <Popover role="dialog">, refines
        // its own; on any other, such as <Surface role="dialog"> or another library's Dialog, the
        // role hand-rolls the widget.
        if (roleEntry && !isIntrinsic(node.name) && ownsRole(node, roleEntry)) return;
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
              (candidate.element === '*' && !candidate.except.includes(name))) &&
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
