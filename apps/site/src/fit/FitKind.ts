/*
 * The types that say how a picture is fitted: its kind (FitKind), what its script tells the fit
 * (StageScript), and which decider places its view now (FitMode). README.md defines the words
 * this folder's comments use and lists which fitter fits what.
 */

/**
 * How a picture's scale is chosen, and whether it is a page's own tile (tiles/Tiles.ts), written
 * for the tiles' window and played by its script. fitKindOf returns one of these cases.
 */
export type FitKind =
  /**
   * A component drawn at its own size and cropped by its stage. The components' gallery draws
   * every component at one scale this way: its tile, or the example of a component without one.
   */
  | { scale: 'own'; tile: boolean }
  /**
   * A pattern's scene, drawn no smaller than a legible scale. The patterns' gallery draws each
   * scene this way, centred on what it paints and cropped by its stage where it is larger.
   */
  | { scale: 'legible'; tile: boolean }
  /** A page's own tile drawn at its window's scale, such as a drawing or a foundation's tile. */
  | { scale: 'window'; tile: true }
  /** An example or a specimen, drawn as large as fits what it paints, at most its window's scale. */
  | { scale: 'content'; tile: false };

/** The tiles' window's width, in rem (Tile.css). A tile written for a narrower one is a drawing. */
const tileWindowWidth = 14;

/**
 * One object per kind. fitKindOf returns these, so the same kind is always the same object and
 * useFit can restart its fit only when the kind changes.
 */
const kinds = {
  ownTile: { scale: 'own', tile: true },
  own: { scale: 'own', tile: false },
  legibleTile: { scale: 'legible', tile: true },
  legible: { scale: 'legible', tile: false },
  window: { scale: 'window', tile: true },
  content: { scale: 'content', tile: false },
} as const satisfies Record<string, FitKind>;

/**
 * The kind a tile's picture is fitted as, from how its page frames it (`frame`, frameOf in
 * RelatedPages.ts). `own` gives a component at its own size, except a drawing (a tile written
 * for a window narrower than the tiles'), which is drawn larger at its window's scale. `legible`
 * gives a pattern's scene at a legible scale. Without a frame, a tile is drawn at its window's
 * scale and anything else as large as what it paints.
 */
export function fitKindOf(
  picture: { tile?: boolean; window?: { width: number } } | undefined,
  frame: 'own' | 'legible' | undefined,
): FitKind {
  const tile = Boolean(picture?.tile);
  const drawing = picture?.window !== undefined && picture.window.width < tileWindowWidth;
  if (frame === 'own' && !drawing) return tile ? kinds.ownTile : kinds.own;
  if (frame === 'legible') return tile ? kinds.legibleTile : kinds.legible;
  return tile ? kinds.window : kinds.content;
}

/**
 * Whether a picture is cropped by its stage where it is larger, rather than drawn smaller to
 * fit. True for a component at its own size and a scene at a legible scale.
 */
export const cropped = (kind: FitKind) => kind.scale === 'own' || kind.scale === 'legible';

/** A point a tile's pointer heads to: an element, by its selector, and fractions of its box. */
export interface Aim {
  selector: string;
  x: number;
  y: number;
}

/**
 * What a tile's script tells its fit. The fit reads it again at the start of every fit, through
 * a ScriptReader.
 */
export interface StageScript {
  /**
   * Whether the view holds still while the tile plays (a held view), and whether the picture
   * lays out from its window's top, so what it adds while playing grows downwards.
   */
  holdsView: boolean;
  fromTop: boolean;
  /**
   * `named`: selectors of everything the animation acts on. They count only inside popups.
   * `anywhere`: the named selectors that count outside popups too, such as a panel that opens in
   * place.
   */
  named: readonly string[];
  anywhere: readonly string[];
  /** Where the pointer heads now (the heading), and every point it heads to, in order (the course). */
  heading: Aim | null;
  course: readonly Aim[];
  /** The element of the canvas that a selector of the script aims at, found as the pointer finds it. */
  aimed: (selector: string) => Element | null;
  /**
   * Whether the components' gallery shows two tiles to a row (narrowGallery, Tiles.ts). Its
   * stages are then too narrow for a popup beside its button.
   */
  narrow: boolean;
}

/**
 * Reads a stage's script (StageScript) from the stage's root element, and names the event the
 * root receives when the pointer's heading changes, which makes the fit run again. The figures
 * pass it in (figures/StageScript.ts), because the script's records live in motion/.
 */
export interface ScriptReader {
  read: (root: Element) => StageScript;
  heading: string;
}

/**
 * When a fit runs: whether the picture plays now, and whether it has shown (`data-fitted`). Until
 * it has shown, it is framed as at rest, even when its picture loaded while the pointer was on it.
 */
export interface Moment {
  playing: boolean;
  shown: boolean;
}

/**
 * Which decider places the view:
 * - `screen`: a modal's screen fills the stage, at rest and while playing (FitScreen.ts). Chosen
 *   when the fit decided the picture is a modal's screen (`kept.screen`, useFit.ts).
 * - `playing`: a cropped tile that plays after it has shown, drawn out for what it opens
 *   (FitPlaying.ts).
 * - `resting`: every other case, centred on what it paints (FitResting.ts). This includes any
 *   picture other than a cropped tile while it plays.
 */
export type FitMode = 'screen' | 'playing' | 'resting';

export function fitModeOf(kind: FitKind, screen: boolean, { playing, shown }: Moment): FitMode {
  if (screen) return 'screen';
  return cropped(kind) && kind.tile && playing && shown ? 'playing' : 'resting';
}
