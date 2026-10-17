'use client';

import type { ReactNode } from 'react';
import { AvatarButton } from '../actions/AvatarButton.js';
import { Avatar } from '../content/Avatar.js';
import { ThemeRadioGroup, type ThemeRadioGroupProps } from '../foundations/ThemeRadioGroup.js';
import { accountMenu } from '../foundations/messages/accountMenu.js';
import { organizationSwitcher } from '../foundations/messages/organizationSwitcher.js';
import { Groups3 } from '../icons/Groups3.js';
import { Palette } from '../icons/Palette.js';
import { UnfoldMore } from '../icons/UnfoldMore.js';
import { ActionElement } from '../internal/ActionElement.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import * as Menu from './Menu.js';
import type { OrganizationSwitcherItem } from './OrganizationSwitcher.js';
import { useInSidebar, useSidebarCompact } from './internal/SidebarCompact.js';
import { OrganizationOptions } from './internal/OrganizationOptions.js';

export interface RootProps
  extends Omit<Menu.RootProps, 'trigger' | 'aria-label' | 'children' | 'side' | 'align'> {
  /** The signed-in person's name, on the trigger row, in the avatar's tooltip and in the menu's header. */
  name: string;
  /** A second line under the name, such as the e-mail address, on the trigger row and in the header. */
  description?: ReactNode;
  /** The person's picture; the default person picture shows without one. */
  avatarSrc?: string;
  /**
   * What opens the menu: `row`, the avatar with the name and description, for the foot of a
   * sidebar; `avatar`, the avatar alone, for a header or a sidebar showing icons only; `auto`, a
   * row in an expanded sidebar and the avatar elsewhere.
   * @default 'auto'
   */
  trigger?: 'auto' | 'avatar' | 'row';
  /**
   * The side of the trigger the menu opens on; it flips where the window has no room.
   * @default 'top' for a row, 'inline-end' for the avatar in a sidebar, else 'bottom'
   */
  side?: Menu.RootProps['side'];
  /**
   * How the menu lines up with the trigger along that side.
   * @default 'start' for a row, else 'end'
   */
  align?: Menu.RootProps['align'];
  /**
   * Accessible name of the menu.
   * @default 'Account', or EnvUIProvider's messages.accountMenu.label
   */
  'aria-label'?: string;
  /**
   * The menu's items after its header: Menu.Item, Menu.Separator, AccountMenu.ThemeSubmenu,
   * AccountMenu.OrganizationSubmenu and the other Menu parts.
   */
  children: ReactNode;
}

/**
 * The signed-in person's menu: their avatar, or a row with their name, opens a Menu with a header
 * that shows who is signed in, then the application's items, such as account settings, the theme
 * and sign out.
 */
function Root({
  name,
  description,
  avatarSrc,
  trigger = 'auto',
  side,
  align,
  'aria-label': ownLabel,
  className,
  children,
  ...menuProps
}: RootProps) {
  const messages = useMessages('accountMenu', accountMenu);
  const inSidebar = useInSidebar();
  const inRail = useSidebarCompact();
  const row = trigger === 'row' || (trigger === 'auto' && inSidebar && !inRail);
  const control = row ? (
    <ActionElement className="env-account-menu-trigger">
      <Avatar name={name} src={avatarSrc} size="sm" />
      <span className="env-account-menu-trigger-text">
        <span className="env-account-menu-trigger-name">{name}</span>
        {description != null && (
          <span className="env-account-menu-trigger-description">{description}</span>
        )}
      </span>
      <DecorativeIcon>
        <UnfoldMore />
      </DecorativeIcon>
    </ActionElement>
  ) : (
    <AvatarButton
      name={name}
      description={typeof description === 'string' ? description : undefined}
      src={avatarSrc}
      size={inSidebar ? 'sm' : 'md'}
    />
  );
  return (
    <Menu.Root
      {...menuProps}
      aria-label={ownLabel ?? messages.label}
      side={side ?? (row ? 'top' : inSidebar ? 'inline-end' : 'bottom')}
      align={align ?? (row ? 'start' : 'end')}
      className={classNames('env-account-menu', className)}
      trigger={control}
    >
      <Menu.Header className="env-account-menu-header">
        <Avatar name={name} src={avatarSrc} size="lg" />
        <span className="env-account-menu-header-text">
          <span className="env-account-menu-header-name">{name}</span>
          {description != null && (
            <span className="env-account-menu-header-description">{description}</span>
          )}
        </span>
      </Menu.Header>
      {children}
    </Menu.Root>
  );
}

