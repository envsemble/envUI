'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Menubar as BaseMenubar } from '@base-ui/react/menubar';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Row } from '../layout/Layout.js';
import { setRef } from '../internal/react/setRef.js';
import { MenuPopup, menuParts } from './internal/MenuPopup.js';
import {
  containedOpenChange,
  usePortalContainer,
} from '../internal/popup/PortalContainerContext.js';
import { useDirection } from '../internal/provider/useDirection.js';
import { flag } from '../internal/flag.js';
import { useMenubarAccessKeys } from './internal/useMenubarAccessKeys.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import '../styles/Base.css';
import '../styles/Menubar.css';

interface MenubarContextValue {
  /** Access keys are on, so triggers name theirs in aria-keyshortcuts. */
  accessKeys: boolean;
  /** The element that had focus before the menubar or one of its menus took it. */
  previousFocus: () => Element | null;
  /** Registers a function that closes a menu, so leaving the menubar closes an open one. */
  registerClose: (close: () => void) => () => void;
}

const MenubarContext = createContext<MenubarContextValue | null>(null);

/** Whether an element belongs to the menubar or an open menu, which never count as earlier focus. */
function isMenuPart(menubar: Element, element: Element) {
  return menubar.contains(element) || element.closest('[role="menu"]') !== null;
}

/** An access key as one lowercase character, such as f for File. */
function normalizeAccessKey(accessKey: string | undefined) {
  const character = Array.from(accessKey?.trim() ?? '')[0];
  return character?.toLowerCase();
}

export interface RootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Accessible name of the menubar, such as Application menu. */
  'aria-label': string;
  /** Menubar.Menu elements. */
  children: ReactNode;
  /**
   * Desktop access keys, off by default: holding Alt underlines each menu's accessKey, Alt with that
   * letter opens the menu, and Alt alone moves focus to the menubar and back. Turn it on for one
   * menubar per window.
   */
  accessKeys?: boolean;
  /**
   * Disables every menu of the menubar.
   * @default false
   */
  disabled?: boolean;
}

/**
 * An application menubar: a row of small text buttons that open menus, such as File, Edit,
 * View and Help. Once a menu is open, hovering another trigger or pressing ← and → switches to its
 * menu. Opening a menu neither locks scrolling nor shifts the page.
 */
function Root({
  'aria-label': label,
  children,
  accessKeys = false,
  disabled = false,
  className,
  ref,
  onFocus,
  ...props
}: RootProps) {
  const root = useRef<HTMLDivElement>(null);
  // The arrow keys between the menus, and the side submenus open on, follow the text direction,
  // which Base UI only knows from its own provider.
  const [direction, readDirection] = useDirection(root);
  // The last element outside the menubar and its menus that had focus, such as a text field.
  const lastFocus = useRef<Element | null>(null);
  const closers = useRef(new Set<() => void>());

  // Leaves the menubar: an open menu closes and focus returns to where it was.
  const leave = useCallback(() => {
    for (const close of closers.current) close();
    const target = lastFocus.current;
    if (target instanceof HTMLElement && target.isConnected) target.focus();
    else (root.current?.ownerDocument.activeElement as HTMLElement | null)?.blur();
  }, []);
  const { shown: accessKeysShown, endActivation } = useMenubarAccessKeys({
    root,
    enabled: accessKeys,
    leave,
  });

  useEffect(() => {
    const menubar = root.current;
    if (!menubar) return;
    const document = menubar.ownerDocument;
    const active = document.activeElement;
    if (active && active !== document.body && !isMenuPart(menubar, active))
      lastFocus.current = active;
    // As in a desktop application, the last field stays the target of commands such as Copy, even
    // after a click elsewhere on the page.
    const noteFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element) || isMenuPart(menubar, event.target)) return;
      lastFocus.current = event.target;
      endActivation();
    };
    document.addEventListener('focusin', noteFocus, true);
    return () => document.removeEventListener('focusin', noteFocus, true);
  }, [endActivation]);

  const previousFocus = useCallback(() => {
    const menubar = root.current;
    const document = menubar?.ownerDocument;
    const active = document?.activeElement;
    // A pointer opens a menu before focus moves, so the focused element is still the earlier one.
    if (menubar && active && active !== document.body && !isMenuPart(menubar, active))
      return active;
    const remembered = lastFocus.current;
    return remembered?.isConnected ? remembered : null;
  }, []);

  const registerClose = useCallback((close: () => void) => {
    closers.current.add(close);
    return () => {
      closers.current.delete(close);
    };
  }, []);

  const setRoot = useCallback(
    (node: HTMLDivElement | null) => {
      root.current = node;
      setRef(ref, node);
    },
    [ref],
  );
  const context = useMemo(
    () => ({ accessKeys, previousFocus, registerClose }),
    [accessKeys, previousFocus, registerClose],
  );
  return (
    <MenubarContext value={context}>
      <DirectionProvider direction={direction}>
        <BaseMenubar
          render={<Row align="center" />}
          {...props}
          ref={setRoot}
          onFocus={(event) => {
            readDirection();
            onFocus?.(event);
          }}
          aria-label={label}
          // Opening a menu leaves the page scrollable and the layout in place.
          modal={false}
          disabled={disabled}
          className={classNames('env-menubar', className)}
          data-access-keys-shown={flag(accessKeysShown)}
        >
          {children}
        </BaseMenubar>
      </DirectionProvider>
    </MenubarContext>
  );
}

