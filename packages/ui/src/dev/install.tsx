import { createRoot, type Root } from 'react-dom/client';
import { layout, type LayoutApi } from './api.js';
import { devAttribute } from './elements.js';
import { loadParts, setParts, type PartsFile } from './parts.js';
import { DevMode, type DevModeController } from './ui/DevMode.js';
import devModeStyleSheetText from './ui/DevMode.css?raw' with { type: 'text' };

export interface DevModeOptions {
  /**
   * The parts' descriptions: docs/generated/parts.json's content, or the URL to fetch it from.
   * Without it, dev mode tries the copy beside it in the package, and goes without descriptions when
   * that fails. Names don't depend on it.
   */
  parts?: PartsFile | string | URL;
  /** Show the button in the corner that opens dev mode in a new tab. @default true */
  button?: boolean;
  /** Open dev mode in a new tab with Alt+Shift+D; false turns the shortcut off. @default true */
  shortcut?: boolean;
  /**
   * Open the 3D view and the inspector over this page at once, as `open()` does. A page opened
   * with the `envui-dev` query parameter, as the button and the shortcut open it, opens them in
   * any case.
   * @default false
   */
  open?: boolean;
  /** The element dev mode's UI measures, or a selector for it; the readout's default otherwise. */
  root?: Element | string;
}

/** Controls an installed dev mode. */
export interface DevModeHandle {
  /** The readout, also on the window as `envui.layout`. */
  layout: LayoutApi;
  /** Settles once the parts' descriptions have loaded, or failed to. */
  ready: Promise<void>;
  /**
   * Opens the page's address in a new tab with dev mode open over the whole window, as the button
   * and Alt+Shift+D do; where the browser blocks the tab, it opens dev mode over this page.
   */
  openInNewTab(): void;
  /** Opens the 3D view and the inspector over this page, which Esc closes again. */
  open(): void;
  /** Closes the 3D view and the inspector opened over this page. */
  close(): void;
  /** Opens or closes the 3D view and the inspector over this page. */
  toggle(): void;
  /** Removes the toggle, the shortcut, the style sheet and `envui.layout`. */
  uninstall(): void;
}

declare global {
  interface Window {
    /** envUI's dev mode, present while it is installed. */
    envui?: { layout?: LayoutApi } & Record<string, unknown>;
  }
}

let installed: DevModeHandle | null = null;

const devModeQueryParameter = 'envui-dev';

function isDevModeTab(): boolean {
  try {
    return new URLSearchParams(window.location?.search ?? '').has(devModeQueryParameter);
  } catch {
    return false;
  }
}

function devModeAddress(href: string): string {
  const url = new URL(href);
  if (!new URLSearchParams(url.search).has(devModeQueryParameter))
    url.search = url.search ? `${url.search}&${devModeQueryParameter}` : devModeQueryParameter;
  return url.href;
}

function isDevModeShortcut(event: KeyboardEvent): boolean {
  const altShiftD =
    event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyD';
  if (!altShiftD) return false;
  const target = event.target;
  const typingText =
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
  return !typingText;
}

/**
 * Installs dev mode: `window.envui.layout` with `describe()`, `check()` and `at()`, a button in the
 * corner and Alt+Shift+D, which open the page in a new tab with the 3D view and the inspector over
 * the whole window. Closing that tab ends dev mode; the page it came from stays as it was. Load it
 * in development only, so production builds contain none of it:
 *
 *   if (import.meta.env.DEV) {
 *     void import('@envsemble/envui/dev').then(({ installDevMode }) => installDevMode());
 *   }
 *
 * Calling it again returns the dev mode already installed, until it is uninstalled.
 */
export function installDevMode(options: DevModeOptions = {}): DevModeHandle {
  if (installed) return installed;
  const noop = () => {};
  if (typeof document === 'undefined')
    return {
      layout,
      ready: Promise.resolve(),
      openInNewTab: noop,
      open: noop,
      close: noop,
      toggle: noop,
      uninstall: noop,
    };

  const ready =
    options.parts === undefined
      ? loadParts().then(noop)
      : typeof options.parts === 'string' || options.parts instanceof URL
        ? loadParts(options.parts).then(noop)
        : Promise.resolve(options.parts)
            .then((parts) => {
              setParts(parts);
            })
            .catch((error: unknown) => {
              // eslint-disable-next-line no-console
              console.warn(
                'envUI dev mode: the parts given are not docs/generated/parts.json.',
                error,
              );
            });

  const style = document.createElement('style');
  style.setAttribute(devAttribute, '');
  style.textContent = devModeStyleSheetText;
  document.head.append(style);

  const host = document.createElement('div');
  host.setAttribute(devAttribute, '');
  host.setAttribute('data-env-dev-host', '');
  document.body.append(host);

  const listeners = new Set<(open: boolean) => void>();
  const inDevModeTab = isDevModeTab();
  const openInNewTab = () => {
    const newTab = window.open(devModeAddress(window.location.href), '_blank');
    const tabBlocked = newTab === null;
    if (tabBlocked) controller.setOpen(true);
    else newTab.opener = null;
  };
  const controller: DevModeController = {
    open: inDevModeTab || (options.open ?? false),
    inDevModeTab,
    showOpenButton: !inDevModeTab && (options.button ?? true),
    shortcut: options.shortcut === false ? null : 'Alt+Shift+D',
    root: options.root,
    host,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setOpen(open) {
      controller.open = open;
      for (const listener of listeners) listener(open);
    },
    openInNewTab,
  };
  const root: Root = createRoot(host);
  root.render(<DevMode controller={controller} />);

  const onKey = (event: KeyboardEvent) => {
    if (!isDevModeShortcut(event)) return;
    event.preventDefault();
    if (!inDevModeTab) openInNewTab();
  };
  if (controller.shortcut) window.addEventListener('keydown', onKey);

  const envui = window.envui ?? (window.envui = {});
  const hadLayout = Object.prototype.hasOwnProperty.call(envui, 'layout');
  const pageOwnLayout = envui.layout;
  envui.layout = layout;

  const unmountAfterTheCurrentRender = () =>
    window.setTimeout(() => {
      root.unmount();
      host.remove();
    });

  let removed = false;
  const handle: DevModeHandle = {
    layout,
    ready,
    openInNewTab,
    open: () => controller.setOpen(true),
    close: () => controller.setOpen(false),
    toggle: () => controller.setOpen(!controller.open),
    uninstall() {
      if (removed) return;
      removed = true;
      window.removeEventListener('keydown', onKey);
      unmountAfterTheCurrentRender();
      style.remove();
      if (envui.layout === layout) {
        if (hadLayout) envui.layout = pageOwnLayout;
        else delete envui.layout;
      }
      if (installed === handle) installed = null;
    },
  };
  installed = handle;
  return handle;
}
