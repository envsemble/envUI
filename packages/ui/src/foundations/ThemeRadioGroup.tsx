'use client';

import { useContext, type ReactNode } from 'react';
import * as Menu from '../navigation/Menu.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { themeToggle } from './messages/themeToggle.js';
import { ThemePreferenceContext } from './internal/ThemePreferenceContext.js';
import type { ThemePreference } from './themeBootstrap.js';
import { Computer } from '../icons/Computer.js';
import { DarkMode } from '../icons/DarkMode.js';
import { LightMode } from '../icons/LightMode.js';

export interface ThemeRadioGroupProps {
  /**
   * The chosen preference: system, light or dark.
   * @default the nearest ThemePreferenceProvider's preference
   */
  value?: ThemePreference;
  /**
   * Called with the preference chosen, for an application that stores the theme itself.
   * @default the nearest ThemePreferenceProvider's setPreference, which stores the choice
   */
  onValueChange?: (value: ThemePreference) => void;
  /**
   * A small heading above the choices, which names the group. Leave it out inside a submenu, which
   * its row already names.
   */
  label?: ReactNode;
  /** Id of a heading elsewhere in the menu that names the group, in place of label. */
  'aria-labelledby'?: string;
  /**
   * Close the menu after a choice. Off by default, so people see the theme change with the menu
   * still open.
   * @default false
   */
  closeOnClick?: boolean;
}

const choices = [
  { value: 'system', icon: <Computer /> },
  { value: 'light', icon: <LightMode /> },
  { value: 'dark', icon: <DarkMode /> },
] as const satisfies readonly { value: ThemePreference; icon: ReactNode }[];

/**
 * The theme choice for a Menu: System, Light and Dark as radio items. Inside a
 * ThemePreferenceProvider it shows and stores the provider's preference; value and onValueChange
 * connect it to a theme the application stores itself.
 */
export function ThemeRadioGroup({
  value,
  onValueChange,
  label,
  'aria-labelledby': labelledBy,
  closeOnClick = false,
}: ThemeRadioGroupProps) {
  const provider = useContext(ThemePreferenceContext);
  const messages = useMessages('themeToggle', themeToggle);
  const current = value ?? provider?.preference;
  const change = onValueChange ?? provider?.setPreference;
  if (current === undefined || !change)
    throw new Error(
      'ThemeRadioGroup needs a ThemePreferenceProvider around it, or value and onValueChange.',
    );
  return (
    <Menu.RadioGroup
      value={current}
      onValueChange={(next) => change(next as ThemePreference)}
      label={label}
      aria-labelledby={labelledBy}
    >
      {choices.map((choice) => (
        <Menu.RadioItem
          key={choice.value}
          value={choice.value}
          icon={choice.icon}
          closeOnClick={closeOnClick}
        >
          {messages[choice.value]}
        </Menu.RadioItem>
      ))}
    </Menu.RadioGroup>
  );
}
