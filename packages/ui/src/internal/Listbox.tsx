import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from './classNames.js';
import { ListRow, type ListRowProps } from './ListRow.js';

export interface ListboxProps<Item> extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The options, in order. */
  items: readonly Item[];
  /** A stable key for an option, unique among them. */
  getKey(item: Item): string;
  /** The props of an option from useActiveDescendant: its id, selection and press handling. */
  getOptionProps(item: Item): Record<string, unknown>;
  /** An option's row: its label, and its icon, description and end content where it has them. */
  renderItem(item: Item): Omit<ListRowProps, 'render'>;
  /** Shown, in a status beside the list, when there are no options, such as No results. */
  empty?: ReactNode;
}

/**
 * The options of a listbox whose focus stays in a text input, such as an editor's suggestions:
 * role="listbox" with an option per item, each a ListRow, wired by the owner's useActiveDescendant.
 * Name it with aria-label or aria-labelledby, and give the input aria-controls with its id.
 * `className` and `style` go to the frame around the list; the other props to the list. `empty`
 * shows in a status beside the list rather than inside it, where only options may be, and the
 * status stays mounted, so a change such as from loading to no results is announced.
 */
export function Listbox<Item>({
  items,
  getKey,
  getOptionProps,
  renderItem,
  empty,
  className,
  style,
  ...props
}: ListboxProps<Item>) {
  const showEmpty = items.length === 0 && empty != null;
  return (
    <div className={classNames('env-listbox', className)} style={style}>
      <div {...props} role="listbox" className="env-listbox-options">
        {items.map((item) => (
          <ListRow
            key={getKey(item)}
            {...renderItem(item)}
            render={<div role="option" {...getOptionProps(item)} />}
          />
        ))}
      </div>
      {empty != null && (
        <div role="status" className="env-listbox-empty">
          {showEmpty ? empty : null}
        </div>
      )}
    </div>
  );
}
