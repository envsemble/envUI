import {
  documentationUrl,
  findAttribute,
  importedComponent,
  isIntrinsic,
  jsxName,
  pluginSettings,
  readData,
  staticValue,
  walk,
} from '../utilities.js';

const entryPoints = new Set(readData('entryPoints.json').entryPoints);

const rows = {
  'List.Item': {
    props: ['href', 'onClick'],
    raised: new Set(['start', 'end', 'control']),
    place: 'its end slot as a Button',
    advice: ' When it goes where the row goes, mark it data-row-target instead.',
  },
  'Table.Row': {
    props: ['onClick'],
    raised: new Set(),
    place: 'a cell of its own as a Button',
    advice:
      ' When it goes where the row goes, mark it data-row-target and make the row interactive in place of its onClick.',
  },
  Card: {
    props: ['href', 'onClick'],
    raised: new Set(),
    place: 'beside the card as a Button',
    advice:
      " When it goes where the card goes, leave it out: the card's href or onClick takes the click.",
  },
};

const isSet = (attribute) => attribute !== undefined && staticValue(attribute) !== false;

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a link-styled action inside a row or card that takes the click itself',
      recommended: true,
      url: documentationUrl('no-link-in-clickable-row'),
    },
    schema: [],
    messages: {
      nested:
        '{{found}} inside a clickable {{row}}: the row takes the click. Move the action into {{place}}, or into a Menu.{{advice}}',
    },
  },
  create(context) {
    const { sourceCode } = context;
    const { isReexportModule } = pluginSettings(context);
    const isEnvuiSource = (source) => entryPoints.has(source) || isReexportModule(source);

    function envuiName(name) {
      if (isIntrinsic(name)) return undefined;
      const imported = importedComponent(sourceCode, name);
      if (!imported) return jsxName(name);
      return isEnvuiSource(imported.source) ? imported.name : undefined;
    }

    function linkStyled(element) {
      if (findAttribute(element, 'data-row-target')) return undefined;
      if (jsxName(element.name) === 'a') return 'A raw <a>';
      const name = envuiName(element.name);
      if (name === 'Link') return 'A Link';
      const variant = findAttribute(element, 'variant');
      if (name === 'Button' && variant && staticValue(variant) === 'text')
        return 'A Button with variant="text"';
      return undefined;
    }

    function inside(row, raised) {
      const elements = [];
      walk(row, sourceCode.visitorKeys, (node) => {
        if (node === row) return true;
        if (node.type === 'JSXAttribute' && node.parent === row.openingElement)
          return !raised.has(jsxName(node.name));
        if (node.type !== 'JSXElement') return true;
        if (rows[envuiName(node.openingElement.name)]) return false;
        elements.push(node.openingElement);
        return true;
      });
      return elements;
    }

    return {
      JSXElement(node) {
        const name = envuiName(node.openingElement.name);
        const row = rows[name];
        if (!row) return;
        const clickable = row.props.some((prop) => isSet(findAttribute(node.openingElement, prop)));
        if (!clickable) return;
        const { place, advice } = row;
        for (const element of inside(node, row.raised)) {
          const found = linkStyled(element);
          if (found)
            context.report({
              node: element.name,
              messageId: 'nested',
              data: { found, row: name, place, advice },
            });
        }
      },
    };
  },
};
