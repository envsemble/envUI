'use client';

import type { ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { IconButton, type IconButtonProps } from '../actions/Button.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { themePreference } from './messages/themePreference.js';
import { IconDarkMode } from '../icons/DarkMode.js';
import { IconLightMode } from '../icons/LightMode.js';
import { useThemePreference } from './ThemePreferenceProvider.js';
import '../styles/Base.css';
import '../styles/ThemeToggle.css';

type ToggleButtonProps = Extract<IconButtonProps, { href?: undefined }>;

export type ThemeToggleProps = (ToggleButtonProps extends infer Props
  ? Props extends unknown
    ? Omit<Props, 'icon' | 'aria-label' | 'onClick' | 'href'>
    : never
  : never) & {
  /**
   * The button's name; without it, Switch to dark theme or Switch to light theme, or
   * EnvUIProvider's messages.themePreference.
   */
  'aria-label'?: string;
  /**
   * The button's icon, such as one of the application's own; useThemePreference gives the theme
   * to choose it by.
   * @default the dark mode icon in the light theme, the light mode icon in the dark theme
   */
  icon?: ReactNode;
};

/** Switches between the light and dark themes, through the nearest ThemePreferenceProvider. */
export function ThemeToggle({
  title,
  className,
  'aria-label': ownLabel,
  icon,
  ...props
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemePreference();
  const messages = useMessages('themePreference', themePreference);
  const label = ownLabel ?? (theme === 'light' ? messages.toDark : messages.toLight);
  return (
    <IconButton
      {...props}
      className={classNames('env-theme-toggle', className)}
      icon={icon ?? (theme === 'light' ? <IconDarkMode /> : <IconLightMode />)}
      aria-label={label}
      title={title ?? label}
      onClick={toggleTheme}
    />
  );
}
