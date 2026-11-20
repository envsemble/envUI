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
import { IconDragIndicator } from '../../icons/DragIndicator.js';
import { classNames } from '../../internal/classNames.js';
import { Grid } from '../../layout/Layout.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { setRef } from '../../internal/react/setRef.js';
import { useFormatters } from '../../internal/provider/useFormatters.js';
import { useHydrated } from '../../internal/react/useHydrated.js';
import { useReorder, type Announcement, type ReorderHandlers } from './useReorder.js';
import type { RootProps } from '../List.js';
import { usePortalContainer } from '../../internal/provider/PortalContainerContext.js';
import { reportInDevelopment } from '../../internal/developmentReport.js';
import '../../styles/Base.css';
import '../../styles/List.css';
import '../../styles/ConnectedRows.css';

interface Reorder {
  handlers: ReorderHandlers;
  instructionsId: string;
}

const ReorderContext = createContext<Reorder | null>(null);

function AlternatingAnnouncer({ announcement }: { announcement: Announcement }) {
  const hydrated = useHydrated();
  const { container } = usePortalContainer();
  if (!hydrated || container === null) return null;
  const speakingRegion = announcement.count % 2;
  return createPortal(
    <div className="env-list-announcer">
      <div role="status">{speakingRegion === 1 ? announcement.text : ''}</div>
      <div role="status">{speakingRegion === 0 ? announcement.text : ''}</div>
    </div>,
    container ?? document.body,
  );
}

function rowOf(list: HTMLElement, element: EventTarget | null) {
  let node = element instanceof Element ? element : null;
  while (node && node.parentElement !== list) node = node.parentElement;
  return node instanceof HTMLElement && node.tagName === 'LI' ? node : null;
}

const labelOf = (row: HTMLElement) =>
  row.querySelector(':scope > .env-list-item-handle')?.getAttribute('data-label') ??
  row.textContent?.trim() ??
  '';

function reportOfRowsWithoutHandle(list: HTMLUListElement | null) {
  const bare = Array.from(list?.children ?? []).filter(
    (row) => row.tagName === 'LI' && !row.querySelector('.env-list-item-handle'),
  ).length;
  return (
    bare > 0 &&
    `${bare} row${bare === 1 ? '' : 's'} of a List.Root with onReorder ${bare === 1 ? 'has' : 'have'} no drag handle. ` +
      'Render each row as a List.Item, and have a row component pass the props it does not use on to its List.Item.'
  );
}

export function ReorderableList({
  density,
  onReorder,
  className,
  ref,
  onKeyDown,
  children,
  ...props
}: Omit<RootProps, 'title' | 'headingLevel' | 'description' | 'headerEnd' | 'handlePlacement'> & {
  onReorder: NonNullable<RootProps['onReorder']>;
}) {
  const element = useRef<HTMLUListElement | null>(null);
  const messages = useMessages('list', listMessages);
  const format = useFormatters();
  const formatNumber = useCallback((value: number) => format.number().format(value), [format]);
  const { announcement, handlers } = useReorder(element, onReorder, messages, formatNumber);
  const instructionsId = `${useId()}-instructions`;
  const reorder = useMemo(() => ({ handlers, instructionsId }), [handlers, instructionsId]);
  useLayoutEffect(function reportRowsThatCannotMoveOncePerList() {
    reportInDevelopment(
      () => process.env.NODE_ENV !== 'production' && reportOfRowsWithoutHandle(element.current),
      { key: instructionsId },
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
      <span id={instructionsId} hidden>
        {messages.instructions}
      </span>
      <AlternatingAnnouncer announcement={announcement} />
    </ReorderContext>
  );
}

export function ListReorderHandle({
  textValue,
  placement,
}: {
  textValue?: string;
  placement?: 'end';
}) {
  const reorder = useContext(ReorderContext);
  const messages = useMessages('list', listMessages);
  const button = useRef<HTMLButtonElement | null>(null);
  const [labelShownAsText, setLabelShownAsText] = useState('');
  useLayoutEffect(
    function followTheShownTextOfALabelThatIsNotText() {
      if (textValue !== undefined || !reorder) return;
      const content = button.current
        ?.closest('li')
        ?.querySelector(':scope > .env-list-item-content > .env-list-item-label');
      if (!content) return;
      const read = () => setLabelShownAsText(content.textContent?.trim() ?? '');
      read();
      const observer = new MutationObserver(read);
      observer.observe(content, { childList: true, characterData: true, subtree: true });
      return () => observer.disconnect();
    },
    [textValue, reorder],
  );
  if (!reorder) return null;
  const { handlers, instructionsId } = reorder;
  const text = textValue ?? labelShownAsText;
  const notLiftedUntilTheReorderLiftsIt = false;
  const row = () => button.current?.closest('li') ?? null;
  return (
    <IconButton
      ref={button}
      variant="ghost"
      size="sm"
      icon={<IconDragIndicator />}
      aria-label={messages.reorder({ label: text })}
      aria-describedby={instructionsId}
      aria-pressed={notLiftedUntilTheReorderLiftsIt}
      data-label={text}
      data-placement={placement}
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
