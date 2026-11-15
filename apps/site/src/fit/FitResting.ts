import { cropFade, rowSelector, type Placement } from './FitDraw';
import {
  anchoredScale,
  contain,
  cutSides,
  insetPx,
  insetSlackPx,
  join,
  marginPx,
  popupRoomPx,
  restingScale,
  scalePrecision,
  scaleTolerance,
  wholeRoomPx,
  type Extent,
  type Padded,
} from './FitGeometry';
import { cropped, type FitKind, type StageScript } from './FitKind';
import { lowestOf, type Held, type Measured, type Seen, type StageSize } from './FitMeasure';
import {
  heldNextLeastScale,
  heldPlace,
  heldScale,
  heldTopLeastPx,
  rowSlackPx,
  subjectScale,
} from './HeldView';
import { inPopup, partOf, type Shown } from './PaintedBoxes';
import { onCourse, restingAims } from './PointerCourse';
import type { View } from './ViewEasing';
import { pixelTolerance } from '../shared/Remeasure';

interface Picture {
  stage: HTMLElement;
  canvas: HTMLElement;
  kind: FitKind;
}

export interface WholeFor {
  stage: string;
  narrower: number | null;
  whole: number;
}

export interface Popups {
  dialog: boolean;
  room: StageSize;
  anchored: Padded[] | null;
  narrower: number | null;
  whole: number;
  scale: (atMost: number) => number;
  wholeFor: WholeFor;
}

export function decidePopups(
  { across, down }: StageSize,
  kind: FitKind,
  { extent, painted, popup, dialog, scales }: Measured,
  script: Pick<StageScript, 'holdsView' | 'narrow'>,
  { shown, wholeFor: kept }: { shown: boolean; wholeFor: WholeFor | null },
): Popups {
  const { left, top, right, bottom, width, height } = extent;
  const component = kind.scale === 'own';
  const wholeScale = Math.min(width / (right - left), height / (bottom - top));
  const room = { across: across - 2 * marginPx, down: down - 2 * marginPx };
  const anchored =
    component && popup && !dialog
      ? painted.map(({ box, popup: inOne }) => ({ box, pad: inOne ? popupRoomPx : insetPx }))
      : null;
  const roomy = dialog || (component && popup);
  const marginScale = roomy
    ? Math.min(room.across / (right - left), room.down / (bottom - top))
    : 0;
  const roomScale = anchored ? anchoredScale(anchored, across, down) : marginScale;
  const stageKey = `${across} ${down}`;
  const wholeFor =
    shown && kept?.stage === stageKey
      ? kept
      : wholeAtStage({ across, down }, script, anchored, roomScale, scales, stageKey);
  const { narrower, whole } = wholeFor;
  return {
    dialog,
    room,
    anchored,
    narrower,
    whole,
    scale: (atMost) => {
      if (Math.max(wholeScale, roomScale) >= atMost - scaleTolerance) return atMost;
      return narrower ?? Math.min(atMost, scales.popupLeast);
    },
    wholeFor,
  };
}

function wholeAtStage(
  { across, down }: StageSize,
  { holdsView, narrow }: Pick<StageScript, 'holdsView' | 'narrow'>,
  anchored: Padded[] | null,
  roomScale: number,
  { phone, popupLeast }: Measured['scales'],
  stage: string,
): WholeFor {
  const whole =
    anchored && holdsView && (phone || narrow)
      ? anchoredScale(
          anchored.map(({ box }) => ({ box, pad: wholeRoomPx })),
          across,
          down,
        )
      : 0;
  return {
    stage,
    whole,
    narrower:
      roomScale < popupLeast - scaleTolerance &&
      whole < popupLeast - scaleTolerance &&
      whole >= heldNextLeastScale - scaleTolerance
        ? Math.floor(whole * scalePrecision) / scalePrecision
        : null,
  };
}

export interface RestingScale {
  scale: number;
  drawnWhole: boolean;
  heldSmaller: boolean;
  layoutScale: string | null;
  overlayWhole: number;
}

