// The marks the library's theme bootstrap sets, which no entry exports, from its source module:
// vite.config.ts runs this file in Node before anything is built (as it imports ThemeBootstrap.ts).
import {
  contrastSourceAttribute,
  ownContrastSource,
  ownScaleSource,
  scaleSourceAttribute,
} from '../../../../packages/ui/src/foundations/themeBootstrap.js';

/**
 * Where the site stores the reader's display settings in localStorage. vite.config.ts writes the
 * script that applies them before the site loads.
 */
export const displayStorageKeys = {
  theme: 'envui-site-theme',
  contrast: 'envui-site-contrast',
  scale: 'envui-site-scale',
  motion: 'envui-site-motion',
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
 * the stored scale, as in DisplaySettingsProvider; the system scale, the default, writes nothing. It
 * writes the attributes and source markers that ThemePreferenceProvider writes,
 * data-env-contrast-source="envui:high" and data-env-scale-source="envui:compact", so the provider
 * takes them as its own once it mounts.
 */
export function createDisplayBootstrapScript() {
  const contrastKey = JSON.stringify(displayStorageKeys.contrast);
  const scaleKey = JSON.stringify(displayStorageKeys.scale);
  const contrastSource = JSON.stringify(contrastSourceAttribute);
  const scaleSource = JSON.stringify(scaleSourceAttribute);
  // The markers' values, envui:high, as ownContrastSource and ownScaleSource write them.
  const contrastMark = JSON.stringify(ownContrastSource(''));
  const scaleMark = JSON.stringify(ownScaleSource(''));
  return `(function(){var r=document.documentElement;try{var c=localStorage.getItem(${contrastKey}),q=new URLSearchParams(location.search).get("scale"),s=q==="compact"||q==="comfortable"||q==="system"?q:localStorage.getItem(${scaleKey});if(c==="high"||c==="standard"){r.setAttribute("data-env-contrast",c);r.setAttribute(${contrastSource},${contrastMark}+c)}if(s==="compact"||s==="comfortable"){r.setAttribute("data-env-scale",s);r.setAttribute(${scaleSource},${scaleMark}+s)}}catch(e){}})();`;
}

/**
 * A style sheet for the document head that gives the page its background from the first paint,
 * before the site's style sheets arrive: the root's `--env-color-bg-page` for each theme and
 * contrast, as `tokensCss` (envUI's Tokens.css) sets it, under the same selectors, so it follows
 * the theme the bootstrap script applies rather than painting white first and flashing in a dark
 * theme. In a layer of its own ahead of every other, so envUI's own rule for the background,
 * which sets the same color, takes over once it loads.
 */
export function createFirstPaintStyle(tokensCss: string) {
  const rules: string[] = [];
  const open: string[] = [];
  for (const line of tokensCss.split('\n')) {
    const text = line.trim();
    if (text.endsWith('{')) open.push(text.slice(0, -1).trim());
    else if (text === '}') open.pop();
    else {
      const value = /^--env-color-bg-page:\s*([^;]+);/.exec(text)?.[1];
      const selector = open.at(-1);
      if (!value || !selector?.startsWith('.env-theme')) continue;
      const rule = `html${selector}{background:${value}}`;
      const media = open.find((block) => block.startsWith('@media'));
      rules.push(media ? `${media}{${rule}}` : rule);
    }
  }
  if (!rules.length) throw new Error('Tokens.css sets no --env-color-bg-page on .env-theme.');
  return `@layer site-first-paint{${rules.join('')}}`;
}
