import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react';

/*
 * The layout tiles' shared pieces, drawn as a line drawing of a layout, as an architect's plan
 * draws a room: the outlines that stand in for content, the outline of the layout box's edges, the
 * faint outline of an area it sets aside, and the glide that carries what a reflow moves, such as
 * an item wrapping to the next line, from where it was to where it lands, rather than jumping there.
 */

/** A hairline in a color of the theme. */
const line = (color: string) => `var(--env-control-border-width) solid var(${color})`;

/** The color of a drawing's construction lines, fainter than what they measure. */
const construction = '--env-color-border-muted';

/**
 * A piece of content, drawn as its outline over the page's faint fill, so a block that glides past
 * another passes in front of it rather than through it.
 */
export const block = (inlineSize: string, blockSize = '1.25rem'): CSSProperties => ({
  boxSizing: 'border-box',
  inlineSize,
  blockSize,
  flex: 'none',
  border: line('--env-color-fg-muted'),
  borderRadius: 'var(--env-radius-xs)',
  background: 'var(--env-color-bg-page)',
});

/**
 * A layout box's edges, which it doesn't paint, outlined around what it lays out; its corners
 * follow the blocks' around a padding of space-2, so the two are concentric.
 */
export const frame: CSSProperties = {
  boxSizing: 'border-box',
  border: line('--env-color-border-default'),
  borderRadius: 'calc(var(--env-radius-xs) + var(--env-space-2))',
};

/**
 * A faint outline of an area a layout box sets aside, such as the content within its padding, as
 * a drawing's lighter construction lines.
 */
export const guide: CSSProperties = {
  boxSizing: 'border-box',
  border: line(construction),
  borderRadius: 'var(--env-radius-sm)',
};

/**
 * A dimension, as a drawing marks one: the gap that begins `from` the start of the positioned box
 * that holds it, `across` an axis, a bracket whose ends continue the edges it measures, standing
 * `off` the box's start along the other axis.
 */
export const dimension = (
  along: 'inline' | 'block',
  { from, across, off }: { from: string; across: string; off: string },
): CSSProperties => {
  const inline = along === 'inline';
  const width = 'var(--env-control-border-width)';
  return {
    position: 'absolute',
    boxSizing: 'border-box',
    [inline ? 'insetInlineStart' : 'insetBlockStart']: `calc(${from} - ${width})`,
    [inline ? 'inlineSize' : 'blockSize']: `calc(${across} + 2 * ${width})`,
    [inline ? 'insetBlockStart' : 'insetInlineStart']: off,
    [inline ? 'blockSize' : 'inlineSize']: 'var(--env-space-1)',
    [inline ? 'borderInline' : 'borderBlock']: line(construction),
    [inline ? 'borderBlockStart' : 'borderInlineStart']: line(construction),
  };
};

/**
 * An inset, as a drawing marks one: a fine line `along` an axis from a box's edge to its content's,
 * placed by `at` within the box.
 */
export const inset = (along: 'inline' | 'block', at: CSSProperties): CSSProperties => ({
  position: 'absolute',
  [along === 'inline' ? 'borderBlockStart' : 'borderInlineStart']: line(construction),
  ...at,
});

/**
 * A construction line along which blocks line up, drawn behind them across the gaps between them
 * and a little beyond, as a drawing's alignment guide; `left` is where its line falls.
 */
export const alignment = (left: string): CSSProperties => ({
  position: 'absolute',
  zIndex: -1,
  insetBlock: 'var(--env-space-1)',
  left,
  inlineSize: 'var(--env-space-1)',
  borderInlineStart: line(construction),
});

/** Where a line falls at a fraction across a box's content, between its `padding` on either side. */
export const across = (fraction: number, padding: string) =>
  `calc(${padding} + (100% - 2 * ${padding} - var(--env-control-border-width)) * ${fraction})`;

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
