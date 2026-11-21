import { readFileSync } from 'node:fs';
import stylelint from 'stylelint';
import { documentationUrl, numbers, reportInValue, topLevelWords } from '../values.js';

const {
  createPlugin,
  utils: { ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'envui/no-off-scale-values';

export const offsetProperty = /^(?:inset(?:-[a-z-]+)?|top|right|bottom|left)$/i;

export const isHairline = ({ value, unit }) =>
  (unit === 'px' && Math.abs(value) <= 1) || (unit === 'rem' && Math.abs(value) <= 1 / 16);

export const scaleProperty =
  /^(?:gap|row-gap|column-gap|grid-(?:row-|column-)?gap|padding(?:-[a-z-]+)?|margin(?:-[a-z-]+)?|border(?:-[a-z]+)*-radius)$/i;

const steps = JSON.parse(readFileSync(new URL('../data/scales.json', import.meta.url), 'utf8'));

function scale(name, label) {
  const entries = Object.entries(steps[name]);
  const literal = entries.flatMap(([token, css]) =>
    /^-?(?:\d+\.?\d*|\.\d+)rem$/.test(css) ? [{ token, rem: Number.parseFloat(css), css }] : [],
  );
  const family = entries.length ? entries[0][0].replace(/-[^-]+$/, '-') : '--env-';
  const full = entries.find(([token]) => token.endsWith('-full'))?.[0];
  return { label, literal, family, full };
}

const spacing = scale('space', 'spacing');
const radius = scale('radius', 'radius');

const scaleOf = (property) => (/radius$/i.test(property) ? radius : spacing);

const remOf = ({ value, unit }) =>
  unit === 'rem' ? value : unit === 'px' ? value / 16 : undefined;

function nearest(steps, rem) {
  return steps.reduce((best, step) =>
    Math.abs(step.rem - rem) < Math.abs(best.rem - rem) ? step : best,
  );
}

const write = (token, negative) => (negative ? `calc(-1 * var(${token}))` : `var(${token})`);

const messages = ruleMessages(ruleName, {
  exact: (length, property, token, negative) =>
    `${length} in ${property}: write ${write(token, negative)} instead, envUI's ${scaleOf(property).label} step of that size.`,
  nearest: (length, property, token, css, negative) =>
    `${length} in ${property} is off envUI's ${scaleOf(property).label} scale: write the nearest step, ${write(token, negative)} (${css}), or another var(${scaleOf(property).family}…) step.`,
  full: (length, property, token) =>
    `${length} in ${property} is past envUI's largest ${scaleOf(property).label} step: write var(${token}) for a fully rounded corner.`,
  unknown: (length, property) =>
    `${length} in ${property} is off envUI's ${scaleOf(property).label} scale: write a var(${scaleOf(property).family}…) step.`,
});

function passes(word) {
  const call = /^([\w-]+)\(/.exec(word);
  return call !== null && (/^(?:var|env)$/i.test(call[1]) || /\bvar\(/i.test(word));
}

const onScaleUnit = (unit) => unit === 'rem' || unit === 'px';

function literalLengths(value) {
  return topLevelWords(value).flatMap(({ word, index }) => {
    if (passes(word)) return [];
    const lengths = numbers(word).filter(
      ({ value: size, unit, functions }) =>
        size !== 0 &&
        unit !== '' &&
        !isHairline({ value: size, unit }) &&
        !functions.some((name) => name === 'var' || name === 'env'),
    );
    if (!lengths.every(({ unit }) => onScaleUnit(unit))) return [];
    return lengths.map((length) => ({ ...length, index: index + length.index }));
  });
}

const clearlyFullyRoundedRem = 10;

const rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;
  root.walkDecls(scaleProperty, (declaration) => {
    const property = declaration.prop.toLowerCase();
    const { literal, full } = scaleOf(property);
    const largest = Math.max(...literal.map((step) => step.rem));
    for (const length of literalLengths(declaration.value)) {
      const rem = remOf(length);
      const negative = length.value < 0;
      let message;
      if (rem === undefined || literal.length === 0)
        message = messages.unknown(length.text, property);
      else if (full && Math.abs(rem) > largest && Math.abs(rem) >= clearlyFullyRoundedRem)
        message = messages.full(length.text, property, full);
      else {
        const step = nearest(literal, Math.abs(rem));
        message =
          step.rem === Math.abs(rem)
            ? messages.exact(length.text, property, step.token, negative)
            : messages.nearest(length.text, property, step.token, step.css, negative);
      }
      reportInValue({
        result,
        ruleName,
        declaration,
        message,
        start: length.index,
        length: length.text.length,
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = { url: documentationUrl(ruleName.replace('/', '')) };

export default createPlugin(ruleName, rule);
