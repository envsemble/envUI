'use client';

// Dev mode's UI: a toggle in the corner and, while open, over the page, the node tree, the 3D view
// and the inspector side by side. It is made of envUI's components, inside its own Theme at the
// compact scale of a desktop tool, and the readout leaves it out.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IconButton } from '../../actions/Button.js';
import { PortalContainer } from '../../foundations/PortalContainer.js';
import { Theme, type ThemeValue } from '../../foundations/Theme.js';
import { ViewInAr } from '../../icons/ViewInAr.js';
import { resizeRoot } from '../api.js';
import { resolveRoot } from '../measure.js';
import { Inspector, NodeTree } from './Inspector.js';
import { useLivePage } from './useLivePage.js';
import { View3D } from './View3D.js';

/** How the installer talks to the UI. */
export interface DevModeController {
  open: boolean;
  /** Called by the UI with its setter, so that the installer's open() and close() reach it. */
  subscribe: (setOpen: (open: boolean) => void) => () => void;
  setOpen: (open: boolean) => void;
  button: boolean;
  /** The shortcut as people read it, such as Alt+Shift+D, or null without one. */
  shortcut: string | null;
  root?: Element | string;
  /**
   * The element dev mode renders into. Its own popups, such as a tooltip, portal into it too, so
   * they stay dev mode's and the readout leaves them out.
   */
  host: HTMLElement;
}

/** The page's theme, so dev mode's UI matches it. */
function pageTheme(): ThemeValue {
  const theme = document
    .querySelector('[data-env-theme]:not([data-env-dev] *)')
    ?.getAttribute('data-env-theme');
  return theme === 'dark' ? 'dark' : 'light';
}

export function DevMode({ controller }: { controller: DevModeController }) {
  const [open, setOpen] = useState(controller.open);
  useEffect(() => controller.subscribe(setOpen), [controller]);
  return (
    <PortalContainer container={controller.host}>
      <Theme theme={pageTheme()} scale="compact" className="env-dev">
        {open ? <Panel controller={controller} /> : null}
        {controller.button ? (
          <IconButton
            className="env-dev-toggle"
            variant={open ? 'primary' : 'secondary'}
            icon={<ViewInAr />}
            aria-label="Dev mode"
            aria-pressed={open}
            title={controller.shortcut ? `Dev mode (${controller.shortcut})` : 'Dev mode'}
            onClick={() => controller.setOpen(!open)}
          />
        ) : null}
      </Theme>
    </PortalContainer>
  );
}

/**
 * Makes the page under the panel inert and moves focus into the panel; what it returns undoes it
 * and gives focus back. The page stays as it is when it holds the panel, as the body would.
 */
function cover(root: HTMLElement, element: HTMLElement | null, returnFocus: HTMLElement | null) {
  const page = element && !root.contains(element) ? root : null;
  const wasInert = page?.inert ?? false;
  if (page) page.inert = true;
  element?.focus({ preventScroll: true });
  return () => {
    if (page) page.inert = wasInert;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  };
}

function Panel({ controller }: { controller: DevModeController }) {
  const [root] = useState(() => resolveRoot(controller.root));
  // Where focus was as it opened, to give it back as it closes.
  const [returnFocus] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  const live = useLivePage(root);
  const [selected, setSelected] = useState<number | null>(null);
  const [treeHover, setTreeHover] = useState<number | null>(null);
  const [sides, setSides] = useState({ tree: true, inspector: true });
  // The width the responsive frame lays the page out at, in px, or null for its real width.
  const [frameWidth, setFrameWidth] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  // While the panel covers the page, the page is inert and focus is in the panel.
  useLayoutEffect(() => cover(root, panel.current, returnFocus), [root, returnFocus]);
  // The frame resizes the root as at() does, and puts its style back on a reset and as dev mode
  // closes; the page re-lays out under the panel and the live page measures it again.
  useLayoutEffect(
    () => (frameWidth === null ? undefined : resizeRoot(root, frameWidth)),
    [root, frameWidth],
  );
  return (
    <div
      ref={panel}
      className="env-dev-panel"
      role="region"
      aria-label="Dev mode"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || event.defaultPrevented) return;
        event.preventDefault();
        controller.setOpen(false);
      }}
    >
      {sides.tree ? (
        <NodeTree
          live={live}
          selected={selected}
          onSelect={setSelected}
          onTreeHover={setTreeHover}
          onHide={() => setSides((current) => ({ ...current, tree: false }))}
        />
      ) : null}
      <View3D
        live={live}
        selected={selected}
        onSelect={setSelected}
        treeHover={treeHover}
        sides={sides}
        onSidesChange={setSides}
        frameWidth={frameWidth}
        onFrameWidthChange={setFrameWidth}
        onClose={() => controller.setOpen(false)}
      />
      {sides.inspector ? (
        <Inspector
          live={live}
          selected={selected}
          onHide={() => setSides((current) => ({ ...current, inspector: false }))}
        />
      ) : null}
    </div>
  );
}
