'use client';

import { useEffect, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { classNames } from '../../../internal/classNames.js';
import { ListRow, type ListRowProps } from '../../../internal/list/ListRow.js';
import '../../../styles/Base.css';
import '../../../styles/Listbox.css';

export interface ListboxProps<Item> extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  items: readonly Item[];
  getKey(item: Item): string;
  getOptionProps(item: Item): Record<string, unknown>;
  renderItem(item: Item): Omit<ListRowProps, 'render'>;
  empty?: ReactNode;
}

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
        <StatusMountedBeforeItsMessage>{showEmpty ? empty : null}</StatusMountedBeforeItsMessage>
      )}
    </div>
  );
}

function useShownAfterFirstPaint() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setShown(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return shown;
}

function StatusMountedBeforeItsMessage({ children }: { children: ReactNode }) {
  const shown = useShownAfterFirstPaint();
  return (
    <div role="status" className="env-listbox-empty">
      {shown ? children : null}
    </div>
  );
}
