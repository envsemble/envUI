import {
  documentationUrl,
  findAttribute,
  importedComponent,
  isFunction,
  jsxName,
  pluginSettings,
  propertyName,
  spreadsProps,
  staticValue,
} from '../utilities.js';

/**
 * The icon packages whose icons envUI's own replace: a source that is one of them, or a path
 * inside one, such as `react-icons/fa`, is reported.
 */
const iconPackages = [
  'lucide-react',
  'react-icons',
  '@heroicons/react',
  '@mui/icons-material',
  '@tabler/icons-react',
  '@phosphor-icons/react',
  'phosphor-react',
];

/** The icon package a module specifier imports from, if it is one of them. */
const iconPackage = (source) =>
  typeof source === 'string'
    ? iconPackages.find((name) => source === name || source.startsWith(`${name}/`))
    : undefined;

/**
 * The sizes that don't fix an svg's size: a length that follows the text, such as envUI's own
 * icons' `1em`, a percentage of its container, `0` for an svg that only holds definitions, and
 * the keywords that leave it to CSS.
 */
const flexibleSize = /^(?:[+-]?(?:\d+\.?\d*|\.\d+)(?:em|ex|ch|cap|ic|lh|%)|0|auto|inherit)$/i;

/** The fills that don't fix an svg's color: the text color, as envUI's own icons have, and none. */
const flexibleFill = new Set(['currentcolor', 'none', 'inherit', 'transparent']);

/** Whether an svg attribute's static value fixes its size or color. */
function isFixed(name, value) {
  const text = String(value).trim();
  return name === 'fill' ? !flexibleFill.has(text.toLowerCase()) : !flexibleSize.test(text);
}

/** How the message writes an attribute: `width="24"`, or `width={24}` for a number. */
const describeAttribute = (name, value) =>
  typeof value === 'number' ? `${name}={${value}}` : `${name}="${value}"`;

/** Whether a style property sets a margin: `margin`, `marginInline`, `margin-left` and the like. */
const isMargin = (name) => typeof name === 'string' && /^margin(?:$|[A-Z-])/.test(name);

/** Whether a style value is a margin of zero, which removes no edge: `0`, `'0'` or `'0px 0'`. */
const isZero = (value) =>
  value?.type === 'Literal' &&
  (value.value === 0 ||
    (typeof value.value === 'string' && /^(?:\s*[+-]?0*\.?0+[a-z%]*)+\s*$/i.test(value.value)));

/**
 * Whether a prop, or an object's property, takes an icon whose slot gives it its size: `icon`, a
 * name that ends in `Icon`, such as Button's `startIcon`, or `start`, as on List.Item, TopBar,
 * PageHeader and Combobox options.
 */
const isIconSlot = (name) =>
  name === 'icon' || name === 'start' || (typeof name === 'string' && /^[a-z]\w*Icon$/.test(name));

/**
 * The expressions an element passes through on its way into the element around it: an expression
 * container, either branch of a condition and either side of a logical expression, as in
 * `{dark ? <svg … /> : <svg … />}` or `{show && <svg … />}`.
 */
const passesThrough = (node) =>
  node.type === 'JSXExpressionContainer' ||
  node.type === 'ConditionalExpression' ||
  node.type === 'LogicalExpression';

/** The name a function component is declared under: its own, or its variable's, through calls. */
function componentName(fn) {
  if (fn.id) return fn.id.name;
  let holder = fn.parent;
  while (holder?.type === 'CallExpression') holder = holder.parent;
  return holder?.type === 'VariableDeclarator' && holder.id.type === 'Identifier'
    ? holder.id.name
    : undefined;
}

/**
 * Whether an svg element is what a function component returns, as its root: from a function
 * whose name, or its variable's, is capitalized, such as `function Mark() { return <svg … />; }`
 * or `const Mark = forwardRef((props, ref) => <svg … />)`.
 */
