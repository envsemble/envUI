/*
 * What a picture's fit keeps from one fit to the next (useFit.ts), in three parts: what it fits,
 * set once; what its fits decided that the next goes by (`kept`); and its view, where the canvas is
 * drawn and where it eases to (`view`, ViewEasing.ts). What a fit measures is its own
 * (FitMeasure.ts), never kept.
 */
import { rootEasingFunction } from '../motion/RootMotionTokens';
import type { FitKind } from './FitKind';
import type { Run } from './FitPlaying';
import type { Follow, Framed } from './HeldView';
import type { Course } from './ViewEasing';

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
  /** The glide the view is on, and its easing (ViewEasing.ts). */
  course: Course | null;
  ease: (time: number) => number;
  /**
   * Before it shows, the frames its fit has held where it is, and when it was first fitted: a
   * popup is placed by its style a frame or two after it opens, and a picture shown before then
   * would glide to it as it fades in.
   */
  first: { calm: number; start: number };
}

/** What a picture's fits decided that the next one goes by. */
interface Kept {
  /**
   * Whether the canvas is a screen as large as the stage, for a modal over it (FitScreen.ts):
   * decided on its still, it stays one as the modal closes (FitMode).
   */
  screen: boolean;
  /** At rest, what the view was last framed on and where, and how often it followed since. */
  framed: Framed | null;
  follow: Follow;
  /**
   * Whether a held popup is drawn whole a little smaller (narrower), and at what scale,
   * decided as it is first fitted, for its stage's size (decidePopups): a popup is placed again as
   * the view changes, a little higher or lower against the window's edge, and a choice that
   * followed it would go back and forth.
   */
  wholeFor: { room: string; narrower: number | null; whole: number } | null;
  /**
   * Where a held view's fade at its foot starts at the latest, in the canvas's own px: below what
   * its script acts on, such as a picker's chosen row.
   */
  fadeAt: number | null;
  /** As a tile plays, what its still showed and what it has opened since (FitPlaying.ts). */
  run: Run | null;
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
  kept: Kept;
  view: View;
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
    kept: {
      screen: false,
      framed: null,
      follow: { count: 0, following: false },
      wholeFor: null,
      fadeAt: null,
      run: null,
    },
    view: {
      x: 0,
      y: 0,
      scale: 1,
      toX: 0,
      toY: 0,
      toScale: 1,
      rest: 1,
      zoomed: false,
      frame: 0,
      course: null,
      ease: rootEasingFunction('ease'),
      first: { calm: 0, start: 0 },
    },
  };
}
