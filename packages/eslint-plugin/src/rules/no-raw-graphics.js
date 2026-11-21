import {
  documentationUrl,
  enclosingPropName,
  findAttribute,
  importedComponent,
  insideAttribute,
  isFunction,
  jsxName,
  pluginSettings,
  propertyName,
  resolveVariable,
  spreadsProps,
  staticValue,
} from '../utilities.js';

const iconPackages = [
  'lucide-react',
  'react-icons',
  '@heroicons/react',
  '@mui/icons-material',
  '@tabler/icons-react',
  '@phosphor-icons/react',
  'phosphor-react',
];

const iconPackage = (source) =>
  typeof source === 'string'
    ? iconPackages.find((name) => source === name || source.startsWith(`${name}/`))
    : undefined;

const flexibleSize = /^(?:[+-]?(?:\d+\.?\d*|\.\d+)(?:em|ex|ch|cap|ic|lh|%)|0|auto|inherit)$/i;

const flexibleFill = new Set(['currentcolor', 'none', 'inherit', 'transparent']);

function isFixed(name, value) {
  const text = String(value).trim();
  return name === 'fill' ? !flexibleFill.has(text.toLowerCase()) : !flexibleSize.test(text);
}

const describeAttribute = (name, value) =>
  typeof value === 'number' ? `${name}={${value}}` : `${name}="${value}"`;

const isMargin = (name) => typeof name === 'string' && /^margin(?:$|[A-Z-])/.test(name);

