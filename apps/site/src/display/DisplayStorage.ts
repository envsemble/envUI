/**
 * Where the site stores the reader's display settings in localStorage. The script that applies
 * them before the site loads is in HeadScripts.ts.
 */
export const displayStorageKeys = {
  theme: 'envui-site-theme',
  contrast: 'envui-site-contrast',
  scale: 'envui-site-scale',
  motion: 'envui-site-motion',
} as const;

/** Where the site keeps the width the reader gives a part's drawer, the catalogue's or the Docs'. */
export const drawerWidthKey = (area: 'catalogue' | 'docs') => `envui-site-drawer-width-${area}`;
