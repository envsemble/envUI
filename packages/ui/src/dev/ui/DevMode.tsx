'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { IconButton } from '../../actions/Button.js';
import { Tooltip } from '../../overlays/Tooltip.js';
import { Row } from '../../layout/Layout.js';
import { PortalContainer } from '../../foundations/PortalContainer.js';
import { Theme, type ColorScheme } from '../../foundations/Theme.js';
import { IconViewInAr } from '../../icons/ViewInAr.js';
import { resizeRoot } from '../api.js';
import { resolveRoot } from '../measure.js';
import { Inspector, NodeTree } from './Inspector.js';
import { pageOwnSize, type FrameSize } from './Frame.js';
import type { Side } from './Controls.js';
import { loadEditorTheme, saveEditorTheme, type EditorTheme } from './editorTheme.js';
import { containWheelWhereOverscrollBehaviorFallsShort } from './wheel.js';
import { loadSides, saveSides, type Sides } from './sides.js';
import { useLivePage } from './useLivePage.js';
import { View3D } from './View3D.js';

export interface DevModeController {
  open: boolean;
  subscribe: (setOpen: (open: boolean) => void) => () => void;
  setOpen: (open: boolean) => void;
  openInNewTab: () => void;
  inDevModeTab: boolean;
  showOpenButton: boolean;
  shortcut: string | null;
  root?: Element | string;
  host: HTMLElement;
}

function rootIfAlreadyThere(root?: Element | string): HTMLElement | null {
  try {
    return resolveRoot(root);
  } catch {
    return null;
  }
}

function themeOfMeasuredPage(root?: Element | string): ColorScheme {
  const resolved = rootIfAlreadyThere(root);
  const element =
    resolved?.closest('[data-env-theme]') ??
    resolved?.querySelector('[data-env-theme]:not([data-env-dev] *)') ??
    document.querySelector('[data-env-theme]:not([data-env-dev] *)');
  return element?.getAttribute('data-env-theme') === 'dark' ? 'dark' : 'light';
}

export function DevMode({ controller }: { controller: DevModeController }) {
  const [open, setOpen] = useState(controller.open);
  const [editor, setEditor] = useState(loadEditorTheme);
  const [pageThemeAtOpen, setPageThemeAtOpen] = useState(() =>
    themeOfMeasuredPage(controller.root),
  );
  useEffect(() => {
    const follow = (next: boolean) => {
      if (next) setPageThemeAtOpen(themeOfMeasuredPage(controller.root));
      setOpen(next);
    };
    const openedOrClosedBeforeSubscribing = controller.open !== open;
    if (openedOrClosedBeforeSubscribing) follow(controller.open);
    return controller.subscribe(follow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller]);
  const editorTheme = useMemo(
    () => ({
      value: editor,
      onChange: (next: EditorTheme) => {
        if (next.theme === 'page') setPageThemeAtOpen(themeOfMeasuredPage(controller.root));
        setEditor(next);
        saveEditorTheme(next);
      },
    }),
    [editor, controller.root],
  );
  return (
    <PortalContainer container={controller.host}>
      <Theme
        theme={editor.theme === 'page' ? pageThemeAtOpen : editor.theme}
        contrast={editor.contrast}
        scale="compact"
        className="env-dev"
      >
        {open ? <Panel controller={controller} editorTheme={editorTheme} /> : null}
        {controller.showOpenButton && !open ? (
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
              icon={<IconViewInAr />}
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

function coverPageAndFocusPanel(
  root: HTMLElement,
  element: HTMLElement | null,
  focusBeforeOpening: HTMLElement | null,
) {
  const pageHoldsThePanel = element !== null && root.contains(element);
  const coveredPage = element && !pageHoldsThePanel ? root : null;
  const wasInert = coveredPage?.inert ?? false;
  if (coveredPage) coveredPage.inert = true;
  element?.focus({ preventScroll: true });
  return () => {
    if (coveredPage) coveredPage.inert = wasInert;
    if (focusBeforeOpening?.isConnected) focusBeforeOpening.focus({ preventScroll: true });
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
  const [focusBeforeOpening] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  const live = useLivePage(root);
  const [selected, setSelected] = useState<number | null>(null);
  const highlightPlaneFromTree = useRef<(key: number | null) => void>(() => {});
  const onTreeHover = useCallback((key: number | null) => highlightPlaneFromTree.current(key), []);
  const [sidesAsLastLeft] = useState(loadSides);
  const [shown, setShown] = useState({
    tree: sidesAsLastLeft.tree,
    inspector: sidesAsLastLeft.inspector,
  });
  const storeSideChange = useCallback(
    (change: Partial<Sides>) => saveSides({ ...loadSides(), ...change }),
    [],
  );
  const setSide = useCallback(
    (side: Side, show: boolean) => {
      setShown((current) => ({ ...current, [side]: show }));
      storeSideChange({ [side]: show });
    },
    [storeSideChange],
  );
  const onShow = useCallback((side: Side) => setSide(side, true), [setSide]);
  const hideTree = useCallback(() => setSide('tree', false), [setSide]);
  const hideInspector = useCallback(() => setSide('inspector', false), [setSide]);
  const storeTreeWidth = useCallback(
    (width: number) => storeSideChange({ treeWidth: width }),
    [storeSideChange],
  );
  const storeInspectorWidth = useCallback(
    (width: number) => storeSideChange({ inspectorWidth: width }),
    [storeSideChange],
  );
  const [responsiveFrame, setResponsiveFrame] = useState<FrameSize>(pageOwnSize);
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () => coverPageAndFocusPanel(root, panel.current, focusBeforeOpening),
    [root, focusBeforeOpening],
  );
  useEffect(
    () =>
      panel.current ? containWheelWhereOverscrollBehaviorFallsShort(panel.current) : undefined,
    [],
  );
  useEffect(() => {
    if (!controller.inDevModeTab) return;
    const pageTitle = document.title;
    document.title = pageTitle ? `Dev mode · ${pageTitle}` : 'Dev mode';
    return () => {
      document.title = pageTitle;
    };
  }, [controller.inDevModeTab]);
  useLayoutEffect(
    () =>
      responsiveFrame.width === null && responsiveFrame.height === null
        ? undefined
        : resizeRoot(root, responsiveFrame.width, responsiveFrame.height),
    [root, responsiveFrame.width, responsiveFrame.height],
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
        const escClosesDevModeOverThePage =
          !controller.inDevModeTab && event.key === 'Escape' && !event.defaultPrevented;
        if (!escClosesDevModeOverThePage) return;
        event.preventDefault();
        controller.setOpen(false);
      }}
    >
      {shown.tree ? (
        <NodeTree
          full={live.full}
          selected={selected}
          onSelect={setSelected}
          onTreeHover={onTreeHover}
          defaultWidth={sidesAsLastLeft.treeWidth}
          onWidthCommit={storeTreeWidth}
          onHide={hideTree}
          editorTheme={editorTheme}
        />
      ) : null}
      <View3D
        live={live}
        selected={selected}
        onSelect={setSelected}
        markPlaneHoveredRef={highlightPlaneFromTree}
        sides={shown}
        onShow={onShow}
        frame={responsiveFrame}
        onFrameChange={setResponsiveFrame}
        root={root}
      />
      {shown.inspector ? (
        <Inspector
          full={live.full}
          selected={selected}
          defaultWidth={sidesAsLastLeft.inspectorWidth}
          onWidthCommit={storeInspectorWidth}
          onHide={hideInspector}
        />
      ) : null}
    </Row>
  );
}
