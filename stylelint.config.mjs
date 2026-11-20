import { readFileSync } from 'node:fs';
import stylelint from 'stylelint';
import {
  hairlineProperties,
  rawColorFunction,
  stackingValues,
} from '@envsemble/stylelint-config-envui';
import { partsFile } from './scripts/RepositoryPaths.ts';
import {
  noStyleSheetComments,
  styleSheetCommentRuleName,
} from './scripts/lint/NoStyleSheetComments.ts';

const commentFreeStyleSheets = ['tests/**/*.css', 'packages/ui/src/**/*.css', 'apps/site/**/*.css'];
const generatedStyleSheets = ['packages/ui/src/generated/**/*.css'];

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const hexColor = '/#[\\da-f]{3,8}\\b/i';

const sitePrefixed = '^(?:site|catalogue|docs|env)-[a-z0-9]+(?:-[a-z0-9]+)*$';

const siteCustomProperty = '^(?:(?:site|catalogue|docs|env)-|_)[a-z0-9]+(?:-[a-z0-9]+)*$';

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

const functionsInCssPixels = ['env'];

const unitRule = (units, ignoreProperties) => [
  units,
  {
    ignoreProperties,
    ignoreFunctions: functionsInCssPixels,
    message: (unit) =>
      unit === 'em'
        ? 'Disallowed unit "em": em is only for typography that follows the element’s font size, such as line-height and letter-spacing; use rem or a token.'
        : `Disallowed unit "${unit}": px is only for hairlines, such as border and outline widths, focus-ring and shadow offsets; use rem or a token.`,
  },
];

const fontWeightRuleName = 'envui/font-weight-from-token';
const fontWeightMessages = ruleMessages(fontWeightRuleName, {
  rejected: (weight) =>
    `Literal font weight ${weight} in the font shorthand: take it from a token, such as var(--type-…) or a var(--…-font-weight) weight.`,
});
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
      const isLineHeight = words[position - 1]?.word === '/';
      const isWeightNumber = /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(word) && !isLineHeight;
      if (!isWeightNumber && !/^(?:bold|bolder|lighter)$/i.test(word)) return;
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
  const contract = JSON.parse(readFileSync(partsFile, 'utf8'));
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

const variableFontWeightRange = '/^\\d+\\s+\\d+$/';

const libraryStyleSheets = ['packages/ui/src/styles/**/*.css'];
const tokenDefinitions = [
  'packages/ui/src/generated/Tokens.css',
  'packages/ui/src/styles/TokensHandwritten.css',
];
const siteStyleSheets = ['apps/site/src/**/*.css'];
const testStyleSheetsStandingInForAnApplication = ['tests/**/*.css'];

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-recommended'],
  plugins: [fontWeightFromToken, slotContent, noStyleSheetComments],
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'declaration-property-value-disallowed-list': { '/.*/': [rawColorFunction] },
    'declaration-property-value-allowed-list': {
      'z-index': stackingValues,
      'font-weight': ['inherit', 'normal', '/^var\\(--/', variableFontWeightRange],
    },
    [fontWeightRuleName]: true,
    'unit-disallowed-list': unitRule(['px', 'em'], {
      px: hairlineProperties,
      em: textRelativeProperties,
    }),
    'no-descending-specificity': null,
  },
  overrides: [
    {
      files: libraryStyleSheets,
      rules: {
        [slotRuleName]: true,
        'declaration-property-unit-disallowed-list': { '/^(?!--)/': ['rem'] },
        'selector-class-pattern': [
          '^(?:env(?:-[a-z0-9]+)+|contains-task-list|task-list-item|footnotes)$',
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
      files: tokenDefinitions,
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
      files: siteStyleSheets,
      rules: {
        'selector-class-pattern': sitePrefixed,
        'custom-property-pattern': siteCustomProperty,
      },
    },
    {
      files: testStyleSheetsStandingInForAnApplication,
      rules: {
        'declaration-property-value-disallowed-list': null,
        'unit-disallowed-list': null,
        [fontWeightRuleName]: null,
      },
    },
    {
      files: commentFreeStyleSheets,
      rules: { [styleSheetCommentRuleName]: true },
    },
    {
      files: generatedStyleSheets,
      rules: { [styleSheetCommentRuleName]: null },
    },
  ],
};
