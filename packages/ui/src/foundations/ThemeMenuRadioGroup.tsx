'use client';

import { useContext, type ReactNode } from 'react';
import * as Menu from '../actions/menu/Menu.js';
import { RadioItemsCloseOnClickContext } from '../actions/menu/MenuChoices.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { themePreference } from './messages/themePreference.js';
import { ThemePreferenceContext } from './internal/ThemePreferenceContext.js';
import type { ThemePreference } from './themeBootstrap.js';
import { IconComputer } from '../icons/Computer.js';
import { IconDarkMode } from '../icons/DarkMode.js';
import { IconLightMode } from '../icons/LightMode.js';

export interface ThemeMenuRadioGroupProps {
  /**
   * The chosen preference: system, light or dark.
   * @default the nearest ThemePreferenceProvider's preference
   */
  value?: ThemePreference;
  /**
   * Called with the preference chosen, for a group outside a ThemePreferenceProvider.
   * @default the nearest ThemePreferenceProvider's setPreference
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
   * still open. It applies to the choices given as children too, unless one sets its own.
   * @default false
   */
  closeOnClick?: boolean;
  /**
   * The choices, as Menu.RadioItems valued system, light or dark, in place of the three default
   * ones: such as Light and Dark alone, or a choice with a hint beside it.
   */
  children?: ReactNode;
  /** The group's class, beside env-menu-group. */
  className?: string;
}

const choices = [
  { value: 'system', icon: <IconComputer /> },
  { value: 'light', icon: <IconLightMode /> },
  { value: 'dark', icon: <IconDarkMode /> },
] as const satisfies readonly { value: ThemePreference; icon: ReactNode }[];

/**
 * The theme choice for a Menu: System, Light and Dark as radio items. Inside a
 * ThemePreferenceProvider it shows and changes the provider's preference; value and onValueChange
 * connect it to a preference outside one.
 */
export function ThemeMenuRadioGroup({
  value,
  onValueChange,
  label,
  'aria-labelledby': labelledBy,
  closeOnClick = false,
  children,
  className,
}: ThemeMenuRadioGroupProps) {
  const provider = useContext(ThemePreferenceContext);
  const messages = useMessages('themePreference', themePreference);
  const current = value ?? provider?.preference;
  const change = onValueChange ?? provider?.setPreference;
  if (current === undefined || !change)
    throw new Error(
      'ThemeMenuRadioGroup needs a ThemePreferenceProvider around it, or value and onValueChange.',
    );
  return (
    <Menu.RadioGroup
      value={current}
      onValueChange={(next) => change(next as ThemePreference)}
      label={label}
      aria-labelledby={labelledBy}
      className={className}
    >
      <RadioItemsCloseOnClickContext value={closeOnClick}>
        {children ??
          choices.map((choice) => (
            <Menu.RadioItem key={choice.value} value={choice.value} start={choice.icon}>
              {messages[choice.value]}
            </Menu.RadioItem>
          ))}
      </RadioItemsCloseOnClickContext>
    </Menu.RadioGroup>
  );
}
