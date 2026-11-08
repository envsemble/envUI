// What the 3D view says about the node under the pointer: a card beside the pointer with its size,
// container and problems, and, colored by window class, a ruler over it.

import { Column } from '../../foundations/Layout.js';
import { Text } from '../../foundations/Text.js';
import type { LayoutProblem, NodeData, Snapshot } from '../model.js';
import { queriesFor, thresholdsFor } from '../queries.js';
import { labelOf } from '../readout.js';
import { round, toRem, windowClasses, windowClassOf } from '../units.js';
import { flag } from '../../internal/flag.js';

/** The hovered node in a few lines: its name, size, level, container and problems. */
export function NodeHoverCard({
  snapshot,
  node,
  problems,
}: {
  snapshot: Snapshot;
  node: NodeData;
  problems: LayoutProblem[];
}) {
  const width = toRem(node.size.w, snapshot.rootPx);
  const thresholds = node.container
    ? thresholdsFor(queriesFor(node.container.name, snapshot.queries))
    : [];
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

/**
 * Over the hovered node, above every plane: its width against the window classes, a dashed line
 * at each threshold its container's queries test, and how far it is from the next one.
 */
export function Ruler({
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
            data-current={flag(windowClass.name === windowClassOf(width))}
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
