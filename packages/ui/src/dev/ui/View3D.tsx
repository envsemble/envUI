'use client';

// The page in 3D: every node a plane, lifted by how deeply it is nested, so what is inside what
// reads as what is above what. Sticky and floating nodes sit half a level higher, open overlays
// above the whole page. Each plane carries the node's surfaces. The planes are drawn from the
// measured boxes: the page itself can't be tilted, since scroll containers flatten 3D.
//
// The camera moves the scene's transform directly, and hover marks planes directly, so turning
// the view, the wheel and hovering render nothing; the planes render when the page's geometry
// changes, and copy their surfaces once it settles.

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { NodeData, Snapshot } from '../model.js';
import { angles, fitted, useCamera, useOrbit, type Angle } from './camera.js';
import type { Side } from './controls.js';
import { Frame, type FrameSize } from './Frame.js';
import { Legend } from './Legend.js';
import { HoverCard, Ruler } from './NodeHints.js';
import { PerformancePanel } from './PerformancePanel.js';
import { Plane, SurfaceCache } from './Plane.js';
import { devStats } from './stats.js';
import type { LivePage } from './useLivePage.js';
import { ViewCorners, ViewToolbar, type ShowOptions } from './ViewToolbar.js';
import { glideScrollBy, scrollerAt, wheelDelta } from './wheel.js';

export interface View3DProps {
  live: LivePage;
  selected: number | null;
  onSelect: (key: number | null) => void;
  /**
   * Set by the view to what marks a node's plane as hovered from outside, as the node tree does
   * while the pointer rests on a node, without rendering the view.
   */
  highlight: RefObject<(key: number | null) => void>;
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

const defaultShow: ShowOptions = {
  names: true,
  spacing: true,
  onlySelected: false,
  colorBy: 'kind',
};

export const View3D = memo(function View3D({
  live,
  selected,
  onSelect,
  highlight,
  sides,
  onShow,
  frame,
  onFrameChange,
  root,
}: View3DProps) {
  devStats.viewRenders += 1;
  const snapshot = live.geometry;
  const problemsByKey = live.full?.problemsByKey;
  const frameOn = frame.width !== null || frame.height !== null;
  const [show, setShow] = useState(defaultShow);
  const [levels, setLevels] = useState({ spacing: 48, from: 0, to: null as number | null });
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [debug, setDebug] = useState(false);
  // The angle the view is at, which the View dropdown marks, until a drag turns it.
  const [angle, setAngle] = useState<Angle | null>('tilted');
  const view = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  // Where the pointer is in the view, where the hover card goes.
  const pointer = useRef({ x: 0, y: 0 });
  const [surfaces] = useState(() => new SurfaceCache());
  useEffect(() => () => surfaces.dispose(), [surfaces]);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const measured = snapshot !== null;
  const most = Math.ceil(Math.max(0, ...(snapshot?.nodes ?? []).map((node) => node.level)));
  const top = Math.min(levels.to ?? most, most);
  const from = Math.min(levels.from, most);
  const lift = Math.max(0, top - from) * levels.spacing;
  const camera = useCamera(lift);
  const scene = camera.scene;

  /** The camera that shows the whole page at an angle, centred in the view. */
  const fittedAt = useCallback((at: { rx: number; ry: number }) => {
    const current = snapshotRef.current;
    const room = view.current?.getBoundingClientRect();
    if (!current || !room) return null;
    return fitted(at, current.root.box, room);
  }, []);
  /** Turns the view to an angle, with the whole page in view. */
  const turnTo = useCallback(
    (next: Angle) => {
      const target = fittedAt(angles[next]);
      if (!target) return;
      camera.glideTo(target);
      setAngle(next);
    },
    [camera, fittedAt],
  );

  // The first measurement fits the page into the view; so does a new size from the Responsive
  // dropdown, once the page is measured at it, at the angle the view is at. Dragging the frame
  // keeps the camera where it is.
  const fittedOnce = useRef(false);
  const refitFrom = useRef<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    if (!snapshot) return;
    const box = snapshot.root.box;
    if (!fittedOnce.current) {
      fittedOnce.current = true;
      const target = fittedAt(angles.tilted);
      if (target) camera.set(target);
    } else if (
      refitFrom.current &&
      (refitFrom.current.w !== box.w || refitFrom.current.h !== box.h)
    ) {
      refitFrom.current = null;
      const target = fittedAt(camera.camera.current);
      if (target) camera.glideTo(target);
    }
  }, [snapshot, camera, fittedAt]);
  const changeFrameFromMenu = useCallback(
    (next: FrameSize) => {
      const box = snapshotRef.current?.root.box;
      refitFrom.current = box ? { w: box.w, h: box.h } : null;
      onFrameChange(next);
    },
    [onFrameChange],
  );

  // Forget the copies of nodes that are gone.
  useEffect(() => {
    if (live.full) surfaces.keep(new Set(live.full.snapshot.nodes.map((node) => node.key)));
  }, [live.full, surfaces]);

