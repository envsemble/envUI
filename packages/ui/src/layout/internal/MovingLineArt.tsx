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
import { setRef } from '../../internal/react/setRef.js';
import type { LineArtDrawing, LineArtMotion } from '../LineArt.js';
import { lineArtSheet, lineArtShapes } from './lineArtShapes.js';

const movingShapesByDrawing = new Map<
  LineArtDrawing,
  { shapes: ReactNode[]; last: { in: number; out: number } }
>();
function movingShapes(drawing: LineArtDrawing) {
  let found = movingShapesByDrawing.get(drawing);
  if (found) return found;
  const { shapes: fragment, order: beats } = lineArtShapes[drawing];
  const shareOfLoopAtStart: number[] = [];
  beats.forEach((lines, beat) => {
    for (const line of lines)
      shareOfLoopAtStart[line] = beats.length > 1 ? beat / (beats.length - 1) : 0;
  });
  const shapesOfFragment = (fragment as ReactElement<{ children: ReactNode }>).props.children;
  const shapes = Children.toArray(shapesOfFragment).map((shape, index) =>
    cloneElement(shape as ReactElement<{ pathLength?: number; style?: CSSProperties }>, {
      pathLength: 1,
      style: { '--_line-art-at': shareOfLoopAtStart[index] },
    }),
  );
  const lastLineDrawingIn = beats.at(-1)!.at(-1)!;
  const lastLineDrawingOut = beats[0].at(-1)!;
  found = { shapes, last: { in: lastLineDrawingIn, out: lastLineDrawingOut } };
  movingShapesByDrawing.set(drawing, found);
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
  useLayoutEffect(
    function scaleDashesToLinesOnScreen() {
      if (!svg) return;
      const measure = () => {
        const scale = Math.max(
          svg.clientWidth / lineArtSheet.width,
          svg.clientHeight / lineArtSheet.height,
        );
        if (scale > 0) svg.style.setProperty('--_line-art-scale', `${scale}px`);
      };
      measure();
      const resizes = new ResizeObserver(measure);
      resizes.observe(svg);
      return () => resizes.disconnect();
    },
    [svg],
  );
  const [loopTurn, setLoopTurn] = useState({ motion, out: false });
  if (loopTurn.motion !== motion) setLoopTurn({ motion, out: false });
  const out = motion === 'disappear' || (motion === 'loop' && loopTurn.out);
  const ended = (event: AnimationEvent<SVGSVGElement>) => {
    onAnimationEnd?.(event);
    const lineThatStartsLast = event.currentTarget.children[out ? lines.last.out : lines.last.in];
    if (event.target !== lineThatStartsLast) return;
    if (motion === 'loop') setLoopTurn({ motion, out: !out });
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
