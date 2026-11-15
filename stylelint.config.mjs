// Stylelint for the library's and the site's CSS. Existing violations of the rules that the
// token work removes are recorded in stylelint-suppressions.json, and
// tests/tooling/StylelintSuppressions.test.ts requires the recorded counts to match the CSS
// exactly; anything new fails. See "Ports, workers and recorded lists" in AGENTS.md.
import { readFileSync } from 'node:fs';
import stylelint from 'stylelint';
// The px allowlist, the raw color functions and the z-index values are the ones envUI's Stylelint
// config ships, so applications and the library follow the same rules.
import {
  hairlineProperties,
  rawColorFunction,
  stackingValues,
} from '@envsemble/stylelint-config-envui';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const hexColor = '/#[\\da-f]{3,8}\\b/i';

/** A name of the site's, by its part, or of the library's: kebab case after the prefix. */
const sitePrefixed = '^(?:site|catalogue|docs|env)-[a-z0-9]+(?:-[a-z0-9]+)*$';

/** A custom property the site reads or sets: its own, the library's, or a library part's private one. */
const siteCustomProperty = '^(?:(?:site|catalogue|docs|env)-|_)[a-z0-9]+(?:-[a-z0-9]+)*$';

/**
 * Where em may appear: typography that follows the element's own font size rather than the
 * reader's root size. Boxes, spacing and motion take rem, from tokens in the library.
 */
const textRelativeProperties = [
  'font',
  'font-size',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-indent',
  'text-decoration-thickness',
  'text-underline-offset',
];

const unitRule = (units, ignoreProperties) => [
  units,
  {
    ignoreProperties,
    // env() values are in CSS pixels by definition.
    ignoreFunctions: ['env'],
    message: (unit) =>
      unit === 'em'
        ? 'Disallowed unit "em": em is only for typography that follows the element’s font size, such as line-height and letter-spacing; use rem or a token.'
        : `Disallowed unit "${unit}": px is only for hairlines, such as border and outline widths, focus-ring and shadow offsets; use rem or a token.`,
  },
];

/**
 * envui/font-weight-from-token: the `font` shorthand takes its weight from a token too, as
 * `font-weight` does; a literal weight in it, such as `font: 600 1rem/1.4 …`, is reported.
 */
