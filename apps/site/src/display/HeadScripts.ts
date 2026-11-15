// eslint-disable-next-line no-restricted-imports
import {
  contrastSourceAttribute,
  createThemeBootstrapScript,
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
  siteTheme,
  storedDrawerWidthProperty,
} from './DisplayStorage.ts';

const renamedStorageKeys: readonly (readonly [before: string, now: string])[] = [
  ['envui-catalogue-theme', displayStorageKeys.theme],
  ['envui-catalogue-contrast', displayStorageKeys.contrast],
  ['envui-catalogue-scale', displayStorageKeys.scale],
  ['envui-catalogue-drawer-width-site', drawerWidthKey('catalogue')],
  ['envui-catalogue-drawer-width-docs', drawerWidthKey('docs')],
];

export const headScript = () =>
  createStorageMigrationScript() +
  createThemeBootstrapScript(siteTheme) +
  createDisplayBootstrapScript() +
  createSiteBootstrapScript();

function createStorageMigrationScript() {
  const keys = JSON.stringify(renamedStorageKeys);
  return `(function(){try{var k=${keys};for(var i=0;i<k.length;i++){var v=localStorage.getItem(k[i][0]);if(v!==null){if(localStorage.getItem(k[i][1])===null)localStorage.setItem(k[i][1],v);localStorage.removeItem(k[i][0])}}}catch(e){}})();`;
}

function createDisplayBootstrapScript() {
  const contrastKey = JSON.stringify(displayStorageKeys.contrast);
  const scaleKey = JSON.stringify(displayStorageKeys.scale);
  const contrastSource = JSON.stringify(contrastSourceAttribute);
  const scaleSource = JSON.stringify(scaleSourceAttribute);
  const contrastSourcePrefix = JSON.stringify(ownContrastSource(''));
  const scaleSourcePrefix = JSON.stringify(ownScaleSource(''));
  return `(function(){var r=document.documentElement;try{var c=localStorage.getItem(${contrastKey}),q=new URLSearchParams(location.search).get("scale"),s=q==="compact"||q==="comfortable"||q==="system"?q:localStorage.getItem(${scaleKey});if(c==="high"||c==="standard"){r.setAttribute("data-env-contrast",c);r.setAttribute(${contrastSource},${contrastSourcePrefix}+c)}if(s==="compact"||s==="comfortable"){r.setAttribute("data-env-scale",s);r.setAttribute(${scaleSource},${scaleSourcePrefix}+s)}}catch(e){}})();`;
}

function createSiteBootstrapScript() {
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
