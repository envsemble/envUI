'use client';

// The page in 3D: every node a plane, lifted by how deeply it is nested, so what is inside what
// reads as what is above what. Sticky and floating nodes sit half a level higher, open overlays
// above the whole page. Each plane carries the node's surfaces. The planes are drawn from the
// measured boxes: the page itself can't be tilted, since scroll containers flatten 3D.
//
// Over the view float a toolbar of four dropdowns, the view's angle, what the planes show, the
// responsive frame and the view's settings, and in its top corners how to move around and the
// buttons that bring back a hidden sidebar.

import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Button } from '../../actions/Button.js';
import * as Toolbar from '../../actions/Toolbar.js';
import * as DescriptionList from '../../content/DescriptionList.js';
import { Kbd } from '../../content/Kbd.js';
import { Popover } from '../../feedback/Popover.js';
import { Slider } from '../../forms/Slider.js';
import { Column, Grid, Row } from '../../foundations/Layout.js';
import { Surface } from '../../foundations/Surface.js';
import { Text } from '../../foundations/Text.js';
import { Close } from '../../icons/Close.js';
import { FilterAlt } from '../../icons/FilterAlt.js';
import { Info } from '../../icons/Info.js';
import { Label } from '../../icons/Label.js';
import { Layers } from '../../icons/Layers.js';
import { Padding } from '../../icons/Padding.js';
import { Palette } from '../../icons/Palette.js';
import { ResponsiveLayout } from '../../icons/ResponsiveLayout.js';
import { StayCurrentLandscape } from '../../icons/StayCurrentLandscape.js';
import { StayCurrentPortrait } from '../../icons/StayCurrentPortrait.js';
import { Tune } from '../../icons/Tune.js';
import { ViewInAr } from '../../icons/ViewInAr.js';
import * as Menu from '../../navigation/Menu.js';
import { layoutAttribute, overlaySelector } from '../measure.js';
import type { LayoutProblem, NodeData, Snapshot } from '../model.js';
import { queriesFor, thresholdsFor } from '../queries.js';
import { labelOf } from '../readout.js';
import { round, toRem, windowClasses, windowClassOf } from '../units.js';
import { HintedIconButton, SidebarToggle, instant, type Side } from './controls.js';
import { ViewFit, ViewFront, ViewLeft, ViewRight, ViewTilted, ViewTop } from './icons.js';
import { deviceGroups } from './devices.js';
import { FrameHandle, realSize, type FrameEdge, type FrameSize } from './FrameHandle.js';
import { scrollsToward, wheelDelta } from './scrolling.js';
import { surfaceOf } from './surfaces.js';
import type { LivePage } from './useLivePage.js';

interface Camera {
  rx: number;
  ry: number;
  zoom: number;
  px: number;
  py: number;
}

type Angle = 'tilted' | 'front' | 'top' | 'left' | 'right';

const tilted = { rx: 38, ry: -22 };
/** The angles the view turns to, by the side of the page they look from. */
const angles: Record<Angle, { label: string; icon: ReactNode; rx: number; ry: number }> = {
  tilted: { label: 'Tilted', icon: <ViewTilted />, ...tilted },
  front: { label: 'Front', icon: <ViewFront />, rx: 0, ry: 0 },
  top: { label: 'Top', icon: <ViewTop />, rx: -70, ry: 0 },
  left: { label: 'Left', icon: <ViewLeft />, rx: 0, ry: 70 },
  right: { label: 'Right', icon: <ViewRight />, rx: 0, ry: -70 },
};
/**
 * The View dropdown's three by two grid, row by row, laid out as the angles look at the page: Top
 * above Front, Left and Right beside it, and Tilted, which looks from above and to the right, in
 * the top right corner. null leaves a cell empty.
 */
const angleGrid: (Angle | null)[] = [null, 'top', 'tilted', 'left', 'front', 'right'];

type CachedSurface = { signature: string; element: HTMLElement; restore: () => void };

export interface View3DProps {
  live: LivePage;
  selected: number | null;
  onSelect: (key: number | null) => void;
  /** The node hovered in the tree. */
  treeHover: number | null;
  /** Which sidebars show: a hidden one leaves its button floating in its corner of the view. */
  sides: { tree: boolean; inspector: boolean };
  onShow: (side: Side) => void;
  /**
   * The size the responsive frame lays the page out at; the page's own size, with no frame shown,
   * until the reader turns the frame on.
   */
  frame: FrameSize;
  onFrameChange: (frame: FrameSize) => void;
  /** The element dev mode shows; the wheel scrolls nothing around it. */
  root: HTMLElement;
}

/** The nodes in a node, itself included, by key. */
function subtreeOf(snapshot: Snapshot, key: number): Set<number> {
  const keys = new Set<number>();
  const start = snapshot.nodes.find((node) => node.key === key);
  const visit = (node: NodeData) => {
    keys.add(node.key);
    for (const child of node.children) visit(snapshot.nodes[child]);
  };
  if (start) visit(start);
  return keys;
}

