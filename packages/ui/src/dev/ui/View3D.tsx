'use client';

import { memo, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { NodeData, Snapshot } from '../model.js';
import { useCamera, useOrbit } from './camera.js';
import type { Side } from './Controls.js';
import { Frame, type FrameSize } from './Frame.js';
import { Legend } from './Legend.js';
import { NodeHoverCard, HoveredNodeRuler } from './NodeHints.js';
import { PerformancePanel } from './PerformancePanel.js';
import { Plane, SurfaceCache } from './Plane.js';
import { countViewRender } from './stats.js';
import type { LivePage } from './useLivePage.js';
import { ViewCorners, ViewToolbar, type ShowOptions } from './ViewToolbar.js';
import { usePlaneHover } from './usePlaneHover.js';
import { useViewFit } from './useViewFit.js';
import { useViewWheel } from './useViewWheel.js';
import { flag } from '../../internal/flag.js';

export interface View3DProps {
  live: LivePage;
  selected: number | null;
  onSelect: (key: number | null) => void;
  markPlaneHoveredRef: RefObject<(key: number | null) => void>;
  sides: { tree: boolean; inspector: boolean };
  onShow: (side: Side) => void;
  frame: FrameSize;
  onFrameChange: (frame: FrameSize) => void;
  root: HTMLElement;
}

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

function SpacingPatterns() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <pattern
          id="env-dev-padding"
          patternUnits="userSpaceOnUse"
          width="7"
          height="7"
          patternTransform="rotate(45)"
        >
          <rect width="3" height="7" fill="var(--_dev-tint-butter)" fillOpacity="0.45" />
        </pattern>
        <pattern
          id="env-dev-gap"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(-45)"
        >
          <rect width="2" height="6" fill="var(--_dev-tint-seafoam)" fillOpacity="0.3" />
        </pattern>
      </defs>
    </svg>
  );
}

const neverStartTheBrowsersOwnDrag = (event: { preventDefault(): void }) => event.preventDefault();

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
  markPlaneHoveredRef,
  sides,
  onShow,
  frame,
  onFrameChange,
  root,
}: View3DProps) {
  countViewRender();
  const snapshot = live.geometry;
  const problemsByKey = live.full?.problemsByKey;
  const frameOn = frame.width !== null || frame.height !== null;
  const [show, setShow] = useState(defaultShow);
  const [levels, setLevels] = useState({ spacing: 48, from: 0, to: null as number | null });
  const [dragging, setDragging] = useState(false);
  const [debug, setDebug] = useState(false);
  const view = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const hoverCardPosition = useRef({ x: 0, y: 0 });
  const [surfaces] = useState(() => new SurfaceCache());
  useEffect(() => () => surfaces.dispose(), [surfaces]);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const measured = snapshot !== null;
  const highestLevel = Math.ceil(Math.max(0, ...(snapshot?.nodes ?? []).map((node) => node.level)));
  const top = Math.min(levels.to ?? highestLevel, highestLevel);
  const from = Math.min(levels.from, highestLevel);
  const lift = Math.max(0, top - from) * levels.spacing;
  const camera = useCamera(lift);
  const scene = camera.scene;

  const { angle, setAngle, turnTo, changeFrameFromMenu } = useViewFit({
    snapshot,
    snapshotRef,
    view,
    camera,
    onFrameChange,
  });

  useEffect(() => {
    if (live.full)
      surfaces.forgetNodesOtherThan(new Set(live.full.snapshot.nodes.map((node) => node.key)));
  }, [live.full, surfaces]);

  const { hovered, hoveredRef, hover } = usePlaneHover({ scene, markPlaneHoveredRef });

  useViewWheel({
    view,
    root,
    camera,
    snapshot: snapshotRef,
    hovered: hoveredRef,
    planesMounted: measured,
  });

  const onlySelectedRoot = show.onlySelected ? selected : null;
  const shownKeys = useMemo(
    () => (snapshot && onlySelectedRoot !== null ? subtreeOf(snapshot, onlySelectedRoot) : null),
    [snapshot, onlySelectedRoot],
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
    () => ({ spacing: levels.spacing, from, to: top, highestLevel }),
    [levels.spacing, from, top, highestLevel],
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
      data-dragging={flag(dragging)}
      onPointerDown={orbit.down}
      onPointerMove={(event) => {
        orbit.move(event);
        const room = event.currentTarget.getBoundingClientRect();
        hoverCardPosition.current = {
          x: event.clientX - room.left + 14,
          y: event.clientY - room.top + 14,
        };
        if (card.current) {
          card.current.style.left = `${hoverCardPosition.current.x}px`;
          card.current.style.top = `${hoverCardPosition.current.y}px`;
        }
        if (orbit.moving()) return;
        const plane = (event.target as Element).closest<HTMLElement>('[data-plane]');
        hover(plane ? Number(plane.dataset.plane) : null);
      }}
      onPointerUp={orbit.up}
      onPointerCancel={orbit.up}
      onPointerLeave={() => hover(null)}
      onDragStart={neverStartTheBrowsersOwnDrag}
    >
      <SpacingPatterns />
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
          <HoveredNodeRuler
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

      <Legend colorBy={show.colorBy} rootPx={snapshot.rootPx} />
      {debug ? <PerformancePanel planes={shown.length} /> : null}

      {hoveredNode && !dragging ? (
        <div
          ref={card}
          className="env-dev-card"
          style={{ left: hoverCardPosition.current.x, top: hoverCardPosition.current.y }}
        >
          <NodeHoverCard
            snapshot={snapshot}
            node={hoveredNode}
            problems={problemsByKey?.get(hoveredNode.key) ?? []}
          />
        </div>
      ) : null}
    </div>
  );
});
