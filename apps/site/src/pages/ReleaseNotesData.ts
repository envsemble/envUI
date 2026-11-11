/** The shapes of the release notes' data from the repository; see the virtual modules in vite.config.ts. */

/** A piece of a line of the release notes: text, code, or a link whose text has pieces of its own. */
export type InlinePiece =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; href: string; children: InlinePiece[] };

/** One release's entry in the release notes. */
export interface Release {
  version: string;
  /** The release's date, YYYY-MM-DD; null while it is upcoming. */
  date: string | null;
  upcoming: boolean;
  highlights: InlinePiece[][];
  breaking: InlinePiece[][];
}
