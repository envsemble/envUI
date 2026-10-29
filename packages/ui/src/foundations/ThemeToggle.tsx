'use client';

import { classNames } from '../internal/classNames.js';
import { IconButton, type IconButtonProps } from '../actions/Button.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { themePreference } from './messages/themePreference.js';
import { DarkMode } from '../icons/DarkMode.js';
import { LightMode } from '../icons/LightMode.js';
import { useThemePreference } from './ThemePreference.js';
import '../styles/Base.css';
import '../styles/ThemeToggle.css';

/** IconButton's props as a button: a toggle runs its own onClick, so it is never a link. */
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
};

/** Switches between the light and dark themes and stores the choice. */
export function ThemeToggle({
  title,
  className,
  'aria-label': ownLabel,
  ...props
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemePreference();
  const messages = useMessages('themePreference', themePreference);
  const label = ownLabel ?? (theme === 'light' ? messages.toDark : messages.toLight);
  return (
    <IconButton
      {...(props as IconButtonProps)}
      className={classNames('env-theme-toggle', className)}
      icon={theme === 'light' ? <DarkMode /> : <LightMode />}
      aria-label={label}
      title={title ?? label}
      onClick={toggleTheme}
    />
  );
}
