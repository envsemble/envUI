/*
 * The fit's decisions for a modal's screen (useFit.ts): a component's modal over its backdrop,
 * such as a dialog, a sheet or a command palette, in a tile whose stage is its screen. The
 * functions return their decisions for the fit to draw (FitDraw.ts) and keep; they write nothing.
 * The scale is decided from the measurements, and the place after the canvas is laid out at it.
 *
 * The stage acts as the modal's screen, as the window does in an application. The canvas is laid
 * out as large as the stage at the chosen scale, from the stage's corner, so the backdrop covers
 * the stage and the modal's own style places it. When the modal is taller than the stage, the
 * screen is as tall as the modal needs and shows from its top. While the tile plays, the view pans
 * down the screen to where the pointer is heading, so what it presses is in view before the press.
 */
import type { Placement } from './FitDraw';
import { contain, join, margin, stepDown } from './FitGeometry';
import type { StageScript } from './FitKind';
import { stageSize, type Measured, type StageSize } from './FitMeasure';
import { overlayLayer, partOf, type Shown } from './PaintedBoxes';
import { heading, onCourse } from './PointerCourse';
import { pixelTolerance } from '../shared/Remeasure';

/** A modal's backdrop, open in a tile's overlay layer. */
export const modal = `${overlayLayer} .env-dialog-backdrop`;

/** A modal's surface over its backdrop: a dialog's, a sheet's or a command palette's. */
const modalSurfaces = `${overlayLayer} :is(.env-dialog-surface, .env-command-palette, .env-sheet)`;

/** The element that positions a modal's surface on the screen, with the gutters around it. */
const modalPositioners =
  '.env-dialog-positioner, .env-command-palette-positioner, .env-sheet-viewport';

/** Whether a modal's surface is visible and not closing. */
const open = (surface: Element) =>
  surface.checkVisibility() && !surface.closest('[data-ending-style]');

/**
 * The space the open modals in a canvas need, in its own px:
 * - `needHeight`: the tallest surface's content height plus its margins and its positioner's
 *   padding. Sheets do not count, since a sheet is as tall as the screen it spans.
 * - `needWidth`: the widest surface's width plus margins and padding, only when wider than the
 *   canvas; else 0.
 * - `surfaceHeight`: the tallest surface's content height alone.
 */
export interface ModalNeeds {
  needHeight: number;
  needWidth: number;
  surfaceHeight: number;
}

/** Measures the space the open modals in a canvas need (ModalNeeds). */
export function modalNeeds(canvas: HTMLElement): ModalNeeds {
  const px = (value: string) => parseFloat(value) || 0;
  let needHeight = 0;
  let needWidth = 0;
  let surfaceHeight = 0;
  for (const surface of canvas.querySelectorAll<HTMLElement>(modalSurfaces)) {
    if (!open(surface)) continue;
    // An open surface is inside the overlay layer, so it has a parent.
    const holder = surface.closest<HTMLElement>(modalPositioners) ?? surface.parentElement!;
    const itself = getComputedStyle(surface);
    const around = getComputedStyle(holder);
    const surfaceTall = surface.scrollHeight + surface.offsetHeight - surface.clientHeight;
    if (!surface.matches('.env-sheet')) {
      surfaceHeight = Math.max(surfaceHeight, surfaceTall);
      needHeight = Math.max(
        needHeight,
        surfaceTall +
          px(itself.marginTop) +
          px(itself.marginBottom) +
          px(around.paddingTop) +
          px(around.paddingBottom),
      );
    }
    const wide =
      surface.offsetWidth +
      px(itself.marginLeft) +
      px(itself.marginRight) +
      px(around.paddingLeft) +
      px(around.paddingRight);
    if (wide > canvas.offsetWidth + pixelTolerance) needWidth = Math.max(needWidth, wide);
  }
  return { needHeight, needWidth, surfaceHeight };
}

/**
 * A modal screen's scale, and `tall`, its height in the canvas's own px; `plays`, whether it
 * keeps the screen it had at rest because the tile plays; `surfaceHeight` (ModalNeeds); and
 * `centred`, whether it is an overlay, centred on its surface.
 */
export interface ScreenScale {
  scale: number;
  tall: number;
  plays: boolean;
  surfaceHeight: number;
  centred: boolean;
}

