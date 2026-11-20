'use client';

import { useCallback, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useEnvUI, type Direction } from '../../internal/provider/EnvUIContext.js';
import { computedDirection } from '../../internal/dom/direction.js';
import { typeAhead } from '../../internal/typeahead.js';
import { flag } from '../../internal/flag.js';

export interface RovingOptions<Item> {
  items: readonly Item[];
  getKey(item: Item): string;
  isDisabled?(item: Item): boolean;
  orientation: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  columnMajor?: boolean;
  loop?: boolean;
  dir?: Direction;
  activeKey: string | null;
  onActiveKeyChange(key: string): void;
  typeahead?(item: Item): string;
  pageSize?: number;
}

function keyboardTarget<Item>(
  options: RovingOptions<Item>,
  index: number,
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey'>,
  direction: Direction,
): number | undefined {
  const { items, orientation, columns = 1, columnMajor = false, loop = false } = options;
  const disabled = (at: number) => options.isDisabled?.(items[at]) ?? false;
  const last = items.length - 1;
  const nearestEnabledFrom = (start: number, by: number) => {
    for (let at = start; at >= 0 && at <= last; at += by) if (!disabled(at)) return at;
    return undefined;
  };
  const move = (by: number) => {
    let next = index + by;
    if (orientation !== 'grid' && loop && (next < 0 || next > last)) next = next < 0 ? last : 0;
    if (next < 0 || next > last) return undefined;
    const skipKeepingAGridsRowOrColumn = orientation === 'grid' ? by : Math.sign(by);
    return nearestEnabledFrom(next, skipKeepingAGridsRowOrColumn);
  };
  const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  if (orientation === 'grid') {
    const across = columnMajor ? columns : 1;
    const down = columnMajor ? 1 : columns;
    if (event.key === forward) return move(across);
    if (event.key === backward) return move(-across);
    if (event.key === 'ArrowDown') return move(down);
    if (event.key === 'ArrowUp') return move(-down);
    const corner = event.ctrlKey || event.metaKey;
    if (event.key === 'Home') {
      if (corner || columnMajor) return nearestEnabledFrom(0, 1);
      return nearestEnabledFrom(index - (index % columns), 1);
    }
    if (event.key === 'End') {
      if (corner || columnMajor) return nearestEnabledFrom(last, -1);
      return nearestEnabledFrom(Math.min(last, index - (index % columns) + columns - 1), -1);
    }
    return undefined;
  }
  const next = orientation === 'vertical' ? 'ArrowDown' : forward;
  const previous = orientation === 'vertical' ? 'ArrowUp' : backward;
  if (event.key === next) return move(1);
  if (event.key === previous) return move(-1);
  if (event.key === 'Home') return nearestEnabledFrom(0, 1);
  if (event.key === 'End') return nearestEnabledFrom(last, -1);
  const page = options.pageSize ?? 10;
  if (event.key === 'PageDown')
    return nearestEnabledFrom(Math.min(last, index + page), -1) ?? nearestEnabledFrom(index, 1);
  if (event.key === 'PageUp')
    return nearestEnabledFrom(Math.max(0, index - page), 1) ?? nearestEnabledFrom(index, -1);
  return undefined;
}

function useTypeahead<Item>(options: RovingOptions<Item>) {
  const typed = useRef({ text: '', at: 0 });
  return (event: ReactKeyboardEvent, index: number) => {
    const { typeahead, items } = options;
    if (!typeahead || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey)
      return undefined;
    if (event.key === ' ' && typed.current.text === '') return undefined;
    const now = event.timeStamp;
    const text = typeAhead(typed.current, event.key, now);
    typed.current = { text, at: now };
    const wanted = text.toLocaleLowerCase();
    const repeatedLetter = [...wanted].every((letter) => letter === wanted[0]);
    for (let offset = 1; offset <= items.length; offset += 1) {
      const at =
        (index + (repeatedLetter && wanted.length > 1 ? offset : offset - 1)) % items.length;
      const item = items[at];
      if (options.isDisabled?.(item)) continue;
      const name = typeahead(item).toLocaleLowerCase();
      if (repeatedLetter ? name.startsWith(wanted[0]) : name.startsWith(wanted)) return at;
    }
    return undefined;
  };
}

export function useRovingFocus<Item>(options: RovingOptions<Item>) {
  const provided = useEnvUI().dir;
  const elements = useRef(new Map<string, HTMLElement>());
  const typeahead = useTypeahead(options);
  const { items, getKey, activeKey, onActiveKeyChange } = options;
  const firstEnabled = items.find((item) => !options.isDisabled?.(item));
  const stopKey =
    activeKey !== null && items.some((item) => getKey(item) === activeKey)
      ? activeKey
      : firstEnabled
        ? getKey(firstEnabled)
        : null;

  const focus = useCallback(
    (key: string) => {
      onActiveKeyChange(key);
      elements.current.get(key)?.focus();
    },
    [onActiveKeyChange],
  );

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || stopKey === null) return;
    const index = items.findIndex((item) => getKey(item) === stopKey);
    if (index === -1) return;
    const direction = options.dir ?? provided ?? computedDirection(event.currentTarget);
    const next = keyboardTarget(options, index, event, direction) ?? typeahead(event, index);
    if (next === undefined) return;
    event.preventDefault();
    focus(getKey(items[next]));
  };

  return {
    activeKey: stopKey,
    focus,
    getContainerProps: () => ({ onKeyDown }),
    getItemProps: (item: Item) => {
      const key = getKey(item);
      return {
        tabIndex: key === stopKey ? 0 : -1,
        'data-active': flag(key === stopKey),
        onFocus: () => {
          if (key !== activeKey) onActiveKeyChange(key);
        },
        ref: (element: HTMLElement | null) => {
          if (element) elements.current.set(key, element);
          else elements.current.delete(key);
        },
      };
    },
  };
}
