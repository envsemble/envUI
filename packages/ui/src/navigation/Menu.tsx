'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  useId,
  useRef,
  type AriaAttributes,
  type ComponentPropsWithRef,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Grid } from '../foundations/Layout.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import type { PopupSide } from '../internal/PopupSurface.js';
import { Check } from '../icons/Check.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { Kbd } from '../content/Kbd.js';
import { useLinkComponent } from '../internal/LinkContext.js';
import type { SkeletonProps } from '../internal/skeleton.js';
import { MenuPopup, menuPopupInlineInset, menuPopupInset } from './internal/MenuPopup.js';
import { setRef } from '../internal/setRef.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { markTriggerOwner } from '../internal/triggerOwner.js';
import { keyShortcuts, shortcutChords } from '../internal/shortcuts.js';

/** The Base UI parts every menu's popup is made of. */
const menuParts = {
  Portal: BaseMenu.Portal,
  Positioner: BaseMenu.Positioner,
  Popup: BaseMenu.Popup,
};

export interface RootProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'aria-label' | 'role' | 'onToggle'>,
    SkeletonProps {
  /**
   * The control that opens the menu, such as a Button or an AvatarButton; it receives the menu
   * button semantics and ref, so it must accept native props and a ref.
   */
  trigger: ReactElement;
  /** Accessible name of the menu, such as Account. */
  'aria-label': string;
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
  /** Called with the new visibility as the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Class of the menu popup. ref, style, data attributes and the other native props go to the popup
   * too; the trigger is the element you pass.
   */
  className?: string;
}

/**
 * A list of actions and destinations that opens from a trigger; keyboard and focus follow the menu
 * pattern. The popup is raised above the page, with rows of the scale's row height, hairline
 * separators and small keys for shortcuts.
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
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
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

interface ItemContentProps {
  /** A decorative icon before the label, such as Settings. */
  icon?: ReactNode;
  /** The item's label, which names it. */
  children: ReactNode;
  /** A second, muted line; announced as the item's description. */
  description?: ReactNode;
  /**
   * Keyboard hint at the end, such as Ctrl+P, shown as Kbd keys and announced as aria-keyshortcuts;
   * a sequence, such as Ctrl+K Ctrl+S, shows its keys without the attribute. The application
   * handles the shortcut itself.
   */
  shortcut?: string;
  /** End content, such as a Badge or CounterBadge; it is part of the item's name. */
  end?: ReactNode;
}

/** Shared item layout: indicator, icon, label with optional description, end content, shortcut. */
function useMenuItemContent(
  { icon, children, description, shortcut, end }: ItemContentProps,
  indicator?: ReactNode,
) {
  const descriptionId = useId();
  const chords = shortcut ? shortcutChords(shortcut) : [];
  const content = (
    <>
      {indicator}
      {icon != null && <DecorativeIcon>{icon}</DecorativeIcon>}
      <span className="env-menu-item-text">
        <span className="env-menu-item-label">{children}</span>
        {description != null && (
          // Announced through aria-describedby rather than as part of the item's name.
          <span className="env-menu-item-description" id={descriptionId} aria-hidden="true">
            {description}
          </span>
        )}
      </span>
      {end != null && (
        <>
          {/* The space keeps the end content a separate word in the item's accessible name. */}{' '}
          <span className="env-menu-item-end">{end}</span>
        </>
      )}
      {chords.length > 0 && (
        // aria-keyshortcuts announces the shortcut; the keys show it.
        <span className="env-menu-item-shortcut" aria-hidden="true">
          {chords.map((keys, index) => (
            <Kbd key={index} keys={keys} />
          ))}
        </span>
      )}
    </>
  );
  return {
    content,
    accessibility: {
      'aria-describedby': description != null ? descriptionId : undefined,
      'aria-keyshortcuts': keyShortcuts(chords),
    },
  };
}

interface ItemSharedProps extends ItemContentProps {
  /**
   * The item is unavailable: it stays in place, dimmed, and reports aria-disabled; its action does
   * not run, and a destination has no link to follow.
   * @default false
   */
  disabled?: boolean;
  /**
   * Marks a destination as the page shown now, such as aria-current="page" on the current one of a
   * Bar's destinations that its More menu holds.
   */
  'aria-current'?: AriaAttributes['aria-current'];
  /**
   * The item's accessible name, where its label and end content don't say it as wanted, such as
   * Inbox, 3 new for a destination whose count shows as a badge.
   */
  'aria-label'?: string;
  /** Class of the item's row. */
  className?: string;
}

export type ItemProps = ItemSharedProps &
  (
    | {
        /**
         * The destination: the item is a link, through the LinkProvider's link component, and the
         * menu closes as it is followed.
         */
        href: string;
        /**
         * Runs as the destination is followed, before the menu closes, such as to record the
         * choice; the link still navigates.
         */
        onClick?: () => void;
        /** Where the destination opens, such as _blank, as on a native link. */
        target?: string;
        /** The destination's relationship to the page, such as noopener, as on a native link. */
        rel?: string;
      }
    | {
        href?: undefined;
        /** The action, run when the item is chosen; the menu then closes. */
        onClick?: () => void;
        target?: never;
        rel?: never;
      }
  );

