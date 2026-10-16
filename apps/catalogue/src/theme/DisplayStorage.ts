/**
 * Where the catalogue stores the reader's display settings in localStorage. vite.config.ts writes
 * the script that applies them before the catalogue loads.
 */
export const displayStorageKeys = {
  theme: 'envui-catalogue-theme',
  contrast: 'envui-catalogue-contrast',
  scale: 'envui-catalogue-scale',
} as const;

/**
 * An inline script for the document head that applies the stored contrast and scale to the root
 * before the catalogue loads, as createThemeBootstrapScript does the theme, so a compact or
 * high-contrast reader does not see the page change as it starts. ?scale= in the address wins over
 * the stored scale, as in DisplaySettingsProvider. It writes the attributes and source markers that
 * ThemePreferenceProvider writes, data-env-contrast-source="envui:high" and
 * data-env-scale-source="envui:compact", so the provider takes them as its own once it mounts.
 */
export function createDisplayBootstrapScript() {
  const contrastKey = JSON.stringify(displayStorageKeys.contrast);
  const scaleKey = JSON.stringify(displayStorageKeys.scale);
  return `(function(){var r=document.documentElement;try{var c=localStorage.getItem(${contrastKey}),q=new URLSearchParams(location.search).get("scale"),s=q==="compact"||q==="comfortable"?q:localStorage.getItem(${scaleKey});if(c==="high"||c==="standard"){r.setAttribute("data-env-contrast",c);r.setAttribute("data-env-contrast-source","envui:"+c)}if(s==="compact"){r.setAttribute("data-env-scale","compact");r.setAttribute("data-env-scale-source","envui:compact")}}catch(e){}})();`;
}
