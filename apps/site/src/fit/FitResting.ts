/*
 * The decisions of a fit at rest (useFit.ts), each returned for the fit to draw (FitDraw.ts) and
 * keep: how a popup shown open is drawn (decidePopups) and the scale the picture is drawn at
 * (decideRestingScale), decided on what was measured, nothing else; and where its view goes and
 * where it is cut off there (decideRestingPlace), measured as the picture is laid out at that
 * scale. They write nothing.
 */
import { cropFade, rowSelector, type Placement } from './FitDraw';
import {
  anchoredScale,
  contain,
  cutSides,
  inset,
  insetSlack,
  join,
  margin,
  popupRoom,
  restingScale,
  scalePrecision,
  scaleTolerance,
  wholeRoom,
  type Extent,
  type Padded,
} from './FitGeometry';
import { cropped, type FitKind, type StageScript } from './FitKind';
import { lowestOf, type Held, type Measured, type Seen } from './FitMeasure';
import {
  heldNextLeast,
  heldPlace,
  heldScale,
  heldTopLeast,
  rowSlack,
  subjectScale,
} from './HeldView';
import { inPopup, partOf, type Shown } from './PaintedBoxes';
import { onCourse, restingAims } from './PointerCourse';
import type { View } from './ViewEasing';
import { pixelTolerance } from '../shared/Remeasure';

/** A stage's size, in px. */
interface Room {
  across: number;
  down: number;
}

/** A picture's stage and canvas, and what it is fitted as. */
interface Picture {
  stage: HTMLElement;
  canvas: HTMLElement;
  kind: FitKind;
}

/**
 * Whether a held popup is drawn whole a little smaller (`narrower`), and at what scale (`whole`),
 * decided as it is first fitted for its stage's size, `room` (decidePopups): a popup is placed again
 * as the view changes, a little higher or lower against the window's edge, and a choice that
 * followed it would go back and forth.
 */
export interface WholeFor {
  room: string;
  narrower: number | null;
  whole: number;
}

/** How a popup shown open is drawn in its stage (decidePopups). */
export interface Popups {
  /** Whether it is a dialog over its backdrop, in a scene too. */
  dialog: boolean;
  /** The stage's room, a margin from its edges. */
  room: { width: number; height: number };
  /** What a component's popup paints, each with the room it keeps from the stage's edges. */
  anchored: Padded[] | null;
  /** The scale a held popup is drawn whole at a little smaller, and whether it is. */
  narrower: number | null;
  whole: number;
  /** The scale a popup is drawn at, at most `atMost`. */
  scale: (atMost: number) => number;
  /** What the fit keeps of it for its stage's size (`kept.wholeFor`). */
  wholeFor: WholeFor;
}

/**
 * How a popup shown open is drawn. A popup a little larger than the inset leaves room for, such as
 * a menu bar with its menu open, is drawn whole in the stage, where that scale allows, rather than
 * as a window cut off through its last row: what it opens from, such as its field or its bar, the
 * inset from the stage's edges, and the popup a margin from them (anchoredScale). A larger one,
 * such as a picker, stays a window onto it from its top.
 */
