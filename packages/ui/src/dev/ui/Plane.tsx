'use client';

// One plane of the 3D view: a node's visible box, lifted to its level, carrying a copy of its
// surfaces, its padding and gaps hatched, and its name.

import { memo, useLayoutEffect, useRef } from 'react';
import type { NodeData } from '../model.js';
import { labelOf } from '../readout.js';
import { windowClassOf } from '../units.js';
import { devStats, timed } from './stats.js';
import { surfaceOf } from './surfaces.js';
import { flag } from '../../internal/flag.js';

/** A node's surfaces, copied at a size and a version of its content, with what scrolls them. */
export interface CopiedSurface {
  size: string;
  version: number;
  element: HTMLElement;
  restore: () => void;
}

/** How long the copies may take each frame, in ms: the rest wait for the next frame. */
const copyBudget = 6;

/**
 * The copies of the planes' surfaces, by node key, kept across renders, and the copies waiting to
 * be made. Copying is paced: a few nodes each animation frame, within a budget, so a page that
 * settles after a resize stays responsive while its planes fill in.
 */
export class SurfaceCache {
  private copies = new Map<number, CopiedSurface>();
  private waiting = new Map<number, () => void>();
  private frame = 0;

  get(key: number) {
    return this.copies.get(key);
  }

  set(key: number, copy: CopiedSurface) {
    this.copies.set(key, copy);
  }

  /** Forgets the copies of nodes that are gone. */
  keep(keys: Set<number>) {
    for (const key of this.copies.keys()) if (!keys.has(key)) this.copies.delete(key);
  }

  /** Makes a node's copy in a coming frame, replacing any copy of it still waiting. */
  request(key: number, copy: () => void) {
    this.waiting.set(key, copy);
    if (!this.frame) this.frame = requestAnimationFrame(this.work);
  }

  cancel(key: number) {
    this.waiting.delete(key);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.waiting.clear();
  }

  private work = () => {
    this.frame = 0;
    const start = performance.now();
    for (const [key, copy] of this.waiting) {
      this.waiting.delete(key);
      copy();
      if (performance.now() - start > copyBudget) break;
    }
    if (this.waiting.size) this.frame = requestAnimationFrame(this.work);
  };
}

export interface PlaneProps {
  node: NodeData;
  /** Where the root is, which the plane is placed from. */
  origin: { x: number; y: number };
  /** How high it floats, in px. */
  z: number;
  /** The node's element, whose surfaces it copies. */
  element: HTMLElement | undefined;
  /** How often the node's content changed: a new version is copied again. */
  version: number;
  surfaces: SurfaceCache;
  /**
   * Whether the page has settled: surfaces are copied only then. While the page resizes, a copy
   * of another size is hidden rather than shown cut off, and the plane shows its outline, its
   * name and its spacing, which follow every frame.
   */
  settled: boolean;
  rootPx: number;
  names: boolean;
  showSpacing: boolean;
  problems: number;
  selected: boolean;
}

/** The plane of a node. Hover marks it with data-hovered from outside, without a render. */
export const Plane = memo(
  function Plane({
    node,
    origin,
    z,
    element,
    version,
    surfaces,
    settled,
    rootPx,
    names,
    showSpacing,
    problems,
    selected,
  }: PlaneProps) {
    const host = useRef<HTMLDivElement>(null);
    const { clip, box } = node;
    useLayoutEffect(() => {
      const target = host.current;
      if (!target || !element?.isConnected) return;
      const size = `${node.size.w}x${node.size.h}`;
      const show = (copy: CopiedSurface | undefined) => {
        // A copy at another size than the node's would be cut off, or leave the plane half
        // empty: the plane shows none until the new one is made.
        if (!copy || copy.size !== size) target.replaceChildren();
        else {
          if (copy.element.parentElement !== target) target.replaceChildren(copy.element);
          copy.restore();
        }
      };
      const copy = surfaces.get(node.key);
      show(copy);
      if (!settled || (copy?.size === size && copy.version === version)) return;
      surfaces.request(node.key, () => {
        if (!element.isConnected) return;
        const next = { size, version, ...timed(devStats.copies, () => surfaceOf(element)) };
        surfaces.set(node.key, next);
        show(next);
      });
      return () => surfaces.cancel(node.key);
    }, [element, node.key, node.size.w, node.size.h, version, surfaces, settled]);
    const roomy = clip.w > 48 && clip.h > 14;
    return (
      <div
        className="env-dev-plane"
        data-plane={node.key}
        data-kind={node.kind}
        data-overlay={flag(node.overlay)}
        data-window={windowClassOf(node.size.w / rootPx)}
        data-container={flag(node.container)}
        data-problems={flag(problems)}
        data-selected={flag(selected)}
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
    !!a.node.container === !!b.node.container &&
    a.node.kids.length === b.node.kids.length &&
    a.node.kids.every((kid, index) => sameBox(kid.box, b.node.kids[index].box)) &&
    a.origin.x === b.origin.x &&
    a.origin.y === b.origin.y &&
    a.z === b.z &&
    a.element === b.element &&
    a.version === b.version &&
    a.settled === b.settled &&
    a.names === b.names &&
    a.showSpacing === b.showSpacing &&
    a.problems === b.problems &&
    a.selected === b.selected &&
    a.rootPx === b.rootPx,
);

type Rect = { x: number; y: number; w: number; h: number };

const sameBox = (a: Rect, b: Rect) => a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

const rectPath = ({ x, y, w, h }: Rect) => `M${x} ${y}h${w}v${h}h${-w}Z`;

/**
 * Padding hatched one way, the space between and around the children the other, the children
 * dotted.
 */
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
  const children = kids
    .filter((kid) => !kid.detached)
    .map((kid) => ({ x: kid.box.x - box.x, y: kid.box.y - box.y, w: kid.box.w, h: kid.box.h }));
  return (
    <svg className="env-dev-spacing" width={w} height={h} aria-hidden="true">
      {pt + pr + pb + pl > 0 ? (
        <path data-padding="" fillRule="evenodd" d={rectPath(inner) + rectPath(content)} />
      ) : null}
      {children.length ? (
        <path
          data-gap=""
          fillRule="evenodd"
          d={rectPath(content) + children.map(rectPath).join('')}
        />
      ) : null}
      {children.map((child, index) => (
        <rect key={index} data-child="" x={child.x} y={child.y} width={child.w} height={child.h} />
      ))}
    </svg>
  );
}
