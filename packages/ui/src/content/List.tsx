import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Surface } from '../foundations/Surface.js';
import { withDisplayName } from '../internal/withDisplayName.js';

export interface RootProps extends ComponentPropsWithRef<'ul'> {
  contrast?: boolean;
}

function Root({ contrast = false, className, ...props }: RootProps) {
  const rows = (
    <ul {...props} className={classNames('env-list', 'env-connected-rows', className)} />
  );
  return contrast ? (
    <Surface tone="row" padding={3} className="env-list-surface">
      {rows}
    </Surface>
  ) : (
    rows
  );
}

export interface ItemProps extends Omit<ComponentPropsWithRef<'li'>, 'title'> {
  title: ReactNode;
  detail?: ReactNode;
  action?: ReactNode;
  /**
   * The row opens something through a link or button inside: it reacts to hover, keyboard focus
   * inside it and presses. Mark that link or button `data-row-target` to stretch it over the row.
   */
  interactive?: boolean;
}

function Item({
  title,
  detail,
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
        {title}
        {detail != null && <small>{detail}</small>}
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
