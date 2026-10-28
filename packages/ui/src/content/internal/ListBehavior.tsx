'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '../../actions/Button.js';
import { list as listMessages } from '../../foundations/messages/list.js';
import { DragIndicator } from '../../icons/DragIndicator.js';
import { classNames } from '../../internal/classNames.js';
import { Grid } from '../../foundations/Layout.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { setRef } from '../../internal/setRef.js';
import { useFormatters } from '../../internal/useFormatters.js';
import { useHydrated } from '../../internal/useHydrated.js';
import { useReorder, type Announcement, type ReorderHandlers } from './useReorder.js';
import type { RootProps } from '../List.js';
import { usePortalContainer } from '../../internal/PortalContainerContext.js';

/**
 * The client side of List, as ActionElement is Button's: List.Root and List.Item stay server
 * components and render these islands only for a reorderable list: the list, which handles its
 * rows' Alt+↑ and Alt+↓ and announces the moves, and each row's handle.
 */

interface Reorder {
  handlers: ReorderHandlers;
  /** The id of the handles' instructions, which describe them. */
  instructions: string;
}

/** The nearest reorderable list's handlers and instructions, or null. */
const ReorderContext = createContext<Reorder | null>(null);

/**
 * The polite live regions that announce a move, in the document's body, so they add nothing to
 * the list's container. Each announcement goes to the other region and empties the last one, so
 * the same words twice, such as reaching the end of the list again, are announced again.
 */
function Announcer({ announcement }: { announcement: Announcement }) {
  const hydrated = useHydrated();
  const { container } = usePortalContainer();
  if (!hydrated || container === null) return null;
  const shown = announcement.count % 2;
  return createPortal(
    <div className="env-list-announcer">
      <div role="status">{shown === 1 ? announcement.text : ''}</div>
      <div role="status">{shown === 0 ? announcement.text : ''}</div>
    </div>,
    container ?? document.body,
  );
}

/** The row of the list that holds an element: the list's `li` child around it. */
function rowOf(list: HTMLElement, element: EventTarget | null) {
  let node = element instanceof Element ? element : null;
  while (node && node.parentElement !== list) node = node.parentElement;
  return node instanceof HTMLElement && node.tagName === 'LI' ? node : null;
}

/** A row's label, as its handle has it, or the row's text where it has no handle. */
const labelOf = (row: HTMLElement) =>
  row
    .querySelector(':scope > .env-list-item-start > .env-list-item-handle')
    ?.getAttribute('data-label') ??
  row.textContent?.trim() ??
  '';

/**
 * List.Root with onReorder: the list, Alt+↑ and Alt+↓ on its rows' targets, the handles'
 * instructions and the announcements.
 */
export function ReorderableList({
  density,
  onReorder,
  className,
  ref,
  onKeyDown,
  children,
  ...props
}: RootProps & { onReorder: NonNullable<RootProps['onReorder']> }) {
  const element = useRef<HTMLUListElement | null>(null);
  const messages = useMessages('list', listMessages);
  const format = useFormatters();
  const formatNumber = useCallback((value: number) => format.number().format(value), [format]);
  const { announcement, handlers } = useReorder(element, onReorder, messages, formatNumber);
  const instructions = `${useId()}-instructions`;
  const reorder = useMemo(() => ({ handlers, instructions }), [handlers, instructions]);
  // A row without a handle, such as one of a component that doesn't pass List.Root's props on to
  // its List.Item, can't be moved: say so while developing. Written inline so bundlers replace
  // process.env.NODE_ENV, as in Theme. Each list says so once.
  const reported = useRef(false);
  useLayoutEffect(() => {
    let developing = false;
    try {
      developing = process.env.NODE_ENV !== 'production';
    } catch {
      // No bundler defined process.env.NODE_ENV.
    }
    const list = element.current;
    if (!developing || !list || reported.current) return;
    const bare = Array.from(list.children).filter(
      (row) => row.tagName === 'LI' && !row.querySelector('.env-list-item-handle'),
    ).length;
    if (bare === 0) return;
    reported.current = true;
    // A development-only report, as React reports an invalid prop.
    // eslint-disable-next-line no-console
    console.error(
      `envUI: ${bare} row${bare === 1 ? '' : 's'} of a List.Root with onReorder ${bare === 1 ? 'has' : 'have'} no drag handle. ` +
        'Render each row as a List.Item, and have a row component pass the props it does not use on to its List.Item.',
    );
  });
  const forward = useCallback(
    (node: HTMLUListElement | null) => {
      element.current = node;
      setRef(ref, node);
    },
    [ref],
  );
  return (
    <ReorderContext value={reorder}>
      <Grid
        render={
          <ul
            {...props}
            ref={forward}
            data-density={density}
            data-reorderable=""
            className={classNames('env-list', 'env-connected-rows', className)}
            onKeyDown={(event: KeyboardEvent<HTMLUListElement>) => {
              onKeyDown?.(event);
              const list = element.current;
              if (event.defaultPrevented || !list) return;
              const row = rowOf(list, event.target);
              if (row) handlers.rowKeyDown(event, row, labelOf(row));
            }}
          />
        }
      >
        {children}
      </Grid>
      <span id={instructions} hidden>
        {messages.instructions}
      </span>
      <Announcer announcement={announcement} />
    </ReorderContext>
  );
}

/**
 * A reorderable row's drag handle: pressed, by keyboard or by a click, it lifts the row and drops
 * it; dragged, the row follows it. Outside a reorderable list it renders nothing.
 */
export function ListReorderHandle({ textValue }: { textValue?: string }) {
  const reorder = useContext(ReorderContext);
  const messages = useMessages('list', listMessages);
  const button = useRef<HTMLButtonElement | null>(null);
  // A label that isn't text names the handle by what it shows, followed as it changes.
  const [shownLabel, setShownLabel] = useState('');
  useLayoutEffect(() => {
    if (textValue !== undefined || !reorder) return;
    const content = button.current?.closest('li')?.querySelector(':scope > .env-list-item-content');
    if (!content) return;
    const read = () => setShownLabel(content.firstChild?.textContent?.trim() ?? '');
    read();
    const observer = new MutationObserver(read);
    observer.observe(content, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [textValue, reorder]);
  if (!reorder) return null;
  const { handlers, instructions } = reorder;
  const text = textValue ?? shownLabel;
  const row = () => button.current?.closest('li') ?? null;
  return (
    <IconButton
      ref={button}
      variant="ghost"
      size="sm"
      icon={<DragIndicator />}
      aria-label={messages.reorder({ label: text })}
      aria-describedby={instructions}
      // Whether the row is lifted; the reorder sets it as the row lifts and drops.
      aria-pressed={false}
      data-label={text}
      className="env-list-item-handle"
      onClick={(event) => {
        const each = row();
        if (each) handlers.handleClick(event, each, text);
      }}
      onKeyDown={(event) => {
        const each = row();
        if (each) handlers.handleKeyDown(event, each, text);
      }}
      onKeyUp={handlers.handleKeyUp}
      onBlur={handlers.handleBlur}
      onPointerDown={(event) => {
        const each = row();
        if (each) handlers.handlePointerDown(event, each, text);
      }}
      onPointerMove={handlers.handlePointerMove}
      onPointerUp={handlers.handlePointerUp}
      onPointerCancel={handlers.handlePointerCancel}
    />
  );
}
