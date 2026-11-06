import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PortalContainer, windowClasses, type WindowClass } from '@envsemble/envui';
import { usePlayback } from './Motion';

/*
 * An Adapting to width figure that plays: the example in one frame whose width sweeps between the
 * widths a page gives, held a moment at each, while the example reflows for real, as its container
 * queries see the frame. A faint ruler above the frame names its width, and its window class where
 * the page asks. The figure keeps one height throughout, the tallest the example takes on the way,
 * and the frame, centred, is drawn at one scale, chosen once for the stage, so a wide frame is never clipped
 * or drawn in tiny text: where the widest width doesn't fit even at the least scale, the frame
 * sweeps only as wide as the stage can show, or with `crop`, as wide as it is, cut off at the
 * stage's end, seen from its start. What the example opens, such as a sheet or a menu, opens in the
 * frame, as it would in a window of that width, rather than over the whole stage.
 */

/** The least scale a frame is drawn at; a stage narrower than that shows a narrower sweep. */
const leastScale = 0.8;
/**
 * The least scale of a frame that fits its widest width (`fit`), for an example that changes only
 * at a width wider than the column, such as a diff side by side.
 */
const leastFitScale = 0.6;
/** How long the frame holds at each width, in ms. */
const holdTime = 1100;
/** How long it holds at its first width as it starts playing: an animation starts at once. */
const firstHold = 400;
/** How long the frame takes from one width to another: a little longer for a longer way. */
const travelTime = (from: number, to: number) => 700 + 70 * Math.abs(to - from);
/** Eases a move in and out, gently, as a window's edge dragged by hand. */
const ease = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
/** How finely the example's height is sampled along the sweep, in rem. */
const sampleStep = 0.25;

/** Each window class's name, in plain words. */
const classNames: Record<WindowClass, string> = {
  compact: 'Compact',
  medium: 'Medium',
  expanded: 'Expanded',
  large: 'Large',
};

/** The window class of a width in rem. */
function classOf(width: number) {
  let found: WindowClass = 'compact';
  for (const [name, from] of Object.entries(windowClasses) as [WindowClass, string][])
    if (width >= parseFloat(from)) found = name;
  return found;
}

/**
 * The order the frame visits its widths in, by index: on through them and back, so 22, 40 and 64
 * go 22, 40, 64, 40 and back to 22.
 */
const orderOf = (count: number) =>
  count < 2
    ? [0]
    : [
        ...Array.from({ length: count }, (_, index) => index),
        ...Array.from({ length: count - 2 }, (_, index) => count - 2 - index),
      ];

