/*
 * One picture's fit as it runs (useFit.ts): its stage and canvas, what it was asked for, its view,
 * and what it keeps from one fit to the next.
 */
import { motionEasing } from '../motion/MotionTokens';
import { trimRows } from './Crop';
import type { Follow, Framed, Shape } from './HeldView';
import type { Run } from './PlayFit';
import type { Course } from './ViewEasing';

/** What a picture is fitted as (useFit's options). */
export interface FitKind {
  /** Whether the window it lays out in counts whole, as a gallery's does. */
  whole: boolean;
  /** Whether it is a page's own tile, drawn at its window's scale. */
  tile: boolean;
  /** Whether it is drawn at its own size, cropped by its stage rather than drawn smaller. */
  ownSize: boolean;
  /**
   * Whether it is drawn no smaller than a legible scale, as a pattern's scene in a gallery is,
   * centred on what it paints and cropped by its stage where it is larger.
   */
  legible: boolean;
}

/**
 * The view: where the canvas is and the scale it is drawn at, and where it eases to (glide), a
 * target that moves as the picture changes followed on the way. `rest` is the scale it is fitted
 * at resting, `zoomed` whether it is drawn smaller than that as it plays, or on its way back, and
 * `frame` the glide's next frame.
 */
export interface View {
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

export interface Fitting extends FitKind {
  stage: HTMLElement;
  canvas: HTMLElement;
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
  /** Whether the canvas is a screen as large as the stage, for a modal over it (screenFit). */
  screen: boolean;
  /** At rest, what the view was last framed on and where, and how often it followed since. */
  framed: Framed | null;
  follow: Follow;
  /** What the fit at hand was decided on, measured before it moves anything (shapeOf). */
  measured: Shape | null;
  /**
   * Whether a held popup is drawn whole a little smaller (narrower, below), and at what scale,
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
    ...kind,
    stage,
    canvas,
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
