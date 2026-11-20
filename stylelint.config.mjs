import {
  hairlineProperties,
  rawColorFunction,
  stackingValues,
} from '@envsemble/stylelint-config-envui';
import { fontWeightFromToken, fontWeightRuleName } from './scripts/lint/FontWeightFromToken.ts';
import {
  noStyleSheetComments,
  styleSheetCommentRuleName,
} from './scripts/lint/NoStyleSheetComments.ts';
import { slotContent, slotContentRuleName } from './scripts/lint/SlotContent.ts';

const commentFreeStyleSheets = ['tests/**/*.css', 'packages/ui/src/**/*.css', 'apps/site/**/*.css'];
const generatedStyleSheets = ['packages/ui/src/generated/**/*.css'];

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
        [slotContentRuleName]: true,
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