function isComponentRoot(element) {
  let node = element;
  while (node.parent.type === 'ConditionalExpression' || node.parent.type === 'LogicalExpression')
    node = node.parent;
  let fn;
  if (isFunction(node.parent) && node.parent.body === node) fn = node.parent;
  else if (node.parent.type === 'ReturnStatement') {
    fn = node.parent.parent;
    while (fn && !isFunction(fn)) fn = fn.parent;
  }
  return fn !== undefined && /^[A-Z]/.test(componentName(fn) ?? '');
}

/** What a component's svg is to write instead of a fixed size, color or both, and why. */
const definitionFixes = {
  size: 'write width="1em" height="1em", or leave them out, so it follows its slot or the text',
  color: 'write fill="currentColor", so it takes the text color',
  'size and color':
    'write width="1em" height="1em" fill="currentColor", so it follows its slot or the text and takes the text color',
};

/**
 * Whether an import or export only names types, which render nothing: `import type { … }`, or
 * one whose every specifier is marked `type`, as in `import { type IconProps } from …`.
 */
const isTypeOnly = (node, kind) =>
  node[kind] === 'type' ||
  (node.specifiers.length > 0 && node.specifiers.every((specifier) => specifier[kind] === 'type'));

/** The prop whose value a part renders in place of its own element, as no-html-elements skips. */
const renderProp = 'render';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Disallow raw images, fixed-size SVGs and other icon packages, which envUI's Graphic and icons provide",
      recommended: true,
      url: documentationUrl('no-raw-graphics'),
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            description: 'Icon packages to allow, by name, such as react-icons.',
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ allow: [] }],
    messages: {
      img: 'Use envUI\'s Graphic instead of a raw <img>: import { Graphic } from \'@envsemble/envui\'. Its size comes from envUI\'s steps, not the file\'s: <Graphic src={logo} alt="Acme" size="md" />, or for a photo <Graphic src={photo} alt="…" size="fill" aspect="16/9" fit="cover" />.',
      svg: "A raw <svg {{attributes}}> takes its {{what}} from the file: pass it to an icon slot, such as Button's startIcon, or wrap it in envUI's <Graphic alt=\"\">: import { Graphic } from '@envsemble/envui'.",
      definition: "A component's <svg {{attributes}}> takes its {{what}} from the file: {{fix}}.",
      alt: 'Graphic needs alt: what the picture says, such as the company\'s name, or alt="" when the text beside it says it already.',
      margin:
        "A margin on a Graphic makes up for the file's empty edges: trim the file once with npx envui-graphic <file>, and drop the margin.",
      iconPackage:
        "Use envUI's icons instead of {{source}}: import { IconSearch } from '@envsemble/envui/icons/Search'. For the app's own icons and logos, use Graphic: import { Graphic } from '@envsemble/envui'.",
    },
  },
  create(context) {
    const [{ allow }] = context.options;
    const { sourceCode } = context;
    const { isReexportModule } = pluginSettings(context);
    const unknown = allow.filter((name) => !iconPackages.includes(name));
    if (unknown.length > 0)
      throw new Error(
        `envui/no-raw-graphics: unknown allow ${unknown.length === 1 ? 'entry' : 'entries'} ${unknown.map((name) => `"${name}"`).join(', ')}. Known packages: ${iconPackages.join(', ')}.`,
      );

    /** Reports a module specifier that imports from an icon package that isn't allowed. */
    function checkSource(node) {
      const value =
        node?.type === 'TemplateLiteral' && node.expressions.length === 0
          ? node.quasis[0].value.cooked
          : node?.type === 'Literal'
            ? node.value
            : undefined;
      const name = iconPackage(value);
      if (name && !allow.includes(name))
        context.report({ node, messageId: 'iconPackage', data: { source: value } });
    }

    /**
     * Whether a JSX element is envUI's Graphic: imported as Graphic from `@envsemble/envui` or a
     * module listed in `settings.envui.reexportModules`, under any local name or as a member of a
     * namespace, or written `Graphic` when nothing in the file declares it.
     */
    function isGraphic(name) {
      const imported = importedComponent(sourceCode, name);
      if (!imported) return jsxName(name) === 'Graphic';
      return (
        (imported.source === '@envsemble/envui' || isReexportModule(imported.source)) &&
        imported.name === 'Graphic'
      );
    }

    /** Whether a node sits in a prop that renders it in place of a part's own element. */
    const insideRenderProp = (node) =>
      sourceCode
        .getAncestors(node)
        .some(
          (ancestor) => ancestor.type === 'JSXAttribute' && jsxName(ancestor.name) === renderProp,
        );

    /**
     * Whether an svg sits where its size and color are given to it: in an icon slot, a prop or an
     * object's property, as in `startIcon={<svg … />}` or `{ label, icon: <svg … /> }`, or as a
     * child of a Graphic, also through a condition, as in `<Graphic>{dark ? <svg … /> : …}`.
     */
    function isPlaced(node) {
      let parent = node.parent.parent;
      while (parent && passesThrough(parent)) parent = parent.parent;
      if (parent?.type === 'JSXElement' && isGraphic(parent.openingElement.name)) return true;
      return sourceCode
        .getAncestors(node)
        .some(
          (ancestor) =>
            (ancestor.type === 'JSXAttribute' && isIconSlot(jsxName(ancestor.name))) ||
            (ancestor.type === 'Property' && isIconSlot(propertyName(ancestor))),
        );
    }

    function checkSvg(node) {
      const fixed = ['width', 'height', 'fill'].flatMap((name) => {
        const attribute = findAttribute(node, name);
        const value = attribute && staticValue(attribute);
        return value !== undefined && value !== true && isFixed(name, value)
          ? [describeAttribute(name, value)]
          : [];
      });
      if (fixed.length === 0 || isPlaced(node) || insideRenderProp(node)) return;
      const size = fixed.some((attribute) => !attribute.startsWith('fill'));
      const color = fixed.some((attribute) => attribute.startsWith('fill'));
      const what = size && color ? 'size and color' : size ? 'size' : 'color';
      // A component's own svg, which takes the props it is given or is what the component
      // returns, is fixed where it is written.
      const definition = spreadsProps(node) || isComponentRoot(node.parent);
      context.report({
        node: node.name,
        messageId: definition ? 'definition' : 'svg',
        data: { attributes: fixed.join(' '), what, fix: definitionFixes[what] },
      });
    }

    function checkGraphic(node) {
      if (!findAttribute(node, 'alt') && !spreadsProps(node))
        context.report({ node: node.name, messageId: 'alt' });
      const style = findAttribute(node, 'style')?.value;
      if (style?.type !== 'JSXExpressionContainer' || style.expression.type !== 'ObjectExpression')
        return;
      for (const property of style.expression.properties)
        if (
          property.type === 'Property' &&
          isMargin(propertyName(property)) &&
          !isZero(property.value)
        )
          context.report({ node: property, messageId: 'margin' });
    }

    return {
      ImportDeclaration(node) {
        if (!isTypeOnly(node, 'importKind')) checkSource(node.source);
      },
      ExportNamedDeclaration(node) {
        if (node.source && !isTypeOnly(node, 'exportKind')) checkSource(node.source);
      },
      ExportAllDeclaration(node) {
        if (node.exportKind !== 'type') checkSource(node.source);
      },
      ImportExpression(node) {
        checkSource(node.source);
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments.length === 1
        )
          checkSource(node.arguments[0]);
      },
      TSExternalModuleReference(node) {
        checkSource(node.expression);
      },
      JSXOpeningElement(node) {
        const name = jsxName(node.name);
        if (name === 'img') {
          if (!insideRenderProp(node)) context.report({ node: node.name, messageId: 'img' });
        } else if (name === 'svg') checkSvg(node);
        else if (isGraphic(node.name)) checkGraphic(node);
      },
    };
  },
};
