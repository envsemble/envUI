'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '../actions/Button.js';
import { list as listMessages } from '../foundations/messages/list.js';
import type { RowDensity } from '../foundations/Theme.js';
import { DragIndicator } from '../icons/DragIndicator.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { setRef } from '../internal/setRef.js';
import { useFormatters } from '../internal/useFormatters.js';
import { useHydrated } from '../internal/useHydrated.js';
import { useReorder, type ReorderHandlers } from '../internal/useReorder.js';
import { withDisplayName } from '../internal/withDisplayName.js';

/** The reorder handlers of the nearest List.Root with onReorder, or null. */
const ReorderContext = createContext<ReorderHandlers | null>(null);

export interface RootProps extends ComponentPropsWithRef<'ul'> {
  /**
   * How tightly the rows pack: xs, sm, md or lg changes only their block padding, never the text.
   * @default 'md'
   */
  density?: RowDensity;
  /**
   * Makes the rows reorderable: each row gets a drag handle at its start, moved by dragging it or
   * by keyboard, and the list calls this with the row's index and the index it is dropped at. The
   * application moves the item in its own state; nothing moves until it does.
   */
  onReorder?: (from: number, to: number) => void;
}

/**
 * A `ul` of connected rows with shared outer corners. In a muted Surface that holds only lists, such as
 * `<Surface background="muted" padding={3}>`, the rows take the raised fill, so they stand out
 * from it. With onReorder, people move the rows by their handles.
 */
function Root({ density = 'md', onReorder, className, ref, ...props }: RootProps) {
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
    <ReorderContext value={onReorder ? handlers : null}>
      <ul
        {...props}
        ref={forward}
        data-density={density}
        data-reorderable={onReorder ? '' : undefined}
        className={classNames('env-list', 'env-connected-rows', className)}
      />
      {onReorder && <Announcer text={announcement} />}
    </ReorderContext>
  );
}

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

export interface ItemProps extends ComponentPropsWithRef<'li'> {
  /** The row's main text, such as an item's name; a link marked `data-row-target` in an interactive row. */
  label: ReactNode;
  /** A short fact in muted text below the label, such as who changed the item and when. */
  description?: ReactNode;
  /** A control at the end of the row, such as a Button; it moves below the text when it doesn't fit. */
  action?: ReactNode;
  /** More content after the label and the description, such as a Badge. */
  children?: ReactNode;
  /**
   * The row opens something through a link or button inside: it reacts to hover, keyboard focus
   * inside it and presses. Mark that link or button `data-row-target` to stretch it over the row.
   */
  interactive?: boolean;
  /**
   * The current row, such as the one whose details show beside a list: the selected fill, and
   * `aria-current="true"` on its `data-row-target`, or on the row without one.
   * @default false
   */
  selected?: boolean;
  /**
   * Content before the label, such as an Avatar, an icon or a Checkbox for choosing several rows;
   * a row whose checkbox is checked takes the selected fill.
   */
  start?: ReactNode;
  /**
   * The row's label as plain text, for its drag handle's name and the reorder announcements where
   * `label` isn't a string.
   * @default the label's text
   */
  textValue?: string;
}

/** One `li` row with a label, a description and an action. */
function Item({
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

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'List.Root');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'List.Item');
export { RootPart as Root, ItemPart as Item };
