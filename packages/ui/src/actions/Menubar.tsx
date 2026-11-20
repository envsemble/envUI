'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Menubar as BaseMenubar } from '@base-ui/react/menubar';
import {
  Children,
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
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
import { MenuPopup, menuParts } from './menu/internal/MenuPopup.js';
import {
  containedOpenChange,
  usePortalContainer,
} from '../internal/popup/PortalContainerContext.js';
import { useDirection } from '../internal/provider/useDirection.js';
import { flag } from '../internal/flag.js';
import { useMenubarAccessKeys } from './internal/useMenubarAccessKeys.js';
import type { TriggerProps } from './menu/internal/menuTriggerProps.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import '../styles/Base.css';
import '../styles/Menubar.css';

interface MenubarContextValue {
  accessKeys: boolean;
  previousFocus: () => Element | null;
  registerClose: (close: () => void) => () => void;
}

const MenubarContext = createContext<MenubarContextValue | null>(null);

function belongsToMenubarOrOpenMenu(menubar: Element, element: Element) {
  return menubar.contains(element) || element.closest('[role="menu"]') !== null;
}

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
  const [textDirectionForBaseUI, readTextDirection] = useDirection(root);
  const lastFocusOutsideMenubar = useRef<Element | null>(null);
  const closers = useRef(new Set<() => void>());

  const leaveMenubar = useCallback(() => {
    for (const close of closers.current) close();
    const target = lastFocusOutsideMenubar.current;
    if (target instanceof HTMLElement && target.isConnected) target.focus();
    else (root.current?.ownerDocument.activeElement as HTMLElement | null)?.blur();
  }, []);
  const { shown: accessKeysShown, endActivation } = useMenubarAccessKeys({
    root,
    enabled: accessKeys,
    leave: leaveMenubar,
  });

  useEffect(() => {
    const menubar = root.current;
    if (!menubar) return;
    const document = menubar.ownerDocument;
    const active = document.activeElement;
    if (active && active !== document.body && !belongsToMenubarOrOpenMenu(menubar, active))
      lastFocusOutsideMenubar.current = active;
    const keepLastFieldAsCommandTarget = (event: FocusEvent) => {
      if (!(event.target instanceof Element) || belongsToMenubarOrOpenMenu(menubar, event.target))
        return;
      lastFocusOutsideMenubar.current = event.target;
      endActivation();
    };
    document.addEventListener('focusin', keepLastFieldAsCommandTarget, true);
    return () => document.removeEventListener('focusin', keepLastFieldAsCommandTarget, true);
  }, [endActivation]);

  const previousFocus = useCallback(() => {
    const menubar = root.current;
    const document = menubar?.ownerDocument;
    const active = document?.activeElement;
    const pointerOpenedMenuBeforeFocusMoved =
      menubar && active && active !== document.body && !belongsToMenubarOrOpenMenu(menubar, active);
    if (pointerOpenedMenuBeforeFocusMoved) return active;
    const remembered = lastFocusOutsideMenubar.current;
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
      <DirectionProvider direction={textDirectionForBaseUI}>
        <BaseMenubar
          render={<Row align="center" />}
          {...props}
          ref={setRoot}
          onFocus={(event) => {
            readTextDirection();
            onFocus?.(event);
          }}
          aria-label={label}
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
export interface OpenChangeDetails {
  /**
   * The element that had focus before the menubar took it, such as a text field, or null. Commands
   * such as Copy act on it.
   */
  previousFocus: Element | null;
}

export interface MenuProps {
  /** The trigger's text, such as File, or content such as an icon beside the text. */
  label: ReactNode;
  /**
   * A letter of the label, such as F for File. With Menubar.Root's accessKeys, holding Alt underlines
   * it, in the label's text also beside an icon or inside an element such as a span, and Alt with
   * the letter opens the menu.
   */
  accessKey?: string;
  /**
   * Attributes of the trigger button, such as a className, a style, a ref or a data attribute; the
   * menu's own className, style and ref are its popup's.
   */
  triggerProps?: TriggerProps;
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
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /** Class of the menu popup. */
  className?: string;
  /** The menu popup's ref; the trigger is the menubar's own. */
  ref?: Ref<HTMLDivElement>;
  /** The menu popup's inline style. */
  style?: CSSProperties;
}

function underlineFirst(node: ReactNode, accessKey: string, found: { done: boolean }): ReactNode {
  if (found.done) return node;
  if (typeof node === 'string') {
    const index = node.toLowerCase().indexOf(accessKey);
    if (index === -1) return node;
    found.done = true;
    return (
      <>
        {node.slice(0, index)}
        <span className="env-menubar-access-key">{node.slice(index, index + 1)}</span>
        {node.slice(index + 1)}
      </>
    );
  }
  if (Array.isArray(node))
    return Children.map(node, (child) => underlineFirst(child, accessKey, found));
  const rendersItsChildren =
    isValidElement<{ children?: ReactNode }>(node) &&
    (node.type === Fragment || typeof node.type === 'string');
  if (!rendersItsChildren || node.props.children == null) return node;
  const children = underlineFirst(node.props.children, accessKey, found);
  return found.done ? cloneElement(node, undefined, children) : node;
}

function AccessKeyLabel({ label, accessKey }: { label: ReactNode; accessKey: string | undefined }) {
  return (
    <span className="env-menubar-label">
      {accessKey === undefined ? label : underlineFirst(label, accessKey, { done: false })}
    </span>
  );
}

const reasonsAnotherMenuTakesFocus = new Set(['sibling-open', 'list-navigation']);

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
  triggerProps,
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

  function focusMovedOnFromClosingMenu() {
    const document = trigger.current?.ownerDocument;
    const active = document?.activeElement;
    if (!active || active === document.body || active === trigger.current) return false;
    const menu = active.closest('[role="menu"]');
    return menu === null || (menu !== popup.current && menu.hasAttribute('data-open'));
  }

  function focusInOpenSubmenuOfThisMenu() {
    const active = trigger.current?.ownerDocument.activeElement;
    const menu = active?.closest('[role="menu"]');
    return (
      menu != null &&
      menu !== popup.current &&
      menu.hasAttribute('data-open') &&
      popup.current?.querySelector('[data-popup-open]') != null
    );
  }

  function blurTriggerSoKeysDoNotReopenMenu() {
    if (trigger.current?.ownerDocument.activeElement === trigger.current) trigger.current?.blur();
  }

  function focusAfterClosing() {
    const reason = closeReason.current ?? '';
    const focusStaysWhereItIs =
      focusMovedOnFromClosingMenu() || reasonsAnotherMenuTakesFocus.has(reason);
    if (focusStaysWhereItIs) return false;
    const earlier = previousFocus.current;
    const returnToEarlierFocusLikeDesktopApps =
      reason !== 'escape-key' && earlier instanceof HTMLElement && earlier.isConnected;
    if (returnToEarlierFocusLikeDesktopApps) return earlier;
    if (reason === 'outside-press') {
      blurTriggerSoKeysDoNotReopenMenu();
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
        const lateBaseUIFocusCheckFindsOwnSubmenu =
          !next && details.reason === 'trigger-focus' && focusInOpenSubmenuOfThisMenu();
        if (lateBaseUIFocusCheckFindsOwnSubmenu) {
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
        {...triggerProps}
        ref={(node: HTMLButtonElement | null) => {
          trigger.current = node;
          setRef(triggerProps?.ref, node);
        }}
        className={classNames('env-menubar-trigger', triggerProps?.className)}
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
        finalFocus={focusAfterClosing}
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

const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Menubar.Root');
const MenuPart = /* @__PURE__ */ withDisplayName(Menu, 'Menubar.Menu');
export { RootPart as Root, MenuPart as Menu };
