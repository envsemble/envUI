import {
  documentationUrl,
  findAttribute,
  isIntrinsic,
  jsxName,
  readData,
  spreadsProps,
  staticValue,
} from '../utilities.js';

const { roles, elements } = readData('elements.json');
const rolesByName = new Map(roles.map((entry) => [entry.role, entry]));
const knownIds = new Set([...roles, ...elements].flatMap((entry) => [entry.id, entry.element]));
knownIds.delete(undefined);
knownIds.delete('*');

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
        "Use envUI's {{use}} instead of {{found}}{{alternatives}}: import { {{imports}} } from '@envsemble/envui'.{{note}} If envUI can't do what you need, propose an addition to envUI instead of a local copy.",
    },
  },
  create(context) {
    const [{ allow, renderProps }] = context.options;
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
          note: entry.note ? ` ${entry.note}` : '',
        },
      });
    }

    return {
      JSXOpeningElement(node) {
        if (isDecoy(node)) return;
        const name = jsxName(node.name);
        const roleAttribute = findAttribute(node, 'role');
        const role = roleAttribute && staticValue(roleAttribute);
        const roleEntry =
          typeof role === 'string'
            ? rolesByName.get(role.trim().split(/\s+/)[0].toLowerCase())
            : null;
        if (roleEntry) {
          // An element that is one of the suggested components, such as <Menu.Root role="menu">.
          if (isAllowed(roleEntry) || bindings(roleEntry).includes(name.split('.')[0])) return;
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
        report(node, entry, describeElement(entry, node, name));
      },
    };
  },
};
