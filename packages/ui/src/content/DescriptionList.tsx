import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import '../styles/Base.css';
import '../styles/DescriptionList.css';

export interface RootProps extends ComponentPropsWithRef<'dl'> {
  /**
   * Where each label sits: inline, beside its value, in a column as wide as the longest label;
   * stacked, above its value; auto, inline, stacked below 24 rem of the list's own width.
   * @default 'auto'
   */
  layout?: 'inline' | 'stacked' | 'auto';
  /**
   * The text size: sm, the smaller body text, for facts beside other content, such as in a sidebar
   * or a card; md, body text, for a page of details.
   * @default 'sm'
   */
  size?: 'sm' | 'md';
  /**
   * The values hold controls, such as a Select or a Switch: each row is at least as tall as a small
   * control, and its label sits on the control's first line.
   */
  controls?: boolean;
}

export interface ItemProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The term, such as Owner or Created. */
  label: ReactNode;
  /** The value: text, a link, a Badge, or a control in a list with `controls`. */
  children: ReactNode;
}

/**
 * A list of labelled values, the facts about one thing, such as a project's owner, status and
 * dates: a `dl` whose items are its terms with their values.
 */
function Root({ layout = 'auto', size = 'sm', controls = false, className, ...props }: RootProps) {
  return (
    <dl
      {...props}
      className={classNames('env-description-list', className)}
      data-layout={layout}
      data-size={size}
      data-controls={controls ? '' : undefined}
    />
  );
}

/** One term and its value: a `div` around a `dt` and a `dd`. */
function Item({ label, children, className, ...props }: ItemProps) {
  return (
    <div {...props} className={classNames('env-description-list-item', className)}>
      <dt className="env-description-list-label">{label}</dt>
      <dd className="env-description-list-value">{children}</dd>
    </div>
  );
}

const RootPart = /* @__PURE__ */ withDisplayName(Root, 'DescriptionList.Root');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'DescriptionList.Item');
export { RootPart as Root, ItemPart as Item };
