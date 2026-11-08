import type { ModifierKey } from '@envsemble/envui';

/**
 * Whether a key press asks for search: the platform's modifier with K, ⌘K on Apple platforms and
 * Ctrl+K elsewhere (useModifierKey), so Ctrl+K stays free on a Mac, where text fields use it to
 * delete to the end of the line.
 */
export function isSearchShortcut(event: KeyboardEvent, modifier: ModifierKey['key']) {
  const held =
    modifier === 'Meta' ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  return held && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k';
}