const negativeLength = /(?:^|[\s(,])-\s*(?:\d*\.?\d*[1-9]|var\()/;

const isNegative = (value) =>
  (value?.type === 'Literal' &&
    ((typeof value.value === 'number' && value.value < 0) ||
      (typeof value.value === 'string' && negativeLength.test(value.value)))) ||
  (value?.type === 'UnaryExpression' &&
    value.operator === '-' &&
    !(value.argument.type === 'Literal' && value.argument.value === 0));

const literalString = (node) =>
  node?.type === 'TemplateLiteral' && node.expressions.length === 0
    ? node.quasis[0].value.cooked
    : node?.type === 'Literal'
      ? node.value
      : undefined;

function definitionSource(definition) {
  if (definition.type === 'ImportBinding')
    return definition.node.type === 'TSImportEqualsDeclaration'
      ? definition.node.moduleReference.expression
      : definition.parent?.source;
  const init = definition.type === 'Variable' ? definition.node.init : undefined;
  return init?.type === 'CallExpression' &&
    init.callee.type === 'Identifier' &&
    init.callee.name === 'require' &&
    init.arguments.length === 1
    ? init.arguments[0]
    : undefined;
}

const isIconSlot = (name) =>
  name === 'icon' || (typeof name === 'string' && /^[a-z]\w*Icon$/.test(name));

const contentSlots = new Set(['start', 'end']);

const passesThrough = (node) =>
  node.type === 'JSXExpressionContainer' ||
  node.type === 'ConditionalExpression' ||
  node.type === 'LogicalExpression';

function componentName(fn) {
  if (fn.id) return fn.id.name;
  let holder = fn.parent;
  while (holder?.type === 'CallExpression') holder = holder.parent;
  return holder?.type === 'VariableDeclarator' && holder.id.type === 'Identifier'
    ? holder.id.name
    : undefined;
}

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

const definitionFixes = {
  size: 'write width="1em" height="1em", or leave them out, so it follows its slot or the text',
  color: 'write fill="currentColor", so it takes the text color',
  'size and color':
    'write width="1em" height="1em" fill="currentColor", so it follows its slot or the text and takes the text color',
};

const renderProp = 'render';

const localPath = /^(?:\.{1,2}\/|\/(?!\/))/;

const imageModule = /\.(?:apng|avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:\?.*)?$/i;

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Disallow raw images, and fixed-size SVGs and other icon packages' icons outside an icon slot or envUI's Graphic",
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
      svg: "A raw <svg {{attributes}}> takes its {{what}} from the file: pass it to an icon slot, such as IconButton's icon, or wrap it in envUI's <Graphic alt=\"\">: import { Graphic } from '@envsemble/envui'.",
      definition: "A component's <svg {{attributes}}> takes its {{what}} from the file: {{fix}}.",
      alt: 'Graphic needs alt: what the picture says, such as the company\'s name, or alt="" when the text beside it says it already.',
      margin:
        "A negative margin on a Graphic makes up for the file's empty edges: trim the file once with npx envui-graphic <file>, and drop the margin.",
      iconPackage:
        "A <{{name}}> from {{source}} takes its size from the package: pass it to an icon slot, such as IconButton's icon, or wrap it in envUI's <Graphic alt=\"\">: import { Graphic } from '@envsemble/envui'. envUI's own icons fit its slots and text: import { IconSearch } from '@envsemble/envui/icons/Search'.",
      svgInContentSlot:
        "A raw <svg {{attributes}}> keeps the file's {{what}} in {{slot}}, which sizes only envUI's icons and a Graphic: wrap it in envUI's <Graphic alt=\"\">: import { Graphic } from '@envsemble/envui'.",
      iconPackageInContentSlot:
        "A <{{name}}> from {{source}} keeps the package's size in {{slot}}, which sizes only envUI's icons and a Graphic: wrap it in envUI's <Graphic alt=\"\">: import { Graphic } from '@envsemble/envui'. envUI's own icons fit it: import { IconSearch } from '@envsemble/envui/icons/Search'.",
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

    function iconPackageSource(name) {
      let root = name;
      while (root.type === 'JSXMemberExpression') root = root.object;
      if (root.type !== 'JSXIdentifier') return undefined;
      const variable = resolveVariable(sourceCode, root, root.name);
      for (const definition of variable?.defs ?? []) {
        const source = literalString(definitionSource(definition));
        const known = iconPackage(source);
        if (known && !allow.includes(known)) return source;
      }
      return undefined;
    }

    function isGraphic(name) {
      const imported = importedComponent(sourceCode, name);
      if (!imported) return jsxName(name) === 'Graphic';
      return (
        (imported.source === '@envsemble/envui' || isReexportModule(imported.source)) &&
        imported.name === 'Graphic'
      );
    }

    function isLocalImage(node) {
      const src = findAttribute(node, 'src');
      if (!src) return false;
      const value = staticValue(src);
      if (typeof value === 'string') return localPath.test(value);
      const expression = src.value?.type === 'JSXExpressionContainer' && src.value.expression;
      if (expression?.type !== 'Identifier') return false;
      const variable = resolveVariable(sourceCode, expression, expression.name);
      return Boolean(
        variable?.defs.length &&
        variable.defs.every(
          (definition) =>
            definition.type === 'ImportBinding' &&
            imageModule.test(String(definition.parent.source.value)),
        ),
      );
    }

    const insideRenderProp = (node) =>
      insideAttribute(sourceCode, node, (name) => name === renderProp);

    function isPlaced(node) {
      let parent = node.parent.parent;
      while (parent && passesThrough(parent)) parent = parent.parent;
      if (parent?.type === 'JSXElement' && isGraphic(parent.openingElement.name)) return true;
      return (
        insideAttribute(sourceCode, node, isIconSlot) ||
        sourceCode
          .getAncestors(node)
          .some((ancestor) => ancestor.type === 'Property' && isIconSlot(propertyName(ancestor)))
      );
    }

    function contentSlot(node) {
      const name = enclosingPropName(sourceCode, node);
      return contentSlots.has(name) ? name : undefined;
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
      const definition = spreadsProps(node) || isComponentRoot(node.parent);
      const slot = definition ? undefined : contentSlot(node);
      context.report({
        node: node.name,
        messageId: definition ? 'definition' : slot ? 'svgInContentSlot' : 'svg',
        data: { attributes: fixed.join(' '), what, fix: definitionFixes[what], slot },
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
          isNegative(property.value)
        )
          context.report({ node: property, messageId: 'margin' });
    }

    return {
      JSXOpeningElement(node) {
        const name = jsxName(node.name);
        if (name === 'img') {
          if (!insideRenderProp(node) && !isLocalImage(node))
            context.report({ node: node.name, messageId: 'img' });
        } else if (name === 'svg') checkSvg(node);
        else if (isGraphic(node.name)) checkGraphic(node);
        else {
          const source = iconPackageSource(node.name);
          if (source && !isPlaced(node) && !insideRenderProp(node)) {
            const slot = contentSlot(node);
            context.report({
              node: node.name,
              messageId: slot ? 'iconPackageInContentSlot' : 'iconPackage',
              data: { name: jsxName(node.name), source, slot },
            });
          }
        }
      },
    };
  },
};
