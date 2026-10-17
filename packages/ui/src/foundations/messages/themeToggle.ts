/**
 * The English defaults of the `themeToggle` messages: ThemeToggle. EnvUIProvider's
 * `messages.themeToggle` overrides any of them.
 */
export const themeToggle = {
  /** The button's name in the light theme. */
  toDark: 'Switch to dark theme',
  /** The button's name in the dark theme. */
  toLight: 'Switch to light theme',
  /** The choice that follows the system's theme, as in a theme menu. */
  system: 'System',
  /** The light theme's choice. */
  light: 'Light',
  /** The dark theme's choice. */
  dark: 'Dark',
};

export type ThemeToggleMessages = typeof themeToggle;
