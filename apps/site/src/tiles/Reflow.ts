import { createElement, type CSSProperties, type ReactNode } from 'react';

/*
 * The pieces of the foundations' layout drawings (Glance.tsx), drawn as the catalogue banners'
 * figures are, as a draughtsman sets out a plan: every line one screen pixel wide at any scale, in the default edge color, nothing
 * filled. The outlines stand for a layout box's edges and the content it lays out; a few marks
 * show what it sets out, such as a gap, an inset or the line its content aligns to. A change of
 * layout is drawn at once, as the layout components make it: nothing glides.
 */

/**
 * A line of the drawing: a hairline at any scale, unfilled, in the default edge color, a step
 * stronger than LineArt's muted one behind a banner, as a drawing on its own is all the tile shows.
 */
const hairline: CSSProperties = {
  fill: 'none',
  stroke: 'var(--env-color-border-default)',
  strokeWidth: 1,
  vectorEffect: 'non-scaling-stroke',
};

/** A drawing over the whole of the positioned box that holds it, its lines on the box's edges. */
const sheet: CSSProperties = {
  position: 'absolute',
  inset: 0,
  inlineSize: '100%',
  blockSize: '100%',
  overflow: 'visible',
  pointerEvents: 'none',
};

/** A point within the drawing's box, each coordinate a length or a fraction of the box, such as 100%. */
type Point = readonly [x: string, y: string];

/**
 * The drawing of a box's `lines`, each from one point to the next, or of its edges, their corners
 * rounded by `radius`, a length, where the box stands for something round, such as a button.
 */
function drawing(
  lines: readonly (readonly [Point, Point])[] | 'edges',
  radius?: string,
): ReactNode {
  const shapes =
    lines === 'edges'
      ? [
          createElement('rect', {
            key: 0,
            width: '100%',
            height: '100%',
            style: radius ? { ...hairline, rx: radius, ry: radius } : hairline,
          }),
        ]
      : lines.map(([[x1, y1], [x2, y2]], index) =>
          createElement('line', { key: index, x1, y1, x2, y2, style: hairline }),
        );
  return createElement('svg', { 'aria-hidden': true, focusable: 'false', style: sheet }, shapes);
}

/** A layout box's edges, drawn over the positioned box that lays out the content. */
export const edges = (radius?: string) => drawing('edges', radius);

/** A piece of content, `width` by `height`, drawn as its outline, its corners rounded by `radius`. */
export function Item({
  width,
  height,
  radius,
}: {
  width: string;
  height: string;
  radius?: string;
}) {
  return createElement(
    'span',
    { style: { position: 'relative', flex: 'none', inlineSize: width, blockSize: height } },
    edges(radius),
  );
}

/** A mark of the drawing, its lines within a box placed by `at` in the positioned box around it. */
export function Mark({
  at,
  lines,
}: {
  at: CSSProperties;
  lines: readonly (readonly [Point, Point])[];
}) {
  return createElement('span', { style: { position: 'absolute', ...at } }, drawing(lines));
}

/**
 * A gap, as a drawing dimensions one: a bracket whose ends continue the edges it measures, the gap
 * beginning `from` the start of the box that holds it and running `across` it along an axis,
 * standing `off` the box's start on the other axis, open toward what it measures.
 */
export const gap = (
  along: 'inline' | 'block',
  { from, across, off }: { from: string; across: string; off: string },
): { at: CSSProperties; lines: readonly (readonly [Point, Point])[] } =>
  along === 'inline'
    ? {
        at: { left: from, width: across, top: off, height: 'var(--env-space-1)' },
        lines: [
          [
            ['0', '100%'],
            ['0', '0'],
          ],
          [
            ['0', '0'],
            ['100%', '0'],
          ],
          [
            ['100%', '0'],
            ['100%', '100%'],
          ],
        ],
      }
    : {
        at: { top: from, height: across, left: off, width: 'var(--env-space-1)' },
        lines: [
          [
            ['100%', '0'],
            ['0', '0'],
          ],
          [
            ['0', '0'],
            ['0', '100%'],
          ],
          [
            ['0', '100%'],
            ['100%', '100%'],
          ],
        ],
      };

/**
 * A straight line along the length of its box, down it or across it, through the middle of the
 * box's other side, which is space-1 wide (`line`), so the box is something to draw in.
 */
export const along = {
  block: [
    [
      ['50%', '0'],
      ['50%', '100%'],
    ],
  ],
  inline: [
    [
      ['0', '50%'],
      ['100%', '50%'],
    ],
  ],
} as const satisfies Record<string, readonly (readonly [Point, Point])[]>;

/** The box of a straight line down from `top` (`block`) or across from `left` (`inline`), at `at`. */
export const line = (direction: 'block' | 'inline', at: string): CSSProperties =>
  direction === 'block'
    ? { left: at, width: 'var(--env-space-1)', marginLeft: 'calc(var(--env-space-1) / -2)' }
    : { top: at, height: 'var(--env-space-1)', marginTop: 'calc(var(--env-space-1) / -2)' };