export interface ThemeSubmenuProps extends Omit<ThemeRadioGroupProps, 'label' | 'aria-labelledby'> {
  /**
   * The label of the row that opens the submenu.
   * @default 'Theme', or EnvUIProvider's messages.accountMenu.theme
   */
  label?: string;
  /**
   * A decorative icon before the label.
   * @default the Palette icon
   */
  icon?: ReactNode;
}

/**
 * A submenu with the theme choice, System, Light and Dark: a ThemeRadioGroup, which stores the
 * choice through the nearest ThemePreferenceProvider unless value and onValueChange are given.
 */
function ThemeSubmenu({ label, icon, ...group }: ThemeSubmenuProps) {
  const messages = useMessages('accountMenu', accountMenu);
  return (
    <Menu.Submenu label={label ?? messages.theme} icon={icon ?? <Palette />}>
      <ThemeRadioGroup {...group} />
    </Menu.Submenu>
  );
}

export interface OrganizationSubmenuProps {
  /** Organizations the signed-in person belongs to, in display order. */
  items: readonly OrganizationSwitcherItem[];
  /** The active organization's id, or null before one is chosen; its name shows under the row's label. */
  value: string | null;
  /** Called with the id of the organization chosen, unless it is the active one. */
  onValueChange: (value: string) => void;
  /** Offers creating an organization after the organizations. */
  onCreate?: () => void;
  /**
   * The label of the row that opens the submenu.
   * @default 'Organization', or EnvUIProvider's messages.accountMenu.organization
   */
  label?: string;
  /**
   * Label of the create action.
   * @default 'Create organization', or EnvUIProvider's messages.organizationSwitcher.create
   */
  createLabel?: string;
  /**
   * A decorative icon before the label.
   * @default the Groups3 icon
   */
  icon?: ReactNode;
}

/**
 * A submenu that switches between the person's organizations, with OrganizationSwitcher's rows,
 * for an application whose account menu holds the switch. OrganizationSwitcher stays the control
 * for a switch of its own, such as at the top of a sidebar.
 */
function OrganizationSubmenu({
  items,
  value,
  onValueChange,
  onCreate,
  label,
  createLabel,
  icon,
}: OrganizationSubmenuProps) {
  const messages = useMessages('accountMenu', accountMenu);
  const switcherMessages = useMessages('organizationSwitcher', organizationSwitcher);
  const current = items.find((item) => item.id === value);
  return (
    <Menu.Submenu
      label={label ?? messages.organization}
      icon={icon ?? <Groups3 />}
      description={current?.name}
    >
      <OrganizationOptions
        items={items}
        value={value}
        onValueChange={onValueChange}
        onCreate={onCreate}
        createLabel={createLabel ?? switcherMessages.create}
      />
    </Menu.Submenu>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'AccountMenu.Root');
const ThemeSubmenuPart = /* @__PURE__ */ withDisplayName(ThemeSubmenu, 'AccountMenu.ThemeSubmenu');
const OrganizationSubmenuPart = /* @__PURE__ */ withDisplayName(
  OrganizationSubmenu,
  'AccountMenu.OrganizationSubmenu',
);
export {
  RootPart as Root,
  ThemeSubmenuPart as ThemeSubmenu,
  OrganizationSubmenuPart as OrganizationSubmenu,
};
