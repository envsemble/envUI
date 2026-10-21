// Installs dev mode in a page: the readout as `envui.layout` on the window, and the toggle that
// opens the 3D view and the inspector.

import { createRoot, type Root } from 'react-dom/client';
import { layout, type LayoutApi } from './api.js';
import { devAttribute } from './measure.js';
import { loadParts, setParts } from './parts.js';
import { DevMode, type DevModeController } from './ui/DevMode.js';
import { devStyles } from './ui/styles.js';

export interface DevModeOptions {
  /**
   * The parts' names and descriptions, as docs/generated/parts.json holds them, or the URL to fetch
   * them from. Without it, dev mode tries the copy beside it in the package, and names parts by
   * their classes alone when that fails.
   */
  parts?: unknown;
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
 * Calling it again returns the dev mode already installed.
 */
export function installDevMode(options: DevModeOptions = {}): DevModeHandle {
  if (installed) return installed;
  const noop = () => {};
  if (typeof document === 'undefined')
    return { layout, open: noop, close: noop, toggle: noop, uninstall: noop };

  if (options.parts === undefined) void loadParts();
  else if (typeof options.parts === 'string' || options.parts instanceof URL)
    void loadParts(options.parts);
  else setParts(options.parts);

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

  const previous = window.envui;
  window.envui = { ...previous, layout };

  installed = {
    layout,
    open: () => controller.setOpen(true),
    close: () => controller.setOpen(false),
    toggle: () => controller.setOpen(!controller.open),
    uninstall() {
      window.removeEventListener('keydown', onKey);
      // Unmounting while the app renders, as when an effect's cleanup uninstalls dev mode, waits
      // for that render to end.
      window.setTimeout(() => {
        root.unmount();
        host.remove();
      });
      style.remove();
      if (window.envui?.layout === layout) {
        const { layout: _layout, ...rest } = window.envui;
        window.envui = Object.keys(rest).length ? rest : undefined;
      }
      installed = null;
    },
  };
  return installed;
}
