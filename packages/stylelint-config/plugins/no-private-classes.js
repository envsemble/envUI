import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'envui/no-private-classes';

const messages = ruleMessages(ruleName, {
  rejected: (name) =>
    `.${name} styles envUI's private markup, which can change in any envUI release. Use the component's props and envUI's tokens, or style a class of your own.`,
});

const meta = {
  url: 'https://github.com/envsemble/envUI/blob/main/packages/stylelint-config/README.md#envuino-private-classes',
};

/** envUI classes a selector targets: `.env-…`, and `[class*="env-…"]` and its relatives. */
const privateClass = /\.(env-[\w-]*)|\[\s*class\s*[~|^$*]?=\s*["']?\s*(env-[\w-]*)/g;

const isString = (value) => typeof value === 'string';

/** @type {import('stylelint').Rule<true, { allow?: string[] }>} */
const rule = (primary, secondaryOptions) => (root, result) => {
  const valid = validateOptions(
    result,
    ruleName,
    { actual: primary, possible: [true] },
    { actual: secondaryOptions, possible: { allow: [isString] }, optional: true },
  );
  if (!valid) return;
  const allowed = new Set(secondaryOptions?.allow ?? []);

  /** Reports each envUI class in `text`, which starts `offset` characters into the node. */
  function check(node, text, offset) {
    for (const match of text.matchAll(privateClass)) {
      const name = match[1] ?? match[2];
      if (allowed.has(name)) continue;
      const index = offset + match.index;
      report({
        result,
        ruleName,
        node,
        message: messages.rejected,
        messageArgs: [name],
        index,
        endIndex: index + match[0].length,
      });
    }
  }

  root.walkRules((node) => check(node, node.selector, 0));
  // @scope (.env-dialog) to (.env-dialog-body) selects by class too.
  root.walkAtRules(/^scope$/i, (node) =>
    check(node, node.params, 1 + node.name.length + (node.raws.afterName ?? '').length),
  );
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

export default createPlugin(ruleName, rule);
