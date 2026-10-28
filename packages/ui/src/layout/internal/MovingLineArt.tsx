'use client';

import {
  Children,
  cloneElement,
  useCallback,
  useLayoutEffect,
  useState,
  type AnimationEvent,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { setRef } from '../../internal/setRef.js';
import type { LineArtDrawing, LineArtMotion } from '../LineArt.js';
import { lineArtShapes } from './lineArtShapes.js';

/**
 * Each drawing's lines, ready to move: each set one long, so a dash of one is the whole line, and
 * given its place in the order as a fraction of the time the lines start over
 * (--env-line-art-at), from 0 for the first beat to 1 for the last; and the line that finishes
 * last as they draw in, and as they draw out, the other way round.
 */
const moving = new Map<
  LineArtDrawing,
  { shapes: ReactNode[]; last: { in: number; out: number } }
>();
function movingShapes(drawing: LineArtDrawing) {
  let found = moving.get(drawing);
  if (found) return found;
  const { shapes: fragment, order: beats } = lineArtShapes[drawing];
  const at: number[] = [];
  beats.forEach((lines, beat) => {
    for (const line of lines) at[line] = beats.length > 1 ? beat / (beats.length - 1) : 0;
  });
  const drawn = (fragment as ReactElement<{ children: ReactNode }>).props.children;
  const shapes = Children.toArray(drawn).map((shape, index) =>
    cloneElement(shape as ReactElement<{ pathLength?: number; style?: CSSProperties }>, {
      pathLength: 1,
      style: { '--env-line-art-at': at[index] } as CSSProperties,
    }),
  );
  found = { shapes, last: { in: beats.at(-1)!.at(-1)!, out: beats[0]!.at(-1)! } };
  moving.set(drawing, found);
  return found;
}

/**
 * LineArt in motion (LineArt.css): its root's props as LineArt sets them, and the drawing's lines
 * moving one beat after another, in by the order of its construction and out the other way round.
 * A loop takes turns, in then out, each starting as the last one's last line ends.
 */
export function MovingLineArt({
  drawing,
  motion,
  onMotionEnd,
  onAnimationEnd,
  ref,
  ...props
}: Omit<ComponentPropsWithRef<'svg'>, 'children'> & {
  drawing: LineArtDrawing;
  motion: LineArtMotion;
  onMotionEnd?: () => void;
}) {
  const lines = movingShapes(drawing);
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const attach = useCallback(
    (node: SVGSVGElement | null) => {
      setSvg(node);
      setRef(ref, node);
    },
    [ref],
  );
  // The lines keep their width on screen (non-scaling-stroke), which lays their dashes out on
  // screen too, while their length of one is the drawing's: the drawing's scale
  // (--env-line-art-scale) sets the dashes to the lines' length on screen, at any size.
  useLayoutEffect(() => {
    if (!svg) return;
    const measure = () => {
      const scale = Math.max(svg.clientWidth / 480, svg.clientHeight / 330);
      if (scale > 0) svg.style.setProperty('--env-line-art-scale', `${scale}px`);
    };
    measure();
    const resizes = new ResizeObserver(measure);
    resizes.observe(svg);
    return () => resizes.disconnect();
  }, [svg]);
  // A loop's turn, which starts drawing in whenever the loop is set.
  const [turn, setTurn] = useState({ motion, out: false });
  if (turn.motion !== motion) setTurn({ motion, out: false });
  const out = motion === 'disappear' || (motion === 'loop' && turn.out);
  const ended = (event: AnimationEvent<SVGSVGElement>) => {
    onAnimationEnd?.(event);
    // The motion ends with the line that starts last, as every line takes as long.
    if (event.target !== event.currentTarget.children[out ? lines.last.out : lines.last.in]) return;
    if (motion === 'loop') setTurn({ motion, out: !out });
    else onMotionEnd?.();
  };
  return (
    <svg
      {...props}
      ref={attach}
      onAnimationEnd={ended}
      data-motion={motion}
      data-turn={motion === 'loop' ? (out ? 'out' : 'in') : undefined}
    >
      {lines.shapes}
    </svg>
  );
}
