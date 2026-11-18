import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { PortalContainer, windowClasses, type WindowClass } from '@envsemble/envui';
import { onIdle, scrollerOf } from '../shared/Idle';
import { pixelTolerance, remeasure } from '../shared/Remeasure';
import { usePlayback } from './Playback';
import { remPixels } from '../shared/Lengths';
import { useLatest } from '../shared/useLatest';

const leastLegibleScale = 0.8;
const leastFitScale = 0.6;
const holdTimeMs = 1100;
const firstHoldMs = 400;
const travelBaseMs = 700;
const travelMsPerRem = 70;
const travelTime = (from: number, to: number) =>
  travelBaseMs + travelMsPerRem * Math.abs(to - from);
const ease = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
const sampleStepRem = 0.25;

const windowClassNames: Record<WindowClass, string> = {
  compact: 'Compact',
  medium: 'Medium',
  expanded: 'Expanded',
  large: 'Large',
};

function classOf(width: number) {
  let found: WindowClass = 'compact';
  for (const [name, from] of Object.entries(windowClasses) as [WindowClass, string][])
    if (width >= parseFloat(from)) found = name;
  return found;
}

const orderOf = (count: number) =>
  count < 2
    ? [0]
    : [
        ...Array.from({ length: count }, (_, index) => index),
        ...Array.from({ length: count - 2 }, (_, index) => count - 2 - index),
      ];

function widthAt(time: number, stops: readonly number[], hold: number) {
  const order = orderOf(stops.length);
  const legs = order.map((index, leg) => {
    const from = stops[index];
    const to = stops[order[(leg + 1) % order.length]];
    return { from, to, travel: from === to ? 0 : travelTime(from, to) };
  });
  const length = legs.reduce((sum, leg) => sum + hold + leg.travel, 0);
  let left = time % length;
  for (const leg of legs) {
    if (left < hold) return leg.from;
    left -= hold;
    if (left < leg.travel) return leg.from + (leg.to - leg.from) * ease(left / leg.travel);
    left -= leg.travel;
  }
  return stops[0];
}

interface SweepLayout {
  scale: number;
  stops: readonly number[];
  room: number;
  cropped: boolean;
}

function fitSweep(
  stops: readonly number[],
  space: number,
  rem: number,
  { fit, crop }: { fit: boolean; crop: boolean },
): SweepLayout {
  const least = fit ? leastFitScale : leastLegibleScale;
  let scale = Math.min(1, space / (Math.max(...stops) * rem));
  let limit = Infinity;
  const cropped = crop && scale < least;
  if (cropped) {
    scale = leastLegibleScale;
  } else if (scale < least) {
    scale = least;
    limit = Math.floor(space / (least * rem));
  }
  return { scale, stops: stops.map((width) => Math.min(width, limit)), room: space, cropped };
}

function tallestAlong(box: HTMLElement, narrowest: number, most: number) {
  let tallest = 0;
  for (let width = narrowest; width < most + sampleStepRem; width += sampleStepRem) {
    box.style.inlineSize = `${Math.min(width, most)}rem`;
    tallest = Math.max(tallest, box.offsetHeight);
  }
  return tallest;
}

const nearViews = 1;

function nearView(element: HTMLElement, scroller: Element | null) {
  const box = element.getBoundingClientRect();
  const view = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: innerHeight };
  const margin = nearViews * (view.bottom - view.top);
  return box.bottom > view.top - margin && box.top < view.bottom + margin;
}

function tallestWhenIdle(
  box: HTMLElement,
  narrowest: number,
  most: number,
  done: (tallest: number) => void,
) {
  let width = narrowest;
  let tallest = 0;
  let cancel = onIdle(function sample(time) {
    const own = box.style.inlineSize;
    do {
      box.style.inlineSize = `${Math.min(width, most)}rem`;
      tallest = Math.max(tallest, box.offsetHeight);
      width += sampleStepRem;
    } while (width < most + sampleStepRem && time.timeRemaining() > idleSampleTimeMs);
    box.style.inlineSize = own;
    if (width < most + sampleStepRem) cancel = onIdle(sample);
    else done(tallest);
  });
  return () => cancel();
}

const idleSampleTimeMs = 10;

const stopToleranceRem = 0.01;

