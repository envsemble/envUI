import {
  documentationUrl,
  importedComponent,
  isIntrinsic,
  jsxName,
  pluginSettings,
  readData,
} from '../utilities.js';

const entryPoints = new Set(readData('entryPoints.json').entryPoints);

const fields = new Set([
  'Select',
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
      description: "Disallow a field in a List.Item's control or end",
      recommended: true,
      url: documentationUrl('no-field-in-list-row'),
    },
    schema: [],
    messages: {
      field:
        "A {{field}} in a List.Item's {{slot}}: the row doesn't label it and a list row holds only a Switch, Checkbox or RadioGroup. Put it in a form as a field with its label above it.",
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
        if (name && fields.has(name)) found.push({ node: expression.openingElement.name, name });
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
          if (attribute.type !== 'JSXAttribute') continue;
          const slot = jsxName(attribute.name);
          if (slot !== 'control' && slot !== 'end') continue;
          for (const { node: at, name } of fieldsIn(attribute.value, []))
            context.report({ node: at, messageId: 'field', data: { field: name, slot } });
        }
      },
    };
  },
};
