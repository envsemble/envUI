import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { RowDensity } from '../foundations/Theme.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import type { SkeletonProps } from '../internal/skeleton/skeleton.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import { renderItem, renderList } from './internal/listMarkup.js';
import { ControlledItem, TitledList } from './internal/ListNaming.js';
import '../styles/Base.css';
import '../styles/List.css';
import '../styles/ConnectedRows.css';

export interface RootProps extends Omit<ComponentPropsWithRef<'ul'>, 'title'>, SkeletonProps {
  /**
   * The heading above the rows, such as Remote access for a group of settings. It names the list,
   * so that a page of such groups has one consistent outline.
   */
  title?: ReactNode;
  /**
   * The heading's level, for the page's outline: 2 under the page's own heading, 3 inside a section
   * that has one. It looks the same at every level.
   * @default 2
   */
  headingLevel?: Exclude<HeadingLevel, 1>;
  /**
   * A sentence under the title, in muted text, such as what the group's settings change. It
   * describes the list.
   */
  description?: ReactNode;
  /**
   * Content at the end of the title's line, outside the heading, such as an Add Button, a Manage
   * link or a count, placed as given; it wraps below the title when it doesn't fit beside it.
   */
  headerEnd?: ReactNode;
  /**
   * How tightly the rows pack: xs, sm, md or lg changes only their block padding, never the text.
   * @default 'md'
   */
  density?: RowDensity;
  /**
   * Makes the rows reorderable: each row gets a drag handle, at its start unless handlePlacement
   * puts it at its end, moved by dragging it, by pressing it or by keyboard, and the list calls
   * this with the row's index and the index it is dropped at. The application moves the item in its own state; nothing moves until it does. The
   * rows are the list's children, directly or in arrays and fragments: List.Item elements, or
   * elements of a row component that passes the props it doesn't use on to its List.Item, such as
   * `function SlideRow({ slide, ...props }) { return <List.Item {...props} label={slide} />; }`.
   */
  onReorder?: (from: number, to: number) => void;
  /**
   * Where each row's drag handle sits in a list with onReorder: at the row's start, before its
   * start content, or at its end, after its end content and its control.
   * @default 'start'
   */
  handlePlacement?: 'start' | 'end';
}

/**
 * A `ul` of rows, filled tiles joined into one block by small gaps with shared outer corners, for
 * items people scan, open or choose. In a muted Surface that holds only lists, the rows take the
 * raised fill, so they stand out from it. With onReorder, people move the rows by their handles.
 * With a title, a heading above the rows names the list.
 */
function Root(props: RootProps) {
  return props.title == null ? renderList(props) : <TitledList {...props} />;
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
   * Content at the end of the row, such as a Button or a Badge, which keeps its size; it moves below
   * the text when it doesn't fit beside it. The control of the setting a row names goes in control.
   */
  end?: ReactNode;
  /** More content under the label and the description, such as a row of Badges, placed as given. */
  children?: ReactNode;
  /**
   * The control of the setting the row is about, at the row's end: a Switch, a Checkbox, a Radio or
   * a field, such as a Select or a SegmentedControl, given no label of its own. The row's label names
   * it and the row's description describes it, so it isn't labelled twice.
   */
  control?: ReactNode;
  /**
   * The row opens something through a link or button inside: it reacts to hover, keyboard focus
   * inside it and presses. Mark that link or button `data-row-target` to stretch it over the row;
   * the other links, buttons and fields in the row, such as an author's link in the description,
   * stay clickable above it.
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

/**
 * One `li` row with a label, a description and content at its end, or the control of the setting it
 * names; the current row, content at its start, and in a reorderable list a drag handle.
 */
function Item(props: ItemProps) {
  return props.control == null ? renderItem(props) : <ControlledItem {...props} />;
}

const RootPart = /* @__PURE__ */ withDisplayName(Root, 'List.Root');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'List.Item');
export { RootPart as Root, ItemPart as Item };