export function decideRestingScale(
  { across, down }: StageSize,
  kind: FitKind,
  measured: Measured,
  popups: Popups,
  held: Held,
  script: Pick<StageScript, 'holdsView' | 'anywhere'>,
  { playing, rest, laidOut }: { playing: boolean; rest: number; laidOut: boolean },
): RestingScale {
  const { extent, popup, scales } = measured;
  const { left, top, right, bottom, height } = extent;
  const component = kind.scale === 'own';
  const overlayWhole =
    scales.overlay && popups.anchored ? anchoredScale(popups.anchored, across, Infinity) : Infinity;
  const drawn = restingScale(kind, { ...measured, popupScale: popups.scale, overlayWhole });
  const subject = component && !popup && script.holdsView && script.anywhere.length > 0;
  const drawnWhole = popups.narrower !== null && drawn <= popups.whole + scaleTolerance;
  const framedAt =
    cropped(kind) && !drawnWhole
      ? heldScale(drawn, held.ways, held.heights, { tall: bottom - top, height }, scales)
      : drawn;
  const fitted = subject
    ? Math.min(
        framedAt,
        subjectScale(
          drawn,
          Math.min(
            (across - 2 * marginPx) / (right - left),
            (down - 2 * marginPx) / (bottom - top),
          ),
          scales,
        ),
      )
    : framedAt;
  const scale = Math.abs(fitted - rest) < scaleTolerance ? rest : fitted;
  const laysOut = scales.phone && component && !scales.overlay && !playing && laidOut;
  const layoutAt =
    popups.narrower !== null && scale === popups.narrower ? scales.popupLeast : scale;
  return {
    scale,
    drawnWhole,
    heldSmaller: subject && fitted < drawn - scaleTolerance,
    layoutScale: laysOut ? String(Math.round(layoutAt * scalePrecision) / scalePrecision) : null,
    overlayWhole,
  };
}

export function decideRestingPlace(
  picture: Picture,
  script: StageScript,
  { boxes, moment, growsDown }: Seen,
  { extent, scales }: Measured,
  popups: Popups,
  held: Held,
  { scale, drawnWhole, overlayWhole }: RestingScale,
  {
    view,
    fadeAt: keptFade,
    played,
  }: { view: Pick<View, 'scale' | 'toX' | 'toY'>; fadeAt: number | null; played: boolean },
): Placement {
  const { stage, canvas, kind } = picture;
  const { left, top, right, bottom, width, height } = extent;
  const keep = held.rows?.keep;
  let fadeAt = keptFade;
  let toX = ((left + right) / 2) * scale;
  let toY = ((top + bottom) / 2) * scale;
  const across = (right - left) * scale;
  const down = (bottom - top) * scale;
  const inRoom =
    drawnWhole ||
    (popups.anchored
      ? (scales.overlay > 0 &&
          scale <= overlayWhole + scaleTolerance &&
          down <= height + insetSlackPx) ||
        (down <= height + insetSlackPx && across <= width + insetSlackPx)
      : down <= popups.room.down + pixelTolerance && across <= popups.room.across + pixelTolerance);
  const acrossRoom =
    across <= (popups.anchored ? width + insetSlackPx : popups.room.across + pixelTolerance);
  if (kind.scale === 'own' && across > width && !inRoom && !acrossRoom) {
    const ownBoxes = boxes.filter(({ element }) => popups.dialog || !inPopup(element));
    const start = ownBoxes.length ? Math.min(...ownBoxes.map(({ box }) => box.left)) : left;
    toX = start * scale + width / 2;
  }
  const fromTop = cropped(kind) && down > height && !inRoom;
  if (fromTop && keep) {
    const lowest = held.lowest!;
    const placed = heldPlace(scale, held.ways, held.heights) ?? {
      at: heldTopLeastPx,
      fadeAt: Math.max(lowest.top + rowSlackPx + 1, (lowest.top + lowest.bottom) / 2),
    };
    toY = top * scale + stage.clientHeight / 2 - placed.at;
    fadeAt = placed.fadeAt;
  } else if (fromTop) toY = top * scale + height / 2;
  if (growsDown && cropped(kind))
    toY =
      top * scale +
      stage.clientHeight / 2 -
      Math.max(insetPx, (stage.clientHeight - (bottom - top) * scale) / 2);
  const framedOnCourse = cropped(kind) && kind.tile && (!moment.playing || !moment.shown);
  const course = framedOnCourse
    ? {
        ...onCourse(stage, canvas, script, toX, toY, scale),
        ...(fromTop && keep ? { toY } : {}),
      }
    : null;
  const shifted =
    course !== null &&
    (Math.abs(course.toX - toX) >= pixelTolerance || Math.abs(course.toY - toY) >= pixelTolerance);
  if (course) ({ toX, toY } = course);
  const cut = cropped(kind)
    ? cutAtRest(picture, script, boxes, scale, toX, toY, fadeAt, {
        extent,
        inRoom,
        acrossRoom,
        anchored: popups.anchored !== null,
        shifted,
        course: course !== null,
      })
    : undefined;
  if (cut?.fadeAt !== undefined) fadeAt = cut.fadeAt;
  if (kind.tile && moment.playing && view.scale === scale) {
    toX = contain(view.toX, left * scale, right * scale, stage.clientWidth / 2 - insetPx);
    toY = contain(view.toY, top * scale, bottom * scale, stage.clientHeight / 2 - insetPx);
  }
  return { scale, toX, toY, cut: cut?.sides, fadeAt, played };
}

