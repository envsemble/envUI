import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { Check } from '../icons/Check.js';
import { useLinkComponent } from './LinkProvider.js';

export interface MenuProps {
  /** The control that opens the menu; it receives the menu button semantics and ref. */
  trigger: ReactElement;
  /** Accessible name of the menu. */
  'aria-label': string;
  /** MenuHeader, MenuItem, MenuGroup, MenuRadioGroup, MenuCheckboxItem and MenuSeparator elements. */
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** A list of actions and destinations that opens from a trigger; keyboard and focus follow the menu pattern. */
export function Menu({
  trigger,
  'aria-label': label,
  children,
  side = 'bottom',
  align = 'end',
  open,
  defaultOpen,
  onOpenChange,
  className,
}: MenuProps) {
  const theme = useTheme();
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <Theme theme={theme} className="env-menu-theme">
          <BaseMenu.Positioner
            side={side}
            align={align}
            sideOffset={8}
            className="env-menu-positioner"
          >
            <BaseMenu.Popup
              className={classNames('env-menu', className)}
              // Base UI names the menu after its trigger; the menu's own label replaces that name.
              render={(props) => <div {...props} aria-labelledby={undefined} aria-label={label} />}
            >
              {children}
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </Theme>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export interface ContextMenuPoint {
  x: number;
  y: number;
}

export interface ContextMenuProps {
  /** Accessible name of the menu. */
  'aria-label': string;
  /**
   * Menu content: MenuItem, MenuGroup, MenuSeparator and the other menu parts. A function receives
   * the element the menu was opened on: the deepest element under the pointer, or the focused
   * element (its active descendant, when it has one) for the keyboard.
   */
  content: ReactNode | ((target: Element | null) => ReactNode);
  /** One element that becomes the region; it must accept native props and a ref. */
  children: ReactElement;
  /** The region keeps the browser's own context menu. */
  disabled?: boolean;
  /** Controlled visibility, for example to open the menu from another control. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Viewport point to open at while controlled; otherwise the menu opens at the pointer. */
  anchorPoint?: ContextMenuPoint;
  className?: string;
}

/** A browser context-menu key event: the ContextMenu key or Shift+F10. */
function isContextMenuKey(event: KeyboardEvent) {
  return event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
}

function pointAnchor(point: ContextMenuPoint) {
  return {
    getBoundingClientRect: () => DOMRect.fromRect({ x: point.x, y: point.y, width: 0, height: 0 }),
  };
}

/** The keyboard opens the menu below the start of the target, which stays the anchor while it moves. */
function elementAnchor(element: Element) {
  return {
    getBoundingClientRect: () => {
      const rect = element.getBoundingClientRect();
      const rtl = getComputedStyle(element).direction === 'rtl';
      const inset = Math.min(rect.width / 2, 24);
      return DOMRect.fromRect({
        x: rtl ? rect.right - inset : rect.left + inset,
        y: rect.bottom,
        width: 0,
        height: 0,
      });
    },
    contextElement: element,
  };
}

/** Actions for an area, opened by right click, long press, the ContextMenu key or Shift+F10. */
export function ContextMenu({
  'aria-label': label,
  content,
  children,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  anchorPoint,
  className,
}: ContextMenuProps) {
  const theme = useTheme();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const [target, setTarget] = useState<Element | null>(null);
  const [keyboardAnchor, setKeyboardAnchor] = useState<ReturnType<typeof elementAnchor> | null>(
    null,
  );
  // Browsers may follow a context-menu key with their own contextmenu event; it must not reopen
  // the menu at the pointer.
  const keyboardOpenedAt = useRef(Number.NEGATIVE_INFINITY);

  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  function openAtPointer(event: MouseEvent<Element> & { preventBaseUIHandler?: () => void }) {
    if (disabled) return;
    if (performance.now() - keyboardOpenedAt.current < 1000) {
      event.preventDefault();
      event.preventBaseUIHandler?.();
      return;
    }
    setTarget(event.target instanceof Element ? event.target : null);
    setKeyboardAnchor(null);
  }

  function openFromKeyboard(event: KeyboardEvent<Element>) {
    if (disabled || !isContextMenuKey(event)) return;
    event.preventDefault();
    const focused = event.target instanceof Element ? event.target : event.currentTarget;
    const descendantId = focused.getAttribute('aria-activedescendant');
    const descendant = descendantId ? focused.ownerDocument.getElementById(descendantId) : null;
    const element = descendant ?? focused;
    keyboardOpenedAt.current = performance.now();
    setTarget(element);
    setKeyboardAnchor(elementAnchor(element));
    setOpen(true);
  }

  const anchor =
    controlledOpen !== undefined && anchorPoint ? pointAnchor(anchorPoint) : keyboardAnchor;
  return (
    <BaseContextMenu.Root open={open} onOpenChange={(next) => setOpen(next)} disabled={disabled}>
      <BaseContextMenu.Trigger
        render={children}
        onContextMenu={openAtPointer}
        onKeyDown={openFromKeyboard}
      />
      <BaseContextMenu.Portal>
        <Theme theme={theme} className="env-menu-theme">
          <BaseContextMenu.Positioner
            className="env-menu-positioner"
            {...(anchor && { anchor, side: 'bottom', align: 'start', sideOffset: 4 })}
          >
            <BaseContextMenu.Popup
              className={classNames('env-menu', className)}
              render={(props) => <div {...props} aria-labelledby={undefined} aria-label={label} />}
            >
              {typeof content === 'function' ? content(target) : content}
            </BaseContextMenu.Popup>
          </BaseContextMenu.Positioner>
        </Theme>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}

export interface MenuHeaderProps extends ComponentPropsWithRef<'div'> {
  children: ReactNode;
}

/** Non-interactive context at the top of a menu, such as the signed-in account. */
export function MenuHeader({ className, ...props }: MenuHeaderProps) {
  return (
    <div role="presentation" {...props} className={classNames('env-menu-header', className)} />
  );
}

interface MenuItemContentProps {
  /** Optional leading icon. */
  icon?: ReactNode;
  children: ReactNode;
  /** A second, muted line; announced as the item's description. */
  description?: ReactNode;
  /** Keyboard hint at the end, such as Ctrl+P. The application handles the shortcut itself. */
  shortcut?: string;
  /** End content, such as a Badge or Counter. */
  trailing?: ReactNode;
}

const keyNames: Record<string, string> = {
  ctrl: 'Control',
  control: 'Control',
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  '⌘': 'Meta',
  win: 'Meta',
  alt: 'Alt',
  option: 'Alt',
  '⌥': 'Alt',
  shift: 'Shift',
  '⇧': 'Shift',
  esc: 'Escape',
  del: 'Delete',
  space: 'Space',
};

/** Converts a displayed hint such as Ctrl+Shift+P to aria-keyshortcuts syntax. */
function keyShortcuts(shortcut: string) {
  return shortcut
    .split(/\s+/)
    .map((chord) =>
      chord
        .split('+')
        .filter(Boolean)
        .map((key) => keyNames[key.toLowerCase()] ?? key)
        .join('+'),
    )
    .join(' ');
}

/** Shared item layout: indicator, icon, label with optional description, trailing content, shortcut. */
function useMenuItemContent(
  { icon, children, description, shortcut, trailing }: MenuItemContentProps,
  indicator?: ReactNode,
) {
  const descriptionId = useId();
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
      {trailing != null && <span className="env-menu-item-trailing">{trailing}</span>}
      {shortcut && (
        <span className="env-menu-item-shortcut" aria-hidden="true">
          {shortcut}
        </span>
      )}
    </>
  );
  return {
    content,
    accessibility: {
      'aria-describedby': description != null ? descriptionId : undefined,
      'aria-keyshortcuts': shortcut ? keyShortcuts(shortcut) : undefined,
    },
  };
}

interface MenuItemSharedProps extends MenuItemContentProps {
  disabled?: boolean;
  className?: string;
}

export type MenuItemProps = MenuItemSharedProps &
  (
    | { href: string; onClick?: never; target?: string; rel?: string }
    | { href?: undefined; onClick?: () => void; target?: never; rel?: never }
  );

/** One action (onClick) or destination (href) in a Menu. Destinations use the LinkProvider's link. */
export function MenuItem({
  icon,
  children,
  description,
  shortcut,
  trailing,
  disabled,
  className,
  ...props
}: MenuItemProps) {
  const LinkComponent = useLinkComponent();
  const { content, accessibility } = useMenuItemContent({
    icon,
    children,
    description,
    shortcut,
    trailing,
  });
  const itemClassName = classNames('env-menu-item', className);
  if (props.href !== undefined) {
    return (
      <BaseMenu.LinkItem
        className={itemClassName}
        render={<LinkComponent href={props.href} target={props.target} rel={props.rel} />}
        aria-disabled={disabled || undefined}
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
      onClick={props.onClick}
      {...accessibility}
    >
      {content}
    </BaseMenu.Item>
  );
}

/** Separates groups of menu items. */
export function MenuSeparator() {
  return <BaseMenu.Separator className="env-menu-separator" />;
}

export interface MenuGroupProps {
  /** Small heading that names the group for assistive technology too. */
  label: ReactNode;
  /** Items of the group. */
  children: ReactNode;
  className?: string;
}

/** A labelled group of related items, with a small heading above its rows. */
export function MenuGroup({ label, children, className }: MenuGroupProps) {
  return (
    <BaseMenu.Group className={classNames('env-menu-group', className)}>
      <BaseMenu.GroupLabel className="env-menu-group-label">{label}</BaseMenu.GroupLabel>
      {children}
    </BaseMenu.Group>
  );
}

export interface MenuRadioGroupProps {
  /** Value of the checked item, or null for none. */
  value: string | null;
  /** Called with the chosen item's value. */
  onValueChange: (value: string) => void;
  /** MenuRadioItem elements. */
  children: ReactNode;
  /** Optional heading; the group is then labelled like MenuGroup. */
  label?: ReactNode;
  className?: string;
}

/** One choice among several items; the checked item shows a check mark. */
export function MenuRadioGroup({
  value,
  onValueChange,
  children,
  label,
  className,
}: MenuRadioGroupProps) {
  return (
    <BaseMenu.RadioGroup
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
      <Indicator className="env-symbol env-menu-item-check-mark">
        <Check />
      </Indicator>
    </span>
  );
}

export interface MenuRadioItemProps extends Omit<MenuItemContentProps, 'shortcut' | 'trailing'> {
  value: string;
  disabled?: boolean;
  /** Close the menu after choosing; true by default. */
  closeOnClick?: boolean;
  className?: string;
}

/** One option of a MenuRadioGroup. */
export function MenuRadioItem({
  value,
  disabled,
  closeOnClick = true,
  className,
  ...contentProps
}: MenuRadioItemProps) {
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

export interface MenuCheckboxItemProps extends Omit<MenuItemContentProps, 'trailing'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Close the menu after toggling; false by default, so several options can change. */
  closeOnClick?: boolean;
  className?: string;
}

/** An independent on/off option; a check mark shows while it is on. */
export function MenuCheckboxItem({
  checked,
  onCheckedChange,
  disabled,
  closeOnClick = false,
  className,
  ...contentProps
}: MenuCheckboxItemProps) {
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
