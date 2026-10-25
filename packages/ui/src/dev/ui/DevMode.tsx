'use client';

// Dev mode's UI: a button in the corner that opens dev mode in a tab of its own and, while open,
// over the whole window, the node tree, the 3D view and the inspector side by side. It is made of
// envUI's components, inside its own Theme at the compact scale of a desktop tool, and the readout
// leaves it out.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IconButton } from '../../actions/Button.js';
import { Tooltip } from '../../feedback/Tooltip.js';
import { Row } from '../../foundations/Layout.js';
import { PortalContainer } from '../../foundations/PortalContainer.js';
import { Theme, type ThemeValue } from '../../foundations/Theme.js';
import { ViewInAr } from '../../icons/ViewInAr.js';
import { resizeRoot } from '../api.js';
import { resolveRoot } from '../measure.js';
import { Inspector, NodeTree } from './Inspector.js';
import { realSize, type FrameSize } from './FrameHandle.js';
import { loadEditorTheme, saveEditorTheme, type EditorTheme } from './editorTheme.js';
import { containWheel } from './scrolling.js';
import { loadSides, saveSides, type Sides } from './sides.js';
import { useLivePage } from './useLivePage.js';
import { View3D } from './View3D.js';

/** How the installer talks to the UI. */
export interface DevModeController {
  open: boolean;
  /** Called by the UI with its setter, so that the installer's open() and close() reach it. */
  subscribe: (setOpen: (open: boolean) => void) => () => void;
  setOpen: (open: boolean) => void;
  /** Opens the page in a new tab with dev mode open there, as the button and the shortcut do. */
  openInNewTab: () => void;
  /**
   * Whether this page is dev mode's own tab: dev mode stays open over the whole window, and only
   * closing the tab ends it.
   */
  tab: boolean;
  /** Whether the corner button shows, which opens dev mode in a new tab. */
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

/**
 * The theme of the page dev mode measures, so dev mode's UI matches it: the theme boundary around
 * its root, or the root's own, which a nested Theme gives a page of another theme than the document,
 * else the document's first.
 */
function pageTheme(root?: Element | string): ThemeValue {
  let element: Element | null | undefined;
  try {
    const resolved = resolveRoot(root);
    element =
      resolved.closest('[data-env-theme]') ??
      resolved.querySelector('[data-env-theme]:not([data-env-dev] *)');
  } catch {
    // A root that isn't there yet: the panel reports it as it opens.
  }
  element ??= document.querySelector('[data-env-theme]:not([data-env-dev] *)');
  return element?.getAttribute('data-env-theme') === 'dark' ? 'dark' : 'light';
}

export function DevMode({ controller }: { controller: DevModeController }) {
  const [open, setOpen] = useState(controller.open);
  // Dev mode's own UI takes the theme chosen at the foot of its node tree, or by default the
  // page's theme as it opens. The page keeps its own.
  const [editor, setEditor] = useState(loadEditorTheme);
  const [page, setPage] = useState(() => pageTheme(controller.root));
  useEffect(
    () =>
      controller.subscribe((next) => {
        if (next) setPage(pageTheme(controller.root));
        setOpen(next);
      }),
    [controller],
  );
  const editorTheme = {
    value: editor,
    onChange: (next: EditorTheme) => {
      if (next.theme === 'page') setPage(pageTheme(controller.root));
      setEditor(next);
      saveEditorTheme(next);
    },
  };
  return (
    <PortalContainer container={controller.host}>
      <Theme
        theme={editor.theme === 'page' ? page : editor.theme}
        contrast={editor.contrast}
        scale="compact"
        className="env-dev"
      >
        {open ? <Panel controller={controller} editorTheme={editorTheme} /> : null}
        {/* The button opens dev mode in a tab of its own; over an open dev mode it has no use. */}
        {controller.button && !open ? (
          <Tooltip
            content={
              controller.shortcut
                ? `Open dev mode in a new tab (${controller.shortcut})`
                : 'Open dev mode in a new tab'
            }
            side="inline-start"
          >
            <IconButton
              className="env-dev-toggle"
              variant="secondary"
              icon={<ViewInAr />}
              aria-label="Dev mode"
              aria-keyshortcuts={controller.shortcut ?? undefined}
              onClick={() => controller.openInNewTab()}
            />
          </Tooltip>
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

function Panel({
  controller,
  editorTheme,
}: {
  controller: DevModeController;
  editorTheme: { value: EditorTheme; onChange: (theme: EditorTheme) => void };
}) {
  const [root] = useState(() => resolveRoot(controller.root));
  // Where focus was as it opened, to give it back as it closes.
  const [returnFocus] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  const live = useLivePage(root);
  const [selected, setSelected] = useState<number | null>(null);
  const [treeHover, setTreeHover] = useState<number | null>(null);
  // Which sidebars show and how wide they are, kept in this browser for the next dev mode.
  const [sides, setSidesState] = useState(loadSides);
  const setSides = (change: (current: Sides) => Sides) =>
    setSidesState((current) => {
      const next = change(current);
      saveSides(next);
      return next;
    });
  // The size the responsive frame lays the page out at.
  const [frame, setFrame] = useState<FrameSize>(realSize);
  const panel = useRef<HTMLDivElement>(null);
  // While the panel covers the page, the page is inert and focus is in the panel.
  useLayoutEffect(() => cover(root, panel.current, returnFocus), [root, returnFocus]);
  // The wheel over the panel scrolls what in it scrolls, never the page under it.
  useEffect(() => (panel.current ? containWheel(panel.current) : undefined), []);
  // Dev mode's tab says so in its title, so it is told apart from the page's own tab.
  useEffect(() => {
    if (!controller.tab) return;
    const title = document.title;
    document.title = title ? `Dev mode · ${title}` : 'Dev mode';
    return () => {
      document.title = title;
    };
  }, [controller.tab]);
  // The frame resizes the root as at() does, and puts its style back on a reset and as dev mode
  // closes; the page re-lays out under the panel and the live page measures it again.
  useLayoutEffect(
    () =>
      frame.width === null && frame.height === null
        ? undefined
        : resizeRoot(root, frame.width, frame.height),
    [root, frame.width, frame.height],
  );
  return (
    <Row
      ref={panel}
      gap={0}
      align="stretch"
      className="env-dev-panel"
      role="region"
      aria-label="Dev mode"
      tabIndex={-1}
      onKeyDown={(event) => {
        // Dev mode's own tab stays dev mode; over a page, as open() opens it, Esc closes it.
        if (controller.tab || event.key !== 'Escape' || event.defaultPrevented) return;
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
          width={sides.treeWidth}
          onWidthChange={(width) => setSides((current) => ({ ...current, treeWidth: width }))}
          onHide={() => setSides((current) => ({ ...current, tree: false }))}
          editorTheme={editorTheme}
        />
      ) : null}
      <View3D
        live={live}
        selected={selected}
        onSelect={setSelected}
        treeHover={treeHover}
        sides={sides}
        onShow={(side) => setSides((current) => ({ ...current, [side]: true }))}
        frame={frame}
        onFrameChange={setFrame}
        root={root}
      />
      {sides.inspector ? (
        <Inspector
          live={live}
          selected={selected}
          width={sides.inspectorWidth}
          onWidthChange={(width) => setSides((current) => ({ ...current, inspectorWidth: width }))}
          onHide={() => setSides((current) => ({ ...current, inspector: false }))}
        />
      ) : null}
    </Row>
  );
}
