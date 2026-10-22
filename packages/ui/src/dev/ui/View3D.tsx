'use client';

// The page in 3D: every node a plane, lifted by how deeply it is nested, so what is inside what
// reads as what is above what. Sticky and floating nodes sit half a level higher, open overlays
// above the whole page. Each plane carries the node's surfaces. The planes are drawn from the
// measured boxes: the page itself can't be tilted, since scroll containers flatten 3D.
//
// Over the view float a toolbar, with the view directions and what the planes show, and a panel
// with the colors and the levels.

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
import { Button, IconButton } from '../../actions/Button.js';
import * as Toolbar from '../../actions/Toolbar.js';
import { Popover } from '../../feedback/Popover.js';
import { Slider } from '../../forms/Slider.js';
import { Column, Row } from '../../foundations/Layout.js';
import { Text } from '../../foundations/Text.js';
import { Close } from '../../icons/Close.js';
import { Devices } from '../../icons/Devices.js';
import { FilterAlt } from '../../icons/FilterAlt.js';
import { Info } from '../../icons/Info.js';
import { Label } from '../../icons/Label.js';
import { LeftPanelOpen } from '../../icons/LeftPanelOpen.js';
import { Padding } from '../../icons/Padding.js';
import { RightPanelOpen } from '../../icons/RightPanelOpen.js';
import { Tune } from '../../icons/Tune.js';
import type { LayoutProblem, NodeData, Snapshot } from '../model.js';
import { queriesFor, thresholdsFor } from '../queries.js';
import { labelOf } from '../readout.js';
import { round, toRem, windowClasses, windowClassOf } from '../units.js';
import { ViewFit, ViewFront, ViewLeft, ViewRight, ViewTilted, ViewTop } from './icons.js';
import { FrameHandle } from './FrameHandle.js';
import { surfaceOf } from './surfaces.js';
import type { LivePage } from './useLivePage.js';

interface Camera {
  rx: number;
  ry: number;
  zoom: number;
  px: number;
  py: number;
}

const tilted = { rx: 38, ry: -22 };
const presets: { label: string; icon: ReactNode; rx: number; ry: number }[] = [
  { label: 'Tilted', icon: <ViewTilted />, ...tilted },
  { label: 'Straight on', icon: <ViewFront />, rx: 0, ry: 0 },
  { label: 'From the top', icon: <ViewTop />, rx: -70, ry: 0 },
  { label: 'From the left', icon: <ViewLeft />, rx: 0, ry: 70 },
  { label: 'From the right', icon: <ViewRight />, rx: 0, ry: -70 },
];

/** The widths the docs check every example at, one in each window class, in rem. */
const checkWidths = [22, 40, 60, 80];

type CachedSurface = { signature: string; element: HTMLElement; restore: () => void };