/**
 * What the wheel scrolls over a node, as a browser would under the pointer: a scroller of the
 * node's own content, else the nearest around it up to the root, else the window; one at its end
 * passes the wheel on. Never what is around the root, which the view doesn't show; an open
 * overlay's node scrolls only within the overlay. 'end' where all that scrolls there is at its
 * end, null where nothing does.
 */
function scrollerAt(
  element: HTMLElement,
  root: HTMLElement,
  dx: number,
  dy: number,
): HTMLElement | 'end' | null {
  const inPage = root.contains(element);
  const limit = inPage ? root : (element.closest<HTMLElement>(overlaySelector) ?? element);
  const candidates = [element];
  for (const inner of Array.from(element.querySelectorAll<HTMLElement>('*')))
    if (inner.closest(`[${layoutAttribute}]`) === element) candidates.push(inner);
  for (let at = element; at !== limit && at.parentElement; at = at.parentElement)
    candidates.push(at.parentElement);
  const page = document.scrollingElement;
  if (inPage && page instanceof HTMLElement && !candidates.includes(page)) candidates.push(page);
  let end = false;
  for (const candidate of candidates) {
    const scrolls = scrollsToward(candidate, dx, dy);
    if (scrolls === 'room') return candidate;
    if (scrolls === 'end') end = true;
  }
  return end ? 'end' : null;
}

/** A secondary label, quiet and small. */
const Quiet = ({ children }: { children: ReactNode }) => (
  <Text variant="body-sm" render={<span />}>
    {children}
  </Text>
);

/** The floating controls take the pointer and the wheel for themselves, not for the view. */
const keepPointer = (event: ReactPointerEvent) => event.stopPropagation();

