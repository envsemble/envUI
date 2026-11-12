import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { lineArtShapes } from './internal/lineArtShapes.js';
import { MovingLineArt } from './internal/MovingLineArt.js';
import '../styles/Base.css';
import '../styles/LineArt.css';

/**
 * LineArt's drawings, by name: geometric constructions in thin lines, each following one rule,
 * such as a golden rectangle cut into squares or a chain of circles between three arcs.
 */
export const lineArtDrawings = [
  'golden-section',
  'square-circle-triangle',
  'whirling-squares',
  'triangle-and-circles',
  'ford-circles',
  'harmonic-division',
  'pappus-chain',
  'root-rectangles',
  'sacred-cut',
  'gothic-tracery',
  'quartered-square',
  'graded-quadtree',
  'monochord',
  'logarithmic-grid',
  'pointed-arcade',
  'root-two-halving',
] as const;

/** One of LineArt's drawings. */
export type LineArtDrawing = (typeof lineArtDrawings)[number];

/**
 * How a drawing moves: its lines drawing themselves in from nothing (appear), out to nothing
 * (disappear), in and out for as long as it shows (loop), or running out and in again along
 * themselves while the drawing stays whole (play).
 */
export type LineArtMotion = 'appear' | 'disappear' | 'loop' | 'play';

export interface LineArtProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {
  /** The drawing, one of lineArtDrawings, such as golden-section or harmonic-division. */
  drawing: LineArtDrawing;
  /**
   * Where the drawing sits in its box when the box's shape crops it: at the end, at the start or
   * in the center, flipped in right-to-left text, as the drawing itself is. It is cropped from the
   * other side, or from both, and always rests on the box's foot, cropped from its top.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end';
  /**
   * What the drawing shows, for a drawing that is content rather than decoration: it makes the
   * drawing an image named by it. Without it, the drawing is hidden from assistive technology.
   */
  label?: string;
  /**
   * How the drawing moves as it mounts or as this changes, its lines one after another in the
   * order of its construction: `appear` draws them in, from nothing to the whole drawing;
   * `disappear` draws them out, from the whole drawing to nothing, where it stays; `loop` draws
   * them in and out again for as long as it is set, ending each round where the next begins; and
   * `play` runs each line out past its end and draws it in again, the drawing whole throughout,
   * ending on the still. Without it, the drawing is still. Where reduced motion is preferred, the
   * drawing shows where the motion ends at once, and stays whole for `loop`.
   */
  motion?: LineArtMotion;
  /**
   * Called once `appear`, `disappear` or `play` has finished, at once where reduced motion is
   * preferred, such as to unmount a drawing that has disappeared or to play it again later.
   */
  onMotionEnd?: () => void;
}

const aspect = { start: 'xMinYMax', center: 'xMidYMax', end: 'xMaxYMax' } as const;

/**
 * Where a drawing's sheet starts, for the drawings whose lines stop short of its foot or its end:
 * the sheet is moved so they reach both, and a drawing rests on its box's foot at every size with
 * no strip of empty sheet below it or beside its end.
 */
const sheetOrigin: Partial<Record<LineArtDrawing, string>> = {
  'pappus-chain': '0 -18',
  'golden-section': '-14 -30',
  'whirling-squares': '-7 -22',
  'quartered-square': '-26 -24',
  'ford-circles': '0 -18',
};

/**
 * A geometric drawing in hairlines that fills its container's box, for a banner's end, an empty
 * state or the background of a header: its lines in the muted edge color in every theme, one
 * device pixel wide at any size, and the system's gray text color in forced colors. It covers the
 * box, resting on its foot and cropped from its start by default, and is hidden from assistive technology unless a label
 * makes it an image. With `motion`, its lines draw themselves in, out, or in and out again.
 */
export function LineArt({
  drawing,
  align = 'end',
  label,
  motion,
  onMotionEnd,
  className,
  ...props
}: LineArtProps) {
  const root = {
    viewBox: `${sheetOrigin[drawing] ?? '0 0'} 480 330`,
    preserveAspectRatio: `${aspect[align]} slice`,
    focusable: 'false',
    role: label ? 'img' : undefined,
    'aria-label': label,
    'aria-hidden': label ? undefined : true,
    ...props,
  } as const;
  // A drawing in motion moves on the client; a still one is markup alone, which a server renders.
  return motion ? (
    <MovingLineArt
      {...root}
      className={classNames('env-line-art', className)}
      data-drawing={drawing}
      data-align={align}
      drawing={drawing}
      motion={motion}
      onMotionEnd={onMotionEnd}
    />
  ) : (
    <svg
      {...root}
      className={classNames('env-line-art', className)}
      data-drawing={drawing}
      data-align={align}
    >
      {lineArtShapes[drawing]?.shapes}
    </svg>
  );
}
