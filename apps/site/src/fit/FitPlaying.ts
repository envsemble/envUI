/*
 * The decisions of a fit as a gallery's tile plays (useFit.ts): its view stays where it rested,
 * and is drawn out only for what it opens (decideDrawOut), brought on to what its pointer heads to
 * (decideHeading), and cut off where it reaches past the stage (decidePlayCut). Each is returned
 * for the fit to keep and to ease the view to (glideTo, ViewEasing.ts), and writes nothing: a step
 * goes from where the one before left the view.
 */
import { remPixels } from '@envui-internal/internal/dom/lengths';
import { cropFade } from './FitDraw';
import {
  contain,
  covers,
  cursorLength,
  cursorRoom,
  cutSides,
  drawOut,
  join,
  legibleScale,
  margin,
  scaleTolerance,
  stagePoint,
  type Box,
} from './FitGeometry';
import type { FitKind, StageScript } from './FitKind';
import type { Scales } from './FitMeasure';
import { elementsOf, inkOf, inPopup, partOf, settling, type Shown } from './PaintedBoxes';
import { heading } from './PointerCourse';
import type { Target } from './ViewEasing';

/**
 * A playing tile's run: the elements its still showed, in the canvas's own px; the scale it is
 * drawn at, which only falls until it rests; and what opened outside the view, until it has held
 * its place.
 */
export interface Run {
  rested: Map<Element, Box>;
  scale: number;
  pending: Box | null;
  /** Where its view rested, the sides it was cut off at, and whether it has moved since. */
  at: { x: number; y: number; scale: number };
  cut: string[];
  moved: boolean;
}

/** A tile's stage and canvas. */
interface Stage {
  stage: HTMLElement;
  canvas: HTMLElement;
}

/**
 * The trigger of what a playing tile opens, such as a select's or a menu's button or a combobox's
 * input: its view is drawn out about it (drawOut).
 */
const triggers =
  "[data-popup-open], [aria-haspopup][aria-expanded='true'], [role='combobox'][aria-expanded='true']";

/** A tile's run as it starts playing: what its still shows, and where its view rests. */
export function startRun(boxes: Shown[], view: Target, cut: string | undefined): Run {
  return {
    rested: boxes.reduce(
      // Each element's boxes joined: join of a box and another is never none.
      (rested, { element, box }) => rested.set(element, join(rested.get(element) ?? null, box)!),
      new Map<Element, Box>(),
    ),
    scale: view.toScale,
    pending: null,
    at: { x: view.toX, y: view.toY, scale: view.toScale },
    cut: cut?.split(' ') ?? [],
    moved: false,
  };
}

/**
 * As a gallery's tile plays, its view stays where it rested, as the pointer comes in and while
 * what it does stays in its still, such as a tree's branch opening in place. Only once it opens
 * something that needs more room, a popup or what grows in one, such as a palette's results, is
 * it drawn out, as that opens: about the trigger that opened it, which stays where it is, or moves
 * only as far as the popup needs, easing there (drawOut). It is drawn no larger again until it
 * rests, so what closes and opens again doesn't move it in and out, and every time it plays it
 * does the same. What still doesn't fit is shown from its start, cut off past the stage's edge,
 * where it fades out.
 *
 * It is never drawn below the least it is drawn at, its popup's or a scene's, so its words stay
 * legible; a component's is drawn at its still's scale or at that least, never between. What
 * opened is followed once it has held its place from one frame to the next: `pending` until then,
 * which fits it again. A tile that holds its view, its still written as its largest state, moves
 * for nothing.
 */
