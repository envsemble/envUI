import { readFileSync } from 'node:fs';
import stylelint from 'stylelint';
import { documentationUrl, numbers, reportInValue, topLevelWords } from '../values.js';

const {
  createPlugin,
  utils: { ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'envui/no-off-scale-values';

/** The properties whose lengths come from envUI's spacing scale or its radius scale. */
export const scaleProperty =
  /^(?:gap|row-gap|column-gap|grid-(?:row-|column-)?gap|padding(?:-[a-z-]+)?|margin(?:-[a-z-]+)?|inset(?:-[a-z-]+)?|border(?:-[a-z]+)*-radius)$/i;

const steps = JSON.parse(readFileSync(new URL('../data/scales.json', import.meta.url), 'utf8'));

/** A scale's steps: those of a literal length in rem, by size, and the calculated ones. */
function scale(name, label) {
  const entries = Object.entries(steps[name]);
  const literal = entries.flatMap(([token, css]) =>
    /^-?(?:\d+\.?\d*|\.\d+)rem$/.test(css) ? [{ token, rem: Number.parseFloat(css), css }] : [],
  );
  const family = entries.length ? entries[0][0].replace(/-[^-]+$/, '-') : '--env-';
  return { label, literal, family };
}

const spacing = scale('space', 'spacing');
const radius = scale('radius', 'radius');

const scaleOf = (property) => (/radius$/i.test(property) ? radius : spacing);

/** A length's size in rem, for the units that have one at the default font size. */
const remOf = ({ value, unit }) =>
  unit === 'rem' ? value : unit === 'px' ? value / 16 : undefined;

/** The step nearest a size in rem, the smaller one on a tie. */
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
  unknown: (length, property) =>
    `${length} in ${property} is off envUI's ${scaleOf(property).label} scale: write a var(${scaleOf(property).family}…) step.`,
});

/** Whether a value's word passes as it is: a custom property, or a calculation with one. */
function passes(word) {
  const call = /^([\w-]+)\(/.exec(word);
  return call !== null && (/^(?:var|env)$/i.test(call[1]) || /\bvar\(/i.test(word));
}

/** The literal lengths of a value that the scale gives, with their offsets. */
function literalLengths(value) {
  return topLevelWords(value).flatMap(({ word, index }) =>
    passes(word)
      ? []
      : numbers(word)
          .filter(
            ({ value: size, unit, functions }) =>
              size !== 0 &&
              unit !== '%' &&
              unit !== '' &&
              !functions.some((name) => name === 'var' || name === 'env'),
          )
          .map((length) => ({ ...length, index: index + length.index })),
  );
}

const rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;
  root.walkDecls(scaleProperty, (declaration) => {
    const property = declaration.prop.toLowerCase();
    const { literal } = scaleOf(property);
    for (const length of literalLengths(declaration.value)) {
      const rem = remOf(length);
      const negative = length.value < 0;
      let message;
      if (rem === undefined || literal.length === 0)
        message = messages.unknown(length.text, property);
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
