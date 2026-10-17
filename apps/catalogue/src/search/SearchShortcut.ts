/**
 * Apple keyboards name the Command key; other platforms use Ctrl for the same shortcuts. Decided by
 * the platform, as envUI's SearchTrigger decides, not by the user agent, which some engines set to a
 * Mac's elsewhere.
 */
export const applePlatform =
  typeof navigator !== 'undefined' &&
  /mac|iphone|ipad|ipod/i.test(
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
      navigator.platform ||
      '',
  );

/** The modifier of the search shortcut, as a key hint shows it. */
export const commandKey = applePlatform ? '⌘' : 'Ctrl';

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
