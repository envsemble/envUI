/*
 * One picture's fit as it runs (useFit.ts): its stage and canvas, what it is fitted as, its view,
 * and what it keeps from one fit to the next.
 */
import { motionEasing } from '../motion/MotionTokens';
import { trimRows } from './Crop';
import type { Follow, Framed, Shape } from './HeldView';
import type { Run } from './PlayFit';
import type { Course } from './ViewEasing';

/**
 * What a picture is fitted as: how its scale is chosen, and whether it is a page's own tile
 * (tiles/Tiles.ts), written for the tiles' window, whose script plays (fitKindOf). These are the
 * cases there are.
 */
export type FitKind =
  /**
   * A component at its own size, cropped by its stage, as the components' gallery draws every
   * component at one scale: its tile, or the example of a component without one.
   */
  | { scale: 'own'; tile: boolean }
  /**
   * A pattern's scene, no smaller than a legible scale, as the patterns' gallery draws each, centred
   * on what it paints and cropped by its stage where it is larger.
   */
  | { scale: 'legible'; tile: boolean }
  /** A page's own tile at its window's scale, such as a drawing, or a foundation's tile. */
  | { scale: 'window'; tile: true }
  /** An example or a specimen, as large as what it paints fits its stage, no larger than its window. */
  | { scale: 'content'; tile: false };

/** The tiles' window's width, in rem (Tile.css): a tile written for a narrower one is a drawing. */
const tileWindowWidth = 14;

/**
 * What a tile's picture is fitted as, by how its page frames it (frameOf, RelatedPages.ts): a
 * component at its own size, but a drawing, whose window is narrower than the tiles', which is
 * drawn larger at its window's scale; a pattern's scene at a legible scale; anything else at its
 * window's scale, or what it paints.
 */
export function fitKindOf(
  picture: { tile?: boolean; window?: { width: number } } | undefined,
  frame: 'own' | 'legible' | undefined,
): FitKind {
  const tile = Boolean(picture?.tile);
  const drawing = picture?.window !== undefined && picture.window.width < tileWindowWidth;
  if (frame === 'own' && !drawing) return { scale: 'own', tile };
  if (frame === 'legible') return { scale: 'legible', tile };
  return tile ? { scale: 'window', tile: true } : { scale: 'content', tile: false };
}

/**
 * Whether a picture is cropped by its stage where it is larger: a component at its own size and a
 * scene at a legible scale, rather than drawn smaller to fit.
 */
export const cropped = (kind: FitKind) => kind.scale === 'own' || kind.scale === 'legible';

/**
 * When a fit runs: whether its picture plays now, and whether it has shown (`data-fitted`). Until
 * it shows, it is framed as at rest, also a tile whose picture loaded while the pointer was on it.
 */
export interface Moment {
  playing: boolean;
  shown: boolean;
}

/**
 * How a fit places the view: on a modal's screen, the stage, at rest and as it plays (screenFit);
 * drawn out for what it opens as a cropped tile plays, once it has shown (playFit); else at rest,
 * centred on what it paints (placeAtRest, Fit.ts), as any other picture is also as it plays.
 */
export type FitMode = 'screen' | 'playing' | 'resting';

export function fitModeOf(f: Fitting, { playing, shown }: Moment): FitMode {
  if (f.screen) return 'screen';
  return cropped(f.kind) && f.kind.tile && playing && shown ? 'playing' : 'resting';
}

/**
 * The view: where the canvas is and the scale it is drawn at, and where it eases to (glide), a
 * target that moves as the picture changes followed on the way. `rest` is the scale it is fitted
 * at resting, `zoomed` whether it is drawn smaller than that as it plays, or on its way back, and
 * `frame` the glide's next frame.
 */
interface View {
  x: number;
  y: number;
  scale: number;
  toX: number;
  toY: number;
  toScale: number;
  rest: number;
  zoomed: boolean;
  frame: number;
}

export interface Fitting {
  stage: HTMLElement;
  canvas: HTMLElement;
  kind: FitKind;
  /** Whether it plays now, as it changes. */
  playing: { readonly current: boolean };
  /** Fits it again in the next frame. */
  update: () => void;
  /** Fits it again as what it observes resizes. */
  resize: ResizeObserver;
  view: View;
  /** The glide the view is on, and its easing (ViewEasing.ts). */
  course: Course | null;
  ease: (time: number) => number;
  /**
   * Before it shows, the frames its fit has held where it is, and when it was first fitted: a
   * popup is placed by its style a frame or two after it opens, and a picture shown before then
   * would glide to it as it fades in.
   */
  first: { calm: number; start: number };
  /** As a tile plays, what its still showed and what it has opened since (playFit). */
  run: Run | null;
  /**
   * Whether the canvas is a screen as large as the stage, for a modal over it (screenFit): decided
   * on its still, it stays one as the modal closes (FitMode).
   */
  screen: boolean;
  /** At rest, what the view was last framed on and where, and how often it followed since. */
  framed: Framed | null;
  follow: Follow;
  /** What the fit at hand was decided on, measured before it moves anything (shapeOf). */
  measured: Shape | null;
  /**
   * Whether a held popup is drawn whole a little smaller (narrower), and at what scale,
   * decided as it is first fitted, for its stage's size: a popup is placed again as the view
   * changes, a little higher or lower against the window's edge, and a choice that followed it
   * would go back and forth.
   */
  wholeFor: { room: string; narrower: number | null; whole: number } | null;
  /**
   * Where a held view's fade at its foot starts at the latest, in the canvas's own px: below what
   * its script acts on, such as a picker's chosen row.
   */
  fadeAt: number | null;
}

/** A picture's fit before its first. */
export function newFitting(
  stage: HTMLElement,
  canvas: HTMLElement,
  kind: FitKind,
  playing: Fitting['playing'],
  update: () => void,
): Fitting {
  return {
    stage,
    canvas,
    kind,
    playing,
    update,
    resize: new ResizeObserver(update),
    view: { x: 0, y: 0, scale: 1, toX: 0, toY: 0, toScale: 1, rest: 1, zoomed: false, frame: 0 },
    course: null,
    ease: motionEasing('ease'),
    first: { calm: 0, start: 0 },
    run: null,
    screen: false,
    framed: null,
    follow: { count: 0, following: false },
    measured: null,
    wholeFor: null,
    fadeAt: null,
  };
}

/**
 * Hides the rows past the crop's foot and fades it out there, below `fadeAt`; a modal's screen is
 * cut off at the stage's edges, as at a screen's, its backdrop whole (trimRows).
 */
export const trim = (f: Fitting, played = false) =>
  trimRows(
    f.canvas,
    played,
    f.fadeAt === null ? null : f.stage.clientHeight / 2 - f.view.y + f.fadeAt * f.view.scale,
    f.screen,
  );

/** Draws the canvas where the view is, and trims its crop there. */
export function place(f: Fitting) {
  const { canvas, view } = f;
  const transform = `translate(${-view.x}px, ${-view.y}px) scale(${view.scale})`;
  if (canvas.style.transform !== transform) canvas.style.transform = transform;
  trim(f, f.run !== null || (f.screen && f.playing.current));
}
