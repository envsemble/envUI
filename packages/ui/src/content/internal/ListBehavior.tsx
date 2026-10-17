'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '../../actions/Button.js';
import { list as listMessages } from '../../foundations/messages/list.js';
import { DragIndicator } from '../../icons/DragIndicator.js';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { setRef } from '../../internal/setRef.js';
import { useFormatters } from '../../internal/useFormatters.js';
import { useHydrated } from '../../internal/useHydrated.js';
import { useReorder, type ReorderHandlers } from '../../internal/useReorder.js';
import type { ItemProps, RootProps } from '../List.js';

/**
 * The client side of List, as ActionElement is Button's: List.Root and List.Item stay server
 * components and render these for what needs the browser, a reorderable list and its rows.
 */

/** The reorder handlers of the nearest reorderable list, or null. */
const ReorderContext = createContext<ReorderHandlers | null>(null);

/**
 * The polite live region that announces a move, in the document's body, so it adds nothing to
 * the list's container.
 */
function Announcer({ text }: { text: string }) {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return createPortal(
    <div role="status" className="env-list-announcer">
      {text}
    </div>,
    document.body,
  );
}

/** List.Root with onReorder: the list, its rows' reorder handlers and the announcements. */
export function ReorderableList({
  density,
  onReorder,
  className,
  ref,
  ...props
}: RootProps & { onReorder: NonNullable<RootProps['onReorder']> }) {
  const element = useRef<HTMLUListElement | null>(null);
  const messages = useMessages('list', listMessages);
  const format = useFormatters();
  const formatNumber = useCallback((value: number) => format.number().format(value), [format]);
  const { announcement, handlers } = useReorder(element, onReorder, messages, formatNumber);
  const forward = useCallback(
    (node: HTMLUListElement | null) => {
      element.current = node;
      setRef(ref, node);
    },
    [ref],
  );
  return (
    <ReorderContext value={handlers}>
      <ul
        {...props}
        ref={forward}
        data-density={density}
        data-reorderable=""
        className={classNames('env-list', 'env-connected-rows', className)}
      />
      <Announcer text={announcement} />
    </ReorderContext>
  );
}

/**
 * One list row: the current row's mark on its target, and in a reorderable list the drag handle
 * and Alt+↑ and Alt+↓ on the row's target.
 */
export function ListRow({
  label,
  description,
  action,
  interactive = false,
  selected = false,
  start,
  textValue,
  children,
  className,
  ref,
  onKeyDown,
  ...props
}: ItemProps) {
  const reorder = useContext(ReorderContext);
  const messages = useMessages('list', listMessages);
  const row = useRef<HTMLLIElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const forward = useCallback(
    (node: HTMLLIElement | null) => {
      row.current = node;
      setRef(ref, node);
    },
    [ref],
  );
  // A label that isn't text names the handle by what it shows once it is on the page.
  const [shownLabel, setShownLabel] = useState('');
  const text =
    textValue ??
    (typeof label === 'string' || typeof label === 'number' ? String(label) : shownLabel);
  useLayoutEffect(() => {
    if (textValue !== undefined || typeof label === 'string' || typeof label === 'number') return;
    setShownLabel(content.current?.firstChild?.textContent?.trim() ?? '');
  }, [textValue, label]);
  // The current row says so on its target, which people reach and hear, or on the row itself.
  useLayoutEffect(() => {
    if (!selected || !row.current) return;
    const target = row.current.querySelector<HTMLElement>('[data-row-target]') ?? row.current;
    if (target.hasAttribute('aria-current')) return;
    target.setAttribute('aria-current', 'true');
    return () => target.removeAttribute('aria-current');
  });
  const hasStart = start != null || reorder != null;
  return (
    <li
      {...props}
      ref={forward}
      className={classNames('env-list-item', 'env-connected-row', className)}
      data-interactive={interactive ? '' : undefined}
      data-selected={selected ? '' : undefined}
      data-start={hasStart ? '' : undefined}
      onKeyDown={(event: KeyboardEvent<HTMLLIElement>) => {
        onKeyDown?.(event);
        if (reorder && !event.defaultPrevented && row.current)
          reorder.rowKeyDown(event, row.current, text);
      }}
    >
      {hasStart && (
        <div className="env-list-item-start">
          {reorder && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={<DragIndicator />}
              aria-label={messages.reorder({ label: text })}
              className="env-list-item-handle"
              onKeyDown={(event) => row.current && reorder.handleKeyDown(event, row.current, text)}
              onBlur={reorder.handleBlur}
              onPointerDown={(event) =>
                row.current && reorder.handlePointerDown(event, row.current, text)
              }
              onPointerMove={reorder.handlePointerMove}
              onPointerUp={reorder.handlePointerUp}
              onPointerCancel={reorder.handlePointerCancel}
            />
          )}
          {start}
        </div>
      )}
      <div ref={content} className="env-list-item-content">
        {label}
        {description != null && <small>{description}</small>}
        {children}
      </div>
      {action}
    </li>
  );
}
