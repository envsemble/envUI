import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { RowDensity } from '../foundations/Theme.js';
import { classNames } from '../internal/classNames.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { ListReorderHandle, ReorderableList } from './internal/ListBehavior.js';

export interface RootProps extends ComponentPropsWithRef<'ul'> {
  /**
   * How tightly the rows pack: xs, sm, md or lg changes only their block padding, never the text.
   * @default 'md'
   */
  density?: RowDensity;
  /**
   * Makes the rows reorderable: each row gets a drag handle at its start, moved by dragging it, by
   * pressing it or by keyboard, and the list calls this with the row's index and the index it is
   * dropped at. The application moves the item in its own state; nothing moves until it does. The
   * List.Item elements are the list's children, directly or in arrays and fragments.
   */
  onReorder?: (from: number, to: number) => void;
}

/** The prop List.Root gives the rows of a reorderable list, so they render their handles. */
const reorderableProp = 'data-env-reorderable';

/**
 * A `ul` of connected rows with shared outer corners. In a muted Surface that holds only lists, such as
 * `<Surface background="muted" padding={3}>`, the rows take the raised fill, so they stand out
 * from it. With onReorder, people move the rows by their handles.
 */
function Root({ density = 'md', onReorder, className, children, ...props }: RootProps) {
  // A reorderable list needs the browser; a list without it stays server-rendered markup, and
  // ships no client code.
  if (onReorder)
    return (
      <ReorderableList {...props} density={density} onReorder={onReorder} className={className}>
        {markReorderable(children)}
      </ReorderableList>
    );
  return (
    <ul
      {...props}
      data-density={density}
      className={classNames('env-list', 'env-connected-rows', className)}
    >
      {children}
    </ul>
  );
}

/** Tells the List.Item elements among the children, and in their fragments, to show a handle. */
function markReorderable(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return child;
    if (child.type === Fragment)
      return cloneElement(child, undefined, markReorderable(child.props.children));
    if (child.type === ItemPart) return cloneElement(child, { [reorderableProp]: true } as object);
    return child;
  });
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
   * `aria-current="true"` on its `data-row-target` element in the label, description or children,
   * or on the row without one.
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

type TargetProps = { 'data-row-target'?: unknown; 'aria-current'?: unknown; children?: ReactNode };

/**
 * The content with `aria-current="true"` on its first `data-row-target` element, found among the
 * elements as written, and whether it found one.
 */
function markCurrent(node: ReactNode): [ReactNode, boolean] {
  let found = false;
  const visit = (each: ReactNode): ReactNode => {
    if (found || !isValidElement<TargetProps>(each)) return each;
    const element = each as ReactElement<TargetProps>;
    if (element.props['data-row-target'] != null && element.props['data-row-target'] !== false) {
      found = true;
      return element.props['aria-current'] == null
        ? cloneElement(element, { 'aria-current': 'true' })
        : element;
    }
    if (element.props.children == null) return element;
    const children = Children.map(element.props.children, visit);
    return found ? cloneElement(element, undefined, children) : element;
  };
  const marked = Children.map(node, visit);
  return found ? [marked, true] : [node, false];
}

/**
 * One `li` row with a label, a description and an action; the current row, content at its start,
 * and in a reorderable list a drag handle. It renders on the server: only the handle of a
 * reorderable row needs the browser.
 */
function Item(props: ItemProps) {
  const {
    label,
    description,
    action,
    interactive = false,
    selected = false,
    start,
    textValue,
    children,
    className,
    [reorderableProp]: reorderable = false,
    ...rest
  } = props as ItemProps & { [reorderableProp]?: boolean };
  // The current row says so on its target, which people reach and hear, or on the row itself.
  let current = false;
  const mark = (node: ReactNode) => {
    if (!selected || current || node == null) return node;
    const [marked, found] = markCurrent(node);
    current = found;
    return marked;
  };
  const shownLabel = mark(label);
  const shownDescription = mark(description);
  const shownChildren = mark(children);
  const hasStart = start != null || reorderable;
  const text =
    textValue ??
    (typeof label === 'string' || typeof label === 'number' ? String(label) : undefined);
  return (
    <li
      aria-current={selected && !current ? 'true' : undefined}
      {...rest}
      className={classNames('env-list-item', 'env-connected-row', className)}
      data-interactive={interactive ? '' : undefined}
      data-selected={selected ? '' : undefined}
      data-start={hasStart ? '' : undefined}
    >
      {hasStart && (
        <div className="env-list-item-start">
          {reorderable && <ListReorderHandle textValue={text} />}
          {start}
        </div>
      )}
      <div className="env-list-item-content">
        {shownLabel}
        {shownDescription != null && <small>{shownDescription}</small>}
        {shownChildren}
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
