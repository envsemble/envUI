/*
 * The fit's decisions while a gallery's tile plays (useFit.ts). The view starts where the tile
 * rested and changes only to draw out for what the tile opens (decideDrawOut), to bring the
 * pointer's heading into view (decideHeading), and to cut off what reaches past the stage
 * (decidePlayCut). The functions return their decisions for the fit to keep and to ease the view
 * to (glideTo, ViewEasing.ts); they write nothing. Each step starts from where the previous one
 * left the view.
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
import { stageSize, type Scales, type StageSize } from './FitMeasure';
import { elementsOf, inkOf, inPopup, partOf, settling, type Shown } from './PaintedBoxes';
import { heading } from './PointerCourse';
import type { Target } from './ViewEasing';
import { pixelTolerance } from '../shared/Remeasure';

/**
 * The state of one play of a tile, from when it starts playing until it rests:
 * - `rested`: each element its still showed, with its box in the canvas's own px;
 * - `scale`: the scale the play is drawn at, which only falls until the tile rests;
 * - `pending`: what opened outside the view, until it has stayed in place for one frame.
 */
export interface Run {
  rested: Map<Element, Box>;
  scale: number;
  pending: Box | null;
  /** Where the view rested, the sides it was cut off at then, and whether it has moved since. */
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
 * The trigger of a popup a playing tile opens, such as a select's or a menu's button or a
 * combobox's input. The view is drawn out around it (drawOut).
 */
const triggers =
  "[data-popup-open], [aria-haspopup][aria-expanded='true'], [role='combobox'][aria-expanded='true']";

/** A new run as a tile starts playing: the boxes its still shows, and where its view rests. */
export function startRun(boxes: Shown[], view: Target, cut: string | undefined): Run {
  return {
    rested: boxes.reduce(
      // Each element's boxes joined into one; `box` is never null, so neither is the join.
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
 * Decides whether a playing tile's view draws out (moves and gets smaller) for what it opened.
 * Returns the updated run, and the view's new target, or null to leave the view as it is.
 *
 * The view stays where it rested while the pointer comes in and while what happens stays inside
 * the still, such as a tree's branch opening in place. It draws out only when the tile opens
 * something that needs more space: a popup, or content growing in one, such as a palette's
 * results. It then draws out around the trigger, which stays in place, or moves only as far as
 * the popup needs (drawOut). The scale never grows again before the tile rests, so a popup that
 * closes and reopens does not move the view in and out, and every play looks the same. What still
 * does not fit is shown from its start and fades out past the stage's edge.
 *
 * Limits:
 * - The scale is never below the least scale: the popups' least for a component, the legible
 *   scale for a scene. A component is drawn at its resting scale or at that least, never between.
 * - What opened is followed only after it stayed in place from one frame to the next. Until then
 *   it is `pending`, and the caller fits again in the next frame.
 * - A tile that holds its view never draws out.
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
  const { across, down } = stageSize(stage);
  // The named elements: those in a popup, such as a select's options, and those named to count
  // anywhere, such as a panel it opens (StageScript).
  const query = (selector: string) => elementsOf(canvas, selector);
  const named = [...script.named.flatMap(query).filter(inPopup), ...script.anywhere.flatMap(query)]
    .filter((element) => element.checkVisibility({ visibilityProperty: true }))
    .map((element) => inkOf(element, canvas))
    .filter((box) => box.right > box.left && box.bottom > box.top);
  // What opened: boxes in a popup that the still did not show or that grew, such as a palette's
  // results. A popup still entering is measured by its positioner, which is not transformed, so
  // the box is where it will end.
  const opened = boxes
    .filter(({ element, box }) => {
      // A closing popup needs no space.
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
  // If the view already shows it (within 1 px), such as a popup that closes and reopens, nothing
  // moves.
  const shown =
    must &&
    screen(must.left, at.x, across) >= -1 &&
    screen(must.right, at.x, across) <= across + 1 &&
    screen(must.top, at.y, down) >= -1 &&
    screen(must.bottom, at.y, down) <= down + 1;
  // A popup's style places it a frame or two after it appears. The view follows it only once its
  // box matches the one kept from the previous fit (`pending`, within 2 px), not to where it first
  // appeared.
  const placed =
    must && run.pending !== null && covers(run.pending, must) && covers(must, run.pending);
  const holds = script.holdsView;
  const next = { ...run, pending: must && !shown && !placed && !holds ? must : null };
  if (!must || shown || !placed || holds) return { run: next, target: null };
  // The first visible trigger outside the popups, joined with its field's label, which floats
  // over the field's edge.
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
 * Moves the view so where the pointer is heading, such as a row below the stage's bottom, is in
 * view before the pointer gets there. It moves just far enough: across, to contain it; down, to
 * keep it above the whole bottom fade (when the picture is cut at the bottom) with the cursor's tip
 * inside the stage. Returns the new target, or null when the move would be under 1 px.
 */
export function decideHeading(
  { stage, canvas }: Stage,
  script: StageScript,
  view: Target,
): Target | null {
  const box = heading(canvas, script);
  if (!box) return null;
  const { across, down } = stageSize(stage);
  const toX = contain(view.toX, box.left * view.toScale, box.right * view.toScale, across / 2 - 4);
  const scale = view.toScale;
  // The bottom fade's current length: the shortened length when trimRows set one, else the
  // crop's own. A tile's canvas is inside its crop (TileStage.tsx), so it has a parent.
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
 * The sides a playing tile is cut off at, and its run, marked as moved once the view has moved.
 *
 * The sides are where what it paints reaches past the stage at the view's target. Until the view
 * has moved, the sides the still was cut at are added, so the pointer arriving changes nothing. A
 * held view keeps the still's sides throughout, even as content moves within it.
 */
export function decidePlayCut(
  { across, down }: StageSize,
  boxes: { box: Box }[],
  run: Run,
  view: Target,
  holdsView: boolean,
): { cut: string; run: Run } {
  const moved =
    run.moved ||
    Math.abs(view.toX - run.at.x) >= pixelTolerance ||
    Math.abs(view.toY - run.at.y) >= pixelTolerance ||
    Math.abs(view.toScale - run.at.scale) >= scaleTolerance;
  const sides = new Set(
    holdsView
      ? run.cut
      : cutSides(
          // A fit runs only when the picture paints something (shownBoxes), so the join is never
          // null.
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