export interface View3DProps {
  live: LivePage;
  selected: number | null;
  onSelect: (key: number | null) => void;
  /** The node hovered in the tree. */
  treeHover: number | null;
  /** Which side columns show, which the toolbar hides and shows. */
  sides: { tree: boolean; inspector: boolean };
  onSidesChange: (sides: { tree: boolean; inspector: boolean }) => void;
  /** The width the responsive frame lays the page out at, in px, or null for its real width. */
  frameWidth: number | null;
  onFrameWidthChange: (width: number | null) => void;
  onClose: () => void;
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

/** What the wheel scrolls over a node: a scroller of its own content, or the nearest around it. */
function scrollerAt(element: HTMLElement, dx: number, dy: number): HTMLElement | null {
  const can = (candidate: HTMLElement) => {
    const style = getComputedStyle(candidate);
    const y =
      /auto|scroll/.test(style.overflowY) && candidate.scrollHeight > candidate.clientHeight + 1;
    const x =
      /auto|scroll/.test(style.overflowX) && candidate.scrollWidth > candidate.clientWidth + 1;
    return (dy !== 0 && y) || (dx !== 0 && x);
  };
  if (can(element)) return element;
  for (const inner of Array.from(element.querySelectorAll<HTMLElement>('*')))
    if (inner.closest('[data-env-layout]') === element && can(inner)) return inner;
  for (let at = element.parentElement; at; at = at.parentElement) if (can(at)) return at;
  const page = document.scrollingElement;
  return page instanceof HTMLElement && can(page) ? page : null;
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
  onSidesChange,
  frameWidth,
  onFrameWidthChange,
  onClose,
}: View3DProps) {
  const snapshot = live.geometry;
  const problemsByKey = live.full?.problemsByKey;
  const [spacing, setSpacing] = useState(48);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState<number | null>(null);
  const [colorBy, setColorBy] = useState<'kind' | 'window'>('kind');
  const [names, setNames] = useState(true);
  const [showSpacing, setShowSpacing] = useState(true);
  const [onlySelected, setOnlySelected] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const view = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  // Where the pointer is in the view, where the hover card goes.
  const pointer = useRef({ x: 0, y: 0 });
  const camera = useRef<Camera>({ ...tilted, zoom: 0.6, px: 0, py: 0 });
  const fitted = useRef(false);
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

  // The wheel scrolls the page's scroller under the pointer, and the planes follow; Ctrl+wheel,
  // or the wheel where nothing scrolls, zooms toward the pointer.
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
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      const dx = (event.shiftKey ? event.deltaY : event.deltaX) * unit;
      const dy = (event.shiftKey ? 0 : event.deltaY) * unit;
      const key = hoveredRef.current;
      const current = snapshotRef.current;
      const node =
        key === null ? undefined : current?.nodes.find((candidate) => candidate.key === key);
      const target = node ? current?.elements?.[node.index] : undefined;
      const scroller =
        !event.ctrlKey && !event.metaKey && target ? scrollerAt(target, dx, dy) : null;
      if (scroller) scroller.scrollBy({ left: dx, top: dy });
      else zoomAt(event);
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
    // applyCamera reads refs and `lift`, which the layout effect applies on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // With "only the selected" on, the view shows the selected node and what is inside it.
  const focused = onlySelected ? selected : null;
  const shownKeys = useMemo(
    () => (snapshot && focused !== null ? subtreeOf(snapshot, focused) : null),
    [snapshot, focused],
  );
  const drag = useDrag(camera, applyCamera, setDragging, () =>
    onSelect(hoveredRef.current === selected ? null : hoveredRef.current),
  );
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
      onPointerDown={drag.down}
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
            <rect width="3" height="7" fill="var(--env-color-avatar-bg-amber)" fillOpacity="0.45" />
          </pattern>
          <pattern
            id="env-dev-gap"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(-45)"
          >
            <rect width="2" height="6" fill="var(--env-color-avatar-bg-teal)" fillOpacity="0.3" />
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
        <Frame
          width={origin.w}
          set={frameWidth}
          rootPx={snapshot.rootPx}
          z={(top - from) * spacing + 4}
          onWidthChange={onFrameWidthChange}
        />
      </div>

      <Toolbar.Root
        aria-label="3D view"
        className="env-dev-float env-dev-toolbar"
        onPointerDown={keepPointer}
      >
        <Toolbar.Group aria-label="Views">
          {presets.map(({ label, icon, rx, ry }) => (
            <Toolbar.Button
              key={label}
              icon={icon}
              label={label}
              onClick={() => {
                camera.current = { ...camera.current, rx, ry };
                applyCamera();
              }}
            />
          ))}
          <Toolbar.Button icon={<ViewFit />} label="Fit" onClick={fit} />
        </Toolbar.Group>
        <Toolbar.Separator />
        <Toolbar.Group aria-label="Show">
          <Toolbar.Button
            icon={<Label />}
            label="Names"
            pressed={names}
            onClick={() => setNames((value) => !value)}
          />
          <Toolbar.Button
            icon={<Padding />}
            label="Padding and gaps"
            pressed={showSpacing}
            onClick={() => setShowSpacing((value) => !value)}
          />
          <Toolbar.Button
            icon={<FilterAlt />}
            label="Only the selected"
            pressed={onlySelected}
            onClick={() => setOnlySelected((value) => !value)}
          />
          <Toolbar.Button
            icon={<Devices />}
            label="Color by window class"
            pressed={colorBy === 'window'}
            onClick={() => setColorBy((value) => (value === 'window' ? 'kind' : 'window'))}
          />
        </Toolbar.Group>
        <Toolbar.Separator />
        <Popover
          title="View settings"
          side="bottom"
          trigger={<IconButton icon={<Tune />} aria-label="View settings" />}
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
          <Column gap={2} role="group" aria-label="Page width">
            <Quiet>Page width</Quiet>
            <Row gap={1} wrap>
              {checkWidths.map((rem) => (
                <Button
                  key={rem}
                  size="sm"
                  variant="outline"
                  aria-pressed={frameWidth === rem * snapshot.rootPx}
                  title={windowClassOf(rem)}
                  onClick={() => onFrameWidthChange(rem * snapshot.rootPx)}
                >
                  {`${rem}rem`}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                disabled={frameWidth === null}
                onClick={() => onFrameWidthChange(null)}
              >
                Real width
              </Button>
            </Row>
          </Column>
        </Popover>
        <Popover
          title="Moving around"
          side="bottom"
          trigger={<IconButton icon={<Info />} aria-label="How to move around" />}
        >
          <Text variant="body-sm" emphasis="default">
            Drag to turn, Shift+drag to pan. The wheel scrolls what is under the pointer; Ctrl+wheel
            zooms. Click a plane, or a node in the tree, to select it; Only the selected shows it
            and what is inside it. Drag a handle of the frame, or use the arrow keys on it, to lay
            the page out at another width; double-click it for the real width.
          </Text>
        </Popover>
        <Toolbar.Separator />
        <Toolbar.Group aria-label="Panels">
          <Toolbar.Button
            icon={<LeftPanelOpen />}
            label="Nodes"
            pressed={sides.tree}
            onClick={() => onSidesChange({ ...sides, tree: !sides.tree })}
          />
          <Toolbar.Button
            icon={<RightPanelOpen />}
            label="Inspector"
            pressed={sides.inspector}
            onClick={() => onSidesChange({ ...sides, inspector: !sides.inspector })}
          />
          <Toolbar.Button icon={<Close />} label="Close dev mode" onClick={onClose} />
        </Toolbar.Group>
      </Toolbar.Root>

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
  /** The page's width now, in px. */
  width: number;
  /** How high it floats: above every plane, where its handles and label are never covered. */
  z: number;
  /** The width the frame sets, in px, or null where the page has its real width. */
  set: number | null;
  rootPx: number;
  onWidthChange: (width: number | null) => void;
}

/**
 * The responsive frame: the rectangle the page is laid out in, floating above the planes, with a
 * handle on each side edge. Dragging a handle, or the arrow keys on it, sets the width the page
 * is laid out at; the label above says it in rem and px with its window class.
 */
function Frame({ width, z, set, rootPx, onWidthChange }: FrameProps) {
  const rem = round(width / rootPx);
  const windowClass = windowClassOf(rem);
  const text = `${rem}rem · ${Math.round(width)}px · ${windowClass}`;
  return (
    <div
      className="env-dev-frame"
      data-set={set === null ? undefined : ''}
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
        {set !== null ? (
          <IconButton
            variant="ghost"
            size="sm"
            icon={<Close />}
            aria-label="Back to the real width"
            title="Back to the real width"
            onClick={() => onWidthChange(null)}
          />
        ) : null}
      </Row>
      {(['start', 'end'] as const).map((edge) => (
        <FrameHandle
          key={edge}
          edge={edge}
          width={width}
          set={set}
          rootPx={rootPx}
          text={text}
          onWidthChange={onWidthChange}
        />
      ))}
    </div>
  );
}

/** Turning and panning by dragging, and a click that selects. */
function useDrag(
  cameraRef: RefObject<Camera>,
  apply: () => void,
  setDragging: (dragging: boolean) => void,
  click: () => void,
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
      if (!current.moved) setDragging(true);
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
    <>
      <strong>{labelOf(node)}</strong>
      <span>
        {width}×{toRem(node.size.h, snapshot.rootPx)}rem · {windowClassOf(width)} · level{' '}
        {node.level}
      </span>
      <span>
        {node.container
          ? `container ${node.container.name || '(no name)'}: ${thresholds.length ? `queried at ${thresholds.join(', ')}rem` : 'nothing queries it'}`
          : 'not a container'}
      </span>
      {problems.map((problem) => (
        <span key={problem.message} className="env-dev-problem">
          {problem.message}
        </span>
      ))}
    </>
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
    <Row gap={3} wrap className="env-dev-legend" role="group" aria-label="Legend">
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
    <Row gap={3} wrap className="env-dev-legend" role="group" aria-label="Legend">
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
            {windowClass.name} <span className="env-dev-quiet">{range}</span>
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
