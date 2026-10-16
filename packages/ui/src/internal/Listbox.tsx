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
  /** Shown in place of the options when there are none, such as No results. */
  empty?: ReactNode;
}

/**
 * The options of a listbox whose focus stays in a text input, such as an editor's suggestions:
 * role="listbox" with an option per item, each a ListRow, wired by the owner's useActiveDescendant.
 * Name it with aria-label or aria-labelledby, and give the input aria-controls with its id.
 */
export function Listbox<Item>({
  items,
  getKey,
  getOptionProps,
  renderItem,
  empty,
  className,
  ...props
}: ListboxProps<Item>) {
  return (
    <div {...props} role="listbox" className={classNames('env-listbox', className)}>
      {items.length === 0 && empty != null ? (
        <div className="env-listbox-empty">{empty}</div>
      ) : (
        items.map((item) => (
          <ListRow
            key={getKey(item)}
            {...renderItem(item)}
            render={<div role="option" {...getOptionProps(item)} />}
          />
        ))
      )}
    </div>
  );
}
