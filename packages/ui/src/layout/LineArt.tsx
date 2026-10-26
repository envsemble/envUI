import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { lineArtShapes } from './internal/lineArtDrawings.js';

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

export interface LineArtProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {
  /** The drawing, one of lineArtDrawings, such as golden-section or harmonic-division. */
  drawing: LineArtDrawing;
  /**
   * Where the drawing sits in its box when the box's shape crops it: at the end, at the start or
   * in the centre, flipped in right-to-left text, as the drawing itself is. It is cropped from the
   * other side, or from both.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end';
  /**
   * What the drawing shows, for a drawing that is content rather than decoration: it makes the
   * drawing an image named by it. Without it, the drawing is hidden from assistive technology.
   */
  label?: string;
}

const aspect = { start: 'xMinYMid', center: 'xMidYMid', end: 'xMaxYMid' } as const;

/**
 * A geometric drawing in hairlines that fills its container's box, for a banner's end, an empty
 * state or the background of a header: its lines in the muted edge color in every theme, one
 * device pixel wide at any size, and the system's gray text color in forced colors. It covers the
 * box, cropped from its start by default, and is hidden from assistive technology unless a label
 * makes it an image.
 */
export function LineArt({ drawing, align = 'end', label, className, ...props }: LineArtProps) {
  return (
    <svg
      viewBox="0 0 480 330"
      preserveAspectRatio={`${aspect[align]} slice`}
      focusable="false"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
      className={classNames('env-line-art', className)}
      data-drawing={drawing}
      data-align={align}
    >
      {lineArtShapes[drawing]}
    </svg>
  );
}
