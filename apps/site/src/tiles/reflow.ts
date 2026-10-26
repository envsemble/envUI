import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

/*
 * The layout tiles' shared pieces: the blocks that stand in for content, the frame that shows a
 * layout box's edges, and the glide that carries what a reflow moves, such as an item wrapping to
 * the next line, from where it was to where it lands, rather than jumping there.
 */

/** A block standing in for a piece of content, in the accent, as the catalogue draws a measure. */
export const block = (inlineSize: string, blockSize = '1.25rem'): CSSProperties => ({
  inlineSize,
  blockSize,
  flex: 'none',
  borderRadius: 'var(--env-radius-sm)',
  background: 'var(--env-color-bg-accent-emphasis)',
});

/** A layout box's edges, which it doesn't paint: a dashed outline around what it lays out. */
export const frame: CSSProperties = {
  boxSizing: 'border-box',
  border: '0.0625rem dashed var(--env-color-border-default)',
  borderRadius: 'var(--env-radius-md)',
};

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

/**
 * Glides the children of a layout box through its reflows for `settle` ms after `key` changes: a
 * child that jumps, as when it wraps to the next line or the columns change, is drawn where it was
 * and springs to where it lands, gathering speed and settling without overshooting, `speed` its
 * rate, while motion that is already smooth, such as a gap or a width in transition, passes through
 * as it is.
 */
export function useReflow(
  box: RefObject<HTMLElement | null>,
  key: unknown,
  { settle = 1800, speed = 13 }: { settle?: number; speed?: number } = {},
) {
  const places = useRef(new Map<Element, { laid: Place; offset: Place; velocity: Place }>());
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
      const decay = Math.exp(-speed * time);
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
          known.set(child, { laid, offset: { ...rest }, velocity: { ...rest } });
          continue;
        }
        const { offset, velocity } = place;
        for (const side of sides) {
          const step = laid[side] - place.laid[side];
          if (Math.abs(step) > jump) offset[side] -= step;
          // A critically damped spring, stepped exactly: x' = (x + (v + wx)t)e^-wt.
          const lead = velocity[side] + speed * offset[side];
          offset[side] = (offset[side] + lead * time) * decay;
          velocity[side] = (velocity[side] - speed * lead * time) * decay;
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
              (laid.width + offset.width) / (laid.width || 1)
            }, ${(laid.height + offset.height) / (laid.height || 1)})`;
      }
      if (now < end || moving) frame = requestAnimationFrame(tick);
    };
    // The first frame is measured before the change paints, so a jump the change itself makes,
    // such as a new alignment, is held where it was.
    tick(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [box, key, settle, speed]);
}

/**
 * The size of a box, in px, as it lays out now, for a frame around it that eases to it as a line
 * wraps or the columns change, rather than jumping.
 */
export function useSize(box: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<{ width: number; height: number }>();
  useLayoutEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setSize({ width: element.offsetWidth, height: element.offsetHeight }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [box]);
  return size;
}
