'use client';

import { useRef, type KeyboardEvent, type RefObject } from 'react';
import type { CommandPaletteItem } from '../CommandPalette.js';

const pageSizeWhenListUnmeasured = 8;

function pressArrowKeySoBaseUIMovesHighlight(target: EventTarget, key: string, times: number) {
  for (let step = 0; step < times; step += 1)
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

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

  function optionsFittingInList() {
    const container = list.current;
    const option = container?.querySelector<HTMLElement>('[role="option"]');
    return container && option
      ? Math.max(1, Math.floor(container.clientHeight / option.offsetHeight) - 1)
      : pageSizeWhenListUnmeasured;
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    const { item, index } = highlighted.current;
    const enterWithModifierLeftByBaseUI = event.key === 'Enter' && (event.ctrlKey || event.metaKey);
    if (enterWithModifierLeftByBaseUI && item) {
      event.preventDefault();
      onAct(item, true);
      return;
    }
    if ((event.key === 'PageDown' || event.key === 'PageUp') && count > 0) {
      event.preventDefault();
      const down = event.key === 'PageDown';
      const stepsToTheEnd = down ? count - 1 - index : index;
      pressArrowKeySoBaseUIMovesHighlight(
        event.currentTarget,
        down ? 'ArrowDown' : 'ArrowUp',
        Math.min(optionsFittingInList(), stepsToTheEnd),
      );
    }
  }

  function onHighlight(item: CommandPaletteItem | undefined, index: number) {
    highlighted.current = { item, index: item ? index : -1 };
  }

  return { onKeyDown, onHighlight };
}
