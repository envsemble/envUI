import { createElement, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/*
 * The layout tiles' shared drawing, a construction drawing of a layout, as a draughtsman sets out
 * a sheet: thin, even lines in the theme's border colours that run across the whole tile, and
 * whose crossings form what the layout box lays out. The real layout box lays its parts out,
 * unpainted, and the lines are drawn where they land; as a reflow moves a part, its lines glide
 * there rather than jump.
 */

/** The eased motion of a tile's transitions, such as a fill or a corner's radius changing. */
export const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

/** A part's edges, in the drawing's px. */
export interface Edges {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * A line of the drawing, from one point to another: a construction line, faint, or a line of the
 * form, an edge of what is laid out, in the stronger border colour.
 */
export interface Line {
  from: readonly [number, number];
  to: readonly [number, number];
  form?: boolean;
}

/** How far, in px, a construction line runs past the drawing: off the tile, whatever its size. */
const far = 2000;

/** A construction line across the tile, at `y`. */
export const across = (y: number): Line => ({ from: [-far, y], to: [far, y] });

/** A construction line down the tile, at `x`. */
export const down = (x: number): Line => ({ from: [x, -far], to: [x, far] });

/** A construction line through two points, run on past both across the tile. */
export function through(a: readonly [number, number], b: readonly [number, number]): Line {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const x = (b[0] - a[0]) / length;
  const y = (b[1] - a[1]) / length;
  return { from: [a[0] - x * far, a[1] - y * far], to: [b[0] + x * far, b[1] + y * far] };
}

/** A part's four edges as lines of the form. */
export const sides = ({ left, top, right, bottom }: Edges): Line[] => [
  { from: [left, top], to: [right, top], form: true },
  { from: [right, top], to: [right, bottom], form: true },
  { from: [left, bottom], to: [right, bottom], form: true },
  { from: [left, top], to: [left, bottom], form: true },
];

/** The construction lines a part is set out by: its four edges, run across the tile. */
export const setOut = ({ left, top, right, bottom }: Edges): Line[] => [
  across(top),
  across(bottom),
  down(left),
  down(right),
];

/** The edges of what the parts take together. */
export const bounds = (parts: Edges[]): Edges => ({
  left: Math.min(...parts.map((part) => part.left)),
  top: Math.min(...parts.map((part) => part.top)),
  right: Math.max(...parts.map((part) => part.right)),
  bottom: Math.max(...parts.map((part) => part.bottom)),
});

/** The construction lines through a part's opposite corners, run across the tile. */
export const diagonals = ({ left, top, right, bottom }: Edges): Line[] => [
  through([left, top], [right, bottom]),
  through([right, top], [left, bottom]),
];

/** A critically damped spring's step over `time` s at rate `w`: it settles without overshooting. */
function spring(offset: number, velocity: number, w: number, time: number) {
  const decay = Math.exp(-w * time);
  const pull = velocity + w * offset;
  return [(offset + pull * time) * decay, (velocity - w * pull * time) * decay] as const;
}

/** The lines in the order they are painted: the lines of the form last, over the others. */
const layered = (lines: Line[]) => [
  ...lines.filter((line) => !line.form),
  ...lines.filter((line) => line.form),
];

const keys = ['left', 'top', 'right', 'bottom'] as const;

/**
 * The construction lines' colour: the faint border's on a light canvas; on a dark one, where that
 * stands out twice as far, the pressed muted fill's, a step fainter, to keep the lines as faint
 * beside the lines of the form. Both are opaque, so lines that meet draw as one.
 */
const faint = 'light-dark(var(--env-color-border-muted), var(--env-color-bg-muted-pressed))';

/** A line's stroke, in a border colour of the theme. */
const stroke = (form?: boolean) => ({ stroke: form ? 'var(--env-color-border-default)' : faint });

/**
 * The lines' width, in the drawing's px, at `scale` on the screen: whole device pixels, a px on
 * the screen, so the lines straight across or down stay as crisp and as wide wherever they stand
 * as they move, never one pixel wide here and two there. The tile is drawn scaled, and a stroke
 * that doesn't scale (`vector-effect`) doesn't undo a scale of the page's around it.
 */
function hairline(scale: number) {
  const ratio = window.devicePixelRatio || 1;
  return Math.max(1, Math.round(ratio)) / ratio / scale;
}

/**
 * A layout box drawn as construction lines: `children` is the real layout, which paints nothing
 * of its own; `parts` picks the elements it lays out that the drawing follows, and `draw` draws
 * their edges, in this order, as lines. When `step` changes, or the layout resizes, each part's
 * lines spring from where they are drawn to where it is laid now, at `speed`. The lines of the
 * form are drawn over the construction lines.
 */
export function Construction({
  children,
  parts,
  draw,
  step,
  speed = 10,
}: {
  children: ReactNode;
  parts: (drawing: HTMLElement) => Element[];
  draw: (edges: Edges[]) => Line[];
  step: unknown;
  speed?: number;
}) {
  const drawing = useRef<HTMLDivElement>(null);
  const picture = useRef<SVGSVGElement>(null);
  const [lines, setLines] = useState<Line[] | null>(null);
  // Each part's edges as drawn, and how fast they move.
  const drawn = useRef<{ at: Edges; pace: Edges }[]>([]);
  useLayoutEffect(() => {
    const element = drawing.current;
    if (!element) return;
    let frame = 0;
    let last = 0;
    let stroked = '';
    const laid = () => {
      const box = element.getBoundingClientRect();
      const scale = box.width / (element.offsetWidth || 1) || 1;
      const width = `${hairline(scale)}px`;
      const svg = picture.current;
      if (svg && width !== stroked) svg.style.strokeWidth = stroked = width;
      return parts(element).map((part) => {
        const rect = part.getBoundingClientRect();
        return {
          left: (rect.left - box.left) / scale,
          top: (rect.top - box.top) / scale,
          right: (rect.right - box.left) / scale,
          bottom: (rect.bottom - box.top) / scale,
        };
      });
    };
    const paint = () => {
      const next = layered(draw(drawn.current.map(({ at }) => at)));
      const shown = picture.current?.children;
      if (!shown || shown.length !== next.length) {
        setLines(next);
        return;
      }
      next.forEach((line, index) => {
        const shape = shown[index]!;
        shape.setAttribute('x1', String(line.from[0]));
        shape.setAttribute('y1', String(line.from[1]));
        shape.setAttribute('x2', String(line.to[0]));
        shape.setAttribute('y2', String(line.to[1]));
      });
    };
    const tick = (now: number) => {
      const time = Math.min(64, now - (last || now - 16)) / 1000;
      last = now;
      const target = laid();
      let moving = false;
      target.forEach((edges, index) => {
        const part = (drawn.current[index] ??= {
          at: { ...edges },
          pace: { left: 0, top: 0, right: 0, bottom: 0 },
        });
        for (const key of keys) {
          const [offset, pace] = spring(part.at[key] - edges[key], part.pace[key], speed, time);
          if (Math.abs(offset) < 0.05 && Math.abs(pace) < 1) {
            part.at[key] = edges[key];
            part.pace[key] = 0;
          } else {
            part.at[key] = edges[key] + offset;
            part.pace[key] = pace;
            moving = true;
          }
        }
      });
      paint();
      frame = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) last = 0;
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    // Measured before the change paints: what has yet to move is drawn where it was.
    tick(performance.now());
    const resize = new ResizeObserver(start);
    resize.observe(element);
    for (const part of parts(element)) resize.observe(part);
    // The scale it is drawn at changes with a style around it, such as the tile's view as it is
    // fitted, and with the browser's zoom.
    const around = new MutationObserver(start);
    for (let node = element.parentElement; node; node = node.parentElement)
      around.observe(node, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('resize', start);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      around.disconnect();
      window.removeEventListener('resize', start);
    };
  }, [parts, draw, step, speed]);
  return createElement(
    'div',
    { ref: drawing, style: { position: 'relative' } },
    children,
    createElement(
      'svg',
      {
        ref: picture,
        'aria-hidden': true,
        style: {
          position: 'absolute',
          inset: 0,
          inlineSize: '100%',
          blockSize: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
          fill: 'none',
        },
      },
      ...(lines ?? []).map((line, index) =>
        createElement('line', {
          key: index,
          x1: line.from[0],
          y1: line.from[1],
          x2: line.to[0],
          y2: line.to[1],
          shapeRendering:
            line.from[0] === line.to[0] || line.from[1] === line.to[1] ? 'crispEdges' : undefined,
          style: stroke(line.form),
        }),
      ),
    ),
  );
}
