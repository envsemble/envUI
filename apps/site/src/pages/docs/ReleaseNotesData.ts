import type { InlinePiece } from '../../documentation/InlinePieces';

export type { InlinePiece };

export interface Release {
  version: string;
  date: string | null;
  upcoming: boolean;
  highlights: InlinePiece[][];
  breaking: InlinePiece[][];
}