function rulerWords(
  width: number,
  {
    stops,
    widths,
    classes,
  }: { stops: readonly number[]; widths: readonly number[]; classes: boolean | 'only' },
) {
  const exact = stops.find(
    (stop) => Math.abs(stop - width) < stopToleranceRem && widths.includes(stop),
  );
  const words = `${exact ?? Math.round(width)} rem`;
  const name = windowClassNames[classOf(width)];
  return classes === 'only' ? name : classes ? `${words} · ${name}` : words;
}

interface SweepParts {
  areaRef: RefObject<HTMLDivElement | null>;
  placeRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  layoutRef: RefObject<SweepLayout>;
  shownRef: RefObject<number>;
  drawRef: RefObject<(width: number) => void>;
}

function useSweepLayout(
  { areaRef, placeRef, frameRef, layoutRef, shownRef, drawRef }: SweepParts,
  key: string,
  { fit, crop }: { fit: boolean; crop: boolean },
) {
  useLayoutEffect(() => {
    const room = areaRef.current;
    const box = frameRef.current;
    const spot = placeRef.current;
    if (!room || !box || !spot) return;
    const stops = key.split(' ').map(Number);
    const tallestOf = new Map<string, number>();
    let sampling: { range: string; cancel: () => void } | null = null;
    const stopSampling = () => {
      sampling?.cancel();
      sampling = null;
    };
    const scroller = scrollerOf(room);
    let measuredStageWidth = 0;
    const measure = () => {
      const rem = remPixels();
      const outline = getComputedStyle(box);
      const edge = parseFloat(outline.outlineOffset) + parseFloat(outline.outlineWidth) || 0;
      const space = room.clientWidth - 2 * edge;
      const fitted = fitSweep(stops, space, rem, { fit, crop });
      const { scale, cropped } = fitted;
      const narrowest = Math.min(...fitted.stops);
      const most = Math.max(...fitted.stops);
      const range = `${rem} ${narrowest} ${most}`;
      let tallest = tallestOf.get(range);
      if (tallest === undefined && nearView(room, scroller)) {
        stopSampling();
        tallest = tallestAlong(box, narrowest, most);
        tallestOf.set(range, tallest);
      } else if (tallest === undefined && sampling?.range !== range) {
        stopSampling();
        sampling = {
          range,
          cancel: tallestWhenIdle(box, narrowest, most, (sampled) => {
            sampling = null;
            tallestOf.set(range, sampled);
            sweep.update();
          }),
        };
      }
      layoutRef.current = fitted;
      if (cropped) spot.dataset.cropped = '';
      else {
        delete spot.dataset.cropped;
        delete spot.dataset.cut;
        box.style.removeProperty('translate');
      }
      spot.style.setProperty(
        '--catalogue-sweep-widest',
        `${cropped ? space / rem : most * scale}rem`,
      );
      if (tallest !== undefined)
        spot.style.setProperty('--catalogue-sweep-height', `${tallest * scale}px`);
      spot.style.setProperty('--catalogue-sweep-scale', String(scale));
      drawRef.current(Math.min(Math.max(shownRef.current, narrowest), most));
    };
    const sweep = remeasure(
      (changed) => {
        if (changed.has('mutation') || changed.has('fonts')) {
          tallestOf.clear();
          stopSampling();
        } else if (
          changed.size === 1 &&
          changed.has('resize') &&
          room.clientWidth === measuredStageWidth
        )
          return;
        measuredStageWidth = room.clientWidth;
        measure();
      },
      {
        first: 'now',
        resize: [room],
        mutation: { target: box, options: { childList: true, subtree: true, characterData: true } },
        fonts: true,
      },
    );
    const approach = new IntersectionObserver(
      (entries) => {
        if (sampling && entries.some((entry) => entry.isIntersecting)) sweep.update();
      },
      { root: scroller, rootMargin: `${nearViews * 100}% 0px` },
    );
    approach.observe(room);
    return () => {
      sweep.stop();
      approach.disconnect();
      stopSampling();
    };
  }, [areaRef, placeRef, frameRef, layoutRef, shownRef, drawRef, key, fit, crop]);
}