  // Hover marks planes directly: the plane under the pointer and the node the tree's pointer
  // rests on.
  const hoverKeys = useRef<{ pointer: number | null; tree: number | null }>({
    pointer: null,
    tree: null,
  });
  const paintHover = useCallback(() => {
    const element = scene.current;
    if (!element) return;
    const { pointer: under, tree } = hoverKeys.current;
    for (const plane of Array.from(element.querySelectorAll<HTMLElement>('[data-hovered]')))
      if (Number(plane.dataset.plane) !== under && Number(plane.dataset.plane) !== tree)
        delete plane.dataset.hovered;
    for (const key of [under, tree])
      if (key !== null) {
        const plane = element.querySelector<HTMLElement>(`[data-plane="${key}"]`);
        if (plane) plane.dataset.hovered = '';
      }
  }, [scene]);
  useLayoutEffect(() => {
    highlight.current = (key) => {
      hoverKeys.current.tree = key;
      paintHover();
    };
  }, [highlight, paintHover]);
  // Planes that mount afresh, such as after Only the selected, take the mark too.
  useLayoutEffect(paintHover);
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;
  const hover = (key: number | null) => {
    if (key === hoveredRef.current) return;
    hoverKeys.current.pointer = key;
    paintHover();
    setHovered(key);
  };

  // The wheel scrolls the page's scroller under the pointer, in the root, gliding as the
  // browser's smooth scrolling does, and the planes follow; Ctrl+wheel, or the wheel where nothing
  // scrolls, zooms toward the pointer.
  useEffect(() => {
    const element = view.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if ((event.target as Element).closest('.env-dev-float')) return;
      event.preventDefault();
      const { dx, dy } = wheelDelta(event);
      const key = hoveredRef.current;
      const current = snapshotRef.current;
      const node =
        key === null ? undefined : current?.nodes.find((candidate) => candidate.key === key);
      const target = node ? current?.elements?.[node.index] : undefined;
      const scroller =
        !event.ctrlKey && !event.metaKey && target ? scrollerAt(target, root, dx, dy) : null;
      if (scroller === 'end') return;
      if (scroller) {
        glideScrollBy(scroller, dx, dy);
        return;
      }
      const room = element.getBoundingClientRect();
      // A notch zooms a tenth; a touchpad's small turns zoom as little as they turn.
      const factor = Math.exp(-Math.max(-100, Math.min(100, dy || dx)) * 0.00095);
      camera.zoomToward(
        factor,
        event.clientX - room.left - room.width / 2,
        event.clientY - room.top - room.height / 2,
      );
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
    // The view element is there from the first render, and the snapshot is read from its ref.
  }, [root, camera, measured]);

  // With "only the selected" on, the view shows the selected node and what is inside it.
  const focused = show.onlySelected ? selected : null;
  const shownKeys = useMemo(
    () => (snapshot && focused !== null ? subtreeOf(snapshot, focused) : null),
    [snapshot, focused],
  );
  const orbit = useOrbit(camera, {
    onDragChange: setDragging,
    onTurn: () => setAngle(null),
    onClick: () => onSelect(hoveredRef.current === selected ? null : hoveredRef.current),
  });
  const pageSize = useMemo(
    () => ({ w: snapshot?.root.box.w ?? 0, h: snapshot?.root.box.h ?? 0 }),
    [snapshot?.root.box.w, snapshot?.root.box.h],
  );
  const levelSettings = useMemo(
    () => ({ spacing: levels.spacing, from, to: top, most }),
    [levels.spacing, from, top, most],
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
      data-color={show.colorBy}
      data-dragging={dragging ? '' : undefined}
      onPointerDown={orbit.down}
      onPointerMove={(event) => {
        orbit.move(event);
        const room = event.currentTarget.getBoundingClientRect();
        pointer.current = { x: event.clientX - room.left + 14, y: event.clientY - room.top + 14 };
        if (card.current) {
          card.current.style.left = `${pointer.current.x}px`;
          card.current.style.top = `${pointer.current.y}px`;
        }
        if (orbit.moving()) return;
        const plane = (event.target as Element).closest<HTMLElement>('[data-plane]');
        hover(plane ? Number(plane.dataset.plane) : null);
      }}
      onPointerUp={orbit.up}
      onPointerCancel={orbit.up}
      onPointerLeave={() => hover(null)}
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
      <div ref={scene} className="env-dev-scene" style={{ width: origin.w, height: origin.h }}>
        <div className="env-dev-floor" />
        {shown.map((node) => (
          <Plane
            key={node.key}
            node={node}
            origin={origin}
            z={(node.level - from) * levels.spacing}
            element={snapshot.elements?.[node.index]}
            version={live.versions.get(node.key) ?? 0}
            surfaces={surfaces}
            settled={live.settled}
            rootPx={snapshot.rootPx}
            names={show.names}
            showSpacing={show.spacing}
            problems={problemsByKey?.get(node.key)?.length ?? 0}
            selected={selected === node.key}
          />
        ))}
        {show.colorBy === 'window' && hoveredNode && shown.includes(hoveredNode) ? (
          <Ruler
            snapshot={snapshot}
            node={hoveredNode}
            origin={origin}
            z={(top - from + 0.75) * levels.spacing + 2}
          />
        ) : null}
        {frameOn ? (
          <Frame
            width={origin.w}
            height={origin.h}
            size={frame}
            rootPx={snapshot.rootPx}
            z={(top - from) * levels.spacing + 4}
            onSizeChange={onFrameChange}
          />
        ) : null}
      </div>

      <ViewToolbar
        angle={angle}
        onAngle={turnTo}
        show={show}
        onShowChange={setShow}
        frame={frame}
        pageSize={pageSize}
        onFrameChange={changeFrameFromMenu}
        levels={levelSettings}
        onLevelsChange={setLevels}
        debug={debug}
        onDebugChange={setDebug}
      />
      <ViewCorners sides={sides} onShow={onShow} />

      {/* The legend floats over the view, with no pane behind it. */}
      <Legend colorBy={show.colorBy} rootPx={snapshot.rootPx} />
      {debug ? <PerformancePanel planes={shown.length} /> : null}

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
});
