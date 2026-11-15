import { remPixels } from '../shared/Lengths';
import { cropFade } from './FitDraw';
import {
  contain,
  covers,
  cursorLengthRem,
  cursorRoomPx,
  cutSides,
  drawOut,
  join,
  marginPx,
  scaleTolerance,
  stagePoint,
  type Box,
} from './FitGeometry';
import type { StageScript } from './FitKind';
import { stageSize, type Scales, type StageSize } from './FitMeasure';
import { elementsOf, inkOf, inPopup, partOf, settling, type Shown } from './PaintedBoxes';
import { heading } from './PointerCourse';
import type { Target } from './ViewEasing';
import { pixelTolerance } from '../shared/Remeasure';

export interface Run {
  rested: Map<Element, Box>;
  scale: number;
  pending: Box | null;
  at: { x: number; y: number; scale: number };
  cut: string[];
  moved: boolean;
}

interface Stage {
  stage: HTMLElement;
  canvas: HTMLElement;
}

const shownSlackPx = 1;
const leastHeadingMovePx = 1;

const triggers =
  "[data-popup-open], [aria-haspopup][aria-expanded='true'], [role='combobox'][aria-expanded='true']";

export function startRun(boxes: Shown[], view: Target, cut: string | undefined): Run {
  return {
    rested: boxes.reduce(
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

export function decideDrawOut(
  { stage, canvas }: Stage,
  script: StageScript,
  boxes: Shown[],
  { popupLeast }: Scales,
  run: Run,
  view: Target & { rest: number },
): { run: Run; target: Target | null } {
  const least = Math.min(view.rest, popupLeast);
  const stepped = (scale: number) => (scale >= view.rest - scaleTolerance ? view.rest : least);
  const { across, down } = stageSize(stage);
  const query = (selector: string) => elementsOf(canvas, selector);
  const named = [...script.named.flatMap(query).filter(inPopup), ...script.anywhere.flatMap(query)]
    .filter((element) => element.checkVisibility({ visibilityProperty: true }))
    .map((element) => inkOf(element, canvas))
    .filter((box) => box.right > box.left && box.bottom > box.top);
  const opened = boxes
    .filter(({ element, box }) => {
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
  const shown =
    must &&
    screen(must.left, at.x, across) >= -shownSlackPx &&
    screen(must.right, at.x, across) <= across + shownSlackPx &&
    screen(must.top, at.y, down) >= -shownSlackPx &&
    screen(must.bottom, at.y, down) <= down + shownSlackPx;
  const placed =
    must && run.pending !== null && covers(run.pending, must) && covers(must, run.pending);
  const holds = script.holdsView;
  const next = { ...run, pending: must && !shown && !placed && !holds ? must : null };
  if (!must || shown || !placed || holds) return { run: next, target: null };
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
    (tip + cursorLengthRem * remPixels()) * scale + cursorRoomPx,
  );
  const toY = Math.min(Math.max(view.toY, foot - down / 2), box.top * scale + down / 2 - marginPx);
  return Math.hypot(toX - view.toX, toY - view.toY) >= leastHeadingMovePx
    ? { toX, toY, toScale: view.toScale, zoomed: view.zoomed }
    : null;
}

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