/** A disabled destination is no link, so a press follows nothing. */
const preventActivation = (event: MouseEvent<HTMLElement>) => event.preventDefault();

/**
 * One action (onClick) or destination (href) in a Menu. Destinations use the LinkProvider's link
 * and close the menu as they are followed.
 */
function Item({
  icon,
  children,
  description,
  shortcut,
  end,
  disabled,
  'aria-current': ariaCurrent,
  'aria-label': ariaLabel,
  className,
  ...props
}: ItemProps) {
  const LinkComponent = useLinkComponent();
  const { content, accessibility } = useMenuItemContent({
    icon,
    children,
    description,
    shortcut,
    end,
  });
  const itemClassName = classNames('env-menu-item', className);
  // A disabled destination renders no link: it stays in place, dimmed, and reports aria-disabled,
  // as a disabled action does.
  if (props.href !== undefined && !disabled) {
    return (
      <BaseMenu.LinkItem
        className={itemClassName}
        closeOnClick
        onClick={props.onClick}
        // The link component comes from LinkProvider and keeps its identity between renders.
        // eslint-disable-next-line react-hooks/static-components
        render={<LinkComponent href={props.href} target={props.target} rel={props.rel} />}
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        {...accessibility}
      >
        {content}
      </BaseMenu.LinkItem>
    );
  }
  return (
    <BaseMenu.Item
      className={itemClassName}
      disabled={disabled}
      onClick={props.href === undefined ? props.onClick : preventActivation}
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      {...accessibility}
    >
      {content}
    </BaseMenu.Item>
  );
}

/** Separates groups of menu items. */
function Separator() {
  return <BaseMenu.Separator className="env-menu-separator" />;
}

export interface SubmenuProps extends Omit<ItemContentProps, 'children' | 'shortcut' | 'end'> {
  /** The label of the row that opens the submenu, which names the row. */
  label: ReactNode;
  /** The submenu's items: Menu.Item, Menu.Group, Menu.Separator and the other parts, nested submenus too. */
  children: ReactNode;
  /** Accessible name of the submenu; by default the label, when it is a string. */
  'aria-label'?: string;
  /**
   * The row stays in place, dimmed, but cannot open its submenu.
   * @default false
   */
  disabled?: boolean;
  /** Controlled visibility; onOpenChange also suits loading the items as the submenu opens. */
  open?: boolean;
  /**
   * Whether an uncontrolled submenu starts open.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called with the new visibility as the submenu opens or closes, for example to load its items.
   */
  onOpenChange?: (open: boolean) => void;
  /** Class of the submenu popup. */
  className?: string;
  /** The submenu popup's ref. */
  ref?: Ref<HTMLDivElement>;
  /** The submenu popup's inline style. */
  style?: CSSProperties;
}

/** Gap between a submenu and the edge of the menu it opens from, in pixels. */
const submenuGap = 2;
/** Ways of closing only the submenu, after which focus returns to the row that opened it. */
const submenuReturnReasons = new Set(['escape-key', 'list-navigation']);

/**
 * A row that opens a nested menu beside it, on hover or with the keyboard. The submenu opens in the
 * theme of its menu, and lines its first row up with the row that opened it.
 */
function Submenu({
  label,
  icon,
  description,
  children,
  'aria-label': ariaLabel,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ref,
  style,
}: SubmenuProps) {
  const trigger = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const closeReason = useRef<string | null>(null);
  const { content, accessibility } = useMenuItemContent({ icon, children: label, description });
  const textLabel = typeof label === 'string' ? label : undefined;
  return (
    <BaseMenu.SubmenuRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next, details) => {
        closeReason.current = next ? null : details.reason;
        onOpenChange?.(next);
      }}
    >
      <BaseMenu.SubmenuTrigger
        ref={trigger}
        className="env-menu-item env-menu-submenu-trigger"
        disabled={disabled}
        label={textLabel}
        {...accessibility}
      >
        {content}
        <span className="env-icon env-menu-submenu-chevron" aria-hidden="true">
          <ChevronRight />
        </span>
      </BaseMenu.SubmenuTrigger>
      <MenuPopup
        parts={menuParts}
        label={ariaLabel ?? textLabel}
        side="inline-end"
        align="start"
        // The submenu clears the edge of its menu by a small gap, and its first row lines up with
        // the row that opened it. Collisions flip it to the other side.
        sideOffset={() => menuPopupInlineInset(trigger.current?.closest('.env-menu')) + submenuGap}
        alignOffset={() => -menuPopupInset(popup.current)}
        trigger={trigger}
        // Escape and ← close only the submenu and return to its row. Otherwise focus has moved on,
        // or an item closed the whole menu, whose own trigger takes focus.
        finalFocus={() =>
          submenuReturnReasons.has(closeReason.current ?? '') ? (trigger.current ?? false) : false
        }
        className={className}
        popupRef={(node: HTMLDivElement | null) => {
          popup.current = node;
          setRef(ref, node);
        }}
        popupProps={{ style }}
      >
        {children}
      </MenuPopup>
    </BaseMenu.SubmenuRoot>
  );
}

