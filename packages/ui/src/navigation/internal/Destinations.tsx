'use client';

import type { HTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { ActionElement } from '../../internal/ActionElement.js';
import { Column, Row } from '../../foundations/Layout.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { NavigationIconState } from '../../SymbolIconState.js';
import { navigation, type NavigationMessages } from '../../foundations/messages/navigation.js';

/** What every destination has, whichever navigation form shows it. */
interface DestinationFields {
  /**
   * A stable key for the destination, which names a NavigationDrawer section in `expanded` and keys its
   * element; its `href`, or else its label, by default. Give one to a section whose label is
   * translated, so the open sections keep their names in every language.
   */
  id?: string;
  /**
   * The destination's name, such as Inbox: a short noun in sentence case, unique in the list. NavigationBar
   * and NavigationRail show it under the icon, so keep it to one or two short words there.
   */
  label: string;
  /**
   * A count of new things at the destination, such as unread messages: NavigationDrawer shows it at the end of
   * the item, NavigationRail and NavigationBar on the icon. 0 shows nothing, and more than 999 shows 999+. The item's
   * name says it, such as Inbox, 3 new, from messages.navigation.itemCount.
   */
  count?: number;
  /**
   * The heading of the group the destination belongs to, such as Settings. NavigationDrawer shows a heading
   * where the group changes from the destination before; NavigationRail and NavigationBar show the destinations in the
   * same order without headings. Keep a group's destinations next to each other.
   */
  group?: string;
  /**
   * The destination is the page or view shown now: it takes the current fill, fills its Material
   * Symbol and reports aria-current="page". Mark one destination of a list, from the router.
   */
  current?: boolean;
}

/** How a destination is reached: a link, or a button that runs onClick. */
type DestinationTarget =
  | {
      /**
       * The destination's address: the item is a native link, through the LinkProvider's link
       * component, so the application's router follows it.
       */
      href: string;
      /**
       * Runs as the link is followed, such as to close a sheet the navigation sits in;
       * event.preventDefault() keeps the link from being followed.
       */
      onClick?: (event: MouseEvent<HTMLElement>) => void;
    }
  | {
      href?: undefined;
      /** Shows the destination, for a view that changes without an address: the item is a button. */
      onClick: (event: MouseEvent<HTMLElement>) => void;
    };

/** The destinations nested under a destination, which NavigationDrawer shows as a section that opens. */
interface NestedDestinations {
  /**
   * The destinations under this one, such as the pages of a chapter of a guide: NavigationDrawer shows them
   * under it, indented, in a section that opens and closes, open while it holds the current
   * destination. NavigationRail and NavigationBar show only the top level, where a destination whose section holds the
   * current one takes the current fill. NavigationDrawer reads `group` at the top level only.
   */
  children?: readonly NavigationDrawerDestination[];
}

/**
 * One place in the application that NavigationBar, NavigationRail and NavigationDrawer lead to, such as Inbox. The application
 * keeps one array of them and passes the same array to each navigation form it shows.
 */
export type Destination = DestinationFields &
  DestinationTarget &
  NestedDestinations & {
    /**
     * A decorative icon for the destination, such as one of envUI's Material Symbols, which shows
     * filled while the destination is current and outlined otherwise. NavigationBar and NavigationRail show it above
     * the label; NavigationDrawer before it.
     */
    icon: ReactNode;
  };

/**
 * A destination as NavigationDrawer takes it: a Destination, whose icon NavigationDrawer may go without, such as for
 * the sections of a guide, and which may be only the heading of the destinations nested under it;
 * a list for NavigationRail or NavigationBar needs icons and a target for each destination it shows.
 */
export type NavigationDrawerDestination = DestinationFields & {
  /** A decorative icon before the label; leave it out of every destination of a list, or none. */
  icon?: ReactNode;
  /**
   * A short word at the end of the item, after the label and before any count, such as a Badge
   * that says the page is New: part of the item's name, so keep it to a word or two. An item with
   * a count is named by its label and count alone. Drawer alone shows it; Rail and Bar leave it
   * out.
   * @default none
   */
  badge?: ReactNode;
} & (
    | (DestinationTarget & NestedDestinations)
    | {
        href?: undefined;
        onClick?: undefined;
        /**
         * The destinations under this one, which has no address of its own: it is only the
         * heading of its section, a button that opens and closes it.
         */
        children: readonly NavigationDrawerDestination[];
      }
  );

/**
 * The part classes of a form's destinations, which each form writes out as literals: an indicator
 * around the icon above the label, as in NavigationBar and NavigationRail, or none, for a row of icon, label and count,
 * as in NavigationDrawer.
 */
export interface DestinationClasses {
  item: string;
  indicator?: string;
  label: string;
  count: string;
}

/** A run of destinations of one group, in the list's order: NavigationDrawer's sections. */
export interface DestinationSection<Item> {
  /** The group's heading, or undefined for destinations outside any group. */
  group: string | undefined;
  items: Item[];
}

/**
 * The list's destinations in runs of one group, in their order: a new section starts wherever
 * `group` differs from the destination before.
 */
export function destinationSections<Item extends { group?: string }>(
  destinations: readonly Item[],
): DestinationSection<Item>[] {
  const sections: DestinationSection<Item>[] = [];
  for (const destination of destinations) {
    const last = sections.at(-1);
    if (last && last.group === destination.group) last.items.push(destination);
    else sections.push({ group: destination.group, items: [destination] });
  }
  return sections;
}

/** A destination's key: its id, else its address, else its label, which the list keeps unique. */
export const destinationKey = (destination: NavigationDrawerDestination) =>
  destination.id ?? destination.href ?? destination.label;

/** Whether a destination nested under these, at any depth, is the current one. */
export function holdsCurrent(
  children: readonly NavigationDrawerDestination[] | undefined,
): boolean {
  return children?.some((child) => child.current === true || holdsCurrent(child.children)) ?? false;
}

/** The count as it shows: nothing for none, and 999+ above 999. */
export function shownCount(count: number | undefined): string | undefined {
  if (count === undefined || !Number.isFinite(count) || count <= 0) return undefined;
  return count > 999 ? '999+' : String(Math.floor(count));
}

/** The name of an item with a count, such as Inbox, 3 new; undefined where its label names it. */
export function countedName(
  label: string,
  count: number | undefined,
  messages: NavigationMessages,
): string | undefined {
  const shown = shownCount(count);
  return shown === undefined ? undefined : messages.itemCount({ label, count: shown });
}

/** The navigation messages, with the application's overrides. */
export const useNavigationMessages = () => useMessages('navigation', navigation);

/**
 * One destination's control: a link with href, through the LinkProvider's link component, or a
 * button that runs onClick, or that only opens and closes the destinations under it. The current one reports aria-current="page" and fills its icon; one
 * with a count is named with it, such as Inbox, 3 new. NavigationBar and NavigationRail put the icon in an indicator,
 * with the count on it, above the label; NavigationDrawer puts the icon, the label and the count in a row.
 */
export function DestinationItem({
  classes,
  destination,
  labelRef,
  ref,
  topLevel = false,
  end,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  classes: DestinationClasses;
  destination: NavigationDrawerDestination;
  /**
   * The form shows only the top level, as NavigationRail and NavigationBar do: a destination whose nested destinations
   * hold the current one takes the current fill, and reports aria-current="true".
   */
  topLevel?: boolean;
  /** Content at the end of a row, after the count, such as a section's chevron. */
  end?: ReactNode;
  /** The label's element, such as to tell whether it is cut short. */
  labelRef?: Ref<HTMLSpanElement>;
  /** The control's element, for a tooltip that renders it as its trigger. */
  ref?: Ref<HTMLElement>;
}) {
  const messages = useNavigationMessages();
  const { label, icon, count, current = false, href, onClick } = destination;
  const inside = topLevel && !current && holdsCurrent(destination.children);
  const marked = current || inside;
  const shown = shownCount(count);
  const icons =
    icon == null ? null : (
      <NavigationIconState selected={marked}>
        <DecorativeIcon>{icon}</DecorativeIcon>
      </NavigationIconState>
    );
  // The count is part of the item's name, so the badge that shows it is hidden.
  const badge = shown !== undefined && (
    <span className={classes.count} aria-hidden="true">
      {shown}
    </span>
  );
  // A section's heading has no onClick, and takes the click of the trigger that renders it.
  const control =
    href !== undefined ? (
      <ActionElement href={href} onClick={onClick} />
    ) : onClick !== undefined ? (
      <ActionElement onClick={onClick} />
    ) : (
      <ActionElement />
    );
  const shared = {
    // A tooltip's trigger props, such as its pointer and focus handlers.
    ...props,
    ref,
    render: control,
    className: classes.item,
    'data-current': marked ? '' : undefined,
    'aria-current': current ? ('page' as const) : inside ? ('true' as const) : undefined,
    'aria-label': countedName(label, count, messages),
  };
  // The item's text is its label, then its count, apart, in the order its name gives them, such as
  // Inbox 3 for Inbox, 3 new; NavigationBar and NavigationRail draw the indicator above the label with CSS order.
  const apart = badge && ' ';
  return classes.indicator === undefined ? (
    <Row {...shared} align="center" gap={3}>
      {icons}
      <span className={classes.label} ref={labelRef}>
        {label}
      </span>
      {/* Drawer's own badge, such as New, after the label: part of the item's name. */}
      {destination.badge}
      {apart}
      {badge}
      {end}
    </Row>
  ) : (
    <Column {...shared} align="center" gap={1}>
      <span className={classes.label}>{label}</span>
      {apart}
      <span className={classes.indicator}>
        {icons}
        {badge}
      </span>
    </Column>
  );
}
