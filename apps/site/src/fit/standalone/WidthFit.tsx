/*
 * Frames that lay out at a set width and are drawn smaller when their stage is narrower, down to
 * `leastFitScale`: a width frame of an Adapting to width figure (WidthBox, used by LiveExample.tsx)
 * and an anatomy figure's subject that shows all its parts only from a certain width (FitFrame,
 * used by AnatomyFigure.tsx). The frame is scaled, not resized, so it keeps laying out at its own
 * width.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { remPixels } from '@envui-internal/internal/dom/lengths';
import { pixelTolerance, remeasure } from '../../shared/Remeasure';
import { flag } from '@envui-internal/internal/flag';

/** The least scale a frame is drawn at; a frame that would need a smaller one scrolls instead. */
const leastFitScale = 0.7;

/** A frame drawn smaller: its scale, and its drawn width and height in px. */
interface Scaled {
  scale: number;
  width: number;
  height: number;
}

/**
 * A frame `width` by `height` drawn at `scale`, or undefined when `scale` is 1 or more, or below
 * `leastFitScale`.
 */
const scaledAt = (scale: number, width: number, height: number): Scaled | undefined =>
  scale < 1 && scale >= leastFitScale
    ? { scale, width: width * scale, height: height * scale }
    : undefined;

/**
 * A state updater that keeps the current object when the size is the same within pixelTolerance,
 * so React does not render again and the stage, which grows with the frame, settles.
 */
const keepSize = (next: Scaled | undefined) => (current: Scaled | undefined) =>
  current &&
  next &&
  Math.abs(current.width - next.width) < pixelTolerance &&
  Math.abs(current.height - next.height) < pixelTolerance
    ? current
    : next;

/**
 * A frame `width` rem wide for an example, drawn smaller where the stage is narrower than the
 * frame and its outline, down to `leastFitScale`, so an Adapting to width figure's frames fit a
 * column beside the page's contents. A frame that would need a smaller scale keeps its own size
 * instead, as on a phone: it scrolls across the stage from its start (`data-cropped`), and fades
 * out at an edge where it continues past it (`data-cut`), as a cropped sweep or device does,
 * rather than ending in a slice through its words.
 */
export function WidthBox({ width, children }: { width: number; children: ReactNode }) {
  const fit = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scaled, setScaled] = useState<Scaled>();
  /** Whether the frame is too wide for its stage even at `leastFitScale`, so it scrolls. */
  const [cropped, setCropped] = useState(false);
  useLayoutEffect(() => {
    const frame = box.current;
    const place = fit.current;
    const stage = place?.parentElement;
    if (!frame || !place || !stage || typeof ResizeObserver === 'undefined') return;
    /** Marks the edges where the frame continues past its scroll box (`data-cut`), which fade. */
    const markCuts = () => {
      const most = place.scrollWidth - place.clientWidth;
      // The distance from the start in either text direction: in right-to-left text,
      // scrollLeft runs from 0 down to negative values.
      const along = Math.abs(place.scrollLeft);
      const cut = [along > pixelTolerance && 'start', most - along > pixelTolerance && 'end']
        .filter(Boolean)
        .join(' ');
      if ((place.dataset.cut ?? '') !== cut) {
        if (cut) place.dataset.cut = cut;
        else delete place.dataset.cut;
      }
    };
    const measure = () => {
      const style = getComputedStyle(stage);
      const room =
        stage.clientWidth -
        parseFloat(style.paddingInlineStart) -
        parseFloat(style.paddingInlineEnd);
      // The frame's outline, at its offset, needs space on both sides too.
      const outline = getComputedStyle(frame);
      const edge = parseFloat(outline.outlineOffset) + parseFloat(outline.outlineWidth);
      const scale = room / (frame.offsetWidth + 2 * edge);
      setCropped(scale < leastFitScale);
      markCuts();
      setScaled(keepSize(scaledAt(scale, frame.offsetWidth, frame.offsetHeight)));
    };
    // Measured in the next frame after any of these resizes, since resizing the frame's scroll
    // box resizes the stage. The scroll box is observed too, because it takes the stage's width
    // once the frame is cropped.
    const widths = remeasure(measure, { resize: [stage, frame, place] });
    place.addEventListener('scroll', markCuts, { passive: true });
    return () => {
      widths.stop();
      place.removeEventListener('scroll', markCuts);
    };
  }, []);
  return (
    <div
      ref={fit}
      className="catalogue-width-fit"
      data-scaled={flag(scaled)}
      data-cropped={flag(cropped)}
      // A cropped frame scrolls, so it takes focus for keyboard scrolling.
      tabIndex={cropped ? 0 : undefined}
      style={scaled && { inlineSize: scaled.width, blockSize: scaled.height }}
    >
      <div
        ref={box}
        className="catalogue-width-box"
        style={{ inlineSize: `${width}rem`, transform: scaled && `scale(${scaled.scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * An anatomy subject that shows all its parts only from a certain width, such as panes side by
 * side. It lays out at `width` rem and is drawn smaller where the stage is narrower, down to
 * `leastFitScale`, as WidthBox is; the callouts measure the parts as drawn. On a stage narrower
 * still, it lays out at the stage's width and shows the parts that width has.
 */
export function FitFrame({ width, children }: { width: number; children: ReactNode }) {
  const fit = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scaled, setScaled] = useState<Scaled>();
  useLayoutEffect(() => {
    const frame = box.current;
    const subject = fit.current?.parentElement;
    if (!frame || !subject) return;
    const measure = () => {
      const needed = width * remPixels();
      setScaled(keepSize(scaledAt(subject.clientWidth / needed, needed, frame.offsetHeight)));
    };
    return remeasure(measure, { resize: [subject, frame] }).stop;
  }, [width]);
  return (
    <div
      ref={fit}
      className="catalogue-anatomy-fit"
      data-scaled={flag(scaled)}
      style={scaled && { inlineSize: scaled.width, blockSize: scaled.height }}
    >
      <div
        ref={box}
        className="catalogue-anatomy-fit-box"
        style={scaled && { inlineSize: `${width}rem`, transform: `scale(${scaled.scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
