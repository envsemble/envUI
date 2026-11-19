import {
  documentationUrl,
  importedComponent,
  isIntrinsic,
  jsxName,
  pluginSettings,
  readData,
} from '../utilities.js';

const entryPoints = new Set(readData('entryPoints.json').entryPoints);

const overlays = new Set([
  'Popover',
  'Dialog',
  'Sheet',
  'Menu.Root',
  'HoverCard',
  'ConfirmDialog',
  'CommandPalette',
]);

const namingAttributes = new Set(['label', 'aria-label', 'aria-labelledby']);

function isNamed(opening) {
  return opening.attributes.some(
    (attribute) =>
      attribute.type === 'JSXSpreadAttribute' || namingAttributes.has(jsxName(attribute.name)),
  );
}

const fields = new Set([
  'Select',
  'RadioGroup',
  'Radio',
  'Combobox',
  'TextField',
  'SearchField',
  'Textarea',
  'SegmentedControl',
  'Slider',
  'DatePicker',
  'MonthPicker',
  'TimePicker',
  'Calendar',
  'DropZone',
  'ColorPicker',
]);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: "Disallow an unlabelled field in a List.Item's end",
      recommended: true,
      url: documentationUrl('no-field-in-list-row'),
    },
    schema: [],
    messages: {
      field:
        "A {{field}} with no label in a List.Item's end: the row's label names only the control in its control, so nothing names this field. Put it in control when it is the row's setting, or give it a label, or an aria-label or aria-labelledby when its label shouldn't show.",
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

    function fieldsIn(expression, found) {
      if (!expression) return found;
      if (expression.type === 'JSXElement') {
        const name = envuiName(expression.openingElement.name);
        if (name && overlays.has(name)) return found;
        if (name && fields.has(name) && !isNamed(expression.openingElement))
          found.push({ node: expression.openingElement.name, name });
        for (const child of expression.children) fieldsIn(child, found);
      } else if (expression.type === 'JSXFragment') {
        for (const child of expression.children) fieldsIn(child, found);
      } else if (expression.type === 'JSXExpressionContainer') {
        fieldsIn(expression.expression, found);
      } else if (expression.type === 'ConditionalExpression') {
        fieldsIn(expression.consequent, found);
        fieldsIn(expression.alternate, found);
      } else if (expression.type === 'LogicalExpression') {
        fieldsIn(expression.right, found);
      }
      return found;
    }

    return {
      JSXOpeningElement(node) {
        if (envuiName(node.name) !== 'List.Item') return;
        for (const attribute of node.attributes) {
          if (attribute.type !== 'JSXAttribute' || jsxName(attribute.name) !== 'end') continue;
          for (const { node: at, name } of fieldsIn(attribute.value, []))
            context.report({ node: at, messageId: 'field', data: { field: name } });
        }
      },
    };
  },
};