export function View3D({
  live,
  selected,
  onSelect,
  treeHover,
  sides,
  onShow,
  frame,
  onFrameChange,
  root,
}: View3DProps) {
  const snapshot = live.geometry;
  const problemsByKey = live.full?.problemsByKey;
  // The responsive frame shows only once the reader turns it on, or picks a device.
  const frameOn = frame.width !== null || frame.height !== null;
  const [spacing, setSpacing] = useState(48);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState<number | null>(null);
  const [colorBy, setColorBy] = useState<'kind' | 'window'>('kind');
  const [names, setNames] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);
  const [onlySelected, setOnlySelected] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  // The angle the view was last turned to, which the View dropdown shows, until a drag turns it.
  const [angle, setAngle] = useState<Angle | null>('tilted');
  const view = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  // Where the pointer is in the view, where the hover card goes.
  const pointer = useRef({ x: 0, y: 0 });
  const camera = useRef<Camera>({ ...tilted, zoom: 0.6, px: 0, py: 0 });
  const fitted = useRef(false);
  /** The timer that ends a turn to an angle at the latest. */
  const turning = useRef(0);
  useEffect(() => () => window.clearTimeout(turning.current), []);
  const surfaces = useRef(new Map<number, CachedSurface>()).current;
  const hoveredRef = useRef<number | null>(null);
  hoveredRef.current = hovered;
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const maxLevel = Math.ceil(Math.max(0, ...(snapshot?.nodes ?? []).map((node) => node.level)));
  const top = Math.min(to ?? maxLevel, maxLevel);
  const lift = Math.max(0, top - from) * spacing;

  /** Moves the scene to the camera, without a render: dragging stays smooth. */
  const applyCamera = () => {
    const { rx, ry, zoom, px, py } = camera.current;
    if (!scene.current) return;
    scene.current.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px) scale(${zoom}) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${-lift / 2}px)`;
    // The frame's handles and label keep their size on screen at any zoom.
    scene.current.style.setProperty('--env-dev-zoom', String(zoom));
  };
  useLayoutEffect(applyCamera);

  /** Turns the camera to the tilted view, with the whole page in view. */
  const fit = () => {
    const current = snapshotRef.current;
    if (!current || !view.current) return;
    const { w, h } = current.root.box;
    const room = view.current.getBoundingClientRect();
    const zoom = round(Math.min(room.width / Math.max(w, 1), room.height / Math.max(h, 1)) * 0.7);
    camera.current = { ...tilted, zoom: Math.max(0.05, zoom), px: 0, py: 0 };
    applyCamera();
    setAngle('tilted');
  };
  /**
   * Turns the camera to one of the angles, keeping its zoom and pan, or fits the page in view: the
   * scene eases there, where motion is welcome (styles.ts), until the turn ends or a drag or the
   * wheel moves it.
   */
  const turnTo = (next: Angle | 'fit') => {
    const element = scene.current;
    if (element) {
      element.dataset.turning = '';
      // The turn ends as its transition does, or after it at the latest: with reduced motion, or
      // where the camera is already there, no transition runs.
      const end = () => delete element.dataset.turning;
      element.addEventListener('transitionend', end, { once: true });
      window.clearTimeout(turning.current);
      turning.current = window.setTimeout(end, 600);
    }
    if (next === 'fit') return fit();
    const { rx, ry } = angles[next];
    camera.current = { ...camera.current, rx, ry };
    applyCamera();
    setAngle(next);
  };
  /** Ends a turn still easing, so the camera follows the pointer and the wheel at once. */
  const stopTurning = () => {
    if (scene.current) delete scene.current.dataset.turning;
  };
  // The first measurement fits the page into the view.
  useLayoutEffect(() => {
    if (fitted.current || !snapshot) return;
    fitted.current = true;
    fit();
  });

  // Forget the copies of nodes that are gone.
  useEffect(() => {
    if (!snapshot) return;
    const keys = new Set(snapshot.nodes.map((node) => node.key));
    for (const key of surfaces.keys()) if (!keys.has(key)) surfaces.delete(key);
  }, [snapshot, surfaces]);

  // The wheel scrolls the page's scroller under the pointer, in the root, and the planes follow;
  // Ctrl+wheel, or the wheel where nothing scrolls, zooms toward the pointer.
  useEffect(() => {
    const element = view.current;
    if (!element) return;
    const zoomAt = (event: WheelEvent) => {
      const room = element.getBoundingClientRect();
      const mx = event.clientX - room.left - room.width / 2;
      const my = event.clientY - room.top - room.height / 2;
      const current = camera.current;
      const zoom = Math.max(0.05, Math.min(6, current.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1)));
      const k = zoom / current.zoom;
      camera.current = {
        ...current,
        zoom,
        px: mx - (mx - current.px) * k,
        py: my - (my - current.py) * k,
      };
      applyCamera();
    };
    const wheel = (event: WheelEvent) => {
      if ((event.target as Element).closest('.env-dev-float')) return;
      event.preventDefault();
      stopTurning();
      const { dx, dy } = wheelDelta(event);
      const key = hoveredRef.current;
      const current = snapshotRef.current;
      const node =
        key === null ? undefined : current?.nodes.find((candidate) => candidate.key === key);
      const target = node ? current?.elements?.[node.index] : undefined;
      const scroller =
        !event.ctrlKey && !event.metaKey && target ? scrollerAt(target, root, dx, dy) : null;
      if (scroller === null) zoomAt(event);
      else if (scroller !== 'end') scroller.scrollBy({ left: dx, top: dy });
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
    // applyCamera reads refs and `lift`, which the layout effect applies on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

  // With "only the selected" on, the view shows the selected node and what is inside it.
  const focused = onlySelected ? selected : null;
  const shownKeys = useMemo(
    () => (snapshot && focused !== null ? subtreeOf(snapshot, focused) : null),
    [snapshot, focused],
  );
  const drag = useDrag(camera, applyCamera, {
    setDragging,
    turned: () => setAngle(null),
    click: () => onSelect(hoveredRef.current === selected ? null : hoveredRef.current),
  });
  if (!snapshot) return <div className="env-dev-view" ref={view} />;

  const origin = snapshot.root.box;
  const shown = snapshot.nodes.filter(
    (node) =>
      node.hidden === null &&
      node.clip.w >= 1 &&
      node.clip.h >= 1 &&
      node.level >= from &&
      node.level <= top + 0.5 &&
      (!shownKeys || shownKeys.has(node.key)),
  );
  const hoveredNode =
    hovered === null ? undefined : snapshot.nodes.find((node) => node.key === hovered);

  return (
    <div
      ref={view}
      className="env-dev-view"
      data-color={colorBy}
      data-dragging={dragging ? '' : undefined}
      onPointerDown={(event) => {
        stopTurning();
        drag.down(event);
      }}
      onPointerMove={(event) => {
        drag.move(event);
        const room = event.currentTarget.getBoundingClientRect();
        pointer.current = { x: event.clientX - room.left + 14, y: event.clientY - room.top + 14 };
        if (card.current) {
          card.current.style.left = `${pointer.current.x}px`;
          card.current.style.top = `${pointer.current.y}px`;
        }
        if (drag.active()) return;
        const plane = (event.target as Element).closest<HTMLElement>('[data-plane]');
        const key = plane ? Number(plane.dataset.plane) : null;
        if (key !== hoveredRef.current) setHovered(key);
      }}
      onPointerUp={drag.up}
      onPointerCancel={drag.up}
      onPointerLeave={() => setHovered(null)}
      // The view never starts the browser's own drag: pressed on text selected across it, such as
      // after Ctrl+A or a selection dragged out of a sidebar, the browser would drag the selection
      // as a picture and cancel the pointer, and dragging would stop turning the view.
      onDragStart={(event) => event.preventDefault()}
    >
      <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <pattern
            id="env-dev-padding"
            patternUnits="userSpaceOnUse"
            width="7"
            height="7"
            patternTransform="rotate(45)"
          >
            <rect width="3" height="7" fill="var(--env-dev-tint-butter)" fillOpacity="0.45" />
          </pattern>
          <pattern
            id="env-dev-gap"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(-45)"
          >
            <rect width="2" height="6" fill="var(--env-dev-tint-seafoam)" fillOpacity="0.3" />
          </pattern>
        </defs>
      </svg>
      <div
        ref={scene}
        className="env-dev-scene"
        data-dragging={dragging ? '' : undefined}
        style={{ width: origin.w, height: origin.h }}
      >
        <div className="env-dev-floor" />
        {shown.map((node) => (
          <Plane
            key={node.key}
            node={node}
            origin={origin}
            z={(node.level - from) * spacing}
            element={snapshot.elements?.[node.index]}
            version={live.versions.get(node.key) ?? 0}
            surfaces={surfaces}
            rootPx={snapshot.rootPx}
            names={names}
            showSpacing={showSpacing}
            problems={problemsByKey?.get(node.key)?.length ?? 0}
            selected={selected === node.key}
            hovered={hovered === node.key || treeHover === node.key}
          />
        ))}
        {colorBy === 'window' && hoveredNode && shown.includes(hoveredNode) ? (
          <Ruler
            snapshot={snapshot}
            node={hoveredNode}
            origin={origin}
            z={(top - from + 0.75) * spacing + 2}
          />
        ) : null}
        {frameOn ? (
          <Frame
            width={origin.w}
            height={origin.h}
            size={frame}
            rootPx={snapshot.rootPx}
            z={(top - from) * spacing + 4}
            onSizeChange={onFrameChange}
          />
        ) : null}
      </div>

      <Surface
        padding={1}
        radius="full"
        render={<Toolbar.Root aria-label="3D view" size="sm" tooltipDelay={instant} />}
        className="env-dev-float env-dev-toolbar"
        onPointerDown={keepPointer}
      >
        <ViewMenu angle={angle} onAngle={turnTo} onFit={() => turnTo('fit')} />
        <Menu.Root
          aria-label="Show"
          align="center"
          trigger={<Toolbar.Button icon={<Layers />} label="Show" />}
        >
          <Menu.CheckboxItem icon={<Label />} checked={names} onCheckedChange={setNames}>
            Names
          </Menu.CheckboxItem>
          <Menu.CheckboxItem
            icon={<Padding />}
            checked={showSpacing}
            onCheckedChange={setShowSpacing}
          >
            Padding and gaps
          </Menu.CheckboxItem>
          <Menu.CheckboxItem
            icon={<FilterAlt />}
            description="And what is inside it"
            checked={onlySelected}
            onCheckedChange={setOnlySelected}
          >
            Only the selected
          </Menu.CheckboxItem>
          <Menu.CheckboxItem
            icon={<Palette />}
            checked={colorBy === 'window'}
            onCheckedChange={(on) => setColorBy(on ? 'window' : 'kind')}
          >
            Color by window class
          </Menu.CheckboxItem>
        </Menu.Root>
        <ResponsiveMenu
          frame={frame}
          width={origin.w}
          height={origin.h}
          onFrameChange={onFrameChange}
        />
        <Popover
          title="View settings"
          trigger={<Toolbar.Button icon={<Tune />} label="View settings" />}
        >
          <Slider
            label={<Quiet>Spacing between levels</Quiet>}
            min={0}
            max={160}
            value={spacing}
            onValueChange={setSpacing}
            formatValue={(value) => `${value} px`}
          />
          <Slider
            label={<Quiet>From level</Quiet>}
            min={0}
            max={Math.max(1, maxLevel)}
            value={Math.min(from, maxLevel)}
            onValueChange={(value) => {
              setFrom(value);
              if (value > top) setTo(value);
            }}
          />
          <Slider
            label={<Quiet>To level</Quiet>}
            min={0}
            max={Math.max(1, maxLevel)}
            value={top}
            onValueChange={(value) => {
              setTo(value);
              if (value < from) setFrom(value);
            }}
          />
        </Popover>
      </Surface>

      {/* The top corners: a hidden sidebar's button where it was, and how to move around. */}
      {sides.tree ? null : (
        <Surface
          padding={1}
          radius="full"
          className="env-dev-float env-dev-corner"
          data-side="start"
          onPointerDown={keepPointer}
        >
          <SidebarToggle side="tree" shown={false} onClick={() => onShow('tree')} />
        </Surface>
      )}
      <Surface
        padding={1}
        radius="full"
        render={<Row gap={1} align="center" />}
        className="env-dev-float env-dev-corner"
        data-side="end"
        onPointerDown={keepPointer}
      >
        <Popover
          title="Moving around"
          side="bottom"
          align="end"
          trigger={
            <HintedIconButton
              label="How to move around"
              icon={<Info />}
              size="sm"
              side="inline-start"
            />
          }
        >
          <MovingAround />
        </Popover>
        {sides.inspector ? null : (
          <SidebarToggle side="inspector" shown={false} onClick={() => onShow('inspector')} />
        )}
      </Surface>

      {/* The legend floats over the view, with no pane behind it. */}
      {colorBy === 'window' ? <WindowLegend rootPx={snapshot.rootPx} /> : <KindLegend />}

      {hoveredNode && !dragging ? (
        <div
          ref={card}
          className="env-dev-card"
          style={{ left: pointer.current.x, top: pointer.current.y }}
        >
          <HoverCard
            snapshot={snapshot}
            node={hoveredNode}
            problems={problemsByKey?.get(hoveredNode.key) ?? []}
          />
        </div>
      ) : null}
    </div>
  );
}

interface FrameProps {
  /** The page's size now, in px. */
  width: number;
  height: number;
  /** How high it floats: above every plane, where its handles and label are never covered. */
  z: number;
  /** The size the frame sets. */
  size: FrameSize;
  rootPx: number;
  onSizeChange: (size: FrameSize) => void;
}

const frameEdges: FrameEdge[] = ['start', 'end', 'bottom', 'bottom-start', 'bottom-end'];

/**
 * The responsive frame, once turned on: the rectangle the page is laid out in, floating above the planes, with
 * handles on its side and bottom edges and its bottom corners. Dragging a handle, or the arrow
 * keys on an edge's, sets the size the page is laid out at; the label above says it in px and rem
 * with its window class, and the device it came from.
 */
function Frame({ width, height, z, size, rootPx, onSizeChange }: FrameProps) {
  const windowClass = windowClassOf(width / rootPx);
  const text = [
    size.device,
    `${Math.round(width)}×${Math.round(height)}px`,
    `${round(width / rootPx)}×${round(height / rootPx)}rem`,
    windowClass,
  ]
    .filter(Boolean)
    .join(' · ');
  const set = size.width !== null || size.height !== null;
  return (
    <div
      className="env-dev-frame"
      data-set={set ? '' : undefined}
      style={{ transform: `translateZ(${z}px)` }}
    >
      <Row
        gap={1}
        align="center"
        className="env-dev-frame-label"
        onPointerDown={keepPointer}
        data-window={windowClass}
      >
        <Text variant="body-sm" emphasis="default" render={<span />}>
          {text}
        </Text>
        {set ? (
          <HintedIconButton
            size="sm"
            icon={<Close />}
            label="Back to the page's own size"
            onClick={() => onSizeChange(realSize)}
          />
        ) : null}
      </Row>
      {frameEdges.map((edge) => (
        <FrameHandle
          key={edge}
          edge={edge}
          width={width}
          height={height}
          size={size}
          rootPx={rootPx}
          text={text}
          onSizeChange={onSizeChange}
        />
      ))}
    </div>
  );
}

/**
 * The View dropdown: its button shows the angle the view was last turned to, and opens the angles
 * laid out as they look at the page, with Fit below them.
 */
function ViewMenu({
  angle,
  onAngle,
  onFit,
}: {
  angle: Angle | null;
  onAngle: (angle: Angle) => void;
  onFit: () => void;
}) {
  return (
    <Popover
      aria-label="View"
      trigger={<Toolbar.Button icon={angle ? angles[angle].icon : <ViewInAr />} label="View" />}
    >
      {(close) => (
        <Column gap={2} align="stretch">
          <Grid columns={3} gap={1} role="group" aria-label="Angles">
            {angleGrid.map((cell, index) =>
              cell === null ? (
                <span key={index} />
              ) : (
                <Button
                  key={cell}
                  size="sm"
                  variant={angle === cell ? 'secondary' : 'ghost'}
                  aria-pressed={angle === cell}
                  startIcon={angles[cell].icon}
                  onClick={() => {
                    onAngle(cell);
                    close();
                  }}
                >
                  {angles[cell].label}
                </Button>
              ),
            )}
          </Grid>
          <Button
            variant="ghost"
            size="sm"
            startIcon={<ViewFit />}
            onClick={() => {
              onFit();
              close();
            }}
          >
            Fit
          </Button>
        </Column>
      )}
    </Popover>
  );
}

/**
 * The Responsive dropdown: the responsive frame turned on and off, then, while it is on, the
 * device it takes, as a browser's responsive mode lists them, and its orientation. A device sets
 * the frame to its CSS viewport size; dragging the frame afterwards makes it a free one.
 */
function ResponsiveMenu({
  frame,
  width,
  height,
  onFrameChange,
}: {
  frame: FrameSize;
  width: number;
  height: number;
  onFrameChange: (frame: FrameSize) => void;
}) {
  const on = frame.width !== null || frame.height !== null;
  const frameWidth = frame.width ?? Math.round(width);
  const frameHeight = frame.height ?? Math.round(height);
  const orientation = frameWidth > frameHeight ? 'landscape' : 'portrait';
  const device = frame.device ?? 'responsive';
  const pickDevice = (next: string) => {
    if (next === 'responsive') {
      onFrameChange({ width: frameWidth, height: frameHeight, device: null });
      return;
    }
    for (const group of deviceGroups) {
      const found = group.devices.find((candidate) => candidate.name === next);
      if (found) onFrameChange({ width: found.width, height: found.height, device: found.name });
    }
  };
  return (
    <Menu.Root
      aria-label="Responsive"
      align="center"
      trigger={<Toolbar.Button icon={<ResponsiveLayout />} label="Responsive" />}
    >
      <Menu.CheckboxItem
        icon={<ResponsiveLayout />}
        description="Lays the page out at another size"
        checked={on}
        onCheckedChange={(next) =>
          onFrameChange(
            next
              ? { width: Math.round(width), height: Math.round(height), device: null }
              : realSize,
          )
        }
      >
        Responsive frame
      </Menu.CheckboxItem>
      <Menu.Separator />
      <Menu.Submenu label="Device" description={frame.device ?? 'Any size'} disabled={!on}>
        <Menu.RadioGroup value={device} onValueChange={pickDevice}>
          <Menu.RadioItem value="responsive" description="A frame of any size">
            Responsive
          </Menu.RadioItem>
        </Menu.RadioGroup>
        {deviceGroups.map((group) => (
          <Menu.RadioGroup
            key={group.label}
            label={group.label}
            value={device}
            onValueChange={pickDevice}
          >
            {group.devices.map((each) => (
              <Menu.RadioItem
                key={each.name}
                value={each.name}
                description={`${each.width}×${each.height}`}
              >
                {each.name}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        ))}
      </Menu.Submenu>
      <Menu.RadioGroup
        label="Orientation"
        value={orientation}
        onValueChange={(next) => {
          if (next !== orientation)
            onFrameChange({ width: frameHeight, height: frameWidth, device: frame.device });
        }}
      >
        <Menu.RadioItem value="portrait" icon={<StayCurrentPortrait />} disabled={!on}>
          Portrait
        </Menu.RadioItem>
        <Menu.RadioItem value="landscape" icon={<StayCurrentLandscape />} disabled={!on}>
          Landscape
        </Menu.RadioItem>
      </Menu.RadioGroup>
    </Menu.Root>
  );
}

/** How to move around the view: each gesture beside what it does. */
function MovingAround() {
  return (
    <DescriptionList.Root layout="stacked">
      <DescriptionList.Item label="Turn">Drag.</DescriptionList.Item>
      <DescriptionList.Item label="Pan">
        <Kbd keys={['Shift']} /> and drag, or drag with the middle button.
      </DescriptionList.Item>
      <DescriptionList.Item label="Scroll and zoom">
        The wheel scrolls what is under the pointer, or zooms where nothing there scrolls;{' '}
        <Kbd keys={['Ctrl']} /> and the wheel zoom.
      </DescriptionList.Item>
      <DescriptionList.Item label="Select">
        Click a plane, or a node in the tree. Show, Only the selected shows it and what is inside
        it.
      </DescriptionList.Item>
      <DescriptionList.Item label="Resize the page">
        Turn on Responsive frame, then drag a handle of the frame, or use the arrow keys on an
        edge&apos;s handle; double-click one for the page&apos;s own size.
      </DescriptionList.Item>
    </DescriptionList.Root>
  );
}

/** Turning and panning by dragging, and a click that selects. */
function useDrag(
  cameraRef: RefObject<Camera>,
  apply: () => void,
  {
    setDragging,
    turned,
    click,
  }: {
    setDragging: (dragging: boolean) => void;
    /** Called as a drag starts turning the view, which leaves the angle it was at. */
    turned: () => void;
    click: () => void;
  },
) {
  const state = useRef<{
    x: number;
    y: number;
    start: Camera;
    pan: boolean;
    moved: boolean;
  } | null>(null);
  return {
    active: () => state.current?.moved ?? false,
    down(event: ReactPointerEvent<HTMLDivElement>) {
      if (event.button !== 0 && event.button !== 1) return;
      if (event.button === 1) event.preventDefault();
      // A selection left across the view, such as after Ctrl+A, goes: pressed on, the browser would
      // drag it rather than let the view turn.
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) selection.removeAllRanges();
      state.current = {
        x: event.clientX,
        y: event.clientY,
        start: cameraRef.current,
        pan: event.shiftKey || event.button === 1,
        moved: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    move(event: ReactPointerEvent<HTMLDivElement>) {
      const current = state.current;
      if (!current) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.moved && Math.hypot(dx, dy) < 4) return;
      if (!current.moved) {
        setDragging(true);
        if (!current.pan) turned();
      }
      current.moved = true;
      const start = current.start;
      cameraRef.current = current.pan
        ? { ...start, px: start.px + dx, py: start.py + dy }
        : {
            ...start,
            ry: start.ry + dx * 0.3,
            rx: Math.max(-90, Math.min(90, start.rx - dy * 0.3)),
          };
      apply();
    },
    up() {
      const current = state.current;
      state.current = null;
      if (!current) return;
      if (current.moved) setDragging(false);
      else click();
    },
  };
}

interface PlaneProps {
  node: NodeData;
  origin: { x: number; y: number };
  z: number;
  element: HTMLElement | undefined;
  version: number;
  surfaces: Map<number, CachedSurface>;
  rootPx: number;
  names: boolean;
  showSpacing: boolean;
  problems: number;
  selected: boolean;
  hovered: boolean;
}

const Plane = memo(
  function Plane({
    node,
    origin,
    z,
    element,
    version,
    surfaces,
    rootPx,
    names,
    showSpacing,
    problems,
    selected,
    hovered,
  }: PlaneProps) {
    const host = useRef<HTMLDivElement>(null);
    const { clip, box } = node;
    // Its surfaces, copied from the page when the node changes size or content.
    useLayoutEffect(() => {
      const target = host.current;
      if (!target || !element?.isConnected) return;
      const signature = `${node.size.w}x${node.size.h}:${version}`;
      let cached = surfaces.get(node.key);
      if (cached?.signature !== signature) {
        const surface = surfaceOf(element);
        cached = { signature, ...surface };
        surfaces.set(node.key, cached);
      }
      if (cached.element.parentElement !== target) target.replaceChildren(cached.element);
      cached.restore();
    }, [element, node.key, node.size.w, node.size.h, version, surfaces]);
    const roomy = clip.w > 48 && clip.h > 14;
    return (
      <div
        className="env-dev-plane"
        data-plane={node.key}
        data-kind={node.kind}
        data-overlay={node.overlay ? '' : undefined}
        data-window={windowClassOf(node.size.w / rootPx)}
        data-container={node.container ? '' : undefined}
        data-problems={problems ? '' : undefined}
        data-selected={selected ? '' : undefined}
        data-hovered={hovered ? '' : undefined}
        style={{
          width: clip.w,
          height: clip.h,
          transform: `translate3d(${clip.x - origin.x}px, ${clip.y - origin.y}px, ${z}px)`,
        }}
      >
        <div
          className="env-dev-content"
          style={{ transform: `translate(${box.x - clip.x}px, ${box.y - clip.y}px)` }}
        >
          <div ref={host} />
          {showSpacing ? <Spacing node={node} /> : null}
        </div>
        {names && roomy ? <span className="env-dev-name">{labelOf(node)}</span> : null}
      </div>
    );
  },
  (a, b) =>
    a.node.key === b.node.key &&
    a.node.kind === b.node.kind &&
    a.node.name === b.node.name &&
    sameBox(a.node.clip, b.node.clip) &&
    sameBox(a.node.box, b.node.box) &&
    a.node.size.w === b.node.size.w &&
    a.node.size.h === b.node.size.h &&
    a.node.kids.length === b.node.kids.length &&
    a.node.kids.every((kid, index) => sameBox(kid.box, b.node.kids[index].box)) &&
    a.origin.x === b.origin.x &&
    a.origin.y === b.origin.y &&
    a.z === b.z &&
    a.element === b.element &&
    a.version === b.version &&
    a.names === b.names &&
    a.showSpacing === b.showSpacing &&
    a.problems === b.problems &&
    a.selected === b.selected &&
    a.hovered === b.hovered &&
    a.rootPx === b.rootPx,
);

const sameBox = (
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) => a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

const rectPath = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;

/** Padding hatched one way, the space between and around the children the other, the children dotted. */
function Spacing({ node }: { node: NodeData }) {
  const { box, border, padding, kids } = node;
  const [bt, br, bb, bl] = border;
  const [pt, pr, pb, pl] = padding;
  const { w, h } = node.size;
  const inner = { x: bl, y: bt, w: Math.max(0, w - bl - br), h: Math.max(0, h - bt - bb) };
  const content = {
    x: inner.x + pl,
    y: inner.y + pt,
    w: Math.max(0, inner.w - pl - pr),
    h: Math.max(0, inner.h - pt - pb),
  };
  const local = kids
    .filter((kid) => !kid.detached)
    .map((kid) => ({ x: kid.box.x - box.x, y: kid.box.y - box.y, w: kid.box.w, h: kid.box.h }));
  return (
    <svg className="env-dev-spacing" width={w} height={h} aria-hidden="true">
      {pt + pr + pb + pl > 0 ? (
        <path
          data-padding=""
          fillRule="evenodd"
          d={
            rectPath(inner.x, inner.y, inner.w, inner.h) +
            rectPath(content.x, content.y, content.w, content.h)
          }
        />
      ) : null}
      {local.length ? (
        <path
          data-gap=""
          fillRule="evenodd"
          d={
            rectPath(content.x, content.y, content.w, content.h) +
            local.map((kid) => rectPath(kid.x, kid.y, kid.w, kid.h)).join('')
          }
        />
      ) : null}
      {local.map((kid, index) => (
        <rect key={index} data-child="" x={kid.x} y={kid.y} width={kid.w} height={kid.h} />
      ))}
    </svg>
  );
}

function HoverCard({
  snapshot,
  node,
  problems,
}: {
  snapshot: Snapshot;
  node: NodeData;
  problems: LayoutProblem[];
}) {
  const width = toRem(node.size.w, snapshot.rootPx);
  const queries = node.container ? queriesFor(node.container.name, snapshot.queries) : [];
  const thresholds = thresholdsFor(queries);
  return (
    <Column gap={1}>
      <Text variant="body-sm" emphasis="default" render={<strong />}>
        {labelOf(node)}
      </Text>
      <Text variant="body-sm" render={<span />}>
        {width}×{toRem(node.size.h, snapshot.rootPx)}rem · {windowClassOf(width)} · level{' '}
        {node.level}
      </Text>
      <Text variant="body-sm" render={<span />}>
        {node.container
          ? `container ${node.container.name || '(no name)'}: ${thresholds.length ? `queried at ${thresholds.join(', ')}rem` : 'nothing queries it'}`
          : 'not a container'}
      </Text>
      {problems.map((problem) => (
        <Text key={problem.message} variant="body-sm" render={<span />} className="env-dev-problem">
          {problem.message}
        </Text>
      ))}
    </Column>
  );
}

/** One entry of a legend: a swatch drawn as a plane is, and its name. */
function Swatch({
  plane,
  title,
  children,
}: {
  plane: Record<`data-${string}`, string>;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Row gap={1} align="center" render={<span title={title} />}>
      <i className="env-dev-plane env-dev-swatch" {...plane} />
      {children}
    </Row>
  );
}

function KindLegend() {
  const kinds = ['box', 'row', 'column', 'grid', 'scaffold', 'page', 'overlay'];
  return (
    <Row gap={2} wrap className="env-dev-legend" role="group" aria-label="Legend">
      {kinds.map((kind) => (
        <Swatch
          key={kind}
          plane={{ 'data-kind': kind, ...(kind === 'overlay' && { 'data-overlay': '' }) }}
        >
          {kind}
        </Swatch>
      ))}
    </Row>
  );
}

function WindowLegend({ rootPx }: { rootPx: number }) {
  return (
    <Row gap={2} wrap className="env-dev-legend" role="group" aria-label="Legend">
      {windowClasses.map((windowClass, index) => {
        const next = windowClasses[index + 1];
        const range = next
          ? `${windowClass.from ? `${windowClass.from}–` : '< '}${next.from}`
          : `≥ ${windowClass.from}`;
        return (
          <Swatch
            key={windowClass.name}
            plane={{ 'data-window': windowClass.name, 'data-container': '' }}
            title={`${range}rem, ${round((next?.from ?? windowClass.from) * rootPx)}px`}
          >
            {windowClass.name}{' '}
            <Text variant="caption" emphasis="subtle" render={<span />}>
              {range}
            </Text>
          </Swatch>
        );
      })}
      <Swatch plane={{ 'data-window': 'none', 'data-container': '' }}>container</Swatch>
      <Swatch plane={{ 'data-window': 'none' }}>not a container</Swatch>
    </Row>
  );
}

/**
 * Over the hovered node, above every plane: its width against the window classes, a dashed line
 * at each threshold its container's queries test, and how far it is from the next one.
 */
function Ruler({
  snapshot,
  node,
  origin,
  z,
}: {
  snapshot: Snapshot;
  node: NodeData;
  origin: { x: number; y: number };
  z: number;
}) {
  const { rootPx } = snapshot;
  const width = toRem(node.size.w, rootPx);
  const thresholds = node.container
    ? thresholdsFor(queriesFor(node.container.name, snapshot.queries))
    : [];
  const next = thresholds.find((threshold) => threshold > width);
  const end = Math.max(width, next !== undefined ? next + 2 : width);
  const x = (rem: number) => rem * rootPx;
  return (
    <div
      className="env-dev-ruler"
      style={{
        width: node.box.w,
        height: node.box.h,
        transform: `translate3d(${node.box.x - origin.x}px, ${node.box.y - origin.y}px, ${z}px)`,
      }}
    >
      {windowClasses.map((windowClass, index) => {
        const until = Math.min(windowClasses[index + 1]?.from ?? Infinity, end);
        if (windowClass.from >= until) return null;
        return (
          <span
            key={windowClass.name}
            className="env-dev-ruler-band"
            data-window={windowClass.name}
            data-current={windowClass.name === windowClassOf(width) ? '' : undefined}
            style={{ left: x(windowClass.from), width: x(until - windowClass.from) }}
          >
            {windowClass.name}
          </span>
        );
      })}
      {thresholds
        .filter((threshold) => threshold > 0 && threshold <= end)
        .map((threshold) => (
          <div
            key={threshold}
            className="env-dev-ruler-line"
            style={{ left: x(threshold), height: node.box.h + 24 }}
          >
            <span>{threshold}rem</span>
          </div>
        ))}
      <div className="env-dev-ruler-now" style={{ left: node.box.w, height: node.box.h + 24 }}>
        <span>
          {width}rem
          {!node.container
            ? ' · not a container'
            : next !== undefined
              ? ` · ${round(next - width)}rem to the next query`
              : thresholds.length
                ? ' · past every query'
                : ' · nothing queries it'}
        </span>
      </div>
    </div>
  );
}
