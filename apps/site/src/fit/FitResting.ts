/*
 * The fit's decisions for a picture at rest (useFit.ts). The functions return their decisions for
 * the fit to draw (FitDraw.ts) and keep; they write nothing.
 * - decidePopups: how an open popup is drawn.
 * - decideRestingScale: the scale the picture is drawn at.
 * Both decide from the measurements alone.
 * - decideRestingPlace: where the view goes and which sides are cut off. It measures the picture
 *   again after the canvas is laid out at the chosen scale.
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
import { lowestOf, type Held, type Measured, type Seen, type StageSize } from './FitMeasure';
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

/** A picture's stage and canvas, and its kind. */
interface Picture {
  stage: HTMLElement;
  canvas: HTMLElement;
  kind: FitKind;
}

/**
 * Whether a held popup is drawn whole at a scale slightly below the popups' least (`narrower`, or
 * null), and the scale at which it shows whole (`whole`). Decided once per stage size (`stage`,
 * written as `across down`), as the picture first shows (decidePopups). Why it is kept: a popup is
 * placed again as the view changes, a little higher or lower against the window's edge, and a
 * decision that followed it would flip back and forth.
 */
export interface WholeFor {
  stage: string;
  narrower: number | null;
  whole: number;
}

/** How an open popup is drawn in its stage (decidePopups). */
export interface Popups {
  /** Whether it is a dialog over its backdrop (also in a scene). */
  dialog: boolean;
  /** The stage's size less the margin on each side. */
  room: StageSize;
  /**
   * For a component's popup (not a dialog): what it paints, each box with the space it keeps from
   * the stage's edges (popupRoom for the popup, the inset for the rest). Null otherwise.
   */
  anchored: Padded[] | null;
  /** As in WholeFor. */
  narrower: number | null;
  whole: number;
  /** The scale the popup is drawn at, given the most it may be drawn at, `atMost`. */
  scale: (atMost: number) => number;
  /** The decision the fit keeps for this stage size (`kept.wholeFor`). */
  wholeFor: WholeFor;
}

/**
 * Decides how an open popup is drawn (Popups).
 *
 * A popup slightly larger than the space inside the inset, such as a menu bar with its menu open,
 * is drawn whole when the scale allows, rather than cut off through its last row. Its trigger
 * keeps the inset from the stage's edges and the popup keeps popupRoom (anchoredScale). A larger
 * popup, such as a picker, is shown from its top and cut off at the bottom.
 */
export function decidePopups(
  { across, down }: StageSize,
  kind: FitKind,
  { extent, painted, popup, dialog, scales }: Measured,
  script: Pick<StageScript, 'holdsView' | 'narrow'>,
  /** Whether the picture has shown, and the popup decision the fit kept (`kept.wholeFor`). */
  { shown, wholeFor: kept }: { shown: boolean; wholeFor: WholeFor | null },
): Popups {
  const { left, top, right, bottom, width, height } = extent;
  const component = kind.scale === 'own';
  const wholeScale = Math.min(width / (right - left), height / (bottom - top));
  const room = { across: across - 2 * margin, down: down - 2 * margin };
  const anchored =
    component && popup && !dialog
      ? painted.map(({ box, popup: inOne }) => ({ box, pad: inOne ? popupRoom : inset }))
      : null;
  // A component's popup, or a dialog (also in a scene), may use the stage less the margin.
  const roomy = dialog || (component && popup);
  const marginScale = roomy
    ? Math.min(room.across / (right - left), room.down / (bottom - top))
    : 0;
  const roomScale = anchored ? anchoredScale(anchored, across, down) : marginScale;
  // A popup is drawn at one of two scales, never between, so the popups in a row of tiles match:
  // - `atMost` (its own scale), when it shows whole at it (wholeScale or roomScale);
  // - else the popups' least scale, where it shows whole or is cut off at the bottom.
  // The exception (`narrower`), on a phone or in a narrow gallery: a held popup that reaches past
  // the stage at the popups' least scale but fits whole slightly smaller, down to heldNextLeast,
  // is drawn whole at that scale with wholeRoom from the edges. Examples: a menu bar's last menu,
  // a select's list on a shorter stage. It lays out as wide as at the popups' least scale, so its
  // width does not change with its scale (decideRestingScale). This is decided when the picture
  // first shows, and again only when the stage's size changes.
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

/** Decides WholeFor for a stage size (`stage`, written as `across down`). */
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
          anchored.map(({ box }) => ({ box, pad: wholeRoom })),
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
      whole >= heldNextLeast - scaleTolerance
        ? Math.floor(whole * scalePrecision) / scalePrecision
        : null,
  };
}

