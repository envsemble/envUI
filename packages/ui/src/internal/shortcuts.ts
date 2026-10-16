/** Names people write for keys, by their lower case, and the key names ARIA uses for them. */
const keyNames: Record<string, string> = {
  ctrl: 'Control',
  control: 'Control',
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  '⌘': 'Meta',
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

/**
 * A displayed hint such as Ctrl+Shift+P, Ctrl++ or a sequence such as Ctrl+K Ctrl+S, as the keys of
 * each chord. Spaces around + join a chord.
 */
export function shortcutChords(shortcut: string) {
  return (
    shortcut
      .trim()
      // A spaced + between two keys joins them; a + that is itself the key stays.
      .replace(/(\S)\s+\+\s+(?=\S)/g, '$1+')
      .split(/\s+/)
      .filter(Boolean)
      // Each key is followed by a + or the end; a + right after a separator is the key itself.
      .map((chord) => Array.from(chord.matchAll(/([^+]+|\+)(?:\+|$)/g), (match) => match[1]!))
      .filter((keys) => keys.length > 0)
  );
}

/**
 * aria-keyshortcuts for a single chord, such as Control+Shift+P or Control+Plus. ARIA lists
 * alternative shortcuts, not sequences, so a sequence shows its keys without the attribute.
 */
export function keyShortcuts(chords: string[][]) {
  if (chords.length !== 1) return undefined;
  return chords[0]!
    .map((key) => (key === '+' ? 'Plus' : (keyNames[key.toLowerCase()] ?? key)))
    .join('+');
}
