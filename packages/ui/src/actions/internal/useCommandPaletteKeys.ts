'use client';

import { useRef, type KeyboardEvent, type RefObject } from 'react';
import type { CommandPaletteItem } from '../CommandPalette.js';

/** Options Page Up and Page Down move where the list can't be measured. */
const fallbackPageSize = 8;

/**
 * The keys CommandPalette's search field adds to Base UI's: Ctrl or Cmd with Enter chooses the
 * highlighted option, and Page Up and Page Down move the highlight a list's height. `onHighlight`
 * follows Base UI's highlight, which they read.
 */
export function useCommandPaletteKeys({
  list,
  count,
  onAct,
}: {
  list: RefObject<HTMLDivElement | null>;
  count: number;
  onAct: (item: CommandPaletteItem, modifier: boolean) => void;
}) {
  const highlighted = useRef<{ item?: CommandPaletteItem; index: number }>({ index: -1 });

  /** Options that fit in the list's height, for Page Up and Page Down. */
  function pageSize() {
    const container = list.current;
    const option = container?.querySelector<HTMLElement>('[role="option"]');
    return container && option
      ? Math.max(1, Math.floor(container.clientHeight / option.offsetHeight) - 1)
      : fallbackPageSize;
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    const { item, index } = highlighted.current;
    // Base UI leaves Enter with a modifier to the application: it chooses the highlighted option.
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && item) {
      event.preventDefault();
      onAct(item, true);
      return;
    }
    // Page Up and Page Down move the highlight a list's height, stopping at the ends, as that many
    // presses of the arrow keys would, so Base UI keeps the highlight and its scrolling.
    if ((event.key === 'PageDown' || event.key === 'PageUp') && count > 0) {
      event.preventDefault();
      const down = event.key === 'PageDown';
      const steps = Math.min(pageSize(), down ? count - 1 - index : index);
      for (let step = 0; step < steps; step += 1)
        event.currentTarget.dispatchEvent(
          new KeyboardEvent('keydown', { key: down ? 'ArrowDown' : 'ArrowUp', bubbles: true }),
        );
    }
  }

  function onHighlight(item: CommandPaletteItem | undefined, index: number) {
    highlighted.current = { item, index: item ? index : -1 };
  }

  return { onKeyDown, onHighlight };
}