function useSweepPlayback(
  { layoutRef, shownRef, drawRef }: SweepParts,
  { at, hold }: { at: number | undefined; hold: number },
) {
  const { playing, rest } = usePlayback();
  const clock = useRef(-1);
  const move = useRef<{ from: number; to: number; elapsed: number; duration: number } | null>(null);

  useEffect(() => {
    if (at === undefined) return;
    const to = layoutRef.current.stops[at] ?? shownRef.current;
    if (to === shownRef.current) return;
    move.current = {
      from: shownRef.current,
      to,
      elapsed: 0,
      duration: travelTime(shownRef.current, to),
    };
  }, [layoutRef, shownRef, at]);

  useEffect(() => {
    if (!playing) {
      if (rest === 'start') {
        clock.current = -1;
        move.current = null;
        drawRef.current(layoutRef.current.stops[at ?? 0] ?? shownRef.current);
      }
      return;
    }
    let last = performance.now();
    let request = 0;
    const tick = (now: number) => {
      const passed = now - last;
      last = now;
      if (at === undefined) {
        if (clock.current < 0) clock.current = hold - firstHoldMs;
        clock.current += passed;
        drawRef.current(widthAt(clock.current, layoutRef.current.stops, hold));
      } else if (move.current) {
        const current = move.current;
        current.elapsed = Math.min(current.duration, current.elapsed + passed);
        const progress = ease(current.elapsed / current.duration);
        drawRef.current(current.from + (current.to - current.from) * progress);
        if (current.elapsed >= current.duration) move.current = null;
      }
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [layoutRef, shownRef, drawRef, playing, rest, at, hold]);
}

export function WidthSweep({
  widths,
  at,
  hold = holdTimeMs,
  classes = false,
  fit = false,
  crop = false,
  ruler: showRuler = true,
  outline = true,
  children,
}: {
  widths: readonly number[];
  at?: number;
  hold?: number;
  classes?: boolean | 'only';
  fit?: boolean;
  crop?: boolean;
  ruler?: boolean;
  outline?: boolean;
  children: ReactNode;
}) {
  const area = useRef<HTMLDivElement>(null);
  const place = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const reading = useRef<HTMLSpanElement>(null);
  const [overlays, setOverlays] = useState<HTMLDivElement | null>(null);
  const layout = useRef<SweepLayout>({ scale: 1, stops: widths, room: 0, cropped: false });
  const shown = useRef(widths[at ?? 0] ?? 0);

  const draw = (width: number) => {
    shown.current = width;
    const { scale, stops, room, cropped } = layout.current;
    frame.current?.style.setProperty('inline-size', `${width}rem`);
    let rulerWidth = width * scale;
    if (cropped && place.current) {
      const rem = remPixels();
      const overflowPx = Math.max(0, width * scale * rem - room);
      frame.current?.style.setProperty('translate', `${overflowPx / 2}px 0`);
      const cut = overflowPx > pixelTolerance ? 'end' : '';
      if (place.current.dataset.cut !== cut) place.current.dataset.cut = cut;
      rulerWidth = Math.min(rulerWidth, room / rem);
    }
    ruler.current?.style.setProperty('--catalogue-sweep-width', `${rulerWidth}rem`);
    if (reading.current) {
      const text = rulerWords(width, { stops, widths, classes });
      if (reading.current.textContent !== text) reading.current.textContent = text;
    }
  };
  const drawRef = useLatest(draw);
  const parts: SweepParts = {
    areaRef: area,
    placeRef: place,
    frameRef: frame,
    layoutRef: layout,
    shownRef: shown,
    drawRef,
  };
  useSweepLayout(parts, widths.join(' '), { fit, crop });
  useSweepPlayback(parts, { at, hold });

  return (
    <div ref={area} className="catalogue-width-sweep">
      <div ref={place} className="catalogue-width-sweep-place">
        {showRuler && (
          <div ref={ruler} className="catalogue-width-ruler" aria-hidden="true">
            <span ref={reading} className="catalogue-width-ruler-reading" />
          </div>
        )}
        <div className="catalogue-width-sweep-room">
          <div
            ref={frame}
            className="catalogue-width-sweep-frame"
            data-outline={outline ? undefined : 'none'}
          >
            <PortalContainer container={overlays} contained>
              {children}
            </PortalContainer>
            <div ref={setOverlays} className="catalogue-width-sweep-overlays" />
          </div>
        </div>
      </div>
    </div>
  );
}
