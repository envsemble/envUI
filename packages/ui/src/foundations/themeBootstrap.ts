import type {
  ThemeContrast,
  ThemeCorners,
  ThemeScale,
  ThemeSelection,
  ThemeSurface,
} from './Theme.js';

/** Preference stored by ThemePreferenceProvider: an explicit theme or the operating system's. */
export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * An application's theme, defined once with defineTheme and given to both
 * ThemePreferenceProvider's `theme` and createThemeBootstrapScript, so the first paint and the
 * application agree.
 */
export interface ThemeDefinition {
  /**
   * The localStorage key the stored preference is kept under.
   * @default 'env-theme'
   */
  storageKey?: string;
  /**
   * The preference used while nothing is stored.
   * @default 'system'
   */
  defaultPreference?: ThemePreference;
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
   * How rows, tables and cards draw: plain on the surface they sit on, or filled as tiles. Left
   * out, an enclosing Theme's, and else plain.
   */
  surface?: ThemeSurface;
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

export const defaultThemeStorageKey = 'env-theme';

/**
 * Marks a root `data-env-contrast` that envUI wrote, the bootstrap script or a
 * ThemePreferenceProvider, so that any provider, including one mounted later, replaces or removes
 * it as its own rather than leaving it as one the page set. The marker holds the value written,
 * `envui:high`, so a contrast the page wrote over envUI's no longer matches it and stays. The marker
 * lives on the root with the contrast, and goes with it.
 */
export const contrastSourceAttribute = 'data-env-contrast-source';
export const ownContrastSource = (contrast: string) => `envui:${contrast}`;
/**
 * Marks a root `data-env-scale` that envUI wrote, as contrastSourceAttribute marks a contrast: the
 * marker holds the value written, `envui:compact`, so a scale the page wrote over envUI's stays.
 */
export const scaleSourceAttribute = 'data-env-scale-source';
export const ownScaleSource = (scale: string) => `envui:${scale}`;

export const lookAttributes = {
  surface: 'data-env-surface',
  selection: 'data-env-selection',
  corners: 'data-env-corners',
} as const;

const lookValues: Record<keyof typeof lookAttributes, readonly string[]> = {
  surface: ['plain', 'filled'],
  selection: ['neutral', 'accent'],
  corners: ['sharp', 'rounded', 'round'],
};

const setAttribute = (name: string, value: string) =>
  `r.setAttribute(${JSON.stringify(name)},${JSON.stringify(value)});`;

/**
 * Inline script for the document head. It themes the root element before the first paint, so a
 * saved or system dark theme does not flash light while the application loads, and the contrast,
 * scale, surface, selection and corners of the theme apply from the start. Give it the theme
 * ThemePreferenceProvider takes.
 */
export function createThemeBootstrapScript(theme: ThemeDefinition = {}) {
  const {
    storageKey = defaultThemeStorageKey,
    defaultPreference = 'system',
    contrast = 'system',
    scale = 'system',
  } = theme;
  const writeContrast =
    contrast === 'high' || contrast === 'standard'
      ? setAttribute('data-env-contrast', contrast) +
        setAttribute(contrastSourceAttribute, ownContrastSource(contrast))
      : '';
  const writeScale =
    scale === 'compact' || scale === 'comfortable'
      ? setAttribute('data-env-scale', scale) +
        setAttribute(scaleSourceAttribute, ownScaleSource(scale))
      : '';
  const writeLook = (Object.keys(lookAttributes) as (keyof typeof lookAttributes)[])
    .map((setting) => {
      const value = theme[setting];
      return value !== undefined && lookValues[setting].includes(value)
        ? setAttribute(lookAttributes[setting], value)
        : '';
    })
    .join('');
  return `(function(){var r=document.documentElement,t="light";try{var p=localStorage.getItem(${JSON.stringify(storageKey)});if(p!=="light"&&p!=="dark"&&p!=="system")p=${JSON.stringify(defaultPreference)};t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p}catch(e){}r.classList.add("env-theme");r.setAttribute("data-env-theme",t);${writeContrast}${writeScale}${writeLook}r.style.colorScheme=t})();`;
}
