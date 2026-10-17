import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { RowDensity } from '../foundations/Theme.js';
import { classNames } from '../internal/classNames.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { ListRow, ReorderableList } from './internal/ListBehavior.js';

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
function Root({ density = 'md', onReorder, className, ...props }: RootProps) {
  // A reorderable list needs the browser; a list without it stays server-rendered markup.
  if (onReorder)
    return (
      <ReorderableList {...props} density={density} onReorder={onReorder} className={className} />
    );
  return (
    <ul
      {...props}
      data-density={density}
      className={classNames('env-list', 'env-connected-rows', className)}
    />
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

/**
 * One `li` row with a label, a description and an action; the current row, content at its start,
 * and in a reorderable list a drag handle.
 */
function Item(props: ItemProps) {
  return <ListRow {...props} />;
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'List.Root');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'List.Item');
export { RootPart as Root, ItemPart as Item };
