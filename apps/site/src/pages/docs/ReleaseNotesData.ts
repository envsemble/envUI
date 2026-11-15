export type InlinePiece =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; href: string; children: InlinePiece[] };

export interface Release {
  version: string;
  date: string | null;
  upcoming: boolean;
  highlights: InlinePiece[][];
  breaking: InlinePiece[][];
}
