import type { ThemeStorageOptions } from '@envsemble/envui/theme-storage';

export const displayStorageKeys = {
  theme: 'envui-site-theme',
  contrast: 'envui-site-contrast',
  scale: 'envui-site-scale',
  motion: 'envui-site-motion',
} as const;

export const siteThemeStorage = {
  storageKey: displayStorageKeys.theme,
} as const satisfies ThemeStorageOptions;

export const drawerWidthKey = (area: 'catalogue' | 'docs') => `envui-site-drawer-width-${area}`;

export const drawerWidths = {
  catalogue: { defaultWidth: 16, minWidth: 13, maxWidth: 24 },
  docs: { defaultWidth: 21, minWidth: 18, maxWidth: 30 },
} as const;

export const storedDrawerWidthProperty = (area: 'catalogue' | 'docs') =>
  `--site-drawer-width-${area}`;

export const modifierAttribute = 'data-site-modifier';
