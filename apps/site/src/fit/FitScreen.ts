import type { Placement } from './FitDraw';
import { contain, join, marginPx, stepDown } from './FitGeometry';
import type { StageScript } from './FitKind';
import { stageSize, type Measured, type StageSize } from './FitMeasure';
import { overlayLayer, partOf, type Shown } from './PaintedBoxes';
import { heading, onCourse } from './PointerCourse';
import { pixelTolerance } from '../shared/Remeasure';

const screenCutSlackPx = 1;

export const modal = `${overlayLayer} .env-dialog-backdrop`;

const modalSurfaces = `${overlayLayer} :is(.env-dialog-surface, .env-command-palette, .env-sheet)`;

const modalPositioners =
  '.env-dialog-positioner, .env-command-palette-positioner, .env-sheet-viewport';

const open = (surface: Element) =>
  surface.checkVisibility() && !surface.closest('[data-ending-style]');

export interface ModalNeeds {
  needHeight: number;
  needWidth: number;
  surfaceHeight: number;
}

export function modalNeeds(canvas: HTMLElement): ModalNeeds {
  const px = (value: string) => parseFloat(value) || 0;
  let needHeight = 0;
  let needWidth = 0;
  let surfaceHeight = 0;
  for (const surface of canvas.querySelectorAll<HTMLElement>(modalSurfaces)) {
    if (!open(surface)) continue;
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

export interface ScreenScale {
  scale: number;
  tall: number;
  plays: boolean;
  surfaceHeight: number;
  centred: boolean;
}

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
    needHeight ? (centred ? (down - 2 * marginPx) / surfaceHeight : down / needHeight) : Infinity,
    needWidth ? across / needWidth : Infinity,
  );
  const plays = played !== null;
  const scale = plays ? rest : stepped(fits);
  const tall = plays ? played : Math.max(down / scale, needHeight);
  return { scale, tall, plays, surfaceHeight, centred };
}

export function decideScreenPlace(
  { stage, canvas }: { stage: HTMLElement; canvas: HTMLElement },
  script: StageScript,
  boxes: Shown[],
  { scale, tall, plays, surfaceHeight, centred }: ScreenScale,
  { toY: viewY, fadeAt, playing }: { toY: number; fadeAt: number | null; playing: boolean },
): Placement {
  const { across, down } = stageSize(stage);
  const screenTopViewY = down / 2;
  const screenBottomViewY = Math.max(screenTopViewY, tall * scale - down / 2);
  const keptInScreen = (y: number) => Math.min(Math.max(y, screenTopViewY), screenBottomViewY);
  const surface = [...canvas.querySelectorAll(modalSurfaces)].find(
    (element) => !element.matches('.env-sheet') && open(element),
  );
  const surfaceBox = surface ? partOf(surface, canvas) : null;
  const surfaceFits = surfaceHeight * scale <= down - 2 * marginPx;
  let toY = plays
    ? viewY
    : keptInScreen(
        surfaceBox && surfaceFits
          ? ((surfaceBox.top + surfaceBox.bottom) / 2) * scale
          : surfaceBox && centred
            ? down / 2 + surfaceBox.top * scale - marginPx
            : centred
              ? (tall / 2) * scale
              : onCourse(stage, canvas, script, across / 2, screenTopViewY, scale).toY,
      );
  if (plays) {
    toY = keptInScreen(toY);
    const box = heading(canvas, script);
    if (box) toY = keptInScreen(contain(toY, box.top * scale, box.bottom * scale, down / 2 - 4));
  }
  const shows = join(...boxes.map(({ box }) => box));
  const cut = [
    shows && shows.top * scale - toY < -down / 2 - screenCutSlackPx ? 'top' : '',
    shows && shows.bottom * scale - toY > down / 2 + screenCutSlackPx ? 'bottom' : '',
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
