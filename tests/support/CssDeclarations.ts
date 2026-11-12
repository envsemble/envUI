// The declarations of a style sheet, read with postcss, for the tests that check what the sheets
// declare: corners, shadows and hover.
import postcss from 'postcss';

/**
 * Each declaration of a style sheet with the selector of the rule around it, its whitespace
 * collapsed; a declaration in an at-rule such as @font-face takes the at-rule as its selector.
 */
export function declarations(css: string) {
  const found: { selector: string; prop: string; value: string }[] = [];
  postcss.parse(css).walkDecls((declaration) => {
    // A declaration sits in a rule or an at-rule, never at the root of a style sheet.
    const parent = declaration.parent as postcss.Rule | postcss.AtRule;
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
