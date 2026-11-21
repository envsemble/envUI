export const explicitContrasts = ['standard', 'high'] as const;
export const themeContrasts = [...explicitContrasts, 'system'] as const;
const explicitScales = ['comfortable', 'compact'] as const;
export const themeScales = [...explicitScales, 'system'] as const;
export const themeSelections = ['neutral', 'accent'] as const;
export const themeCorners = ['sharp', 'rounded', 'round'] as const;
export const themePreferences = ['light', 'dark', 'system'] as const;

export const isOneOf = <Value extends string>(
  values: readonly Value[],
  value: unknown,
): value is Value => (values as readonly unknown[]).includes(value);

export const rootAttributes = {
  contrast: 'data-env-contrast',
  scale: 'data-env-scale',
  selection: 'data-env-selection',
  corners: 'data-env-corners',
} as const;

export type OwnedRootSetting = 'contrast' | 'scale';

/**
 * Marks a root `data-env-contrast` or `data-env-scale` that envUI wrote, the bootstrap script or a
 * ThemePreferenceProvider, so that any provider, including one mounted later, replaces or removes
 * it as its own rather than leaving it as one the page set. The marker holds the value written,
 * `envui:high`, so a value the page wrote over envUI's no longer matches it and stays. The marker
 * lives on the root with the value, and goes with it.
 */
export const sourceAttributes = {
  contrast: 'data-env-contrast-source',
  scale: 'data-env-scale-source',
} as const satisfies Record<OwnedRootSetting, string>;

export const ownSource = (value: string) => `envui:${value}`;

const lookValues = { selection: themeSelections, corners: themeCorners };

const setAttribute = (name: string, value: string) =>
  `r.setAttribute(${JSON.stringify(name)},${JSON.stringify(value)});`;

export function themeBootstrapScript(
  theme: Partial<Record<keyof typeof rootAttributes, string>>,
  setPreferenceVariable: string,
) {
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