const fontWeightRuleName = 'envui/font-weight-from-token';
const fontWeightMessages = ruleMessages(fontWeightRuleName, {
  rejected: (weight) =>
    `Literal font weight ${weight} in the font shorthand: take it from a token, such as var(--type-…) or a var(--…-font-weight) weight.`,
});
/** Words of a value outside functions, with their offsets; `/` is a word of its own. */
function topLevelWords(value) {
  const words = [];
  let depth = 0;
  let start = -1;
  const end = (index) => {
    if (start !== -1) words.push({ word: value.slice(start, index), index: start });
    start = -1;
  };
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
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
const fontWeightFromToken = createPlugin(fontWeightRuleName, (primary) => (root, result) => {
  if (!validateOptions(result, fontWeightRuleName, { actual: primary, possible: [true] })) return;
  root.walkDecls(/^font$/i, (declaration) => {
    const words = topLevelWords(declaration.value);
    words.forEach(({ word, index }, position) => {
      // A number after the slash is the line height; before it, only a weight is a bare number.
      const number = /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(word) && words[position - 1]?.word !== '/';
      if (!number && !/^(?:bold|bolder|lighter)$/i.test(word)) return;
      const offset = declaration.prop.length + (declaration.raws.between ?? ':').length + index;
      report({
        result,
        ruleName: fontWeightRuleName,
        node: declaration,
        message: fontWeightMessages.rejected,
        messageArgs: [word],
        index: offset,
        endIndex: offset + word.length,
      });
    });
  });
});

const slotRuleName = 'envui/slot-content';
const slotMessages = ruleMessages(slotRuleName, {
  inside: (selector, slot) =>
    `Selector "${selector}" reaches inside the slot ${slot}: a slot holds what the application gives it and never styles it. Style the content through its own component, or the slot itself for placement only.`,
  text: (property, slot) =>
    `"${property}" on the slot ${slot}: a slot only places what it holds; its text, color and overflow are the content's own.`,
});
const slotTextProperties =
  /^(?:font(?:-.*)?|color|overflow(?:-.*)?|text-overflow|text-wrap(?:-.*)?|white-space(?:-.*)?|(?:-webkit-)?line-clamp|line-height|letter-spacing|word-spacing|text-transform|text-decoration(?:-.*)?)$/i;

function readSlotClasses() {
  const contract = JSON.parse(
    readFileSync(new URL('./docs/generated/parts.json', import.meta.url), 'utf8'),
  );
  return new Set(
    [...Object.values(contract.components), ...Object.values(contract.shared)].flatMap((entry) =>
      entry.parts.filter((part) => part.slot).map((part) => part.class),
    ),
  );
}

function compoundsOf(selector) {
  const compounds = [];
  let depth = 0;
  let quote = '';
  let current = '';
  let combinator = '';
  const close = (next) => {
    if (current) {
      compounds.push({ text: current, combinator: '' });
      current = '';
    }
    if (next && compounds.length) compounds[compounds.length - 1].combinator = next;
  };
  for (const character of selector) {
    if (quote) {
      current += character;
      if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    if (character === '(' || character === '[') depth++;
    if (character === ')' || character === ']') depth--;
    if (depth === 0 && /[\s>+~]/.test(character)) {
      if (character !== ' ' && !/\s/.test(character)) combinator = character;
      else if (!combinator) combinator = ' ';
      if (current) close();
      continue;
    }
    if (combinator) {
      close(combinator);
      combinator = '';
    }
    current += character;
  }
  close();
  return compounds;
}

function classesOf(compound) {
  let text = compound;
  for (let start = text.search(/:(?:not|has)\(/i); start !== -1;) {
    let depth = 0;
    let end = text.indexOf('(', start);
    for (; end < text.length; end++) {
      if (text[end] === '(') depth++;
      else if (text[end] === ')' && --depth === 0) break;
    }
    text = text.slice(0, start) + text.slice(end + 1);
    start = text.search(/:(?:not|has)\(/i);
  }
  return [...text.matchAll(/\.(-?[_a-z][\w-]*)/gi)].map((match) => match[1]);
}

const slotContent = createPlugin(slotRuleName, (primary) => (root, result) => {
  if (!validateOptions(result, slotRuleName, { actual: primary, possible: [true] })) return;
  const slots = readSlotClasses();
  root.walkRules((rule) => {
    for (const selector of rule.selectors) {
      const compounds = compoundsOf(selector);
      for (const { text, combinator } of compounds) {
        const slot = classesOf(text).find((name) => slots.has(name));
        if (slot && (combinator === ' ' || combinator === '>'))
          report({
            result,
            ruleName: slotRuleName,
            node: rule,
            message: slotMessages.inside,
            messageArgs: [selector, slot],
          });
      }
      const subject = compounds.at(-1);
      const slot = subject && classesOf(subject.text).find((name) => slots.has(name));
      if (!slot) continue;
      rule.each((node) => {
        if (node.type === 'decl' && slotTextProperties.test(node.prop))
          report({
            result,
            ruleName: slotRuleName,
            node,
            message: slotMessages.text,
            messageArgs: [node.prop, slot],
          });
      });
    }
  });
});

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-recommended'],
  plugins: [fontWeightFromToken, slotContent],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    // Colors come from tokens.
    'color-no-hex': true,
    'color-named': 'never',
    'declaration-property-value-disallowed-list': { '/.*/': [rawColorFunction] },
    // Stacking order and weights come from tokens.
    'declaration-property-value-allowed-list': {
      'z-index': stackingValues,
      // A range such as `100 900` is a variable font's weights in @font-face.
      'font-weight': ['inherit', 'normal', '/^var\\(--/', '/^\\d+\\s+\\d+$/'],
    },
    [fontWeightRuleName]: true,
    // px only for hairlines, also as the fallback of var(); em only for typography; everything
    // else that follows the text size uses rem.
    'unit-disallowed-list': unitRule(['px', 'em'], {
      px: hairlineProperties,
      em: textRelativeProperties,
    }),
    // Reports the order of selectors for different elements, which component CSS does not rely on.
    'no-descending-specificity': null,
  },
  overrides: [
    {
      // Library components take sizes from tokens rather than literal rem values. Their classes are
      // env-<component>-<part>, apart from the classes of the third-party markup they style (GFM's
      // and TipTap's); their public custom properties take the --env- prefix and their private
      // ones --_<component>-, apart from those Base UI sets on its parts, which they read.
      files: ['packages/ui/src/styles/**/*.css'],
      rules: {
        [slotRuleName]: true,
        'declaration-property-unit-disallowed-list': { '/^(?!--)/': ['rem'] },
        'selector-class-pattern': [
          '^(?:env(?:-[a-z0-9]+)+|ProseMirror(?:-[a-z]+)?|contains-task-list|task-list-item|footnotes|is-editor-empty|selectedCell|tableWrapper)$',
          { message: (name) => `Class "${name}": library classes are env-<component>-<part>.` },
        ],
        'custom-property-pattern': [
          '^(?:env(?:-[a-z0-9]+)+|_[a-z0-9]+(?:-[a-z0-9]+)*|accordion-panel-height|active-tab-(?:left|top|width|height)|anchor-width|available-height|available-width|collapsible-panel-height|drawer-swipe-movement-[xy]|transform-origin)$',
          {
            message: (name) =>
              `Custom property "${name}": library properties are --env-… when public, --_<component>-… when private.`,
          },
        ],
      },
    },
    {
      // The token definitions, generated and hand-written: literal values belong here, in custom
      // properties, including the em line heights of the font shorthands.
      files: [
        'packages/ui/src/generated/Tokens.css',
        'packages/ui/src/styles/TokensHandwritten.css',
      ],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'declaration-property-value-disallowed-list': {
          '/^(?!--)/': [rawColorFunction, hexColor],
        },
        'declaration-property-value-allowed-list': null,
        'declaration-property-unit-disallowed-list': null,
        'unit-disallowed-list': unitRule(['px'], { px: hairlineProperties }),
      },
    },
    {
      // The site's classes and custom properties say which part they belong to (apps/site/AGENTS.md);
      // env- are the library's, which the site styles through its part classes and reads as tokens.
      files: ['apps/site/src/**/*.css'],
      rules: {
        'selector-class-pattern': sitePrefixed,
        'custom-property-pattern': siteCustomProperty,
      },
    },
  ],
};
