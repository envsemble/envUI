import type { ThemeDefinition } from '../themeBootstrap.js';

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
  selection: 'data-env-selection',
  corners: 'data-env-corners',
} as const;

const lookValues: Record<keyof typeof lookAttributes, readonly string[]> = {
  selection: ['neutral', 'accent'],
  corners: ['sharp', 'rounded', 'round'],
};

const setAttribute = (name: string, value: string) =>
  `r.setAttribute(${JSON.stringify(name)},${JSON.stringify(value)});`;

export function themeBootstrapScript(theme: ThemeDefinition, setPreferenceVariable: string) {
  const { contrast = 'system', scale = 'system' } = theme;
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
  return `(function(){var r=document.documentElement,t="light";try{${setPreferenceVariable}t=p==="light"||p==="dark"?p:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){}r.classList.add("env-theme");r.setAttribute("data-env-theme",t);${writeContrast}${writeScale}${writeLook}r.style.colorScheme=t})();`;
}
