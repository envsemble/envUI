// Installs dev mode in a page: the readout as `envui.layout` on the window, and the toggle that
// opens the 3D view and the inspector.

import { createRoot, type Root } from 'react-dom/client';
import { layout, type LayoutApi } from './api.js';
import { devAttribute } from './measure.js';
import { loadParts, setParts, type PartsFile } from './parts.js';
import { DevMode, type DevModeController } from './ui/DevMode.js';
import { devStyles } from './ui/styles.js';

export interface DevModeOptions {
  /**
   * The parts' descriptions: docs/generated/parts.json's content, or the URL to fetch it from.
   * Without it, dev mode tries the copy beside it in the package, and goes without descriptions when
   * that fails. Names don't depend on it.
   */
  parts?: PartsFile | string | URL;
  /** Show the toggle button in the corner. @default true */
  button?: boolean;
  /** Toggle dev mode with Alt+Shift+D; false turns the shortcut off. @default true */
  shortcut?: boolean;
  /** Open the 3D view and the inspector at once. @default false */
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
  open(): void;
  close(): void;
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

/** Whether a key press toggles dev mode: Alt+Shift+D, outside text entry. */
function isShortcut(event: KeyboardEvent): boolean {
  if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey || event.code !== 'KeyD')
    return false;
  const target = event.target;
  return !(
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
}

/**
 * Installs dev mode: `window.envui.layout` with `describe()`, `check()` and `at()`, a toggle button
 * in the corner and Alt+Shift+D, which open the 3D view and the inspector over the page. Load it in
 * development only, so production builds contain none of it:
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
        : // Parts handed over in the wrong shape don't stop dev mode: it runs without descriptions.
          Promise.resolve(options.parts)
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
  style.textContent = devStyles;
  document.head.append(style);

  const host = document.createElement('div');
  host.setAttribute(devAttribute, '');
  host.setAttribute('data-env-dev-host', '');
  document.body.append(host);

  const listeners = new Set<(open: boolean) => void>();
  const controller: DevModeController = {
    open: options.open ?? false,
    button: options.button ?? true,
    shortcut: options.shortcut === false ? null : 'Alt+Shift+D',
    root: options.root,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setOpen(open) {
      controller.open = open;
      for (const listener of listeners) listener(open);
    },
  };
  const root: Root = createRoot(host);
  root.render(<DevMode controller={controller} />);

  const onKey = (event: KeyboardEvent) => {
    if (!isShortcut(event)) return;
    event.preventDefault();
    controller.setOpen(!controller.open);
  };
  if (controller.shortcut) window.addEventListener('keydown', onKey);

  // The page's own `window.envui`, if it has one, stays the same object; a layout it held comes
  // back on uninstall.
  const envui = window.envui ?? (window.envui = {});
  const hadLayout = Object.prototype.hasOwnProperty.call(envui, 'layout');
  const previousLayout = envui.layout;
  envui.layout = layout;

  let removed = false;
  const handle: DevModeHandle = {
    layout,
    ready,
    open: () => controller.setOpen(true),
    close: () => controller.setOpen(false),
    toggle: () => controller.setOpen(!controller.open),
    uninstall() {
      if (removed) return;
      removed = true;
      window.removeEventListener('keydown', onKey);
      // Unmounting while the app renders, as when an effect's cleanup uninstalls dev mode, waits
      // for that render to end.
      window.setTimeout(() => {
        root.unmount();
        host.remove();
      });
      style.remove();
      if (envui.layout === layout) {
        if (hadLayout) envui.layout = previousLayout;
        else delete envui.layout;
      }
      if (installed === handle) installed = null;
    },
  };
  installed = handle;
  return handle;
}