export interface GroupProps {
  /** Small heading that names the group for assistive technology too. */
  label: ReactNode;
  /** Items of the group. */
  children: ReactNode;
  /** Class of the group. */
  className?: string;
}

/** A labelled group of related items, with a small heading above its rows. */
function Group({ label, children, className }: GroupProps) {
  return (
    <BaseMenu.Group render={<Grid />} className={classNames('env-menu-group', className)}>
      <BaseMenu.GroupLabel className="env-menu-group-label">{label}</BaseMenu.GroupLabel>
      {children}
    </BaseMenu.Group>
  );
}

export interface RadioGroupProps {
  /** Value of the checked item, or null for none. */
  value: string | null;
  /** Called with the chosen item's value. */
  onValueChange: (value: string) => void;
  /** Menu.RadioItem elements. */
  children: ReactNode;
  /** Optional heading; the group is then labelled like Menu.Group. */
  label?: ReactNode;
  /** Id of a heading elsewhere in the menu that names the group, in place of label. */
  'aria-labelledby'?: string;
  /** Class of the group. */
  className?: string;
}

/** One choice among several items; the checked item shows a check mark. */
function RadioGroup({
  value,
  onValueChange,
  children,
  label,
  'aria-labelledby': labelledBy,
  className,
}: RadioGroupProps) {
  return (
    <BaseMenu.RadioGroup
      render={<Grid />}
      aria-labelledby={labelledBy}
      className={classNames('env-menu-group', className)}
      value={value}
      onValueChange={(next: string) => onValueChange(next)}
    >
      {label != null && (
        <BaseMenu.GroupLabel className="env-menu-group-label">{label}</BaseMenu.GroupLabel>
      )}
      {children}
    </BaseMenu.RadioGroup>
  );
}

/** The check mark of a checked radio or checkbox item; the slot keeps labels aligned. */
function CheckIndicator({ kind }: { kind: 'radio' | 'checkbox' }) {
  const Indicator = kind === 'radio' ? BaseMenu.RadioItemIndicator : BaseMenu.CheckboxItemIndicator;
  return (
    <span className="env-menu-item-check" aria-hidden="true">
      <Indicator className="env-icon env-menu-item-check-mark">
        <Check />
      </Indicator>
    </span>
  );
}

export interface RadioItemProps extends Omit<ItemContentProps, 'shortcut'> {
  /** The value the Menu.RadioGroup reports when this item is chosen. */
  value: string;
  /**
   * The item stays in place, dimmed, but cannot be chosen.
   * @default false
   */
  disabled?: boolean;
  /**
   * Close the menu after choosing.
   * @default true
   */
  closeOnClick?: boolean;
  /** Class of the item's row. */
  className?: string;
}

/** One option of a Menu.RadioGroup. */
function RadioItem({
  value,
  disabled,
  closeOnClick = true,
  className,
  ...contentProps
}: RadioItemProps) {
  const { content, accessibility } = useMenuItemContent(
    contentProps,
    <CheckIndicator kind="radio" />,
  );
  return (
    <BaseMenu.RadioItem
      value={value}
      disabled={disabled}
      closeOnClick={closeOnClick}
      className={classNames('env-menu-item env-menu-choice', className)}
      {...accessibility}
    >
      {content}
    </BaseMenu.RadioItem>
  );
}

export interface CheckboxItemProps extends ItemContentProps {
  /** Whether the option is on; a check mark shows while it is. */
  checked: boolean;
  /** Called with the new state when the item is toggled. */
  onCheckedChange: (checked: boolean) => void;
  /**
   * The item stays in place, dimmed, but cannot be toggled.
   * @default false
   */
  disabled?: boolean;
  /** Close the menu after toggling; off by default, so several options can change. */
  closeOnClick?: boolean;
  /** Class of the item's row. */
  className?: string;
}

/** An independent on/off option; a check mark shows while it is on. */
function CheckboxItem({
  checked,
  onCheckedChange,
  disabled,
  closeOnClick = false,
  className,
  ...contentProps
}: CheckboxItemProps) {
  const { content, accessibility } = useMenuItemContent(
    contentProps,
    <CheckIndicator kind="checkbox" />,
  );
  return (
    <BaseMenu.CheckboxItem
      checked={checked}
      onCheckedChange={(next: boolean) => onCheckedChange(next)}
      disabled={disabled}
      closeOnClick={closeOnClick}
      className={classNames('env-menu-item env-menu-choice', className)}
      {...accessibility}
    >
      {content}
    </BaseMenu.CheckboxItem>
  );
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
