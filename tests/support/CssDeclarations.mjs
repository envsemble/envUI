// The declarations of a style sheet, read with postcss, for the tests that check what the sheets
// declare: corners, shadows and hover.
import postcss from 'postcss';

/**
 * Each declaration of a style sheet with the selector of the rule around it, its whitespace
 * collapsed; a declaration in an at-rule such as @font-face takes the at-rule as its selector.
 */
export function declarations(css) {
  const found = [];
  postcss.parse(css).walkDecls((declaration) => {
    const { parent } = declaration;
    const selector =
      parent.type === 'rule' ? parent.selector : `@${parent.name} ${parent.params}`.trim();
    found.push({
      selector: selector.replace(/\s+/g, ' '),
      prop: declaration.prop,
      value: declaration.value,
    });
  });
  return found;
}
