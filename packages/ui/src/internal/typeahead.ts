/**
 * How long typed letters keep adding up for typeahead, in milliseconds: Base UI's, so lists, trees
 * and time wheels match a typed name as the menus and selects built on it do.
 */
const typeaheadTimeout = 750;

/** The text typed ahead so far, and the time of its last key in milliseconds. */
export interface TypedText {
  text: string;
  at: number;
}

/** Whether a key pressed at `now` still adds to the text typed so far. */
export const stillTypingAhead = (typed: TypedText, now: number) =>
  now - typed.at <= typeaheadTimeout;

/** The text typed ahead once `key` is pressed at `now`: the text so far and the key, or the key. */
export const typeAhead = (typed: TypedText, key: string, now: number) =>
  stillTypingAhead(typed, now) ? typed.text + key : key;