/**
 * A resting picture's scale decision (decideRestingScale):
 * - `scale`: the scale it is drawn at (restingScale, made smaller for a held view by heldScale
 *   or for a held subject by subjectScale);
 * - `drawnWhole`: whether a held popup is drawn whole at the `narrower` scale (WholeFor);
 * - `heldSmaller`: whether a held subject was drawn smaller for that (`data-held-scale`);
 * - `layoutScale`: on a phone, the scale an open popup lays out at (`--catalogue-canvas-scale`),
 *   or null to leave the canvas's current value;
 * - `overlayWhole`: the largest scale at which an overlay shows whole across.
 */
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
  /**
   * Whether it plays, the scale it last rested at (`rest`), and whether an open popup lays out in
   * the tile's window (`data-popup`).
   */
  { playing, rest, laidOut }: { playing: boolean; rest: number; laidOut: boolean },
): RestingScale {
  const { extent, popup, scales } = measured;
  const { left, top, right, bottom, height } = extent;
  const component = kind.scale === 'own';
  // An overlay, such as a notification, is measured by its own surface, which keeps popupRoom
  // from the stage's edges rather than the inset: overlayWhole is the largest scale at which it
  // shows whole across (anchoredScale). componentScale draws it that much smaller where needed,
  // down to the popups' least scale.
  const overlayWhole =
    scales.overlay && popups.anchored ? anchoredScale(popups.anchored, across, Infinity) : Infinity;
  const drawn = restingScale(kind, { ...measured, popupScale: popups.scale, overlayWhole });
  // A held subject: a held component view (no popup) whose script names what it shows anywhere
  // (StageScript), such as a docked panel or a strip of tabs written as wide as its largest state.
  // It must show whole in the stage less the margin, as a component slightly larger than the
  // inset does (inRoom). Where its scale does not allow that, it is drawn smaller (subjectScale)
  // for its whole loop (`data-held-scale`).
  const subject = component && !popup && script.holdsView && script.anywhere.length > 0;
  // A popup drawn whole at the `narrower` scale (or at a smaller scale that also shows it whole)
  // is framed whole and centred, so heldScale is skipped.
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
          Math.min((across - 2 * margin) / (right - left), (down - 2 * margin) / (bottom - top)),
          scales,
        ),
      )
    : framedAt;
  // A scale within scaleTolerance of the resting one counts as the same, so the view holds still
  // and a tile shows as soon as it is fitted.
  const scale = Math.abs(fitted - rest) < scaleTolerance ? rest : fitted;
  // On a phone, an open popup's canvas lays out as wide as the stage's space at the scale it is
  // drawn at (`--catalogue-canvas-scale`, Gallery.css), so something as wide as its window, such
  // as a field, keeps the inset from both edges. At the `narrower` scale it lays out as at the
  // popups' least scale.
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
 * Where a resting picture's view goes at its scale, and which sides are cut off there (cutAtRest).
 * Measured after the canvas is laid out at that scale. The view starts centred on what the picture
 * paints, then the rules in the body move it.
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
   * The current view, where the bottom fade starts now (`kept.fadeAt`), and whether the tile has
   * played (`kept.run`).
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
  // The painted size at this scale. A component larger than the stage shows from its start, and
  // what reaches past the stage's edge, beyond the inset, is cut off and fades out (`data-cut`,
  // Gallery.css).
  const across = (right - left) * scale;
  const down = (bottom - top) * scale;
  // inRoom: the picture fits and is centred and not cut anywhere. Without a component's popup, it
  // fits when it is inside the stage less the margin, such as a component slightly taller than the
  // inset allows. A popup with its trigger fits only within the inset (plus insetSlack); otherwise
  // it shows from its start, the inset from the stage's top and start, and is cut past that. An
  // overlay that shows whole across at its scale (overlayWhole) and fits down is not cut either.
  const inRoom =
    drawnWhole ||
    (popups.anchored
      ? (scales.overlay > 0 &&
          scale <= overlayWhole + scaleTolerance &&
          down <= height + insetSlack) ||
        (down <= height + insetSlack && across <= width + insetSlack)
      : down <= popups.room.down + pixelTolerance && across <= popups.room.across + pixelTolerance);
  // acrossRoom: the picture fits across, such as a strip of tabs slightly wider than the inset
  // allows, so it may be cut at the bottom but not at its side.
  const acrossRoom =
    across <= (popups.anchored ? width + insetSlack : popups.room.across + pixelTolerance);
  // A component too wide for the stage shows from its own start, not its popups'. A popup shifts
  // to stay in the window, and a view that followed it would shift it again. A dialog is placed by
  // the window alone and covers its trigger, so a dialog's own boxes count too.
  if (kind.scale === 'own' && across > width && !inRoom && !acrossRoom) {
    const ownBoxes = boxes.filter(({ element }) => popups.dialog || !inPopup(element));
    const start = ownBoxes.length ? Math.min(...ownBoxes.map(({ box }) => box.left)) : left;
    toX = start * scale + width / 2;
  }
  // A cropped picture taller than the stage shows from its top, such as a scene with a search
  // above the results it filters, and stays centred across. A held view shows from its top down to
  // what its script acts on, whole above the bottom fade.
  const fromTop = cropped(kind) && down > height && !inRoom;
  if (fromTop && keep) {
    // The held view's top goes where heldPlace puts it (heldTop). If no way fits at this scale,
    // its top goes heldTopLeast from the stage's top, and the fade starts no higher than the
    // middle of the lowest box the script acts on, so its words show above the fade and it fades
    // out through the bottom rather than being cut.
    // `lowest` is set whenever `rows` is (measureHeld).
    const lowest = held.lowest!;
    const placed = heldPlace(scale, held.ways, held.heights) ?? {
      at: heldTopLeast,
      fadeAt: Math.max(lowest.top + rowSlack + 1, (lowest.top + lowest.bottom) / 2),
    };
    toY = top * scale + stage.clientHeight / 2 - placed.at;
    fadeAt = placed.fadeAt;
  } else if (fromTop) toY = top * scale + height / 2;
  // A tile that grows downwards as it plays is placed by its top, so what it adds has the space
  // below the still: centred when the still fits the stage, else the inset from the stage's top
  // (useHeldView).
  if (growsDown && cropped(kind))
    toY =
      top * scale +
      stage.clientHeight / 2 -
      Math.max(inset, (stage.clientHeight - (bottom - top) * scale) / 2);
  // A cropped tile at rest is framed the way it plays, on the pointer's course (onCourse); when
  // that moves the view, it is cut where it reaches past the stage. A held view taller than its
  // stage keeps the height heldTop gave it and takes only the course's position across. A tile
  // first fitted while playing (its picture loaded under the pointer) is framed this way too.
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
  // While a page's own tile plays at the same scale, the view stays where it is while what it
  // shows stays in the stage, else moves just far enough to keep it in (contain).
  if (kind.tile && moment.playing && view.scale === scale) {
    toX = contain(view.toX, left * scale, right * scale, stage.clientWidth / 2 - inset);
    toY = contain(view.toY, top * scale, bottom * scale, stage.clientHeight / 2 - inset);
  }
  return { scale, toX, toY, cut: cut?.sides, fadeAt, played };
}

