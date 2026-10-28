'use client';

import {
  useCallback,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useEnvUI, type Direction } from './EnvUIContext.js';
import { computedDirection } from './direction.js';

export interface RovingOptions<Item> {
  /** The items, in the order they are laid out. */
  items: readonly Item[];
  /** A stable key for an item, unique among the items. */
  getKey(item: Item): string;
  /** Whether the keyboard skips an item. */
  isDisabled?(item: Item): boolean;
  /**
   * How the items are laid out: a vertical list (Up and Down), a horizontal one (Left and Right,
   * which follow the text direction) or a grid (all four).
   */
  orientation: 'horizontal' | 'vertical' | 'grid';
  /**
   * For a grid: how many items a row holds, or, with columnMajor, how many a column holds, as in a
   * calendar heatmap whose items run down each week.
   */
  columns?: number;
  /** For a grid whose items run down each column before the next column. */
  columnMajor?: boolean;
  /** Whether moving past the last item reaches the first, and back; lists only. */
  loop?: boolean;
  /** The text direction for Left and Right; the nearest EnvUIProvider's, or the widget's own. */
  dir?: Direction;
  /** The key of the item that holds the tab stop; null for the first enabled item. */
  activeKey: string | null;
  /** Receives the key of the item the keyboard or focus moves to. */
  onActiveKeyChange(key: string): void;
  /** The text typeahead matches against, for lists that move to an item as its name is typed. */
  typeahead?(item: Item): string;
  /** How many items Page Up and Page Down move; 10 by default, lists only. */
  pageSize?: number;
}

/** How long typed letters keep adding up for typeahead, in milliseconds. */
const typeaheadTimeout = 500;

/**
 * The index the keyboard moves to from `index`, or undefined for a key it ignores. Disabled items
 * are skipped in the direction of travel; a move that finds none stays.
 */
function target<Item>(
  options: RovingOptions<Item>,
  index: number,
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey'>,
  direction: Direction,
): number | undefined {
  const { items, orientation, columns = 1, columnMajor = false, loop = false } = options;
  const disabled = (at: number) => options.isDisabled?.(items[at]) ?? false;
  const last = items.length - 1;
  /** The nearest enabled index from `start`, stepping by `by`, within the items. */
  const seek = (start: number, by: number) => {
    for (let at = start; at >= 0 && at <= last; at += by) if (!disabled(at)) return at;
    return undefined;
  };
  const move = (by: number) => {
    let next = index + by;
    if (orientation !== 'grid' && loop && (next < 0 || next > last)) next = next < 0 ? last : 0;
    if (next < 0 || next > last) return undefined;
    // A grid skips a disabled item to the next one in the same direction, in its row or column.
    return seek(next, orientation === 'grid' ? by : Math.sign(by));
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
      if (corner || columnMajor) return seek(0, 1);
      return seek(index - (index % columns), 1);
    }
    if (event.key === 'End') {
      if (corner || columnMajor) return seek(last, -1);
      return seek(Math.min(last, index - (index % columns) + columns - 1), -1);
    }
    return undefined;
  }
  const next = orientation === 'vertical' ? 'ArrowDown' : forward;
  const previous = orientation === 'vertical' ? 'ArrowUp' : backward;
  if (event.key === next) return move(1);
  if (event.key === previous) return move(-1);
  if (event.key === 'Home') return seek(0, 1);
  if (event.key === 'End') return seek(last, -1);
  const page = options.pageSize ?? 10;
  if (event.key === 'PageDown') return seek(Math.min(last, index + page), -1) ?? seek(index, 1);
  if (event.key === 'PageUp') return seek(Math.max(0, index - page), 1) ?? seek(index, -1);
  return undefined;
}

/** Typeahead: the letters typed lately, and the item they match next. */
function useTypeahead<Item>(options: RovingOptions<Item>) {
  const typed = useRef({ text: '', at: 0 });
  return (event: ReactKeyboardEvent, index: number) => {
    const { typeahead, items } = options;
    if (!typeahead || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey)
      return undefined;
    if (event.key === ' ' && typed.current.text === '') return undefined;
    const now = event.timeStamp;
    const text = (now - typed.current.at > typeaheadTimeout ? '' : typed.current.text) + event.key;
    typed.current = { text, at: now };
    const wanted = text.toLocaleLowerCase();
    // A repeated letter steps through the items that start with it.
    const repeated = [...wanted].every((letter) => letter === wanted[0]);
    for (let offset = 1; offset <= items.length; offset += 1) {
      const at = (index + (repeated && wanted.length > 1 ? offset : offset - 1)) % items.length;
      const item = items[at];
      if (options.isDisabled?.(item)) continue;
      const name = typeahead(item).toLocaleLowerCase();
      if (repeated ? name.startsWith(wanted[0]) : name.startsWith(wanted)) return at;
    }
    return undefined;
  };
}

