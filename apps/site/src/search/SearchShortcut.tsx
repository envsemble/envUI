import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { useModifierKey } from '@envsemble/envui';

/**
 * ⌘K, or Ctrl+K, opens search from anywhere, text fields included, and closes it again; an editor
 * that handles the keys itself, such as for a link, keeps them. The modifier is the platform's,
 * ⌘ on Apple platforms and Ctrl elsewhere (useModifierKey), so Ctrl+K stays free on a Mac, where
 * text fields use it to delete to the end of the line. It renders nothing: a component of its own,
 * so the modifier, which settles once the page has hydrated, renders this again rather than the
 * shell, which would render the whole navigation again, and hydrate the page in one task with it.
 */
export function SearchShortcut({
  setSearchOpen,
}: {
  setSearchOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { key } = useModifierKey();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const held =
        key === 'Meta' ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
      const shortcut = held && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k';
      if (event.defaultPrevented || !shortcut) return;
      event.preventDefault();
      setSearchOpen((open) => !open);
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [key, setSearchOpen]);
  return null;
}