export function decideDrawOut(
  { stage, canvas }: Stage,
  kind: FitKind,
  script: StageScript,
  boxes: Shown[],
  { popupLeast }: Scales,
  run: Run,
  view: Target & { rest: number },
): { run: Run; target: Target | null } {
  const component = kind.scale === 'own';
  const least = Math.min(view.rest, component ? popupLeast : legibleScale);
  const stepped = (scale: number) =>
    component ? (scale >= view.rest - scaleTolerance ? view.rest : least) : scale;
  const across = stage.clientWidth;
  const down = stage.clientHeight;
  // What the script acts on in a popup, such as a select's options, and what the tile names
  // anywhere, such as a panel it opens (StageScript).
  const query = (selector: string) => elementsOf(canvas, selector);
  const named = [...script.named.flatMap(query).filter(inPopup), ...script.anywhere.flatMap(query)]
    .filter((element) => element.checkVisibility({ visibilityProperty: true }))
    .map((element) => inkOf(element, canvas))
    .filter((box) => box.right > box.left && box.bottom > box.top);
  // What opens, a popup, and what grows in one, such as a palette's results: a popup on its way in
  // is measured by the box that places it, untransformed, as it ends.
  const opened = boxes
    .filter(({ element, box }) => {
      // What is closing needs no room.
      if (!inPopup(element) || element.closest('[data-ending-style]')) return false;
      const still = run.rested.get(element);
      return !still || !covers(still, box);
    })
    .map(({ element, box }) => {
      const holder =
        !run.rested.has(element) && settling(element, canvas)
          ? element.closest('.env-popup-positioner, .env-menu-positioner, .env-tooltip-positioner')
          : null;
      return holder && canvas.contains(holder) ? partOf(holder, canvas) : box;
    });
  const must = join(...named, ...opened);
  const at = { x: view.toX, y: view.toY, scale: view.toScale };
  const screen = (point: number, to: number, size: number) => stagePoint(point, to, size, at.scale);
  // What the view shows already, such as a popup that closes and opens again, moves nothing.
  const shown =
    must &&
    screen(must.left, at.x, across) >= -1 &&
    screen(must.right, at.x, across) <= across + 1 &&
    screen(must.top, at.y, down) >= -1 &&
    screen(must.bottom, at.y, down) <= down + 1;
  // What opens is placed by its style a frame or two after it shows: the view follows it once it
  // has held its place from one frame to the next, not to where it first showed.
  const placed =
    must && run.pending !== null && covers(run.pending, must) && covers(must, run.pending);
  const holds = script.holdsView;
  const next = { ...run, pending: must && !shown && !placed && !holds ? must : null };
  if (!must || shown || !placed || holds) return { run: next, target: null };
  // The trigger, outside the popups, with its field's label, which floats over its edge, where the
  // stage shows it.
  const trigger = [...canvas.querySelectorAll(triggers)].find(
    (element) =>
      !inPopup(element) &&
      element.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
  );
  const label = trigger?.closest('.env-field')?.querySelector('.env-field-label');
  const anchor = trigger
    ? join(partOf(trigger, canvas), label ? partOf(label, canvas) : null)
    : null;
  const drawn = drawOut({ must, anchor, at, across, down, scale: run.scale, least, stepped });
  return {
    run: { ...next, scale: drawn.scale },
    target: {
      toX: drawn.toX,
      toY: drawn.toY,
      toScale: drawn.scale,
      zoomed: drawn.scale < view.rest,
    },
  };
}

/**
 * Brings what the pointer heads to, such as a row below the stage's foot, into the stage before it
 * gets there, easing just far enough: down the stage, it is kept above the whole fade at the
 * stage's foot where it fades, and the cursor on it inside the stage; what is there already moves
 * nothing, and none is returned.
 */
export function decideHeading(
  { stage, canvas }: Stage,
  script: StageScript,
  view: Target,
): Target | null {
  const box = heading(canvas, script);
  if (!box) return null;
  const across = stage.clientWidth;
  const down = stage.clientHeight;
  const toX = contain(view.toX, box.left * view.toScale, box.right * view.toScale, across / 2 - 4);
  const scale = view.toScale;
  // The fade as long as it is drawn, shortened below what its pointer heads to at rest. A tile's
  // canvas plays in its crop (TileStage.tsx).
  const crop = canvas.parentElement!;
  const shortened = crop.style.getPropertyValue('--catalogue-crop-bottom');
  const fade = canvas.dataset.cut?.split(' ').includes('bottom')
    ? shortened
      ? parseFloat(shortened) || 0
      : cropFade(crop) || 0
    : 0;
  const aim = script.heading;
  const aimed = aim && script.aimed(aim.selector);
  const own = aimed ? partOf(aimed, canvas) : null;
  const tip = own && aim ? own.top + (own.bottom - own.top) * aim.y : box.bottom;
  const foot = Math.max(
    box.bottom * scale + fade,
    (tip + cursorLength * remPixels()) * scale + cursorRoom,
  );
  const toY = Math.min(Math.max(view.toY, foot - down / 2), box.top * scale + down / 2 - margin);
  return Math.hypot(toX - view.toX, toY - view.toY) >= 1
    ? { toX, toY, toScale: view.toScale, zoomed: view.zoomed }
    : null;
}

/**
 * The sides a playing tile is cut off at: what reaches past the stage's edges, where the view goes;
 * until its view moves, also where its still was, so the pointer coming in changes nothing. A held
 * view is cut off where its still was, also as what it shows moves within it. With them, its run,
 * marked as moved once its view has. `room` is the stage's size.
 */
export function decidePlayCut(
  { across, down }: { across: number; down: number },
  boxes: { box: Box }[],
  run: Run,
  view: Target,
  holdsView: boolean,
): { cut: string; run: Run } {
  const moved =
    run.moved ||
    Math.abs(view.toX - run.at.x) >= 0.5 ||
    Math.abs(view.toY - run.at.y) >= 0.5 ||
    Math.abs(view.toScale - run.at.scale) >= scaleTolerance;
  const sides = new Set(
    holdsView
      ? run.cut
      : cutSides(
          // A fit plays only what paints something (shownBoxes), so their join is a box.
          join(...boxes.map(({ box }) => box))!,
          across,
          down,
          view.toX,
          view.toY,
          view.toScale,
        ).split(' '),
  );
  if (!moved) for (const side of run.cut) sides.add(side);
  sides.delete('');
  return { cut: [...sides].join(' '), run: moved === run.moved ? run : { ...run, moved } };
}
