import {
  contrastSourceAttribute,
  ownContrastSource,
  ownScaleSource,
  scaleSourceAttribute,
} from '../../../../packages/ui/src/foundations/ThemeBootstrap.js';

/**
 * Where the site stores the reader's display settings in localStorage. vite.config.ts writes the
 * script that applies them before the site loads.
 */
export const displayStorageKeys = {
  theme: 'envui-site-theme',
  contrast: 'envui-site-contrast',
  scale: 'envui-site-scale',
} as const;

/** Where the site keeps the width the reader gives a part's drawer, the catalogue's or the Docs'. */
export const drawerWidthKey = (area: 'catalogue' | 'docs') => `envui-site-drawer-width-${area}`;

/**
 * The keys the site stored settings under before, each with the key that holds it now. The site
 * was once called the catalogue, and the catalogue's drawer the site's.
 */
export const renamedStorageKeys: readonly (readonly [before: string, now: string])[] = [
  ['envui-catalogue-theme', displayStorageKeys.theme],
  ['envui-catalogue-contrast', displayStorageKeys.contrast],
  ['envui-catalogue-scale', displayStorageKeys.scale],
  ['envui-catalogue-drawer-width-site', drawerWidthKey('catalogue')],
  ['envui-catalogue-drawer-width-docs', drawerWidthKey('docs')],
];

/**
 * An inline script for the document head, ahead of the scripts that read the settings: a setting
 * stored under a key of before moves to its key now, once, so a reader keeps their theme, contrast,
 * scale and drawer widths. A setting already under its new key wins.
 */
export function createStorageMigrationScript() {
  const keys = JSON.stringify(renamedStorageKeys);
  return `(function(){try{var k=${keys};for(var i=0;i<k.length;i++){var v=localStorage.getItem(k[i][0]);if(v!==null){if(localStorage.getItem(k[i][1])===null)localStorage.setItem(k[i][1],v);localStorage.removeItem(k[i][0])}}}catch(e){}})();`;
}

/**
 * An inline script for the document head that applies the stored contrast and scale to the root
 * before the site loads, as createThemeBootstrapScript does the theme, so a compact or
 * high-contrast reader does not see the page change as it starts. ?scale= in the address wins over
 * the stored scale, as in DisplaySettingsProvider. It writes the attributes and source markers that
 * ThemePreferenceProvider writes, data-env-contrast-source="envui:high" and
 * data-env-scale-source="envui:compact", so the provider takes them as its own once it mounts.
 */
export function createDisplayBootstrapScript() {
  const contrastKey = JSON.stringify(displayStorageKeys.contrast);
  const scaleKey = JSON.stringify(displayStorageKeys.scale);
  const contrastSource = JSON.stringify(contrastSourceAttribute);
  const scaleSource = JSON.stringify(scaleSourceAttribute);
  // The markers' values, envui:high, as ownContrastSource and ownScaleSource write them.
  const contrastMark = JSON.stringify(ownContrastSource(''));
  const compactMark = JSON.stringify(ownScaleSource('compact'));
  return `(function(){var r=document.documentElement;try{var c=localStorage.getItem(${contrastKey}),q=new URLSearchParams(location.search).get("scale"),s=q==="compact"||q==="comfortable"?q:localStorage.getItem(${scaleKey});if(c==="high"||c==="standard"){r.setAttribute("data-env-contrast",c);r.setAttribute(${contrastSource},${contrastMark}+c)}if(s==="compact"){r.setAttribute("data-env-scale","compact");r.setAttribute(${scaleSource},${compactMark})}}catch(e){}})();`;
}