interface CutBy {
  extent: Extent;
  inRoom: boolean;
  acrossRoom: boolean;
  anchored: boolean;
  shifted: boolean;
  course: boolean;
}

function cutAtRest(
  { stage, canvas }: Picture,
  script: StageScript,
  boxes: Shown[],
  scale: number,
  toX: number,
  toY: number,
  fadeAt: number | null,
  how: CutBy,
): { sides: string; fadeAt?: number } {
  const { left, top, right, bottom, width, height } = how.extent;
  const across = (right - left) * scale;
  const down = (bottom - top) * scale;
  const held =
    fadeAt !== null && top * scale - toY + stage.clientHeight / 2 >= -rowSlackPx - pixelTolerance;
  const slack = how.anchored ? insetSlackPx : insetPx;
  const cut =
    how.shifted || fadeAt !== null
      ? cutSides(
          join(...boxes.map(({ box }) => box))!,
          stage.clientWidth,
          stage.clientHeight,
          toX,
          toY,
          scale,
        )
          .split(' ')
          .filter((side) => !(held && side === 'top'))
      : [
          down > height + slack && !how.inRoom ? 'bottom' : '',
          across > width + slack && !how.inRoom && !how.acrossRoom ? 'end' : '',
        ];
  const sides = cut.filter(Boolean).join(' ');
  if (how.course && fadeAt === null && sides.split(' ').includes('bottom')) {
    const feet = feetInFade(stage, canvas, script, boxes, scale, toY);
    if (feet.length) return { sides, fadeAt: Math.max(...feet) };
  }
  return { sides };
}

function feetInFade(
  stage: HTMLElement,
  canvas: HTMLElement,
  script: StageScript,
  boxes: Shown[],
  scale: number,
  toY: number,
) {
  const size = stage.clientHeight;
  const fade = cropFade(canvas.parentElement!) || 0;
  const at = (point: number) => size / 2 - toY + point * scale;
  const inFade = (foot: number) => at(foot) > size - fade && at(foot) <= size + rowSlackPx;
  const feet = restingAims(canvas, script)
    .map(({ box }) => box.bottom)
    .filter(inFade);
  const rows = [...canvas.querySelectorAll(rowSelector)]
    .filter((row) => !row.querySelector(rowSelector) && row.checkVisibility())
    .map((row) => partOf(row, canvas));
  const last = lowestOf(rows.filter((box) => box.bottom > box.top && inFade(box.bottom)));
  const onlyRows =
    last !== null &&
    boxes.every(({ element, box }) => {
      if (at(box.bottom) <= size + rowSlackPx) return true;
      const row = element.closest(rowSelector);
      return row !== null && partOf(row, canvas).top >= last.bottom - rowSlackPx;
    });
  if (onlyRows) feet.push(last.bottom);
  return feet;
}
