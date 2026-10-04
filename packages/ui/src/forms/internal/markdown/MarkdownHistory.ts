import type { MarkdownSelection } from './MarkdownFormatting.js';

export interface MarkdownHistory {
  entries: MarkdownSelection[];
  index: number;
  lastInputType: string;
  lastEditTime: number;
}
export function createMarkdownHistory(value: string): MarkdownHistory {
  return {
    entries: [{ value, start: 0, end: 0, direction: 'none' }],
    index: 0,
    lastInputType: '',
    lastEditTime: 0,
  };
}

/** Typing and toolbar changes share one history; grouping stops at selections and commands. */
export function recordMarkdownEdit(
  history: MarkdownHistory,
  before: MarkdownSelection,
  after: MarkdownSelection,
  inputType: string,
) {
  const previous = history.entries[history.index];
  const now = Date.now();
  const continuousTyping = [
    'insertText',
    'insertCompositionText',
    'deleteContentBackward',
    'deleteContentForward',
  ].includes(inputType);
  const merge =
    continuousTyping &&
    history.index > 0 &&
    history.index === history.entries.length - 1 &&
    history.lastInputType === inputType &&
    now - history.lastEditTime < 1_000 &&
    before.start === before.end &&
    before.start === previous.start &&
    previous.start === previous.end;
  history.entries.splice(history.index + 1);
  if (merge) history.entries[history.index] = after;
  else {
    history.entries[history.index] = before;
    history.entries.push(after);
    history.index++;
  }
  history.lastInputType = inputType;
  history.lastEditTime = now;
  let characters = history.entries.reduce((count, entry) => count + entry.value.length, 0);
  while (history.entries.length > 100 || (characters > 1_000_000 && history.entries.length > 2)) {
    characters -= history.entries.shift()!.value.length;
    history.index--;
  }
}
export function moveMarkdownHistory(history: MarkdownHistory, direction: -1 | 1) {
  const next = history.index + direction;
  if (next < 0 || next >= history.entries.length) return null;
  history.index = next;
  history.lastInputType = '';
  return history.entries[next];
}
