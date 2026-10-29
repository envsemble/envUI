'use client';

import { useEffect, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import type { ControlSize } from '../foundations/Theme.js';
import { IconButton, type ButtonVariant } from '../actions/Button.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { ChevronLeft } from '../icons/ChevronLeft.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { classNames } from '../internal/classNames.js';
import { Row } from '../foundations/Layout.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { useFormatters } from '../internal/useFormatters.js';
import { pagination } from '../foundations/messages/pagination.js';
import '../styles/Base.css';
import '../styles/Pagination.css';

/** The items a page shows, for the text of the range. */
export interface PaginationRange {
  /** The first item on the page, counted from 1; 0 when there are no items. */
  start: number;
  /** The last item on the page. */
  end: number;
  /** All items, when known. */
  total?: number;
  /** The page, counted from 1. */
  page: number;
  /** The number of pages, when the total is known. */
  pageCount?: number;
}

export interface PaginationProps
  extends Omit<ComponentPropsWithRef<'nav'>, 'children' | 'onChange'> {
  /**
   * The page shown, counted from 1. It is kept within the pages that exist, so a page beyond the
   * end shows the last one.
   */
  page: number;
  /** The most items a page shows, such as 60; at least 1. */
  pageSize: number;
  /**
   * All items, when known; the range then ends with it, as in 1–60 of 245, and the last page ends
   * the list. Leave it out for a list read in batches, where hasNextPage says when it ends.
   */
  total?: number;
  /**
   * Whether a later page exists, for a list without total, such as from a cursor's has more.
   * @default true
   */
  hasNextPage?: boolean;
  /**
   * Receives the page before or after the current one when its button is pressed. The application
   * loads that page and passes it back as page.
   */
  onPageChange: (page: number) => void;
  /**
   * A page is loading: the button pressed shows a spinner, also when the load starts in an effect
   * after the page changes, and both buttons ignore presses while staying focusable. A load for
   * another reason, such as a refresh, makes both wait without a spinner.
   */
  pending?: boolean;
  /** Render nothing while every item fits on one page, so neither button has anywhere to go. */
  hideWhenSinglePage?: boolean;
  /**
   * Writes the range from the first and last item shown, the total, the page and the page count,
   * for one pager; EnvUIProvider's messages.pagination.range writes it for every pager.
   * @default 1–60 of 245, or 61–120 without total, with numbers in the locale
   */
  formatRange?: (range: PaginationRange) => ReactNode;
  /**
   * The previous button's accessible name and tooltip.
   * @default 'Previous page', or EnvUIProvider's messages.pagination.previous
   */
  previousLabel?: string;
  /**
   * The next button's accessible name and tooltip.
   * @default 'Next page', or EnvUIProvider's messages.pagination.next
   */
  nextLabel?: string;
  /**
   * The buttons' variant, as on IconButton, such as text for a quiet toolbar.
   * @default 'secondary'
   */
  variant?: ButtonVariant;
  /**
   * The buttons' height, as on every control: sm, md or lg in the current scale. Without it, they
   * take the control height of the container, md unless the container sets another.
   */
  size?: ControlSize;
  /**
   * The navigation landmark's name, such as Report pages, where a page has more than one.
   * @default 'Pagination', or EnvUIProvider's messages.pagination.label
   */
  'aria-label'?: string;
}

/**
 * The button last pressed, and how far its load is: pressed until the page's effects have run,
 * settling for the update they cause, and loading once pending.
 */
interface Press {
  direction: 'previous' | 'next';
  state: 'pressed' | 'settling' | 'loading';
}

/**
 * A compact pager for toolbars: the range of items shown, such as 1–60 of 245, and icon buttons
 * for the previous and next pages, in a navigation landmark. The application loads the pages; the
 * range is announced as it changes, and focus stays on the button pressed.
 */
export function Pagination({
  page,
  pageSize,
  total,
  hasNextPage,
  onPageChange,
  pending = false,
  hideWhenSinglePage = false,
  formatRange,
  previousLabel,
  nextLabel,
  variant = 'secondary',
  size,
  className,
  'aria-label': label,
  ...props
}: PaginationProps) {
  const messages = useMessages('pagination', pagination);
  const numbers = useFormatters().number();
  // A press spins its button for the load it starts: one pending in the same update as the press,
  // or one the application starts in an effect after the page changes, as a query keyed by the page
  // does. A press no load follows by then is forgotten, and so is one whose load ended, so a later
  // load for another reason, such as a refresh, spins neither button.
  const [press, setPress] = useState<Press | null>(null);
  if (press) {
    if (pending) {
      if (press.state !== 'loading') setPress({ ...press, state: 'loading' });
    } else if (press.state !== 'pressed') setPress(null);
  }
  useEffect(() => {
    // The application's effects for the new page run in this same pass; the update they cause
    // comes with this one.
    if (press?.state === 'pressed' && !pending)
      setPress((current) => (current === press ? { ...press, state: 'settling' } : current));
  }, [press, pending]);
  const perPage = Math.max(1, Math.floor(pageSize) || 1);
  const count = total === undefined ? undefined : Math.max(0, Math.floor(total) || 0);
  const pageCount = count === undefined ? undefined : Math.max(1, Math.ceil(count / perPage));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount ?? Infinity);
  const hasPrevious = current > 1;
  const hasNext = pageCount === undefined ? (hasNextPage ?? true) : current < pageCount;
  if (hideWhenSinglePage && !hasPrevious && !hasNext) return null;
  const start = count === 0 ? 0 : (current - 1) * perPage + 1;
  const end = count === undefined ? current * perPage : Math.min(current * perPage, count);

  function pageButton(direction: 'previous' | 'next') {
    const available = direction === 'previous' ? hasPrevious : hasNext;
    const name =
      direction === 'previous'
        ? (previousLabel ?? messages.previous)
        : (nextLabel ?? messages.next);
    const loading = pending && press?.direction === direction;
    return (
      <Tooltip content={name}>
        <IconButton
          icon={direction === 'previous' ? <ChevronLeft /> : <ChevronRight />}
          aria-label={name}
          variant={variant}
          pending={loading}
          // Unavailable buttons stay focusable, so focus stays put on the first and last page.
          aria-disabled={!loading && (!available || pending) ? true : undefined}
          className="env-pagination-button"
          data-direction={direction}
          onClick={() => {
            if (!available || pending) return;
            setPress({ direction, state: 'pressed' });
            onPageChange(direction === 'previous' ? current - 1 : current + 1);
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Row
      wrap
      align="center"
      gap={1}
      render={
        <nav
          {...props}
          aria-label={label ?? messages.label}
          className={classNames('env-pagination', className)}
          data-size={size}
        />
      }
    >
      {/* Announced when it changes, as a page loads; its own direction keeps numbers in order. */}
      <span className="env-pagination-range" dir="auto" aria-live="polite" aria-atomic="true">
        {formatRange
          ? formatRange({ start, end, total: count, page: current, pageCount })
          : messages.range({
              start: numbers.format(start),
              end: numbers.format(end),
              total: count === undefined ? undefined : numbers.format(count),
            })}
      </span>
      {pageButton('previous')}
      {pageButton('next')}
    </Row>
  );
}