export function decidePopups(
  { across, down }: Room,
  kind: FitKind,
  { extent, painted, popup, dialog, scales }: Measured,
  script: Pick<StageScript, 'holdsView' | 'narrow'>,
  /** Whether the picture has shown, and what the fit kept of its popups (`kept.wholeFor`). */
  { shown, wholeFor: kept }: { shown: boolean; wholeFor: WholeFor | null },
): Popups {
  const { left, top, right, bottom, width, height } = extent;
  const component = kind.scale === 'own';
  const wholeScale = Math.min(width / (right - left), height / (bottom - top));
  const room = { width: across - 2 * margin, height: down - 2 * margin };
  const anchored =
    component && popup && !dialog
      ? painted.map(({ box, popup: inOne }) => ({ box, pad: inOne ? popupRoom : inset }))
      : null;
  // A component's own popup, or a dialog in a scene too.
  const roomy = dialog || (component && popup);
  const marginScale = roomy
    ? Math.min(room.width / (right - left), room.height / (bottom - top))
    : 0;
  const roomScale = anchored ? anchoredScale(anchored, across, down) : marginScale;
  // One of two scales, so the popups read as one row beside the other tiles: its own, where it
  // shows whole so, what it opens from the inset from the edges and the popup a little room
  // (anchoredScale), else the popups' one scale, whole there or a window onto it from its top,
  // fading out at its foot. On a phone, in a gallery or in Related, a held popup that runs past
  // the stage's end or foot at the popups' least but shows whole a little smaller, such as a menu
  // bar's menu opened from its last menu or a select's list on a lower stage, is drawn whole at
  // that scale, a little room from the stage's foot, down to `heldNextLeast`, rather than cut off
  // at the stage's edge; it lays out as wide as at the popups' least, so its width doesn't follow
  // its scale (decideRestingScale). On a wider page a popup is drawn at one of two scales, never
  // between. It is decided as the picture first shows, and again only for another stage size.
  const stageRoom = `${across} ${down}`;
  const wholeFor =
    shown && kept?.room === stageRoom
      ? kept
      : wholeAtStage({ across, down }, script, anchored, roomScale, scales, stageRoom);
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

/** Whether a held popup is drawn whole a little smaller at a stage's size, and at what scale. */
function wholeAtStage(
  { across, down }: Room,
  { holdsView, narrow }: Pick<StageScript, 'holdsView' | 'narrow'>,
  anchored: Padded[] | null,
  roomScale: number,
  { phone, popupLeast }: Measured['scales'],
  room: string,
): WholeFor {
  const whole =
    anchored && holdsView && (phone || narrow)
      ? anchoredScale(
          anchored.map(({ box }) => ({ box, pad: wholeRoom })),
          across,
          down,
        )
      : 0;
  return {
    room,
    whole,
    narrower:
      roomScale < popupLeast - scaleTolerance &&
      whole < popupLeast - scaleTolerance &&
      whole >= heldNextLeast - scaleTolerance
        ? Math.floor(whole * scalePrecision) / scalePrecision
        : null,
  };
}

/**
 * The scale a resting picture is drawn at (restingScale), once a held view or a held subject is
 * drawn smaller where it must (heldScale, subjectScale); whether it is drawn whole a little smaller
 * (drawnWhole); whether its subject is drawn smaller so (`data-held-scale`); on a phone, the scale a
 * popup shown open lays out at (`--catalogue-canvas-scale`), or null where its canvas keeps the one
 * it has; and the largest scale an overlay shows whole across at (overlayWhole).
 */
export interface RestingScale {
  scale: number;
  drawnWhole: boolean;
  heldSmaller: boolean;
  layoutScale: string | null;
  overlayWhole: number;
}

export function decideRestingScale(
  { across, down }: Room,
  kind: FitKind,
  measured: Measured,
  popups: Popups,
  held: Held,
  script: Pick<StageScript, 'holdsView' | 'anywhere'>,
  /**
   * Whether it plays, the scale it rested at, and whether a popup shown open lays out in its
   * window (`data-popup`).
   */
  { playing, rest, laidOut }: { playing: boolean; rest: number; laidOut: boolean },
): RestingScale {
  const { extent, popup, scales } = measured;
  const { left, top, right, bottom, height } = extent;
  const component = kind.scale === 'own';
  // An overlay, such as a notification, is measured by its own surface, which keeps a popup's room
  // from the stage's edges, not by the inset a trigger keeps: the largest scale it shows whole
  // across at (anchoredScale). Where it doesn't at its scale, it is drawn as much smaller as that
  // takes, down to the popups' least.
  const overlayWhole =
    scales.overlay && popups.anchored ? anchoredScale(popups.anchored, across, Infinity) : Infinity;
  const drawn = restingScale(kind, { ...measured, popupScale: popups.scale, overlayWhole });
  // A held component view that names what it shows anywhere (StageScript), such as a docked panel or a
  // strip of tabs written as wide as its largest state, shows whole in the stage's room, a margin
  // from its edges, as a component a little larger than the inset leaves room for is (inRoom):
  // where the one scale doesn't allow that, it is drawn at the largest of the scales tiles are
  // drawn at that does, as a held picker is (heldScale), else as much smaller as it needs, down to
  // a held view's least, through its whole loop (`data-held-scale`).
  const subject = component && !popup && script.holdsView && script.anywhere.length > 0;
  // Drawn whole a little smaller (narrower), or at the overlays' scale where that shows it whole
  // so too, it is framed whole, centred, as it is.
  const drawnWhole = popups.narrower !== null && drawn <= popups.whole + scaleTolerance;
  const framedAt =
    cropped(kind) && !drawnWhole
      ? heldScale(drawn, held.ways, held.room, { tall: bottom - top, height }, scales)
      : drawn;
  const fitted = subject
    ? Math.min(
        framedAt,
        subjectScale(
          drawn,
          Math.min((across - 2 * margin) / (right - left), (down - 2 * margin) / (bottom - top)),
          scales,
        ),
      )
    : framedAt;
  // Measured again, a box may come out a hair larger or smaller, a ten-millionth of the scale:
  // that is the same scale, so the view holds still and a tile shows as soon as it is fitted.
  const scale = Math.abs(fitted - rest) < scaleTolerance ? rest : fitted;
  // On a phone, a popup shown open lays out as wide as the stage's room shows at the scale it is
  // drawn at (`--catalogue-canvas-scale`, Gallery.css), so what is as wide as its window, such as
  // a field, keeps the inset from both edges.
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

/**
 * Where a resting picture's view goes at its scale, centred on what it paints, as it shows best
 * there, and where it is cut off there (cutAtRest), measured as it is laid out at that scale.
 */
export function decideRestingPlace(
  picture: Picture,
  script: StageScript,
  { boxes, moment, growsDown }: Seen,
  { extent, scales }: Measured,
  popups: Popups,
  held: Held,
  { scale, drawnWhole, overlayWhole }: RestingScale,
  /**
   * Where the view is drawn and goes now, where its fade starts (`kept.fadeAt`), and whether it is
   * a tile that played (`kept.run`).
   */
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
  // Drawn at its own size, what is larger than the stage shows from its start, as a window onto
  // it, and what reaches past the stage's own edge, beyond the inset, is cut off there and fades
  // out (`data-cut`, Gallery.css).
  const across = (right - left) * scale;
  const down = (bottom - top) * scale;
  // What fits the stage's room, a margin from its edges, such as a component a little taller than
  // the inset leaves room for, is centred on it, cut off nowhere; a popup, with what it opens
  // from, only where it keeps the inset from every edge, else shown from its start, the inset from
  // the stage's top and start, and cut off past the inset's room. An overlay that shows whole
  // across as it is drawn (overlayWhole), its surface a popup's room from the edges, and fits
  // down, isn't faded at an edge.
  const inRoom =
    drawnWhole ||
    (popups.anchored
      ? (scales.overlay > 0 &&
          scale <= overlayWhole + scaleTolerance &&
          down <= height + insetSlack) ||
        (down <= height + insetSlack && across <= width + insetSlack)
      : down <= popups.room.height + pixelTolerance &&
        across <= popups.room.width + pixelTolerance);
  // So is a component a little wider than the inset leaves room for, such as a strip of tabs,
  // across: it is cut off at its foot alone, as every other one is, not at its side.
  const acrossRoom =
    across <= (popups.anchored ? width + insetSlack : popups.room.width + pixelTolerance);
  // It starts at the component's own start, rather than its popups': a popup shifts to stay in
  // the window, and a view that followed it would shift it again. A dialog, over its backdrop, is
  // placed by the window alone and covers what opens it: it starts at its own.
  if (kind.scale === 'own' && across > width && !inRoom && !acrossRoom) {
    const ownBoxes = boxes.filter(({ element }) => popups.dialog || !inPopup(element));
    const start = ownBoxes.length ? Math.min(...ownBoxes.map(({ box }) => box.left)) : left;
    toX = start * scale + width / 2;
  }
  // A scene drawn at a legible scale shows from its top too, where it starts, such as a search
  // above the results it filters, and stays centred across. A tile that holds its view shows from
  // its top down to what its script acts on, whole above the fade at its foot.
  const fromTop = cropped(kind) && down > height && !inRoom;
  if (fromTop && keep) {
    // What it shows from, such as a picker's field, the inset from the stage's top, or as much
    // nearer it as keeps what its script acts on, with the row below a picker's chosen one where
    // there is room, whole above its foot, which fades out below it (heldTop). Where even the least
    // scale doesn't, it shows from as near the top as it is moved, and the fade starts no higher
    // than the middle of the lowest row its script acts on, whose words show above it, and which
    // fades out through the stage's foot rather than being cut there.
    // What its script acts on is there wherever its rows are kept (measureHeld).
    const lowest = held.lowest!;
    const placed = heldPlace(scale, held.ways, held.room) ?? {
      at: heldTopLeast,
      fadeAt: Math.max(lowest.top + rowSlack + 1, (lowest.top + lowest.bottom) / 2),
    };
    toY = top * scale + stage.clientHeight / 2 - placed.at;
    fadeAt = placed.fadeAt;
  } else if (fromTop) toY = top * scale + height / 2;
  // A tile that grows as it plays is shown from its top, so what it adds below has the room the
  // still leaves under it: its still, written as its largest state, centred where it fits the
  // stage, as other tiles are, else the inset from the stage's top (useHeldView).
  if (growsDown && cropped(kind))
    toY =
      top * scale +
      stage.clientHeight / 2 -
      Math.max(inset, (stage.clientHeight - (bottom - top) * scale) / 2);
  // At rest, a tile is framed as it plays, on what its pointer heads to (onCourse); moved for it,
  // it is cut off where it reaches past the stage's edges. A held view taller than its stage is
  // placed down it on what its script acts on (heldTop), and across on its course. A tile first
  // fitted as it plays, its picture loaded while the pointer is on it, is framed so too, as at
  // rest.
  const course =
    cropped(kind) && kind.tile && (!moment.playing || !moment.shown)
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
  // As a page's own tile plays, the view stays where it is while what it shows stays in the stage,
  // else moves just far enough to keep it in.
  if (kind.tile && moment.playing && view.scale === scale) {
    toX = contain(view.toX, left * scale, right * scale, stage.clientWidth / 2 - inset);
    toY = contain(view.toY, top * scale, bottom * scale, stage.clientHeight / 2 - inset);
  }
  return { scale, toX, toY, cut: cut?.sides, fadeAt, played };
}

/** How a resting picture is placed, which decides where it is cut off (cutAtRest). */
interface CutBy {
  extent: Extent;
  inRoom: boolean;
  acrossRoom: boolean;
  anchored: boolean;
  shifted: boolean;
  course: boolean;
}

/**
 * The sides a picture drawn at its own size or a legible scale is cut off at, at rest, and where
 * its fade at its foot starts, where that moves (feetInFade).
 */
function cutAtRest(
  { stage, canvas, kind }: Picture,
  script: StageScript,
  boxes: Shown[],
  scale: number,
  toX: number,
  toY: number,
  fadeAt: number | null,
  how: CutBy,
): { sides: string; fadeAt?: number } {
  const scene = kind.scale === 'legible';
  const { left, top, right, bottom, width, height } = how.extent;
  const across = (right - left) * scale;
  const down = (bottom - top) * scale;
  // Drawn at a legible scale, a scene wider than the stage is cut off on both sides, fading out
  // there too. A held view's top reaching a row's slack past the stage's, its leading clear, isn't
  // cut.
  const held =
    fadeAt !== null && top * scale - toY + stage.clientHeight / 2 >= -rowSlack - pixelTolerance;
  // What may reach past the room before it is cut off: a popup a little, anything else the inset.
  const slack = how.anchored ? insetSlack : inset;
  const cut =
    how.shifted || fadeAt !== null
      ? cutSides(
          // A fit decides only on what paints something (shownBoxes), so their join is a box.
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
          !scene && across > width + slack && !how.inRoom && !how.acrossRoom ? 'end' : '',
          scene && across > stage.clientWidth ? 'start end' : '',
        ];
  const sides = cut.filter(Boolean).join(' ');
  // At rest, where what its pointer heads to over its script reaches into the fade at its foot,
  // such as a list's second row, the fade starts no higher than its foot, and the rows below it
  // that the foot cuts through are hidden whole (trimRows): what it presses reads as whole and
  // live, as it plays, and the view needn't move to bring it out of the fade.
  if (how.course && fadeAt === null && sides.split(' ').includes('bottom')) {
    const feet = feetInFade(stage, canvas, script, boxes, scale, toY);
    if (feet.length) return { sides, fadeAt: Math.max(...feet) };
  }
  return { sides };
}

/**
 * The feet, in the canvas's own px, of what a resting tile's pointer heads to that reach into the
 * fade at its stage's foot, and of a list's last row whole in the stage where all that reaches past
 * its foot is rows below it, hidden whole: it ends on that row, rather than on one faded half out,
 * which reads as disabled.
 */
function feetInFade(
  stage: HTMLElement,
  canvas: HTMLElement,
  script: StageScript,
  boxes: Shown[],
  scale: number,
  toY: number,
) {
  const size = stage.clientHeight;
  // A cropped picture's canvas is in its crop (TileStage.tsx).
  const fade = cropFade(canvas.parentElement!) || 0;
  const at = (point: number) => size / 2 - toY + point * scale;
  const inFade = (foot: number) => at(foot) > size - fade && at(foot) <= size + rowSlack;
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
      if (at(box.bottom) <= size + rowSlack) return true;
      const row = element.closest(rowSelector);
      return row !== null && partOf(row, canvas).top >= last.bottom - rowSlack;
    });
  if (onlyRows) feet.push(last.bottom);
  return feet;
}
