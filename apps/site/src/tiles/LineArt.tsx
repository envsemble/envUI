import { useLayoutEffect, useRef } from 'react';
import { LineArt } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';

/** The drawing at rest, then its lines drawn in anew one after another. */
const durations = [600, 3000];

/** How long one line takes to run out past its end and draw in again, and the next one's delay. */
const redraw = 1300;
const stagger = 85;

/**
 * Each line's dash, a whole line long: at rest, then running out past its end, then, from before
 * its start, drawn in along itself.
 */
const keyframes: Keyframe[] = [
  { strokeDashoffset: 0, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
  { strokeDashoffset: -1, offset: 0.3 },
  { strokeDashoffset: 1, offset: 0.3, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  { strokeDashoffset: 0 },
];

/**
 * The golden section, whole, across the tile. Playing, its lines draw themselves in anew, one after
 * another from the largest, through the dashes of the drawing's own lines, so the drawing is never
 * empty, and rest.
 */
export default function LineArtTile() {
  const step = useTimeline(durations);
  const art = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    const lines = [...(art.current?.children ?? [])] as SVGGeometryElement[];
    for (const line of lines) {
      // A path length of one, so a dash of one is the whole line at any size.
      line.setAttribute('pathLength', '1');
      line.style.strokeDasharray = '1 1';
    }
    if (step !== 1) return;
    const animations = lines.map((line, index) =>
      line.animate(keyframes, { duration: redraw, delay: index * stagger }),
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [step]);
  return (
    // Across the tile, at the drawing's own proportions, so it shows whole.
    <div style={{ inlineSize: '10rem', aspectRatio: '480 / 330' }}>
      <LineArt ref={art} drawing="golden-section" />
    </div>
  );
}
