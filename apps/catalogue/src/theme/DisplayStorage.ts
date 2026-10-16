/**
 * Where the catalogue stores the reader's display settings in localStorage. vite.config.ts reads
 * the theme's key too, for the script that applies the stored theme before the catalogue loads.
 */
export const displayStorageKeys = {
  theme: 'envui-catalogue-theme',
  contrast: 'envui-catalogue-contrast',
  scale: 'envui-catalogue-scale',
} as const;
