import postcss from 'postcss';

export function declarations(css: string) {
  const found: { selector: string; prop: string; value: string }[] = [];
  postcss.parse(css).walkDecls((declaration) => {
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