/**
 * Decides a modal screen's scale and height (ScreenScale).
 *
 * An overlay, such as a dialog, is drawn at the overlays' scale, or smaller so its surface fits
 * the stage less a margin at the top and bottom (the backdrop's gutters around it may be cut
 * off), but no smaller than the popups' least scale (or the overlays' scale, if lower). If it is
 * still taller than the stage, it shows from its top.
 *
 * Any other modal is drawn at its own scale (1 on a phone), or smaller so it fits what it needs
 * (ModalNeeds), but no smaller than the popups' least scale (or its own, if lower). On a phone the
 * scale is one of the phone's steps.
 *
 * `played` is the screen's height when a tile that has shown is playing: it then keeps that height
 * and its resting scale, `rest`.
 */
export function decideScreenScale(
  { across, down }: StageSize,
  { scales, own }: Pick<Measured, 'scales' | 'own'>,
  { needHeight, needWidth, surfaceHeight }: ModalNeeds,
  { played, rest }: { played: number | null; rest: number },
): ScreenScale {
  const { overlay, phone, steps, popupLeast } = scales;
  const centred = Boolean(overlay);
  const atMost = overlay || (phone ? 1 : own);
  const stepped = (scale: number) =>
    overlay
      ? Math.max(Math.min(overlay, popupLeast), scale)
      : phone
        ? stepDown(steps, scale, popupLeast)
        : Math.max(Math.min(own, popupLeast), scale);
  const fits = Math.min(
    atMost,
    needHeight ? (centred ? (down - 2 * margin) / surfaceHeight : down / needHeight) : Infinity,
    needWidth ? across / needWidth : Infinity,
  );
  // While playing, the screen keeps its resting size as the modal closes and opens again.
  const plays = played !== null;
  const scale = plays ? rest : stepped(fits);
  const tall = plays ? played : Math.max(down / scale, needHeight);
  return { scale, tall, plays, surfaceHeight, centred };
}

/**
 * Where the view of a modal's screen goes, measured after the screen is laid out at its scale
 * (drawScreenSize). The view is always centred across; only its height changes.
 *
 * At rest, in order:
 * - a surface (not a sheet) that fits the stage less a margin is centred;
 * - an overlay's surface that does not fit shows from its top, a margin below the stage's top;
 * - an overlay with no surface found is centred on the screen;
 * - any other modal is framed on the pointer's course, as its play frames it (onCourse).
 * While playing, the view keeps its height and pans to keep where the pointer is heading in view.
 *
 * The view stays within the screen. The top and bottom are cut where what it paints reaches past
 * the stage by more than 1 px.
 */
export function decideScreenPlace(
  { stage, canvas }: { stage: HTMLElement; canvas: HTMLElement },
  script: StageScript,
  boxes: Shown[],
  { scale, tall, plays, surfaceHeight, centred }: ScreenScale,
  { toY: viewY, fadeAt, playing }: { toY: number; fadeAt: number | null; playing: boolean },
): Placement {
  const { across, down } = stageSize(stage);
  // The range of view heights that keep the stage inside the screen, from its top to its bottom.
  const highest = down / 2;
  const lowest = Math.max(highest, tall * scale - down / 2);
  const along = (y: number) => Math.min(Math.max(y, highest), lowest);
  const surface = [...canvas.querySelectorAll(modalSurfaces)].find(
    (element) => !element.matches('.env-sheet') && open(element),
  );
  const surfaceBox = surface ? partOf(surface, canvas) : null;
  const surfaceFits = surfaceHeight * scale <= down - 2 * margin;
  let toY = plays
    ? viewY
    : along(
        surfaceBox && surfaceFits
          ? ((surfaceBox.top + surfaceBox.bottom) / 2) * scale
          : surfaceBox && centred
            ? down / 2 + surfaceBox.top * scale - margin
            : centred
              ? (tall / 2) * scale
              : onCourse(stage, canvas, script, across / 2, highest, scale).toY,
      );
  if (plays) {
    toY = along(toY);
    const box = heading(canvas, script);
    if (box) toY = along(contain(toY, box.top * scale, box.bottom * scale, down / 2 - 4));
  }
  const shows = join(...boxes.map(({ box }) => box));
  const cut = [
    shows && shows.top * scale - toY < -down / 2 - 1 ? 'top' : '',
    shows && shows.bottom * scale - toY > down / 2 + 1 ? 'bottom' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return {
    scale,
    toX: across / 2,
    toY,
    cut,
    fadeAt,
    played: playing,
    screenTop: true,
  };
}
