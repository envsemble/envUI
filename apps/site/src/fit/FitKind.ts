export type FitKind =
  | { scale: 'own'; tile: boolean }
  | { scale: 'window'; tile: true }
  | { scale: 'content'; tile: false };

const tileWindowWidthRem = 14;

const kinds = {
  ownTile: { scale: 'own', tile: true },
  own: { scale: 'own', tile: false },
  window: { scale: 'window', tile: true },
  content: { scale: 'content', tile: false },
} as const satisfies Record<string, FitKind>;

export function fitKindOf(
  picture: { tile?: boolean; window?: { width: number } } | undefined,
  ownFrame: boolean,
): FitKind {
  const tile = Boolean(picture?.tile);
  const drawing = picture?.window !== undefined && picture.window.width < tileWindowWidthRem;
  if (ownFrame && !drawing) return tile ? kinds.ownTile : kinds.own;
  return tile ? kinds.window : kinds.content;
}

export const cropped = (kind: FitKind) => kind.scale === 'own';

export interface Aim {
  selector: string;
  x: number;
  y: number;
}

export interface StageScript {
  holdsView: boolean;
  fromTop: boolean;
  named: readonly string[];
  anywhere: readonly string[];
  heading: Aim | null;
  course: readonly Aim[];
  aimed: (selector: string) => Element | null;
  narrow: boolean;
}

export interface ScriptReader {
  read: (root: Element) => StageScript;
  heading: string;
}

export interface Moment {
  playing: boolean;
  shown: boolean;
}

export type FitMode = 'screen' | 'playing' | 'resting';

export function fitModeOf(kind: FitKind, screen: boolean, { playing, shown }: Moment): FitMode {
  if (screen) return 'screen';
  return cropped(kind) && kind.tile && playing && shown ? 'playing' : 'resting';
}
