// What the site's index.html runs and paints before the site loads, which vite.config.ts writes into
// its head. Node runs this module from there before anything is built, where neither the package's
// build nor the @envui-internal alias resolves, so the marks of the library's theme bootstrap,
// which no entry exports, come from its source module by path.
// eslint-disable-next-line no-restricted-imports -- Node loads this file outside Vite (see above).
import {
  contrastSourceAttribute,
  ownContrastSource,
  ownScaleSource,
  scaleSourceAttribute,
} from '../../../../packages/ui/src/foundations/themeBootstrap.ts';
import {
  bannerAppearAttribute,
  bannerDrawnKey,
  displayStorageKeys,
  drawerWidthKey,
  drawerWidths,
  modifierAttribute,
  storedDrawerWidthProperty,
} from './DisplayStorage.ts';

/**
 * The keys the site stored settings under before, each with the key that holds it now. The site
 * was once called the catalogue, and the catalogue's drawer the site's.
 */
const renamedStorageKeys: readonly (readonly [before: string, now: string])[] = [
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
 * An inline script for the document head that applies to the root, before the first paint, what
 * else the reader's browser and stored settings change on a page the server rendered without them,
 * which the site's components take over once it has hydrated:
 * - the width the reader gave each part's drawer, within its bounds, as a custom property that the
 *   drawer takes until then (SiteDrawer.tsx, Shell.css);
 * - whether the banner of the page the session opens on draws itself in (BannerAppear.ts), where
 *   the animations play and no page of the session has drawn one yet, so its lines stay hidden
 *   until it does (Banners.css);
 * - whether the shortcuts' modifier is ⌘, on Apple platforms, as useModifierKey tells, so the
 *   search button shows its keys from the start (SearchButton.tsx, Shell.css).
 */
export function createSiteBootstrapScript() {
  const widths = JSON.stringify(
    (['catalogue', 'docs'] as const).map((area) => [
      drawerWidthKey(area),
      storedDrawerWidthProperty(area),
      drawerWidths[area].minWidth,
      drawerWidths[area].maxWidth,
    ]),
  );
  const motionKey = JSON.stringify(displayStorageKeys.motion);
  const drawnKey = JSON.stringify(bannerDrawnKey);
  const appear = JSON.stringify(bannerAppearAttribute);
  const modifier = JSON.stringify(modifierAttribute);
  return `(function(){var r=document.documentElement,w=${widths},m=null,d=true,n=navigator,u=n.userAgentData;try{for(var i=0;i<w.length;i++){var v=parseFloat(localStorage.getItem(w[i][0]));if(isFinite(v))r.style.setProperty(w[i][1],Math.min(w[i][3],Math.max(w[i][2],v))+"rem")}m=localStorage.getItem(${motionKey})}catch(e){}if(m!=="paused"&&(m==="playing"||!matchMedia("(prefers-reduced-motion: reduce)").matches)){try{d=sessionStorage.getItem(${drawnKey})===null}catch(e){}if(d)r.setAttribute(${appear},"")}if(/mac|iphone|ipad|ipod/i.test(u&&u.platform||n.platform||""))r.setAttribute(${modifier},"meta")})();`;
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
