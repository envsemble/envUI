import { readFileSync } from 'node:fs';
import stylelint from 'stylelint';
import { documentationUrl, reportInValue } from '../values.js';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'envui/no-unknown-custom-properties';

const { names } = JSON.parse(
  readFileSync(new URL('../data/customProperties.json', import.meta.url), 'utf8'),
);
const known = new Set(names);

function distance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++)
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    previous = current;
  }
  return previous[b.length];
}

function nearestName(name) {
  let best;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of names) {
    const edits = distance(name, candidate);
    if (edits < bestDistance) [best, bestDistance] = [candidate, edits];
  }
  const allowed = Math.max(2, Math.floor((name.length - '--env-'.length) / 3));
  return bestDistance <= allowed ? best : undefined;
}

const messages = ruleMessages(ruleName, {
  used: (name, nearest) =>
    nearest
      ? `${name} is not an envUI token or public property: write var(${nearest}) instead.`
      : `${name} is not an envUI token or public property: write one of envUI's tokens, such as var(--env-space-4) or var(--env-color-fg-default).`,
  set: (name, nearest) =>
    nearest
      ? `${name} is not an envUI token or public property: set ${nearest} instead.`
      : `${name} is not an envUI token or public property: set an envUI token, or name the application's own property outside --env-, such as --app-${String(name).slice('--env-'.length)}.`,
});

const uses = /var\(\s*(--env-[\w-]+)/gi;

const rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;
  root.walkDecls((declaration) => {
    const property = declaration.prop;
    if (property.startsWith('--env-') && !known.has(property))
      report({
        result,
        ruleName,
        node: declaration,
        message: messages.set(property, nearestName(property)),
        index: 0,
        endIndex: property.length,
      });
    for (const match of declaration.value.matchAll(uses)) {
      const [whole, name] = match;
      if (known.has(name)) continue;
      reportInValue({
        result,
        ruleName,
        declaration,
        message: messages.used(name, nearestName(name)),
        start: match.index + whole.length - name.length,
        length: name.length,
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = { url: documentationUrl(ruleName.replace('/', '')) };

export default createPlugin(ruleName, rule);
