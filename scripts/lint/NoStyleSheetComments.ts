import stylelint, { type Rule, type RuleBase } from 'stylelint';
import type { Comment, Node, Root } from 'postcss';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

export const styleSheetCommentRuleName = 'repository/no-comments';

const messages = ruleMessages(styleSheetCommentRuleName, {
  comment: 'Name it in the code instead: a class, a custom property or a better name.',
  reason: 'Drop the reason after the directive: a stylelint-disable comment takes none.',
});

const stylelintDirective = /^stylelint-(?:disable(?:-next-line|-line)?|enable)(?:\s|$)/;
const contrastMarker = /^contrast: [a-z0-9]+(?:-[a-z0-9]+)*$/;
const licenceWords = /\b(?:copyright|licen[cs]e|spdx-license-identifier)\b/i;
const rawsWithComments = ['value', 'selector', 'params'] as const;

function directiveStatus(text: string): 'directive' | 'reasoned' | undefined {
  if (stylelintDirective.test(text)) return /\s--(?:\s|$)/.test(text) ? 'reasoned' : 'directive';
  if (text === 'prettier-ignore' || contrastMarker.test(text)) return 'directive';
  return undefined;
}

const isLicenceHeader = (comment: Comment, root: Root) =>
  root.first === comment && licenceWords.test(comment.text);

function hasCommentInRaws(node: Node) {
  const raws = node.raws as Record<string, { raw?: string } | undefined>;
  return rawsWithComments.some((key) => raws[key]?.raw?.includes('/*'));
}

const reportComments: RuleBase = (primary) => (root, result) => {
  if (!validateOptions(result, styleSheetCommentRuleName, { actual: primary, possible: [true] }))
    return;
  const flag = (node: Node, message: string) =>
    report({ result, ruleName: styleSheetCommentRuleName, node, message });
  root.walk((node) => {
    if (node.type !== 'comment') {
      if (hasCommentInRaws(node)) flag(node, messages.comment);
      return;
    }
    const status = directiveStatus(node.text.trim());
    if (status === 'directive' || (!status && isLicenceHeader(node, root))) return;
    flag(node, status === 'reasoned' ? messages.reason : messages.comment);
  });
};

const rule: Rule = Object.assign(reportComments, {
  ruleName: styleSheetCommentRuleName,
  messages,
});

export const noStyleSheetComments = createPlugin(styleSheetCommentRuleName, rule);
