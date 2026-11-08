/*
 * The decisions of a fit on a modal's screen (FitPicture.ts): a component's modal over its
 * backdrop, such as a dialog, a sheet or a command palette, with its tile's stage for its screen.
 * They are returned for the drawing step to apply (FitDraw.ts), and read the page, never write it.
 *
 * The modal has the stage for its screen, as an application's has the window: the canvas is laid
 * out as large as the stage shows at its scale, from the stage's corner, so the backdrop covers the
 * stage as it covers a screen and the modal is placed in it by its own style. Taller than the stage
 * still, the screen is as tall as the modal needs and shows from its top; as the tile plays, the
 * view pans down it, easing, to what the pointer heads to, so what it presses is in view before the
 * press.
 */
import type { Placement } from './FitDraw';
import { contain, join, margin, stepDown } from './FitGeometry';
import type { Measured } from './FitMeasure';
import type { Fitting } from './FitState';
import { overlayLayer, partOf, type Shown } from './PaintedBoxes';
import { heading, onCourse } from './PointerCourse';

/** A component's modal over its backdrop, open in its tile's overlay layer. */
export const modal = `${overlayLayer} .env-dialog-backdrop`;

/** A modal's surface, what it shows over its backdrop: a dialog's, a sheet's or a palette's. */
const modalSurfaces = `${overlayLayer} :is(.env-dialog-surface, .env-command-palette, .env-sheet)`;

/** The box that places a modal's surface over the screen, with its gutters. */
const modalPositioners =
  '.env-dialog-positioner, .env-command-palette-positioner, .env-sheet-viewport';

/** Whether a modal's surface is open and staying so. */
const open = (surface: Element) =>
  surface.checkVisibility() && !surface.closest('[data-ending-style]');

/**
 * The room the modals in a canvas need: as tall as their content and the gutters around it, a
 * sheet as tall as the screen it spans, and as wide where one is wider than the screen; and how
 * tall a surface is alone.
 */
function modalRoom(canvas: HTMLElement) {
  const px = (value: string) => parseFloat(value) || 0;
  let needHeight = 0;
  let needWidth = 0;
  let surfaceHeight = 0;
  for (const surface of canvas.querySelectorAll<HTMLElement>(modalSurfaces)) {
    if (!open(surface)) continue;
    // A surface open in the overlay layer is inside it.
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
    if (wide > canvas.offsetWidth + 0.5) needWidth = Math.max(needWidth, wide);
  }
  return { needHeight, needWidth, surfaceHeight };
}

/**
 * The scale a modal's screen is drawn at, and how tall it is in the canvas's own px; whether it
 * plays, keeping the screen it had at rest; how tall its surface is; and whether it is an overlay,
 * centred on its surface.
 */
export interface ScreenScale {
  scale: number;
  tall: number;
  plays: boolean;
  surfaceHeight: number;
  centred: boolean;
}

/**
 * An overlay, such as a dialog, is drawn at the overlays' one scale, or smaller as far as it needs
 * to show whole, down to its window's least (Tiles.ts), shown from its top where it is taller than
 * the stage still; any other modal at its own size, as far smaller as it needs, down to the popups'
 * least, or on a phone at one of a phone's scales. An overlay is drawn whole where its surface
 * fits the stage a margin from its edges, the gutters of backdrop around it cut off where they
 * don't, centred on it.
 */
export function decideScreenScale(f: Fitting, { scales, own }: Measured): ScreenScale {
  const { stage, canvas, view } = f;
  const { overlay, phone, steps, popupLeast } = scales;
  const centred = Boolean(overlay);
  const atMost = overlay || (phone ? 1 : own);
  const stepped = (scale: number) =>
    overlay
      ? Math.max(Math.min(overlay, popupLeast), scale)
      : phone
        ? stepDown(steps, scale, popupLeast)
        : Math.max(Math.min(own, popupLeast), scale);
  const across = stage.clientWidth;
  const down = stage.clientHeight;
  const { needHeight, needWidth, surfaceHeight } = modalRoom(canvas);
  const fits = Math.min(
    atMost,
    needHeight ? (centred ? (down - 2 * margin) / surfaceHeight : down / needHeight) : Infinity,
    needWidth ? across / needWidth : Infinity,
  );
  // As it plays, the screen stays as it was at rest, as the modal closes and opens again.
  const plays = f.playing.current && canvas.dataset.fitted !== undefined;
  const scale = plays ? view.rest : stepped(fits);
  const tall = plays ? canvas.offsetHeight : Math.max(down / scale, needHeight);
  return { scale, tall, plays, surfaceHeight, centred };
}

/**
 * Where a modal's screen is viewed, measured as it is laid out at its scale (drawScreenSize): at
 * rest, framed as it plays, on what its pointer heads to (onCourse); an overlay centred on its
 * surface, which its positioner centres on the screen. A modal's surface, such as a dialog's or a
 * palette's, that shows whole a margin from the stage's edges is centred on; an overlay's taller
 * than that shows from its top, a margin from the stage's. As it plays, the view pans down the
 * screen to what the pointer heads to. What it shows past the stage's top or foot, the screen's
 * own fill aside, is cut off there.
 */
export function decideScreenPlace(
  f: Fitting,
  boxes: Shown[],
  { scale, tall, plays, surfaceHeight, centred }: ScreenScale,
): Placement {
  const { stage, canvas, view } = f;
  const across = stage.clientWidth;
  const down = stage.clientHeight;
  // From the screen's top to its foot: where the stage's middle is along it.
  const highest = down / 2;
  const lowest = Math.max(highest, tall * scale - down / 2);
  const along = (y: number) => Math.min(Math.max(y, highest), lowest);
  const surface = [...canvas.querySelectorAll(modalSurfaces)].find(
    (element) => !element.matches('.env-sheet') && open(element),
  );
  const surfaceBox = surface ? partOf(surface, canvas) : null;
  const surfaceFits = surfaceHeight * scale <= down - 2 * margin;
  let toY = plays
    ? view.toY
    : along(
        surfaceBox && surfaceFits
          ? ((surfaceBox.top + surfaceBox.bottom) / 2) * scale
          : surfaceBox && centred
            ? down / 2 + surfaceBox.top * scale - margin
            : centred
              ? (tall / 2) * scale
              : onCourse(stage, canvas, across / 2, highest, scale).toY,
      );
  if (plays) {
    toY = along(toY);
    const box = heading(canvas);
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
    fadeAt: f.kept.fadeAt,
    played: f.playing.current,
    screenTop: true,
  };
}
