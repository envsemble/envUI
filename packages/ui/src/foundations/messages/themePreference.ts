/**
 * The English defaults of the `themePreference` messages: ThemeToggle and ThemeMenuRadioGroup, which
 * set the theme preference. EnvUIProvider's `messages.themePreference` overrides any of them.
 */
export const themePreference = {
  /** ThemeToggle's name in the light theme. */
  toDark: 'Switch to dark theme',
  /** ThemeToggle's name in the dark theme. */
  toLight: 'Switch to light theme',
  /** The choice that follows the system's theme, as in a theme menu. */
  system: 'System',
  /** The light theme's choice. */
  light: 'Light',
  /** The dark theme's choice. */
  dark: 'Dark',
};

export type ThemePreferenceMessages = typeof themePreference;
