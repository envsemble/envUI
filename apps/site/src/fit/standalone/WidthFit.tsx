/*
 * A figure's frame laid out at a width of its own and drawn smaller where its stage is narrower,
 * down to `leastFitScale`: a width frame of an Adapting to width figure (WidthBox, LiveExample.tsx)
 * and an anatomy figure's subject that shows all its parts only from a width (FitFrame,
 * AnatomyFigure.tsx). The frame still lays out at its own width, as it is scaled rather than
 * resized.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { remPixels } from '@envui-internal/internal/dom/lengths';
import { pixelTolerance } from '../FitGeometry';
import { remeasure } from '../Remeasure';
import { flag } from '@envui-internal/internal/flag';

/** The least a width frame is drawn at to fit its stage; one that would need less scrolls. */
const leastFitScale = 0.7;

/** A frame drawn smaller: its scale, and the room it takes at it. */
interface Scaled {
  scale: number;
  width: number;
  height: number;
}

/** A frame `width` by `height` drawn at `scale`, where that is smaller, down to `leastFitScale`. */
const scaledAt = (scale: number, width: number, height: number): Scaled | undefined =>
  scale < 1 && scale >= leastFitScale
    ? { scale, width: width * scale, height: height * scale }
    : undefined;

/** Unchanged sizes keep the state, so the stage, which grows with the frame, settles. */
const keepSize = (next: Scaled | undefined) => (current: Scaled | undefined) =>
  current &&
  next &&
  Math.abs(current.width - next.width) < pixelTolerance &&
  Math.abs(current.height - next.height) < pixelTolerance
    ? current
    : next;

/**
 * A frame of a given width for an example, drawn smaller where its stage is narrower than the
 * frame and its outline, down to `leastFitScale`, so the frames of an Adapting to width figure fit
 * a column beside the page's contents. A frame that would need to be smaller still keeps its size,
 * as on a phone: it scrolls across the stage, seen from its start, and fades out at an edge where
 * it runs on past it, as a cropped sweep or device does, rather than ending in a slice through its
 * words.
 */
export function WidthBox({ width, children }: { width: number; children: ReactNode }) {
  const fit = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scaled, setScaled] = useState<Scaled>();
  /** Whether the frame is wider than its stage even at `leastFitScale`, and scrolls across it. */
  const [cropped, setCropped] = useState(false);
  useLayoutEffect(() => {
    const frame = box.current;
    const place = fit.current;
    const stage = place?.parentElement;
    if (!frame || !place || !stage || typeof ResizeObserver === 'undefined') return;
    /** Marks the edges where the frame runs on past its place, which fade out. */
    const markCuts = () => {
      const most = place.scrollWidth - place.clientWidth;
      // From the start, whichever way the text runs: scrollLeft counts down from 0 right to left.
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
      // The outline beside the frame, at its offset, needs room on both sides too.
      const outline = getComputedStyle(frame);
      const edge = parseFloat(outline.outlineOffset) + parseFloat(outline.outlineWidth);
      const scale = room / (frame.offsetWidth + 2 * edge);
      setCropped(scale < leastFitScale);
      markCuts();
      setScaled(keepSize(scaledAt(scale, frame.offsetWidth, frame.offsetHeight)));
    };
    // Measured in the next frame as any of these resizes, as resizing the frame's place resizes
    // the stage it observes; its place too, which takes the stage's width once the frame is cropped.
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
      // Cropped, it scrolls across the stage, so the keyboard can scroll it too.
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
 * A subject that shows all its parts only from a width, such as panes side by side, laid out at
 * that width, in rem, and drawn smaller where the stage is narrower, down to `leastFitScale`, as a
 * width frame is; the callouts measure the parts as drawn. On a stage narrower still, it lays out
 * at the stage's width, and shows the parts that width has.
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
