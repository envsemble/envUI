import type { ReactNode } from 'react';
import type { ListItemElementProps } from '../../internal/list/listEntries.js';

/** One option of a Combobox. */
export interface ComboboxItem {
  /** Stable identifier: the value the field reports and submits. */
  value: string;
  /** Names the option; the field shows it once chosen, and the default filter matches it. */
  label: string;
  /** A muted second line, such as an e-mail address; the default filter matches it too. */
  description?: string;
  /** Content before the label, such as an Avatar or an icon; it takes the size of its slot. */
  start?: ReactNode;
  /**
   * Content at the option's end in the list, such as a role Badge or a count, which keeps its
   * size; it is read as part of the option's name.
   */
  end?: ReactNode;
  /** The option shows but can't be chosen. */
  disabled?: boolean;
  /**
   * More props for the option's element, such as a title or data attributes for tests. Its class
   * joins the option's; the option's role, id and ARIA attributes stay its own.
   */
  itemProps?: ComboboxItemElementProps;
  /** Reserved: an entry with an `items` array is a group, so an option has none. */
  items?: never;
}

/** What a Combobox option's itemProps can set on its option element. */
export type ComboboxItemElementProps = ListItemElementProps;

/** Options under a heading, which also names the group for assistive technology. */
export interface ComboboxGroup<Item extends ComboboxItem = ComboboxItem> {
  /** The group's heading: text, or content such as an icon or a count beside the group's name. */
  label: ReactNode;
  /** The options under the heading, in display order. */
  items: readonly Item[];
}

/** Whether an option matches the text typed into the field. */
export type ComboboxFilter<Item extends ComboboxItem = ComboboxItem> = (
  item: Item,
  query: string,
) => boolean;
