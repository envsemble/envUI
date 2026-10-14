import { useEffect, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { IconButton, type ButtonVariant } from '../actions/Button.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { ChevronLeft } from '../icons/ChevronLeft.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { classNames } from '../internal/classNames.js';

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
  /** The page shown, counted from 1. */
  page: number;
  /** The most items a page shows. */
  pageSize: number;
  /** All items; omit when it is not known, such as for a list read in batches. */
  total?: number;
  /** Whether a later page exists, for a list without total; true by default. */
  hasNextPage?: boolean;
  /** Receives the page before or after the current one when a button is pressed. */
  onPageChange: (page: number) => void;
  /** A page is loading: the button pressed shows a spinner, and both wait. */
  pending?: boolean;
  /** Renders nothing while all items fit on one page. */
  hideWhenSinglePage?: boolean;
  /** Text for the range, such as "1–60 of 245", for example in another language. */
  formatRange?: (range: PaginationRange) => ReactNode;
  /** Name and tooltip of the previous button; Previous page by default. */
  previousLabel?: string;
  /** Name and tooltip of the next button; Next page by default. */
  nextLabel?: string;
  /** As IconButton; secondary by default. */
  variant?: ButtonVariant;
  /** standard (default) takes the surrounding density; compact gives 2 rem buttons anywhere. */
  size?: 'standard' | 'compact';
}

const englishNumbers = new Intl.NumberFormat('en');

/**
 * The button last pressed, and how far its load is: pressed until the page's effects have run,
 * settling for the update they cause, and loading once pending.
 */
interface Press {
  direction: 'previous' | 'next';
  state: 'pressed' | 'settling' | 'loading';
}

/** "1–60 of 245", "245 of 245" for a single item, or "61–120" without a total. */
function formatPageRange({ start, end, total }: PaginationRange) {
  const shown =
    start === end
      ? englishNumbers.format(end)
      : `${englishNumbers.format(start)}–${englishNumbers.format(end)}`;
  return total === undefined ? shown : `${shown} of ${englishNumbers.format(total)}`;
}

/**
 * A compact pager for toolbars: the range of items shown, such as 1–60 of 245, and buttons for
 * the previous and next pages, in a navigation landmark. The application loads the pages.
 */
export function Pagination({
  page,
  pageSize,
  total,
  hasNextPage,
  onPageChange,
  pending = false,
  hideWhenSinglePage = false,
  formatRange = formatPageRange,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  variant = 'secondary',
  size = 'standard',
  className,
  'aria-label': label = 'Pagination',
  ...props
}: PaginationProps) {
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
    const name = direction === 'previous' ? previousLabel : nextLabel;
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
    <nav
      {...props}
      aria-label={label}
      className={classNames('env-pagination', className)}
      data-size={size === 'compact' ? 'compact' : undefined}
    >
      {/* Announced when it changes, as a page loads; its own direction keeps numbers in order. */}
      <span className="env-pagination-range" dir="auto" aria-live="polite" aria-atomic="true">
        {formatRange({ start, end, total: count, page: current, pageCount })}
      </span>
      {pageButton('previous')}
      {pageButton('next')}
    </nav>
  );
}
