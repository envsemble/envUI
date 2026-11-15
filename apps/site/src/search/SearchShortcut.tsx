import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { useModifierKey } from '@envsemble/envui';

export function SearchShortcut({
  setSearchOpen,
}: {
  setSearchOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { key } = useModifierKey();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const platformModifierHeld =
        key === 'Meta' ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
      const shortcut =
        platformModifierHeld && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k';
      if (event.defaultPrevented || !shortcut) return;
      event.preventDefault();
      setSearchOpen((open) => !open);
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [key, setSearchOpen]);
  return null;
}
