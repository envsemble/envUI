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

/**
 * Each part's drawer at the start of a wide window: the width it starts at and its bounds, in rem.
 * The Docs' drawer holds the wordmark and search on its first row, so it starts wider.
 */
export const drawerWidths = {
  catalogue: { defaultWidth: 16, minWidth: 13, maxWidth: 24 },
  docs: { defaultWidth: 21, minWidth: 18, maxWidth: 30 },
} as const;

/**
 * The custom property on the root that holds the width the reader gave a part's drawer until the
 * site has hydrated (HeadScripts.ts, SiteDrawer.tsx).
 */
export const storedDrawerWidthProperty = (area: 'catalogue' | 'docs') =>
  `--site-drawer-width-${area}`;

/** Where the site keeps, in sessionStorage, that the session's banner has drawn itself in. */
export const bannerDrawnKey = 'envui-site-banner-drawn';

/**
 * On the root from the first paint where the banner of the page the session opens on is to draw
 * itself in (HeadScripts.ts), so its lines don't show whole first, until the banner decides
 * (BannerAppear.ts).
 */
export const bannerAppearAttribute = 'data-site-banner-appear';

/** On the root, `meta` where the shortcuts' modifier is ⌘ (HeadScripts.ts, SearchButton.tsx). */
export const modifierAttribute = 'data-site-modifier';
