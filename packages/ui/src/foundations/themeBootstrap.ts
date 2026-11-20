import type { ThemeContrast, ThemeCorners, ThemeScale, ThemeSelection } from './Theme.js';
import {
  explicitContrasts,
  explicitScales,
  isOneOf,
  ownSource,
  rootAttributes,
  sourceAttributes,
  themeCorners,
  themeSelections,
} from '../internal/theme/themeRoot.js';

/** A theme preference: an explicit theme or the operating system's. */
export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * An application's theme, defined once with defineTheme and given to both
 * ThemePreferenceProvider's `theme` and createThemeBootstrapScript, so the first paint and the
 * application agree.
 */
export interface ThemeDefinition {
  /**
   * `high` for the high-contrast colors, `standard` for the standard ones even while the system
   * asks for more, `system` to follow `prefers-contrast: more`. The bootstrap script writes `high`
   * and `standard` to the root before the first paint, marked with `data-env-contrast-source`, so
   * the provider takes it as its own. Left out, the provider takes an enclosing Theme's contrast,
   * or one the page set on the root, and else `system`.
   */
  contrast?: ThemeContrast;
  /**
   * The app scale: comfortable, compact, or `system`, compact under a fine pointer and comfortable
   * on touch. The bootstrap script writes `compact` and `comfortable` to the root before the first
   * paint, marked with `data-env-scale-source`. Left out, the provider takes an enclosing Theme's
   * scale, or one the page set on the root, and else `system`.
   */
  scale?: ThemeScale;
  /**
   * The tone of what is selected: neutral, a gray under the text color, or accent, the brand's
   * tint. Left out, an enclosing Theme's, and else neutral.
   */
  selection?: ThemeSelection;
  /**
   * The corner shape: sharp, rounded or round. Left out, an enclosing Theme's, and else rounded.
   */
  corners?: ThemeCorners;
}

/**
 * Defines an application's theme once, for ThemePreferenceProvider's `theme` and
 * createThemeBootstrapScript, so the two can't drift apart.
 */
export function defineTheme(definition: ThemeDefinition = {}): Readonly<ThemeDefinition> {
  return Object.freeze({ ...definition });
}

const lookValues = { selection: themeSelections, corners: themeCorners };

const setAttribute = (name: string, value: string) =>
  `r.setAttribute(${JSON.stringify(name)},${JSON.stringify(value)});`;

export interface ThemeBootstrapOptions {
  /**
   * The preference the first paint shows, such as the one the server read for this request from
   * the application's cookie or account.
   * @default 'system'
   */
  preference?: ThemePreference;
}

/**
 * Inline script for the document head. It themes the root element before the first paint, so a
 * chosen or system dark theme does not flash light while the application loads, and the contrast,
 * scale, selection and corners of the theme apply from the start. Give it the theme and the
 * preference ThemePreferenceProvider takes.
 */
export function createThemeBootstrapScript(
  theme: ThemeDefinition = {},
  { preference = 'system' }: ThemeBootstrapOptions = {},
) {
  return themeBootstrapScript(theme, `var p=${JSON.stringify(preference)};`);
}

export function themeBootstrapScript(theme: ThemeDefinition, setPreferenceVariable: string) {
  const { contrast = 'system', scale = 'system' } = theme;
  const writeContrast = isOneOf(explicitContrasts, contrast)
    ? setAttribute(rootAttributes.contrast, contrast) +
      setAttribute(sourceAttributes.contrast, ownSource(contrast))
    : '';
  const writeScale = isOneOf(explicitScales, scale)
    ? setAttribute(rootAttributes.scale, scale) +
      setAttribute(sourceAttributes.scale, ownSource(scale))
    : '';
  const writeLook = (Object.keys(lookValues) as (keyof typeof lookValues)[])
    .map((setting) => {
      const value = theme[setting];
      return isOneOf(lookValues[setting], value)
        ? setAttribute(rootAttributes[setting], value)
        : '';
    })
    .join('');
  return `(function(){var r=document.documentElement,t="light";try{${setPreferenceVariable}t=p==="light"||p==="dark"?p:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){}r.classList.add("env-theme");r.setAttribute("data-env-theme",t);${writeContrast}${writeScale}${writeLook}r.style.colorScheme=t})();`;
}
