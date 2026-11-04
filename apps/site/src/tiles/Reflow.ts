import {
  createElement,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

/*
 * The layout tiles' shared pieces, drawn as the catalogue banners' figures are, as a draughtsman
 * sets out a plan: every line one screen pixel wide at any scale, in the muted edge color, nothing
 * filled. The outlines stand for a layout box's edges and the content it lays out, a few marks
 * show what it sets out, such as a gap, an inset or the line its content aligns to, and a glide
 * carries what a reflow moves, such as an item wrapping to the next line, from where it was to
 * where it lands, rather than jumping there.
 */

/** A line of the drawing: a hairline at any scale, unfilled, in the muted edge color, as LineArt's. */
const hairline: CSSProperties = {
  fill: 'none',
  stroke: 'var(--env-color-border-muted)',
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

/** The eased motion of what the frames' transitions change, such as a width or a gap. */
export const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

interface Place {
  x: number;
  y: number;
  width: number;
  height: number;
}

const sides = ['x', 'y', 'width', 'height'] as const;

/** A change of a place, in layout px, between two frames that is a reflow rather than a motion. */
const jump = 6;

/** How much faster the axis that leads a move to another line springs than the other. */
const lead = 1.5;

/** How long, in ms, the other axis holds before it follows. */
const lag = 140;

/**
 * A critically damped spring, stepped exactly over `time` s at rate `w`, from `offset` away from
 * where it rests at `velocity`: x' = (x + (v + wx)t)e^-wt. It gathers speed and settles without
 * overshooting, however its rest moves.
 */
function spring(offset: number, velocity: number, w: number, time: number) {
  const decay = Math.exp(-w * time);
  const pull = velocity + w * offset;
  return [(offset + pull * time) * decay, (velocity - w * pull * time) * decay] as const;
}

/** How much faster an outline follows its box than the children glide. */
const follow = 2;

/**
 * Glides the children of a layout box through its reflows for `settle` ms after `key` changes: a
 * child that jumps, as when it wraps to the next line or the columns change, is drawn where it was
 * and springs to where it lands, `speed` its rate, while motion that is already smooth, such as a
 * gap in transition, passes through as it is. A child moving to another line travels along the
 * lower one, as a hand would move it clear of its neighbours: down first, then along, or along
 * first, then up.
 *
 * Given an `outline` around the box, with only its padding and border between them and the box
 * positioned, the hook sizes the outline: it springs to what the box takes, or the children's
 * drawn places if they reach further, so it eases to a new size, never jumping, and a child that
 * glides never stands out of it.
 */
export function useReflow(
  box: RefObject<HTMLElement | null>,
  key: unknown,
  {
    settle = 1800,
    speed = 13,
    outline,
  }: { settle?: number; speed?: number; outline?: RefObject<HTMLElement | null> } = {},
) {
  const places = useRef(
    new Map<Element, { laid: Place; offset: Place; velocity: Place; rate: Place; hold: Place }>(),
  );
  const drawn = useRef<{ width: number; height: number; across: number; down: number }>(null);
  useLayoutEffect(() => {
    const element = box.current;
    if (!element) return;
    const known = places.current;
    let frame = 0;
    let last = performance.now();
    const end = last + settle;
    const tick = (now: number) => {
      const time = Math.min(64, now - last) / 1000;
      last = now;
      let moving = false;
      for (const child of element.children) {
        if (!(child instanceof HTMLElement)) continue;
        const laid = {
          x: child.offsetLeft,
          y: child.offsetTop,
          width: child.offsetWidth,
          height: child.offsetHeight,
        };
        const place = known.get(child);
        if (!place) {
          const rest = { x: 0, y: 0, width: 0, height: 0 };
          known.set(child, {
            laid,
            offset: { ...rest },
            velocity: { ...rest },
            rate: { x: speed, y: speed, width: speed, height: speed },
            hold: { ...rest },
          });
          continue;
        }
        const { offset, velocity, rate, hold } = place;
        const across = laid.x - place.laid.x;
        const down = laid.y - place.laid.y;
        if (Math.abs(across) > jump && Math.abs(down) > jump) {
          const [first, then] = down > 0 ? (['y', 'x'] as const) : (['x', 'y'] as const);
          rate[first] = speed * lead;
          rate[then] = speed;
          hold[then] = now + lag;
          hold[first] = 0;
        } else if (Math.abs(across) > jump || Math.abs(down) > jump) {
          rate.x = rate.y = speed;
          hold.x = hold.y = 0;
        }
        for (const side of sides) {
          const step = laid[side] - place.laid[side];
          if (Math.abs(step) > jump) offset[side] -= step;
          if (now < hold[side]) {
            moving = true;
            continue;
          }
          [offset[side], velocity[side]] = spring(offset[side], velocity[side], rate[side], time);
          if (Math.abs(offset[side]) < 0.25 && Math.abs(velocity[side]) < 5) {
            offset[side] = 0;
            velocity[side] = 0;
          } else moving = true;
        }
        place.laid = laid;
        const still = sides.every((side) => offset[side] === 0);
        child.style.transformOrigin = '0 0';
        child.style.transform = still
          ? ''
          : `translate(${offset.x}px, ${offset.y}px) scale(${
              laid.width ? (laid.width + offset.width) / laid.width : 1
            }, ${laid.height ? (laid.height + offset.height) / laid.height : 1})`;
      }
      const edges = outline?.current;
      if (edges) {
        // How far the children reach as drawn, and what lies around the box within the outline.
        let right = 0;
        let bottom = 0;
        for (const [child, { laid, offset }] of known) {
          if (child.parentElement !== element) continue;
          right = Math.max(right, laid.x + offset.x + laid.width + offset.width);
          bottom = Math.max(bottom, laid.y + offset.y + laid.height + offset.height);
        }
        const style = getComputedStyle(edges);
        const around = (...sides: string[]) =>
          sides.reduce((sum, side) => sum + parseFloat(style.getPropertyValue(side)), 0);
        const aroundX = around(
          'padding-left',
          'padding-right',
          'border-left-width',
          'border-right-width',
        );
        const aroundY = around(
          'padding-top',
          'padding-bottom',
          'border-top-width',
          'border-bottom-width',
        );
        const reach = { width: right + aroundX, height: bottom + aroundY };
        const rest = {
          width: Math.max(element.offsetWidth + aroundX, reach.width),
          height: Math.max(element.offsetHeight + aroundY, reach.height),
        };
        const size = (drawn.current ??= { ...rest, across: 0, down: 0 });
        for (const [side, pace] of [
          ['width', 'across'],
          ['height', 'down'],
        ] as const) {
          const [offset, velocity] = spring(
            size[side] - rest[side],
            size[pace],
            speed * follow,
            time,
          );
          size[side] = rest[side] + offset;
          size[pace] = velocity;
          if (size[side] < reach[side]) size[side] = reach[side];
          if (Math.abs(offset) < 0.1 && Math.abs(velocity) < 2) {
            size[side] = rest[side];
            size[pace] = 0;
          } else moving = true;
        }
        edges.style.inlineSize = `${size.width}px`;
        edges.style.blockSize = `${size.height}px`;
      }
      if (now < end || moving) frame = requestAnimationFrame(tick);
    };
    // The first frame is measured before the change paints, so a jump the change itself makes,
    // such as a new alignment, is held where it was.
    tick(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [box, key, settle, speed, outline]);
}
