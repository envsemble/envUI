'use client';

import { useCallback, useRef, type KeyboardEvent } from 'react';
import { useEnvUI, type Direction } from '../../../internal/provider/EnvUIContext.js';
import { computedDirection } from '../../../internal/dom/direction.js';
import { flag } from '../../../internal/flag.js';

const swatchesAPageKeyMoves = 10;

function targetIndex(key: string, index: number, count: number, direction: Direction) {
  const last = count - 1;
  const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  if (key === forward) return index === last ? 0 : index + 1;
  if (key === backward) return index === 0 ? last : index - 1;
  if (key === 'Home') return 0;
  if (key === 'End') return last;
  if (key === 'PageDown') return Math.min(last, index + swatchesAPageKeyMoves);
  if (key === 'PageUp') return Math.max(0, index - swatchesAPageKeyMoves);
  return undefined;
}

export function useSwatchFocus({
  keys,
  disabled,
  activeKey,
  onActiveKeyChange,
}: {
  keys: readonly string[];
  disabled: boolean;
  activeKey: string | null;
  onActiveKeyChange(key: string): void;
}) {
  const provided = useEnvUI().dir;
  const elements = useRef(new Map<string, HTMLElement>());
  const firstEnabled = disabled ? undefined : keys[0];
  const stopKey =
    activeKey !== null && keys.includes(activeKey) ? activeKey : (firstEnabled ?? null);

  const focus = useCallback(
    (key: string) => {
      onActiveKeyChange(key);
      elements.current.get(key)?.focus();
    },
    [onActiveKeyChange],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || stopKey === null || disabled) return;
    const direction = provided ?? computedDirection(event.currentTarget);
    const next = targetIndex(event.key, keys.indexOf(stopKey), keys.length, direction);
    if (next === undefined) return;
    event.preventDefault();
    focus(keys[next]);
  };

  return {
    listProps: { onKeyDown },
    swatchProps: (key: string) => ({
      tabIndex: key === stopKey ? 0 : -1,
      'data-active': flag(key === stopKey),
      onFocus: () => {
        if (key !== activeKey) onActiveKeyChange(key);
      },
      ref: (element: HTMLElement | null) => {
        if (element) elements.current.set(key, element);
        else elements.current.delete(key);
      },
    }),
  };
}
