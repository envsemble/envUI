import type { MarkdownSelection } from './markdownFormatting.js';

const typingGroupInterval = 1_000;
const maxEntries = 100;
const maxCharacters = 1_000_000;
const minEntriesKeptOverCharacterLimit = 2;
const typingInputTypes = [
  'insertText',
  'insertCompositionText',
  'deleteContentBackward',
  'deleteContentForward',
];

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

export function recordMarkdownEdit(
  history: MarkdownHistory,
  before: MarkdownSelection,
  after: MarkdownSelection,
  inputType: string,
) {
  const previous = history.entries[history.index];
  const now = Date.now();
  const typing = typingInputTypes.includes(inputType);
  const atLatestEntry = history.index > 0 && history.index === history.entries.length - 1;
  const sameKindOfTypingSoonAfter =
    history.lastInputType === inputType && now - history.lastEditTime < typingGroupInterval;
  const caretNotMovedOrSelectedSince =
    before.start === before.end &&
    before.start === previous.start &&
    previous.start === previous.end;
  const continuesTypingGroup =
    typing && atLatestEntry && sameKindOfTypingSoonAfter && caretNotMovedOrSelectedSince;
  history.entries.splice(history.index + 1);
  if (continuesTypingGroup) history.entries[history.index] = after;
  else {
    history.entries[history.index] = before;
    history.entries.push(after);
    history.index++;
  }
  history.lastInputType = inputType;
  history.lastEditTime = now;
  let characters = history.entries.reduce((count, entry) => count + entry.value.length, 0);
  while (
    history.entries.length > maxEntries ||
    (characters > maxCharacters && history.entries.length > minEntriesKeptOverCharacterLimit)
  ) {
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
