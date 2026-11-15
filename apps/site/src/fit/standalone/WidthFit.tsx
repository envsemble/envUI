import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { remPixels } from '../../shared/Lengths';
import { pixelTolerance, remeasure } from '../../shared/Remeasure';
import { flag } from '../../shared/Attributes';

const leastFitScale = 0.7;

interface Scaled {
  scale: number;
  width: number;
  height: number;
}

const scaledAt = (scale: number, width: number, height: number): Scaled | undefined =>
  scale < 1 && scale >= leastFitScale
    ? { scale, width: width * scale, height: height * scale }
    : undefined;

const keepSize = (next: Scaled | undefined) => (current: Scaled | undefined) =>
  current &&
  next &&
  Math.abs(current.width - next.width) < pixelTolerance &&
  Math.abs(current.height - next.height) < pixelTolerance
    ? current
    : next;

export function WidthBox({ width, children }: { width: number; children: ReactNode }) {
  const fit = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scaled, setScaled] = useState<Scaled>();
  const [cropped, setCropped] = useState(false);
  useLayoutEffect(() => {
    const frame = box.current;
    const place = fit.current;
    const stage = place?.parentElement;
    if (!frame || !place || !stage || typeof ResizeObserver === 'undefined') return;
    const markCuts = () => {
      const scrollRange = place.scrollWidth - place.clientWidth;
      const scrolledFromStart = Math.abs(place.scrollLeft);
      const cut = [
        scrolledFromStart > pixelTolerance && 'start',
        scrollRange - scrolledFromStart > pixelTolerance && 'end',
      ]
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
      const outline = getComputedStyle(frame);
      const outlineReach = parseFloat(outline.outlineOffset) + parseFloat(outline.outlineWidth);
      const scale = room / (frame.offsetWidth + 2 * outlineReach);
      setCropped(scale < leastFitScale);
      markCuts();
      setScaled(keepSize(scaledAt(scale, frame.offsetWidth, frame.offsetHeight)));
    };
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
