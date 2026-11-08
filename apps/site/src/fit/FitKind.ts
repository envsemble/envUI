/*
 * What a picture is fitted as, what its script tells the fit, and how its view is placed now.
 * Each figure kind has its fitter:
 *
 * - a gallery's tile, a page's own tile, and an example's or a specimen's picture: useFit.ts, by
 *   the FitKind below, deciding in FitScreen.ts, FitPlaying.ts and FitResting.ts;
 * - an application's tile, which fills its card: standalone/useAppFit.ts;
 * - a device figure, a phone or a window around its example: standalone/useDeviceFit.ts;
 * - an Adapting to width figure's frames and an anatomy figure's subject drawn from a width:
 *   standalone/WidthFit.tsx;
 * - an open example's room for the overlays it rests open on: standalone/OverlayRoom.ts;
 * - a do or don't figure's example: figures/useVerdictFit.ts, outside this folder, as the motion
 *   figures' stage uses it too (AGENTS.md).
 *
 * The words this folder's comments use:
 *
 * - picture: what a tile or a figure shows, rendered in its canvas; stage: the box it is shown in;
 *   canvas: the box the picture lays out in, moved and scaled to its place; crop: the box around a
 *   tile's canvas, which clips it at the stage and fades out at its foot (TileStage.tsx).
 * - view: where the canvas is drawn in its stage, the point it centres and its scale, and where it
 *   eases to (ViewEasing.ts). Framed: the view a resting picture was placed at, with what it was
 *   measured as then, which it holds while only its popups move (holdsFrame, HeldView.ts).
 * - still, at rest: a tile that isn't playing, and what it shows then; playing: its script runs,
 *   on hover or by itself. Shown (`data-fitted`): once its first fit has held, it fades in.
 * - what it paints: the boxes that show something of their own, such as a fill, an edge or text,
 *   rather than boxes that only lay others out (shownBoxes, PaintedBoxes.ts).
 * - the script: what a tile's animation tells its fit (StageScript): what it acts on, which the
 *   view keeps in view (it names them), where its pointer heads now (heading) and over the whole
 *   script (course). A held view: a tile whose still is written as its largest state, such as a
 *   picker resting open, holds its view as it plays, framed once on its still.
 * - drawn out: a playing tile's view moved and drawn smaller, once, so what it opened fits.
 * - cut: the sides a picture reaches past its stage at (`data-cut`), where it fades out; trimmed:
 *   the rows past the crop's foot hidden whole (trimRows, FitDraw.ts).
 * - popup: what opens in a picture's overlay layer; an overlay: a tile that is one, such as a
 *   notification, drawn at the overlays' scale; a modal: a dialog, a sheet or a palette over its
 *   backdrop, whose screen is the stage (FitScreen.ts).
 * - kept: what one fit decides that the next goes by (`kept`, useFit.ts).
 */

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

/** A point a tile's pointer heads to: an element, by its selector, and fractions of its box. */
export interface Aim {
  selector: string;
  x: number;
  y: number;
}

/**
 * What a tile's script tells its fit, read as each fit starts (TileStage.tsx reads it from
 * motion/MustShow.ts, where the script names it).
 */
export interface StageScript {
  /** Whether its view holds as it plays, and whether it lays out from its window's top. */
  holdsView: boolean;
  fromTop: boolean;
  /**
   * The selectors of everything its animation acts on, which count in its popups, and of those it
   * names to count anywhere too, such as a panel it opens in place.
   */
  named: readonly string[];
  anywhere: readonly string[];
  /** Where its pointer heads now, and every point it heads to over its script, in order. */
  heading: Aim | null;
  course: readonly Aim[];
  /** The element of the canvas a selector of its script aims at, as its pointer finds it. */
  aimed: (selector: string) => Element | null;
  /**
   * Whether the components' gallery stands two to a row, its stages too narrow for a popup beside
   * its button (narrowGallery, Tiles.ts).
   */
  narrow: boolean;
}

/**
 * When a fit runs: whether its picture plays now, and whether it has shown (`data-fitted`). Until
 * it shows, it is framed as at rest, also a tile whose picture loaded while the pointer was on it.
 */
export interface Moment {
  playing: boolean;
  shown: boolean;
}

/**
 * How a fit places the view: on a modal's screen, the stage, at rest and as it plays (FitScreen.ts);
 * drawn out for what it opens as a cropped tile plays, once it has shown (FitPlaying.ts); else at
 * rest, centred on what it paints (FitResting.ts), as any other picture is also as it plays.
 * `screen` is whether the picture was decided to be a modal's screen (`kept.screen`, useFit.ts).
 */
export type FitMode = 'screen' | 'playing' | 'resting';

export function fitModeOf(kind: FitKind, screen: boolean, { playing, shown }: Moment): FitMode {
  if (screen) return 'screen';
  return cropped(kind) && kind.tile && playing && shown ? 'playing' : 'resting';
}
