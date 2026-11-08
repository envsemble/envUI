'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useRef, type ComponentPropsWithRef, type ReactElement, type ReactNode } from 'react';
import { classNames } from '../../internal/classNames.js';
import type { PopupSide } from '../../internal/popup/PopupSurface.js';
import {
  containedModal,
  containedOpenChange,
  usePortalContainer,
} from '../../internal/popup/PortalContainerContext.js';
import type { SkeletonProps } from '../../internal/skeleton.js';
import { withDisplayName } from '../../internal/withDisplayName.js';
import { markTriggerOwner } from '../../internal/popup/triggerOwner.js';
import { MenuPopup, menuParts } from '../internal/MenuPopup.js';
import type { OpenChangeDetails } from '../internal/menuOpenChange.js';
import { Item } from './MenuItem.js';
import { Submenu } from './MenuSubmenu.js';
import { CheckboxItem, Group, RadioGroup, RadioItem } from './MenuChoices.js';
import '../../styles/Base.css';
import '../../styles/Menu.css';

// Menu's parts: the root, header and separator here; the items in MenuItem.tsx, the submenu in
// MenuSubmenu.tsx, and the groups and the items that choose in MenuChoices.tsx.

export type { OpenChangeDetails, OpenChangeReason } from '../internal/menuOpenChange.js';
export type { ItemProps } from './MenuItem.js';
export type { SubmenuProps } from './MenuSubmenu.js';
export type {
  CheckboxItemProps,
  GroupProps,
  RadioGroupProps,
  RadioItemProps,
} from './MenuChoices.js';

export interface RootProps
  extends
    Omit<ComponentPropsWithRef<'div'>, 'children' | 'aria-label' | 'role' | 'onToggle'>,
    SkeletonProps {
  /**
   * The control that opens the menu, such as a Button or an AvatarButton; it receives the menu
   * button semantics and ref, so it must accept native props and a ref.
   */
  trigger: ReactElement;
  /**
   * Accessible name of the menu, where its trigger's name doesn't say it.
   * @default the trigger's name, such as Account
   */
  'aria-label'?: string;
  /**
   * Menu.Header, Menu.Item, Menu.Group, Menu.RadioGroup, Menu.CheckboxItem, Menu.Submenu and Menu.Separator
   * elements.
   */
  children: ReactNode;
  /**
   * The side of the trigger the menu opens on; it flips to the other side where the window has no
   * room. inline-start and inline-end follow the text direction.
   * @default 'bottom'
   */
  side?: PopupSide;
  /**
   * How the menu lines up with the trigger along that side.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Whether the menu is open, for a controlled menu; leave it out and the menu opens and closes
   * itself.
   */
  open?: boolean;
  /**
   * Whether an uncontrolled menu starts open.
   * @default false
   */
  defaultOpen?: boolean;
  /** Called with the new visibility, and why, as the menu opens or closes. */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /**
   * Class of the menu popup. ref, style, data attributes and the other native props go to the popup
   * too; the trigger is the element you pass.
   */
  className?: string;
}

/**
 * A list of actions and destinations that opens from a trigger; keyboard and focus follow the menu
 * pattern. The popup is raised above the page, with rows of the scale's row height, full-width
 * hairline separators and small keys for shortcuts.
 */
function Root({
  trigger,
  'aria-label': label,
  children,
  side = 'bottom',
  align = 'end',
  open,
  defaultOpen,
  onOpenChange,
  skeleton = false,
  className,
  ref,
  ...popupProps
}: RootProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const portal = usePortalContainer();
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={containedOpenChange(portal, triggerRef, (next, details) =>
        onOpenChange?.(next, { reason: details.reason }),
      )}
      modal={containedModal(portal, true)}
    >
      <BaseMenu.Trigger ref={triggerRef} render={trigger} />
      {/* Base UI names the menu after its trigger; the menu's own label replaces that name. */}
      <MenuPopup
        parts={menuParts}
        label={label}
        side={side}
        align={align}
        sideOffset={8}
        trigger={triggerRef}
        className={className}
        popupRef={ref}
        popupProps={popupProps}
        skeleton={skeleton}
      >
        {children}
      </MenuPopup>
    </BaseMenu.Root>
  );
}

export interface HeaderProps extends ComponentPropsWithRef<'div'> {
  /** The context, such as the signed-in person's avatar, name and e-mail address. */
  children: ReactNode;
}

/** Non-interactive context at the top of a menu, such as the signed-in account. */
function Header({ className, ...props }: HeaderProps) {
  return (
    <div role="presentation" {...props} className={classNames('env-menu-header', className)} />
  );
}

export type SeparatorProps = Omit<ComponentPropsWithRef<'div'>, 'children'>;

/** Separates groups of menu items. */
function Separator({ className, ...props }: SeparatorProps) {
  return <BaseMenu.Separator {...props} className={classNames('env-menu-separator', className)} />;
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ markTriggerOwner(
  /* @__PURE__ */ withDisplayName(Root, 'Menu.Root'),
);
const HeaderPart = /* @__PURE__ */ withDisplayName(Header, 'Menu.Header');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'Menu.Item');
const SeparatorPart = /* @__PURE__ */ withDisplayName(Separator, 'Menu.Separator');
const SubmenuPart = /* @__PURE__ */ withDisplayName(Submenu, 'Menu.Submenu');
const GroupPart = /* @__PURE__ */ withDisplayName(Group, 'Menu.Group');
const RadioGroupPart = /* @__PURE__ */ withDisplayName(RadioGroup, 'Menu.RadioGroup');
const RadioItemPart = /* @__PURE__ */ withDisplayName(RadioItem, 'Menu.RadioItem');
const CheckboxItemPart = /* @__PURE__ */ withDisplayName(CheckboxItem, 'Menu.CheckboxItem');
export {
  RootPart as Root,
  HeaderPart as Header,
  ItemPart as Item,
  SeparatorPart as Separator,
  SubmenuPart as Submenu,
  GroupPart as Group,
  RadioGroupPart as RadioGroup,
  RadioItemPart as RadioItem,
  CheckboxItemPart as CheckboxItem,
};
