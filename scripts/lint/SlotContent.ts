import { readFileSync } from 'node:fs';
import stylelint, { type Rule, type RuleBase } from 'stylelint';
import type { PartsContract } from '../docs/parts/Contract.ts';
import { partsFile } from '../RepositoryPaths.ts';
import { compoundsOf } from './Selectors.ts';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

export const slotContentRuleName = 'repository/slot-content';

const messages = ruleMessages(slotContentRuleName, {
  inside: (selector: string, slot: string) =>
    `Selector "${selector}" reaches inside the slot ${slot}: a slot holds what the application gives it and never styles it. Style the content through its own component, or the slot itself for placement only.`,
  text: (property: string, slot: string) =>
    `"${property}" on the slot ${slot}: a slot only places what it holds; its text, color and overflow are the content's own.`,
});

const slotTextProperties =
  /^(?:font(?:-.*)?|color|overflow(?:-.*)?|text-overflow|text-wrap(?:-.*)?|white-space(?:-.*)?|(?:-webkit-)?line-clamp|line-height|letter-spacing|word-spacing|text-transform|text-decoration(?:-.*)?)$/i;

export function slotClasses(contract: PartsContract) {
  return new Set(
    [...Object.values(contract.components), ...Object.values(contract.shared)].flatMap((entry) =>
      entry.parts.filter((part) => part.slot).map((part) => part.class),
    ),
  );
}

const readSlotClasses = () =>
  slotClasses(JSON.parse(readFileSync(partsFile, 'utf8')) as PartsContract);

const reportSlotContent: RuleBase = (primary) => (root, result) => {
  if (!validateOptions(result, slotContentRuleName, { actual: primary, possible: [true] })) return;
  const slots = readSlotClasses();
  const slotIn = (classes: string[]) => classes.find((name) => slots.has(name));
  root.walkRules((rule) => {
    for (const selector of rule.selectors) {
      const compounds = compoundsOf(selector);
      for (const { classes, combinator } of compounds) {
        const slot = slotIn(classes);
        if (slot && (combinator === ' ' || combinator === '>'))
          report({
            result,
            ruleName: slotContentRuleName,
            node: rule,
            message: messages.inside,
            messageArgs: [selector, slot],
          });
      }
      const subject = compounds.at(-1);
      const slot = subject && slotIn(subject.classes);
      if (!slot) continue;
      rule.each((node) => {
        if (node.type === 'decl' && slotTextProperties.test(node.prop))
          report({
            result,
            ruleName: slotContentRuleName,
            node,
            message: messages.text,
            messageArgs: [node.prop, slot],
          });
      });
    }
  });
};

const rule: Rule = Object.assign(reportSlotContent, { ruleName: slotContentRuleName, messages });

export const slotContent = createPlugin(slotContentRuleName, rule);