/** The frame's width at a time of its loop, which holds at each width and then moves on. */
function widthAt(time: number, stops: readonly number[], hold: number) {
  const order = orderOf(stops.length);
  const legs = order.map((index, leg) => {
    const from = stops[index]!;
    const to = stops[order[(leg + 1) % order.length]!]!;
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
  return stops[0]!;
}

/**
 * The example in a frame whose width sweeps between `widths`, in rem, the first its still: on
 * through them and back again, held `hold` ms at each, while its preview plays (Playback), and
 * held where it is when paused. Place it in a MotionStage. With `at`, it sweeps by itself no
 * longer: it moves to the width at that index whenever `at` changes, for a figure that does more
 * at a width, such as opening a sheet at the narrow end, driven by a useTimeline step or a cue.
 * `classes` names the window class beside the width, for an example that changes at one, or in
 * its place with `'only'`, on a page that shows no lengths, such as a foundation's; `fit` draws the
 * frame smaller where it must, to 0.6, to reach its widest width on the stage; `crop`, where the
 * widest doesn't fit even so, draws it at 0.8 and cuts it off at the stage's end instead, seen
 * from its start, where its content begins, and never panned, so a wide layout that needs more
 * room than a phone's stage has still shows, legibly; `ruler={false}`
 * leaves the ruler out, for a figure whose point isn't the width in numbers; and `outline={false}`
 * leaves the frame's dashed edge out too, for a figure that only needs a width of its own, drawn
 * smaller on a narrower stage, such as a dock with room for two panels.
 */
export function WidthSweep({
  widths,
  at,
  hold = holdTime,
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
  const { playing, rest } = usePlayback();
  const area = useRef<HTMLDivElement>(null);
  const place = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const reading = useRef<HTMLSpanElement>(null);
  /** The layer in the frame that the example's overlays render into. */
  const [overlays, setOverlays] = useState<HTMLDivElement | null>(null);
  /**
   * The scale the frame is drawn at, the widths it sweeps between on this stage, whether it is cut
   * off at the stage's edges (`crop`), and the room it shows in, in px, inside its outline.
   */
  const layout = useRef({ scale: 1, stops: widths, room: 0, cropped: false });
  /** The width the frame shows now, in rem. */
  const shown = useRef(widths[at ?? 0] ?? 0);
  /** Where the sweep is in its loop, in ms of play; below 0 before it first plays. */
  const clock = useRef(-1);
  /** A move to the width `at` names, under way. */
  const move = useRef<{ from: number; to: number; elapsed: number; duration: number } | null>(null);
  const key = widths.join(' ');

  /**
   * Draws the frame at a width: its size, the ruler's, and the ruler's words; cropped, whether its
   * end is cut off.
   */
  const draw = (width: number) => {
    shown.current = width;
    const { scale, stops, room, cropped } = layout.current;
    frame.current?.style.setProperty('inline-size', `${width}rem`);
    let rulerWidth = width * scale;
    if (cropped && place.current) {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // How far the frame, centred, runs out past the room: moved by half of that, it shows from
      // its start.
      const over = Math.max(0, width * scale * rem - room);
      frame.current?.style.setProperty('translate', `${over / 2}px 0`);
      const cut = over > 0.5 ? 'end' : '';
      if (place.current.dataset.cut !== cut) place.current.dataset.cut = cut;
      rulerWidth = Math.min(rulerWidth, room / rem);
    }
    ruler.current?.style.setProperty('--catalogue-sweep-width', `${rulerWidth}rem`);
    if (reading.current) {
      // At a width the page gives, its exact value; on the way, and at a width the stage narrowed,
      // whole rem, which change calmly.
      const exact = stops.find((stop) => Math.abs(stop - width) < 0.01 && widths.includes(stop));
      const words = `${exact ?? Math.round(width)} rem`;
      const name = classNames[classOf(width)];
      const text = classes === 'only' ? name : classes ? `${words} · ${name}` : words;
      // The same words leave the text as it is: setting it replaces the text node, which the
      // page's :has() rules restyle much of the page for, on each frame the stage resizes.
      if (reading.current.textContent !== text) reading.current.textContent = text;
    }
  };
  const drawRef = useRef(draw);
  useLayoutEffect(() => {
    drawRef.current = draw;
  });

  // The scale and the height, chosen once for the stage, again only as the stage or the example
  // changes: the scale that shows the widest width, or the least one with a narrower sweep, and
  // the tallest the example is anywhere along it.
  useLayoutEffect(() => {
    const room = area.current;
    const box = frame.current;
    const spot = place.current;
    if (!room || !box || !spot) return;
    const stops = key.split(' ').map(Number);
    /** The tallest the example is along a sweep, by the root's font size and the sweep's ends. */
    const tallestOf = new Map<string, number>();
    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const outline = getComputedStyle(box);
      const edge = parseFloat(outline.outlineOffset) + parseFloat(outline.outlineWidth) || 0;
      const space = room.clientWidth - 2 * edge;
      const widest = Math.max(...stops);
      const least = fit ? leastFitScale : leastScale;
      let scale = Math.min(1, space / (widest * rem));
      let limit = Infinity;
      const cropped = crop && scale < least;
      if (cropped) {
        // Cut off, at the scale that keeps its text legible, rather than at a fit's least.
        scale = leastScale;
      } else if (scale < least) {
        scale = least;
        // In whole rem, so the ruler names the narrower width as it names the others.
        limit = Math.floor(space / (least * rem));
      }
      const shownStops = stops.map((width) => Math.min(width, limit));
      const narrowest = Math.min(...shownStops);
      const most = Math.max(...shownStops);
      // The frame's height follows its own width alone, not the stage's, so a sweep already
      // sampled keeps its tallest as the stage resizes, such as while the drawer beside the page
      // is dragged: a layout for each sample, every frame, made that drag lag.
      const range = `${rem} ${narrowest} ${most}`;
      let tallest = tallestOf.get(range);
      if (tallest === undefined) {
        tallest = 0;
        for (let width = narrowest; width < most + sampleStep; width += sampleStep) {
          box.style.inlineSize = `${Math.min(width, most)}rem`;
          tallest = Math.max(tallest, box.offsetHeight);
        }
        tallestOf.set(range, tallest);
      }
      layout.current = { scale, stops: shownStops, room: space, cropped };
      if (cropped) spot.dataset.cropped = '';
      else {
        delete spot.dataset.cropped;
        delete spot.dataset.cut;
        box.style.removeProperty('translate');
      }
      // Cropped, the place is the stage's width, and the frame runs out past it.
      spot.style.setProperty(
        '--catalogue-sweep-widest',
        `${cropped ? space / rem : most * scale}rem`,
      );
      spot.style.setProperty('--catalogue-sweep-height', `${tallest * scale}px`);
      spot.style.setProperty('--catalogue-sweep-scale', String(scale));
      drawRef.current(Math.min(Math.max(shown.current, narrowest), most));
    };
    measure();
    // Measured again in the next frame where the stage's width changes, or the example's content,
    // such as once it has loaded, and once the fonts have.
    let request = 0;
    const later = () => {
      cancelAnimationFrame(request);
      request = requestAnimationFrame(measure);
    };
    /** As later, sampling the example's height afresh, which its content and fonts change. */
    const afresh = () => {
      tallestOf.clear();
      later();
    };
    let width = room.clientWidth;
    const resize = new ResizeObserver(() => {
      if (room.clientWidth === width) return;
      width = room.clientWidth;
      later();
    });
    resize.observe(room);
    const content = new MutationObserver(afresh);
    content.observe(box, { childList: true, subtree: true, characterData: true });
    void document.fonts?.ready.then(afresh);
    return () => {
      cancelAnimationFrame(request);
      resize.disconnect();
      content.disconnect();
    };
  }, [key, fit, crop]);

  // Given `at`, the frame moves to its width whenever it changes.
  useEffect(() => {
    if (at === undefined) return;
    const to = layout.current.stops[at] ?? shown.current;
    if (to === shown.current) return;
    move.current = { from: shown.current, to, elapsed: 0, duration: travelTime(shown.current, to) };
  }, [at]);

  // The sweep's clock runs only while the preview plays; stopped, a preview that rests at its
  // start is back at its first width, and a paused one holds where it is.
  useEffect(() => {
    if (!playing) {
      if (rest === 'start') {
        clock.current = -1;
        move.current = null;
        drawRef.current(layout.current.stops[at ?? 0] ?? shown.current);
      }
      return;
    }
    let last = performance.now();
    let request = 0;
    const tick = (now: number) => {
      const passed = now - last;
      last = now;
      if (at === undefined) {
        if (clock.current < 0) clock.current = hold - firstHold;
        clock.current += passed;
        drawRef.current(widthAt(clock.current, layout.current.stops, hold));
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
  }, [playing, rest, at, hold]);

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
            {/* The frame stands in for the window: its overlays belong to it, and its transform
                makes it their fixed overlays' containing block, so a sheet opens across the
                frame's width and its backdrop covers the frame, not the stage. */}
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
