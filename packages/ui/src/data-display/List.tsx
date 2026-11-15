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
import { Grid } from '../layout/Layout.js';
import { Slot } from '../internal/layout/Slot.js';
import { SkeletonStatus } from '../foundations/SkeletonScope.js';
import { Text } from '../foundations/Text.js';
import {
  inSkeleton,
  inSkeletonList,
  given,
  skeletonAttributes,
  skeletonListAttributes,
  type SkeletonProps,
} from '../internal/skeleton.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import { ListReorderHandle, ReorderableList } from './internal/ReorderableList.js';
import { flag } from '../internal/flag.js';
import { rowAttributes } from '../internal/layout/primitiveAttributes.js';
import '../styles/Base.css';
import '../styles/List.css';
import '../styles/ConnectedRows.css';

export interface RootProps extends ComponentPropsWithRef<'ul'>, SkeletonProps {
  /**
   * How tightly the rows pack: xs, sm, md or lg changes only their block padding, never the text.
   * @default 'md'
   */
  density?: RowDensity;
  /**
   * Makes the rows reorderable: each row gets a drag handle at its start, moved by dragging it, by
   * pressing it or by keyboard, and the list calls this with the row's index and the index it is
   * dropped at. The application moves the item in its own state; nothing moves until it does. The
   * rows are the list's children, directly or in arrays and fragments: List.Item elements, or
   * elements of a row component that passes the props it doesn't use on to its List.Item, such as
   * `function SlideRow({ slide, ...props }) { return <List.Item {...props} label={slide} />; }`.
   */
  onReorder?: (from: number, to: number) => void;
}

/** The prop List.Root gives the rows of a reorderable list, so they render their handles. */
const reorderableProp = 'data-env-reorderable';

/**
 * A `ul` of rows. Plain by default: no fill, hairlines between the rows and their text in line with
 * the content around the list. Under a Theme with `surface="filled"`, the rows are tiles joined into
 * one block with shared outer corners, and in a muted Surface that holds only lists they take the
 * raised fill, so they stand out from it. With onReorder, people move the rows by their handles.
 */
function Root({
  density = 'md',
  onReorder,
  skeleton = false,
  className,
  children,
  ...props
}: RootProps) {
  // A reorderable list needs the browser; a list without it stays server-rendered markup, and
  // ships no client code.
  // A list's rows must be its children, so a skeleton list is inert as a whole, and a visually
  // hidden status beside it is the busy region.
  const list = onReorder ? (
    <ReorderableList
      {...props}
      {...skeletonListAttributes(skeleton)}
      density={density}
      onReorder={onReorder}
      className={className}
    >
      {inSkeletonList(skeleton, markReorderable(children))}
    </ReorderableList>
  ) : (
    <Grid
      render={
        <ul
          {...props}
          {...skeletonListAttributes(skeleton)}
          data-density={density}
          className={classNames('env-list', 'env-connected-rows', className)}
        />
      }
    >
      {inSkeletonList(skeleton, children)}
    </Grid>
  );
  if (!skeleton) return list;
  return (
    <>
      {list}
      <SkeletonStatus label={props['aria-label']} />
    </>
  );
}

/**
 * Tells the rows among the children, and in their fragments, to show a handle: each element gets
 * the prop, which List.Item reads and a row component passes on to its List.Item with the rest.
 */
function markReorderable(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return child;
    if (child.type === Fragment)
      return cloneElement(child, undefined, markReorderable(child.props.children));
    // An item of any type takes the private prop that marks it reorderable.
    return cloneElement(child, { [reorderableProp]: true } as object);
  });
}

export interface ItemProps extends ComponentPropsWithRef<'li'>, SkeletonProps {
  /**
   * The row's name, in the row's text color, such as an item's name, or in an interactive row a
   * link or text Button marked `data-row-target`, which then reads in the row's text color too. It
   * takes the room the row leaves and wraps; it is never cut short. Undefined, such as over a
   * placeholder item, a skeleton shows a bar in its place.
   */
  label: ReactNode;
  /**
   * A short fact in muted text below the label, such as who changed the item and when. Given as
   * undefined, such as over a placeholder item, a skeleton shows a bar in its place.
   */
  description?: ReactNode;
  /**
   * Content at the end of the row, such as a Button, a Switch or a Badge, which keeps its size; it
   * moves below the text when it doesn't fit beside it.
   */
  end?: ReactNode;
  /** More content under the label and the description, such as a row of Badges, placed as given. */
  children?: ReactNode;
  /**
   * The row opens something through a link or button inside: it reacts to hover, keyboard focus
   * inside it and presses. Mark that link or button `data-row-target` to stretch it over the row.
   * @default false
   */
  interactive?: boolean;
  /**
   * The current row, such as the one whose details show beside a list: the selected fill and medium
   * text, and `aria-current="true"` on its `data-row-target` element in the label, description or
   * children, or on the row without one.
   * @default false
   */
  current?: boolean;
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
    // isValidElement narrows to the element, not its props.
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
 * A row's layout: a wrapping Row's attributes on the li itself, as a Row around each of a long
 * list's rows would cost a component render of its own.
 */
const itemLayout = rowAttributes({ wrap: true, align: 'center', justify: 'between', gap: 3 });

/**
 * One `li` row with a label, a description and content at its end; the current row, content at its start,
 * and in a reorderable list a drag handle. It renders on the server: only the handle of a
 * reorderable row needs the browser.
 */
function Item(props: ItemProps) {
  const {
    label,
    description,
    end,
    interactive = false,
    current = false,
    start,
    textValue,
    skeleton = false,
    children,
    className,
    [reorderableProp]: reorderable = false,
    ...rest
  } = props as ItemProps & { [reorderableProp]?: boolean };
  const hasDescription = description != null || given(props, 'description');
  let targetMarked = false;
  const mark = (node: ReactNode) => {
    if (!current || targetMarked || node == null) return node;
    const [marked, found] = markCurrent(node);
    targetMarked = found;
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
      {...itemLayout}
      aria-current={current && !targetMarked ? 'true' : undefined}
      {...rest}
      {...skeletonAttributes(skeleton)}
      className={classNames('env-list-item', 'env-connected-row', className)}
      data-interactive={flag(interactive)}
      data-selected={flag(current)}
      data-start={flag(hasStart)}
    >
      {inSkeleton(
        skeleton,
        <>
          {reorderable && <ListReorderHandle textValue={text} />}
          {start != null && (
            <Slot className="env-list-item-start" layout="row" shrink="never">
              {start}
            </Slot>
          )}
          <div className="env-list-item-content">
            <Slot className="env-list-item-label">
              {shownLabel ?? <Text render={<span />} variant="body-sm" />}
            </Slot>
            {hasDescription && <div className="env-list-item-description">{shownDescription}</div>}
            {shownChildren != null && <Slot className="env-list-item-extra">{shownChildren}</Slot>}
          </div>
          {end != null && (
            <Slot className="env-list-item-end" layout="row" shrink="never">
              {end}
            </Slot>
          )}
        </>,
      )}
    </li>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'List.Root');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'List.Item');
export { RootPart as Root, ItemPart as Item };