/** What Menubar.Menu's onOpenChange receives beside the requested state. */
export interface MenuFocusDetails {
  /**
   * The element that had focus before the menubar took it, such as a text field, or null. Commands
   * such as Copy act on it.
   */
  previousFocus: Element | null;
}

export interface MenuProps {
  /** The trigger's text, such as File. */
  label: ReactNode;
  /**
   * A letter of the label, such as F for File. With Menubar.Root's accessKeys, holding Alt underlines
   * it and Alt with the letter opens the menu.
   */
  accessKey?: string;
  /** The menu's items: Menu.Item, Menu.Submenu, Menu.Separator and the other menu parts. */
  children: ReactNode;
  /** Accessible name of the menu; by default the label, when it is a string. */
  'aria-label'?: string;
  /**
   * The trigger stays in place, dimmed, but doesn't open its menu.
   * @default false
   */
  disabled?: boolean;
  /** Controlled visibility. */
  open?: boolean;
  /**
   * Whether an uncontrolled menu starts open; closed by default.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called when the menu opens or closes, with the element that had focus before the menubar took it.
   */
  onOpenChange?: (open: boolean, details: MenuFocusDetails) => void;
  /** Class of the menu popup. */
  className?: string;
  /** The menu popup's ref; the trigger is the menubar's own. */
  ref?: Ref<HTMLDivElement>;
  /** The menu popup's inline style. */
  style?: CSSProperties;
}

/**
 * The label with its access key wrapped, so holding Alt can underline it. One inline element holds
 * the label, so the letter stays part of the word for assistive technology.
 */
function AccessKeyLabel({ label, accessKey }: { label: ReactNode; accessKey: string | undefined }) {
  const index =
    typeof label === 'string' && accessKey !== undefined
      ? label.toLowerCase().indexOf(accessKey)
      : -1;
  if (typeof label !== 'string' || index === -1)
    return <span className="env-menubar-label">{label}</span>;
  return (
    <span className="env-menubar-label">
      {label.slice(0, index)}
      <span className="env-menubar-access-key">{label.slice(index, index + 1)}</span>
      {label.slice(index + 1)}
    </span>
  );
}

/** Ways of closing in which another menu of the menubar takes focus. */
const switchingReasons = new Set(['sibling-open', 'list-navigation']);

/**
 * One menu of a Menubar.Root: a small text trigger and the menu that opens below it. After a command,
 * focus returns to where it was before the menubar took it, as in a desktop application.
 */
