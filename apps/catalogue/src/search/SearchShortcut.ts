/** Apple keyboards name the Command key; other platforms use Ctrl for the same shortcuts. */
export const applePlatform =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

/** The modifier of the search shortcut, as a key hint shows it. */
export const commandKey = applePlatform ? '⌘' : 'Ctrl';

/** The search shortcut, as aria-keyshortcuts names it: ⌘K on Apple platforms, Ctrl+K elsewhere. */
export const searchKeyShortcuts = applePlatform ? 'Meta+K' : 'Control+K';

/**
 * Whether a key press asks for search: ⌘K on Apple platforms and Ctrl+K elsewhere, so Ctrl+K stays
 * free on a Mac, where text fields use it to delete to the end of the line.
 */
export function isSearchShortcut(event: KeyboardEvent) {
  const modifier = applePlatform
    ? event.metaKey && !event.ctrlKey
    : event.ctrlKey && !event.metaKey;
  return modifier && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k';
}
