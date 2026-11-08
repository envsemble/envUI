/*
 * What a picture is fitted as, and how its view is placed now. Each figure kind has its fitter:
 *
 * - a gallery's tile, a page's own tile, and an example's or a specimen's picture: useFit.ts, by
 *   the FitKind below, in this folder's steps (FitPicture.ts);
 * - an application's tile, which fills its card: standalone/useAppFit.ts;
 * - a device figure, a phone or a window around its example: standalone/useDeviceFit.ts;
 * - an Adapting to width figure's frames and an anatomy figure's subject drawn from a width:
 *   standalone/WidthFit.tsx;
 * - an open example's room for the overlays it rests open on: standalone/OverlayRoom.ts;
 * - a do or don't figure's example: figures/useVerdictFit.ts, outside this folder, as the motion
 *   figures' stage uses it too, and this folder reads motion/.
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
 * `screen` is whether the picture was decided to be a modal's screen (FitState's `kept`).
 */
export type FitMode = 'screen' | 'playing' | 'resting';

export function fitModeOf(kind: FitKind, screen: boolean, { playing, shown }: Moment): FitMode {
  if (screen) return 'screen';
  return cropped(kind) && kind.tile && playing && shown ? 'playing' : 'resting';
}