function Menu({
  label,
  accessKey,
  children,
  'aria-label': ariaLabel,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ref,
  style,
}: MenuProps) {
  const menubar = useContext(MenubarContext);
  if (!menubar) throw new Error('Menubar.Menu must be used inside Menubar.Root.');
  const { registerClose } = menubar;
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const actions = useRef<BaseMenu.Root.Actions>(null);
  const portal = usePortalContainer();
  const previousFocus = useRef<Element | null>(null);
  const closeReason = useRef<string | null>(null);
  const key = normalizeAccessKey(accessKey);
  const textLabel = typeof label === 'string' ? label : undefined;
  useEffect(() => registerClose(() => actions.current?.close()), [registerClose]);

  // Whether focus has left the closing menu for something else: a field the pointer pressed, a
  // dialog a command opened or another menu that is open.
  function focusMovedOn() {
    const document = trigger.current?.ownerDocument;
    const active = document?.activeElement;
    if (!active || active === document.body || active === trigger.current) return false;
    const menu = active.closest('[role="menu"]');
    return menu === null || (menu !== popup.current && menu.hasAttribute('data-open'));
  }

  // Whether focus is in an open submenu of this menu, which belongs to the menu.
  function focusInSubmenu() {
    const active = trigger.current?.ownerDocument.activeElement;
    const menu = active?.closest('[role="menu"]');
    return (
      menu != null &&
      menu !== popup.current &&
      menu.hasAttribute('data-open') &&
      popup.current?.querySelector('[data-popup-open]') != null
    );
  }

  // Runs as the menu closes. Escape leaves focus on the trigger, in the menubar. Otherwise, such
  // as after a command, focus returns to where it was before the menubar took it, as in a desktop
  // application. Focus that has moved on, or into another menu of the menubar, stays where it is.
  function finalFocus() {
    const reason = closeReason.current ?? '';
    if (focusMovedOn() || switchingReasons.has(reason)) return false;
    const earlier = previousFocus.current;
    if (reason !== 'escape-key' && earlier instanceof HTMLElement && earlier.isConnected)
      return earlier;
    // With nothing to return to, a click elsewhere lets focus go: left on the trigger, Space or a
    // menu's letter would open a menu again.
    if (reason === 'outside-press') {
      if (trigger.current?.ownerDocument.activeElement === trigger.current) trigger.current?.blur();
      return false;
    }
    return trigger.current ?? true;
  }

  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      disabled={disabled}
      actionsRef={actions}
      onOpenChange={containedOpenChange(portal, trigger, (next, details) => {
        // Base UI checks where focus went a moment after it leaves the trigger. When that check runs
        // late, focus may already be in one of the menu's own submenus, so the menu stays open.
        if (!next && details.reason === 'trigger-focus' && focusInSubmenu()) {
          details.cancel();
          return;
        }
        if (next) {
          previousFocus.current = menubar.previousFocus();
          closeReason.current = null;
        } else closeReason.current = details.reason;
        onOpenChange?.(next, { previousFocus: previousFocus.current });
      })}
    >
      <BaseMenu.Trigger
        ref={trigger}
        className="env-menubar-trigger"
        data-access-key={key}
        aria-keyshortcuts={menubar.accessKeys && key ? `Alt+${key.toUpperCase()}` : undefined}
      >
        <AccessKeyLabel label={label} accessKey={key} />
      </BaseMenu.Trigger>
      <MenuPopup
        parts={menuParts}
        label={ariaLabel ?? textLabel}
        side="bottom"
        align="start"
        sideOffset={4}
        trigger={trigger}
        finalFocus={finalFocus}
        className={className}
        popupRef={(node: HTMLDivElement | null) => {
          popup.current = node;
          setRef(ref, node);
        }}
        popupProps={{ style }}
      >
        {children}
      </MenuPopup>
    </BaseMenu.Root>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Menubar.Root');
const MenuPart = /* @__PURE__ */ withDisplayName(Menu, 'Menubar.Menu');
export { RootPart as Root, MenuPart as Menu };
