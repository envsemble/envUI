/**
 * The theme that useTheme() returns outside any Theme: the theme context's default. It is one
 * object, so a component can tell by identity that no Theme encloses it, as
 * ThemePreferenceProvider does to take the scale and the contrast the page set on the root.
 */
export const outsideTheme = Object.freeze({
  theme: 'light',
  contrast: 'system',
  scale: 'comfortable',
} as const);
