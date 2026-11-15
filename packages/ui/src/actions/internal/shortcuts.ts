const ariaKeyNamesByWrittenName: Record<string, string> = {
  ctrl: 'Control',
  control: 'Control',
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  '⌘': 'Meta',
  '⌃': 'Control',
  win: 'Meta',
  alt: 'Alt',
  option: 'Alt',
  '⌥': 'Alt',
  shift: 'Shift',
  '⇧': 'Shift',
  esc: 'Escape',
  del: 'Delete',
  space: 'Space',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
};

const spacedPlusJoiningTwoKeys = /(\S)\s+\+\s+(?=\S)/g;
const keyBeforePlusOrEndWithPlusAsKey = /([^+]+|\+)(?:\+|$)/g;
const modifierSymbolsWrittenWithoutPlus = /^([⌘⌃⌥⇧]+)(.+)$/u;

export function shortcutChords(shortcut: string) {
  return shortcut
    .trim()
    .replace(spacedPlusJoiningTwoKeys, '$1+')
    .split(/\s+/)
    .filter(Boolean)
    .map((chord) =>
      Array.from(chord.matchAll(keyBeforePlusOrEndWithPlusAsKey), (match) => match[1]),
    )
    .filter((keys) => keys.length > 0);
}

function splitModifierSymbols(key: string) {
  const symbols = modifierSymbolsWrittenWithoutPlus.exec(key);
  return symbols ? [...symbols[1], symbols[2]] : [key];
}

export function keyShortcuts(chords: string[][]) {
  const ariaTakesNoSequence = chords.length !== 1;
  if (ariaTakesNoSequence) return undefined;
  return chords[0]
    .flatMap(splitModifierSymbols)
    .map((key) => (key === '+' ? 'Plus' : (ariaKeyNamesByWrittenName[key.toLowerCase()] ?? key)))
    .join('+');
}