/** The facts about a resting picture's placement that decide where it is cut off (cutAtRest). */
interface CutBy {
  extent: Extent;
  inRoom: boolean;
  acrossRoom: boolean;
  anchored: boolean;
  shifted: boolean;
  course: boolean;
}

/**
 * The sides a cropped resting picture (own size or legible scale) is cut off at, and a new start
 * for the bottom fade when one is needed (feetInFade).
 *
 * When the view was moved (`shifted`) or the fade start is set, the sides are computed from the
 * view (cutSides). Otherwise they follow from the sizes: the bottom when it is taller than the
 * stage's space by more than the slack; the end when a component is wider; both sides when a
 * scene is wider than the stage.
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
  // A held view whose top reaches no more than rowSlack above the stage's top is not cut at the
  // top: only the line's leading is outside.
  const held =
    fadeAt !== null && top * scale - toY + stage.clientHeight / 2 >= -rowSlack - pixelTolerance;
  // How far a picture may reach past its space before it is cut: insetSlack for a popup, the
  // inset for anything else.
  const slack = how.anchored ? insetSlack : inset;
  const cut =
    how.shifted || fadeAt !== null
      ? cutSides(
          // A fit runs only when the picture paints something (shownBoxes), so the join is never
          // null.
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
  // When a point of the pointer's course reaches into the bottom fade, such as a list's second
  // row, the fade starts below it, and the rows below that are hidden whole (trimRows). What the
  // pointer presses then reads as whole and enabled, and the view need not move to bring it out of
  // the fade.
  if (how.course && fadeAt === null && sides.split(' ').includes('bottom')) {
    const feet = feetInFade(stage, canvas, script, boxes, scale, toY);
    if (feet.length) return { sides, fadeAt: Math.max(...feet) };
  }
  return { sides };
}

/**
 * The bottoms, in the canvas's own px, that the bottom fade should start below:
 * - each point of the pointer's course (restingAims) whose box ends inside the fade;
 * - the lowest row ending inside the fade, when everything past the stage's bottom is rows below
 *   it, which are then hidden whole. The crop then ends on that row, rather than on a row faded
 *   halfway out, which would read as disabled.
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
  // A cropped picture's canvas is inside its crop (TileStage.tsx), so it has a parent.
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
