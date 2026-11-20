import stylelint, { type Rule, type RuleBase } from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

export const fontWeightRuleName = 'repository/font-weight-from-token';

const messages = ruleMessages(fontWeightRuleName, {
  rejected: (weight: string) =>
    `Literal font weight ${weight} in the font shorthand: take it from a token, such as var(--type-…) or a var(--…-font-weight) weight.`,
});

function topLevelWords(value: string) {
  const words: { word: string; index: number }[] = [];
  let depth = 0;
  let start = -1;
  const end = (index: number) => {
    if (start !== -1) words.push({ word: value.slice(start, index), index: start });
    start = -1;
  };
  for (let index = 0; index < value.length; index++) {
    const character = value[index]!;
    if (character === '(') depth++;
    if (character === ')') depth--;
    if (depth > 0 || character === ')') {
      if (start === -1) start = index;
      continue;
    }
    if (/\s/.test(character) || character === '/' || character === ',') {
      end(index);
      if (character === '/') words.push({ word: '/', index });
    } else if (start === -1) start = index;
  }
  end(value.length);
  return words;
}

const reportLiteralWeights: RuleBase = (primary) => (root, result) => {
  if (!validateOptions(result, fontWeightRuleName, { actual: primary, possible: [true] })) return;
  root.walkDecls(/^font$/i, (declaration) => {
    const words = topLevelWords(declaration.value);
    words.forEach(({ word, index }, position) => {
      const isLineHeight = words[position - 1]?.word === '/';
      const isWeightNumber = /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(word) && !isLineHeight;
      if (!isWeightNumber && !/^(?:bold|bolder|lighter)$/i.test(word)) return;
      const offset = declaration.prop.length + (declaration.raws.between ?? ':').length + index;
      report({
        result,
        ruleName: fontWeightRuleName,
        node: declaration,
        message: messages.rejected,
        messageArgs: [word],
        index: offset,
        endIndex: offset + word.length,
      });
    });
  });
};

const rule: Rule = Object.assign(reportLiteralWeights, { ruleName: fontWeightRuleName, messages });

export const fontWeightFromToken = createPlugin(fontWeightRuleName, rule);
