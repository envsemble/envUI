// What the token build names and builds: the custom-property prefix, the internal groups, and the
// themes and scales Tokens.css declares, each a resolver input with the CSS rules that apply it.
import type { TokenNormalized } from '@terrazzo/parser';
import { makeCSSVar } from '@terrazzo/token-tools/css';

/** The `$extensions` envUI gives a token, under its vendor key. */
export const envuiExtensions = (token: TokenNormalized) =>
  (token.$extensions?.['com.envsemble.envui'] ?? {}) as {
    lineHeightUnit?: string;
    cssUnit?: string;
    component?: string;
  };

/** The prefix of every custom property envUI defines: its tokens and its components' own. */
export const prefix = 'env';

/**
 * The CSS custom property of a token, as plugin-css writes it in Tokens.css, in a var() that
 * aliases it, and for each part of a composite token (`--env-type-body-font-size`): makeCSSVar()
 * keeps letters and digits, joins the words with hyphens, lowercases them and puts the `env`
 * prefix first. The lint rule envui/unique-css-names makes it the token's path joined with
 * hyphens after the prefix, `color.fg.muted` as `--env-color-fg-muted`.
 */
export const cssVariable = (id: string) => makeCSSVar(id, { prefix });

/**
 * Token groups that are build input only: the primitive palette, and the high-contrast values of
 * each scheme that contrast/high.tokens.json points the roles at. Neither becomes CSS; tokens that
 * alias them carry the resolved value instead.
 */
export const internalGroups = ['palette', 'contrast-high'];
export const isInternal = (id: string) => internalGroups.includes(id.split('.')[0]);

/** The semantic color roles: every one is designed for both schemes and both contrasts. */
export const isSemanticColor = (id: string) => /^color\.(bg|fg|border)\./.test(id);

/** A CSS rule that applies a theme or a scale under a media query, beside its own selectors. */
interface MediaRule {
  query: string;
  selector: string;
}

interface Scale {
  name: string;
  input: Record<string, string>;
  selector?: string;
  media?: MediaRule;
}

/**
 * The app scales, each a context of the resolver's scale modifier. Comfortable is the base set;
 * every other scale builds as a rule of its own, `.env-theme[data-env-scale='compact']`, which
 * declares only the tokens it changes. Scales change sizes, never colors, so they combine with every
 * theme. Compact is also the `system` scale, the default, where the primary pointer is fine: every
 * boundary but a comfortable one takes it under `pointer: fine`, as high contrast applies under
 * `prefers-contrast: more`, so the server and the first paint agree without measuring anything.
 */
export const scales: Scale[] = [
  { name: 'comfortable', input: { scale: 'comfortable' } },
  {
    name: 'compact',
    input: { scale: 'compact' },
    selector: ".env-theme[data-env-scale='compact']",
    media: {
      query: '(pointer: fine)',
      selector: ".env-theme:not([data-env-scale='comfortable'])",
    },
  },
];

/** The scales built as rules of their own over the base set: every one but comfortable. */
export const scaleRules = scales.filter(
  (scale): scale is Scale & { selector: string } => scale.selector !== undefined,
);

export type ThemeName = 'light' | 'dark' | 'light-high-contrast' | 'dark-high-contrast';

interface Theme {
  name: ThemeName;
  input: Record<string, string>;
  selectors: string[];
  media?: MediaRule;
}

/**
 * The themes the tokens build into, each a resolver input, with the CSS rules that apply it. The
 * high-contrast themes also apply under `prefers-contrast: more` unless the boundary opts out with
 * data-env-contrast='standard'.
 */
export const themes: Theme[] = [
  {
    name: 'light',
    input: { colorScheme: 'light', contrast: 'standard' },
    selectors: ['.env-theme'],
  },
  {
    name: 'dark',
    input: { colorScheme: 'dark', contrast: 'standard' },
    selectors: [".env-theme[data-env-theme='dark']"],
  },
  {
    name: 'light-high-contrast',
    input: { colorScheme: 'light', contrast: 'high' },
    selectors: [".env-theme[data-env-contrast='high']"],
    media: {
      query: '(prefers-contrast: more)',
      selector: ".env-theme:not([data-env-contrast='standard'])",
    },
  },
  {
    name: 'dark-high-contrast',
    input: { colorScheme: 'dark', contrast: 'high' },
    selectors: [".env-theme[data-env-theme='dark'][data-env-contrast='high']"],
    media: {
      query: '(prefers-contrast: more)',
      selector: ".env-theme[data-env-theme='dark']:not([data-env-contrast='standard'])",
    },
  },
];
