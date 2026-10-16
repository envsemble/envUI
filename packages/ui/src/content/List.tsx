import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import type { RowDensity } from '../foundations/Theme.js';
import { withDisplayName } from '../internal/withDisplayName.js';

export interface RootProps extends ComponentPropsWithRef<'ul'> {
  /**
   * How tightly the rows pack: xs, sm, md or lg changes only their block padding, never the text.
   * @default 'md'
   */
  density?: RowDensity;
}

/**
 * A `ul` of connected rows with shared outer corners. Directly inside a muted Surface, such as
 * `<Surface background="muted" padding={3}>`, the rows take the raised fill, so they stand out
 * from it.
 */
function Root({ density = 'md', className, ...props }: RootProps) {
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
}

/** One `li` row with a label, a description and an action. */
function Item({
  label,
  description,
  action,
  interactive = false,
  children,
  className,
  ...props
}: ItemProps) {
  return (
    <li
      {...props}
      className={classNames('env-list-item', 'env-connected-row', className)}
      data-interactive={interactive ? '' : undefined}
    >
      <div>
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
