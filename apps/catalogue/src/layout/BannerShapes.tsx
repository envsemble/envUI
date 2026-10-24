import type { CSSProperties } from 'react';

type Point = readonly [number, number];

/** A closed path through `points` with every corner rounded by `radius`, convex or not. */
function roundedPolygon(points: readonly Point[], radius: number) {
  const corner = (index: number) => points[(index + points.length) % points.length]!;
  const toward = ([x, y]: Point, [toX, toY]: Point) => {
    const t = Math.min(radius / Math.hypot(toX - x, toY - y), 0.5);
    return `${+(x + (toX - x) * t).toFixed(2)} ${+(y + (toY - y) * t).toFixed(2)}`;
  };
  const path = points.map((point, index) => {
    const start = toward(point, corner(index - 1));
    const end = toward(point, corner(index + 1));
    return `${index ? 'L' : 'M'}${start}Q${point[0]} ${point[1]} ${end}`;
  });
  return `${path.join('')}Z`;
}

/** The Site's shapes, each in a square of 100, rounded in envUI's way, drawn as outlines. */
const shapes = {
  pill: <rect x="2" y="32" width="96" height="36" rx="18" />,
  square: <rect x="6" y="6" width="88" height="88" rx="24" />,
  triangle: (
    <path
      d={roundedPolygon(
        [
          [50, 8],
          [94, 86],
          [6, 86],
        ],
        16,
      )}
    />
  ),
  plus: (
    <path
      d={roundedPolygon(
        [
          [34, 4],
          [66, 4],
          [66, 34],
          [96, 34],
          [96, 66],
          [66, 66],
          [66, 96],
          [34, 96],
          [34, 66],
          [4, 66],
          [4, 34],
          [34, 34],
        ],
        9,
      )}
    />
  ),
} as const;

/**
 * A shape's place, in units of the banner (Banners.css's --docs-banner-unit, a hundredth of its
 * height): its size, its offsets from the inline start or end and the block start or end, and its
 * turn.
 */
interface Placement {
  shape: keyof typeof shapes;
  size: number;
  inline: readonly ['start' | 'end', number];
  block: readonly ['start' | 'end', number];
  turn: number;
  /** A soft fill of the accent inside the outline, for the one shape a landing page lifts. */
  lift?: boolean;
}

/** Every shape lies on one slant, the rhythm of pills, squares, triangles and plus signs. */
const slant = -35;

/**
 * A landing page's shapes run along both ends, the same at the start and, turned half a turn, at
 * the end. Any other page's keep to its start, its icon at the end, or, with no icon, run along both
 * ends in the same way.
 */
const compositions: Record<'landing' | 'page', readonly Placement[]> = {
  landing: [
    { shape: 'pill', size: 46, inline: ['start', -10], block: ['start', 0], turn: slant },
    { shape: 'pill', size: 46, inline: ['start', 12], block: ['start', 26], turn: slant },
    { shape: 'square', size: 20, inline: ['start', 8], block: ['end', 12], turn: slant },
    { shape: 'triangle', size: 16, inline: ['start', 36], block: ['end', 10], turn: slant },
    { shape: 'plus', size: 14, inline: ['start', 44], block: ['start', 10], turn: slant },
    { shape: 'pill', size: 46, inline: ['end', -10], block: ['end', 0], turn: slant },
    { shape: 'pill', size: 46, inline: ['end', 12], block: ['end', 26], turn: slant, lift: true },
    { shape: 'square', size: 20, inline: ['end', 8], block: ['start', 12], turn: slant },
    { shape: 'triangle', size: 16, inline: ['end', 36], block: ['start', 10], turn: slant + 180 },
    { shape: 'plus', size: 14, inline: ['end', 44], block: ['end', 10], turn: slant },
  ],
  page: [
    { shape: 'pill', size: 40, inline: ['start', -8], block: ['start', 2], turn: slant },
    { shape: 'pill', size: 40, inline: ['start', 12], block: ['start', 26], turn: slant },
    { shape: 'square', size: 18, inline: ['start', 8], block: ['end', 12], turn: slant },
    { shape: 'plus', size: 12, inline: ['start', 36], block: ['end', 12], turn: slant },
  ],
};

/** The same placement turned half a turn about the banner's middle. */
const opposite = (placement: Placement): Placement => ({
  ...placement,
  inline: [placement.inline[0] === 'start' ? 'end' : 'start', placement.inline[1]],
  block: [placement.block[0] === 'start' ? 'end' : 'start', placement.block[1]],
  turn: placement.turn + 180,
});

const unit = (value: number) => `calc(var(--docs-banner-unit) * ${value})`;

function Outline({ shape, size, inline, block, turn, lift }: Placement) {
  const style = {
    inlineSize: unit(size),
    [inline[0] === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: unit(inline[1]),
    [block[0] === 'start' ? 'insetBlockStart' : 'insetBlockEnd']: unit(block[1]),
    rotate: `${turn}deg`,
  } as CSSProperties;
  return (
    <svg
      className="docs-banner-outline"
      viewBox="0 0 100 100"
      data-lift={lift || undefined}
      style={style}
    >
      {shapes[shape]}
    </svg>
  );
}

/**
 * The pattern behind a banner's text, a picture hidden from assistive technology, colored for each
 * kind of banner by Banners.css. The Site's banners draw outlined shapes of several kinds, pills,
 * rounded squares, rounded triangles and plus signs, laid on one slant at their edges; the Docs'
 * draw the envUI mark's circle and pill in outline at their end, as on a plan.
 */
export function BannerShapes({
  kind,
  icon = false,
}: {
  kind: 'landing' | 'page' | 'docs';
  /** Whether the banner shows the page's icon at its end, which the shapes then leave clear. */
  icon?: boolean;
}) {
  const placements =
    kind === 'page' && !icon
      ? [...compositions.page, ...compositions.page.map(opposite)]
      : compositions[kind === 'docs' ? 'page' : kind];
  return (
    <span className="docs-banner-shapes" aria-hidden="true">
      {kind === 'docs' ? (
        <>
          <span className="docs-banner-shape" data-shape="circle" data-corner="top-end" />
          <span className="docs-banner-shape" data-shape="pill" data-corner="bottom-end" />
        </>
      ) : (
        placements.map((placement, index) => <Outline key={index} {...placement} />)
      )}
    </span>
  );
}
