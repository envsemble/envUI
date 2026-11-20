import envuiStylelint, {
  rawColorFunction,
  stackingValues,
} from '@envsemble/stylelint-config-envui';
import { baseUiCustomProperties } from './scripts/lint/BaseUiProperties.ts';
import { fontWeightFromToken, fontWeightRuleName } from './scripts/lint/FontWeightFromToken.ts';
import {
  noStyleSheetComments,
  styleSheetCommentRuleName,
} from './scripts/lint/NoStyleSheetComments.ts';
import { slotContent, slotContentRuleName } from './scripts/lint/SlotContent.ts';

const commentFreeStyleSheets = ['tests/**/*.css', 'packages/ui/src/**/*.css', 'apps/site/**/*.css'];
const generatedStyleSheets = ['packages/ui/src/generated/**/*.css'];

const hexColor = '/#[\\da-f]{3,8}\\b/i';

const siteAreas = ['catalogue', 'docs'];

const siteNames = (areas) => {
  const prefixes = ['site', ...areas, 'env'].join('|');
  const prefixed = (name) =>
    `Class or property "${name}": the site's names start site- when both areas use them, ${areas.map((area) => `${area}-`).join(' or ')} when only ${areas.length > 1 ? 'one area does' : `the ${areas[0]} area does`}.`;
  return {
    'selector-class-pattern': [`^(?:${prefixes})-[a-z0-9]+(?:-[a-z0-9]+)*$`, { message: prefixed }],
    'custom-property-pattern': [
      `^(?:(?:${prefixes})-|_)[a-z0-9]+(?:-[a-z0-9]+)*$`,
      { message: prefixed },
    ],
  };
};

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

const emOnlyForText = [
  ['em'],
  {
    ignoreProperties: { em: textRelativeProperties },
    ignoreFunctions: functionsInCssPixels,
    message: () =>
      'Disallowed unit "em": em is only for typography that follows the element’s font size, such as line-height and letter-spacing; use rem or a token.',
  },
];

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
  plugins: [...envuiStylelint.plugins, fontWeightFromToken, slotContent, noStyleSheetComments],
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    ...envuiStylelint.rules,
    'declaration-property-value-allowed-list': {
      'z-index': stackingValues,
      'font-weight': ['inherit', 'normal', '/^var\\(--/', variableFontWeightRange],
    },
    [fontWeightRuleName]: true,
    'unit-disallowed-list': emOnlyForText,
    'no-descending-specificity': null,
  },
  overrides: [
    {
      files: libraryStyleSheets,
      rules: {
        [slotContentRuleName]: true,
        'envui/no-contrast-breaking-pairs': null,
        'declaration-property-unit-disallowed-list': { '/^(?!--)/': ['rem'] },
        'selector-class-pattern': [
          '^(?:env(?:-[a-z0-9]+)+|contains-task-list|task-list-item|footnotes)$',
          { message: (name) => `Class "${name}": library classes are env-<component>-<part>.` },
        ],
        'custom-property-pattern': [
          `^(?:env(?:-[a-z0-9]+)+|_[a-z0-9]+(?:-[a-z0-9]+)*|${baseUiCustomProperties.map((name) => name.slice(2)).join('|')})$`,
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
        'unit-disallowed-list': null,
        'envui/no-unknown-custom-properties': null,
        'envui/no-off-scale-values': null,
      },
    },
    {
      files: siteStyleSheets,
      rules: { ...siteNames(siteAreas), 'envui/no-off-scale-values': null },
    },
    ...siteAreas.map((area) => ({
      files: [`apps/site/src/pages/${area}/**/*.css`],
      rules: siteNames([area]),
    })),
    {
      files: testStyleSheetsStandingInForAnApplication,
      rules: {
        'declaration-property-value-disallowed-list': null,
        'unit-disallowed-list': null,
        'envui/no-px': null,
        'envui/no-off-scale-values': null,
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