/**
 * Roving tabindex for a composite widget, such as a tree, a calendar grid or a list of options
 * that take focus themselves: one item holds the tab stop, and the arrow keys, Home, End, Page Up,
 * Page Down and typeahead move focus between items, skipping disabled ones and following the text
 * direction.
 *
 *   const roving = useRovingFocus({ items, getKey, orientation: 'vertical', activeKey,
 *     onActiveKeyChange: setActiveKey });
 *   <div role="tree" {...roving.getContainerProps()}>
 *     {items.map((item) => <div role="treeitem" key={item.id} {...roving.getItemProps(item)} />)}
 */
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
    // Left and Right follow the given direction, the provider's, or the one at the widget.
    const direction = options.dir ?? provided ?? computedDirection(event.currentTarget);
    const next = target(options, index, event, direction) ?? typeahead(event, index);
    if (next === undefined) return;
    event.preventDefault();
    focus(getKey(items[next]));
  };

  return {
    /** The key of the item that holds the tab stop. */
    activeKey: stopKey,
    /** Moves the tab stop and focus to an item. */
    focus,
    /** Props for the element that holds the items. */
    getContainerProps: () => ({ onKeyDown }),
    /** Props for an item's focusable element. */
    getItemProps: (item: Item) => {
      const key = getKey(item);
      return {
        tabIndex: key === stopKey ? 0 : -1,
        'data-active': key === stopKey ? '' : undefined,
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

/**
 * The listbox pattern where focus stays in a text input, such as suggestions under an editor or a
 * search: the arrow keys, Page Up and Page Down move the active option, which the input names in
 * aria-activedescendant, and Enter picks it. Options keep the input's focus when pressed.
 */
export function useActiveDescendant<Item>(
  options: Omit<RovingOptions<Item>, 'orientation' | 'columns' | 'columnMajor' | 'typeahead'> & {
    /** Receives the item picked with Enter or a press. */
    onSelect(item: Item): void;
  },
) {
  const prefix = useId();
  const { items, getKey, activeKey, onActiveKeyChange, onSelect } = options;
  const roving = { ...options, orientation: 'vertical' as const };
  const idOf = (key: string) => `${prefix}-${key.replace(/\s+/g, '-')}`;
  const activeIndex = items.findIndex((item) => getKey(item) === activeKey);
  return {
    /** Props for the text input that keeps focus. */
    getInputProps: () => ({
      'aria-activedescendant': activeIndex === -1 ? undefined : idOf(activeKey as string),
      onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
        if (event.defaultPrevented || items.length === 0) return;
        if (event.key === 'Enter') {
          if (activeIndex === -1) return;
          event.preventDefault();
          onSelect(items[activeIndex]);
          return;
        }
        // Home and End move the caret in the input; the list answers the arrows and pages.
        if (event.key === 'Home' || event.key === 'End') return;
        // Without an active option, Down reaches the first and Up the last.
        const next =
          activeIndex !== -1
            ? target(roving, activeIndex, event, 'ltr')
            : event.key === 'ArrowDown'
              ? target(roving, items.length - 1, { ...event, key: 'Home' }, 'ltr')
              : event.key === 'ArrowUp'
                ? target(roving, 0, { ...event, key: 'End' }, 'ltr')
                : undefined;
        if (next === undefined) return;
        event.preventDefault();
        onActiveKeyChange(getKey(items[next]));
      },
    }),
    /** Props for an option. */
    getOptionProps: (item: Item) => {
      const key = getKey(item);
      return {
        id: idOf(key),
        'aria-selected': key === activeKey,
        'aria-disabled': options.isDisabled?.(item) || undefined,
        'data-highlighted': key === activeKey ? '' : undefined,
        onPointerMove: () => {
          if (key !== activeKey && !options.isDisabled?.(item)) onActiveKeyChange(key);
        },
        // A press keeps focus in the input.
        onMouseDown: (event: ReactMouseEvent) => event.preventDefault(),
        onClick: () => {
          if (!options.isDisabled?.(item)) onSelect(item);
        },
      };
    },
  };
}
