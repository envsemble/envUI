'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Menubar as BaseMenubar } from '@base-ui/react/menubar';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { MenuDensityContext, renderMenuPopup } from './internal/MenuPopup.js';
import type { Density } from './Menu.js';
import { withDisplayName } from '../internal/withDisplayName.js';

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

/** The letters a key event may stand for: the character typed and the letter key's own name. */
function pressedLetters(event: KeyboardEvent) {
  const letters: string[] = [];
  if (Array.from(event.key).length === 1) letters.push(event.key.toLowerCase());
  // With Alt, some keyboard layouts type another character; the physical key still names a letter.
  const code = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(event.code);
  if (code) letters.push((code[1] ?? code[2])!.toLowerCase());
  return letters;
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
  /** Disables every menu of the menubar. */
  disabled?: boolean;
}

/**
 * An application menubar: a row of compact text buttons that open compact menus, such as File, Edit,
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
  ...props
}: RootProps) {
  const root = useRef<HTMLDivElement>(null);
  // The last element outside the menubar and its menus that had focus, such as a text field.
  const lastFocus = useRef<Element | null>(null);
  const closers = useRef(new Set<() => void>());
  const [altHeld, setAltHeld] = useState(false);
  // Activation by the keyboard keeps the access keys visible while focus stays in the menubar.
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const menubar = root.current;
    if (!menubar) return;
    const document = menubar.ownerDocument;
    const active = document.activeElement;
    if (active && active !== document.body && !isMenuPart(menubar, active))
      lastFocus.current = active;
    // As in a desktop application, the last field stays the target of commands such as Copy, even
    // after a click elsewhere on the page.
    function noteFocus(event: FocusEvent) {
      if (!(event.target instanceof Element) || isMenuPart(menubar!, event.target)) return;
      lastFocus.current = event.target;
      setActivated(false);
    }
    document.addEventListener('focusin', noteFocus, true);
    return () => document.removeEventListener('focusin', noteFocus, true);
  }, []);

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

  useEffect(() => {
    const menubar = root.current;
    if (!accessKeys || !menubar) return;
    const document = menubar.ownerDocument;
    const view = document.defaultView;
    if (!view) return;
    let altAlone = false;

    function enabledTriggers() {
      return Array.from(menubar!.querySelectorAll<HTMLElement>('.env-menubar-trigger')).filter(
        (trigger) => !trigger.hasAttribute('data-disabled'),
      );
    }
    function triggerFor(event: KeyboardEvent) {
      const triggers = enabledTriggers();
      for (const letter of pressedLetters(event)) {
        const trigger = triggers.find((candidate) => candidate.dataset.accessKey === letter);
        if (trigger) return trigger;
      }
      return undefined;
    }
    // Opens a menu as ↓ on its trigger does, with focus on its first item.
    function openMenu(trigger: HTMLElement) {
      setActivated(true);
      trigger.focus();
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          code: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        }),
      );
    }
    function menuOpen() {
      return menubar!.querySelector('.env-menubar-trigger[aria-expanded="true"]') !== null;
    }
    // Leaves the menubar: an open menu closes and focus returns to where it was.
    function leave() {
      setActivated(false);
      for (const close of closers.current) close();
      const target = lastFocus.current;
      if (target instanceof HTMLElement && target.isConnected) target.focus();
      else (document.activeElement as HTMLElement | null)?.blur();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Alt') {
        if (!event.repeat) altAlone = !event.ctrlKey && !event.metaKey && !event.shiftKey;
        if (altAlone) setAltHeld(true);
        return;
      }
      // Another key ends the hint, such as Space opening the window's own menu, which may keep the
      // Alt release from the page. An access key that opens a menu shows the keys again below.
      altAlone = false;
      setAltHeld(false);
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.altKey) {
        // Alt with a letter that no menu claims stays with the page.
        const trigger = triggerFor(event);
        if (!trigger) return;
        event.preventDefault();
        openMenu(trigger);
        return;
      }
      // While a trigger has focus and no menu is open, Escape leaves the menubar and a menu's
      // letter opens that menu.
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !menubar!.contains(active) || menuOpen()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        leave();
        return;
      }
      const trigger = triggerFor(event);
      if (!trigger) return;
      event.preventDefault();
      openMenu(trigger);
    }
    function onKeyUp(event: KeyboardEvent) {
      if (event.key !== 'Alt') return;
      setAltHeld(false);
      if (!altAlone) return;
      altAlone = false;
      event.preventDefault();
      const active = document.activeElement;
      const inMenubar =
        active instanceof Element &&
        (menubar!.contains(active) || (menuOpen() && active.closest('[role="menu"]') !== null));
      if (inMenubar) {
        leave();
        return;
      }
      const first = enabledTriggers()[0];
      if (!first) return;
      setActivated(true);
      first.focus();
    }
    // Leaving the window, or pointing, ends the hint and the keyboard activation.
    function cancel() {
      altAlone = false;
      setAltHeld(false);
      setActivated(false);
    }
    view.addEventListener('keydown', onKeyDown, true);
    view.addEventListener('keyup', onKeyUp, true);
    view.addEventListener('pointerdown', cancel, true);
    view.addEventListener('blur', cancel);
    return () => {
      view.removeEventListener('keydown', onKeyDown, true);
      view.removeEventListener('keyup', onKeyUp, true);
      view.removeEventListener('pointerdown', cancel, true);
      view.removeEventListener('blur', cancel);
      setAltHeld(false);
      setActivated(false);
    };
  }, [accessKeys]);

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
      <BaseMenubar
        {...props}
        ref={setRoot}
        aria-label={label}
        // Opening a menu leaves the page scrollable and the layout in place.
        modal={false}
        disabled={disabled}
        className={classNames('env-menubar', className)}
        data-access-keys-shown={accessKeys && (altHeld || activated) ? '' : undefined}
      >
        {children}
      </BaseMenubar>
    </MenubarContext>
  );
}

export interface MenuOpenChangeDetails {
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
  /** The trigger stays in place, dimmed, but doesn't open its menu. */
  disabled?: boolean;
  /** Controlled visibility. */
  open?: boolean;
  /** Whether an uncontrolled menu starts open; closed by default. */
  defaultOpen?: boolean;
  /**
   * Called when the menu opens or closes, with the element that had focus before the menubar took it.
   */
  onOpenChange?: (open: boolean, details: MenuOpenChangeDetails) => void;
  /** compact by default, like the menus of a desktop menubar. */
  density?: Density;
  /** Class of the menu popup. */
  className?: string;
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
 * One menu of a Menubar.Root: a compact text trigger and the menu that opens below it. After a command,
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
  density = 'compact',
  className,
}: MenuProps) {
  const theme = useTheme();
  const menubar = useContext(MenubarContext);
  if (!menubar) throw new Error('Menubar.Menu must be used inside Menubar.Root.');
  const { registerClose } = menubar;
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const actions = useRef<BaseMenu.Root.Actions>(null);
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
      onOpenChange={(next, details) => {
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
      }}
    >
      <BaseMenu.Trigger
        ref={trigger}
        className="env-menubar-trigger"
        data-access-key={key}
        aria-keyshortcuts={menubar.accessKeys && key ? `Alt+${key.toUpperCase()}` : undefined}
      >
        <AccessKeyLabel label={label} accessKey={key} />
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <Theme {...theme} className="env-menu-theme">
          <BaseMenu.Positioner
            className="env-menu-positioner"
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <BaseMenu.Popup
              ref={popup}
              className={classNames('env-menu', className)}
              render={renderMenuPopup(ariaLabel ?? textLabel, density)}
              finalFocus={finalFocus}
            >
              <MenuDensityContext value={density}>{children}</MenuDensityContext>
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </Theme>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Menubar.Root');
const MenuPart = /* @__PURE__ */ withDisplayName(Menu, 'Menubar.Menu');
export { RootPart as Root, MenuPart as Menu };
