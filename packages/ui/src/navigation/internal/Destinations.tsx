'use client';

import type { ReactNode } from 'react';
import { ActionElement } from '../../internal/ActionElement.js';
import { Column, Row } from '../../foundations/Layout.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { NavigationIconState } from '../../MaterialSymbolState.js';
import { navigation, type NavigationMessages } from '../../foundations/messages/navigation.js';

/** What every destination has, whichever navigation form shows it. */
interface DestinationFields {
  /**
   * The destination's name, such as Inbox: a short noun in sentence case, unique in the list. Bar
   * and Rail show it under the icon, so keep it to one or two short words there.
   */
  label: string;
  /**
   * A count of new things at the destination, such as unread messages: Drawer shows it at the end of
   * the item, Rail and Bar on the icon. 0 shows nothing, and more than 999 shows 999+. The item's
   * name says it, such as Inbox, 3 new, from messages.navigation.itemCount.
   */
  count?: number;
  /**
   * The heading of the group the destination belongs to, such as Settings. Drawer shows a heading
   * where the group changes from the destination before; Rail and Bar show the destinations in the
   * same order without headings. Keep a group's destinations next to each other.
   */
  group?: string;
  /**
   * The destination is the page or view shown now: it takes the current fill, fills its Material
   * Symbol and reports aria-current="page". Mark one destination of a list, from the router.
   */
  current?: boolean;
}

/** How a destination is reached: a link, or a button that runs onSelect. */
type DestinationTarget =
  | {
      /**
       * The destination's address: the item is a native link, through the LinkProvider's link
       * component, so the application's router follows it.
       */
      href: string;
      /** Runs as the link is followed, such as to close a sheet the navigation sits in. */
      onSelect?: () => void;
    }
  | {
      href?: undefined;
      /** Shows the destination, for a view that changes without an address: the item is a button. */
      onSelect: () => void;
    };

/**
 * One place in the application that Bar, Rail and Drawer lead to, such as Inbox. The application
 * keeps one array of them and passes the same array to each navigation form it shows.
 */
export type Destination = DestinationFields &
  DestinationTarget & {
    /**
     * A decorative icon for the destination, such as one of envUI's Material Symbols, which shows
     * filled while the destination is current and outlined otherwise. Bar and Rail show it above
     * the label; Drawer before it.
     */
    icon: ReactNode;
  };

/**
 * A destination as Drawer takes it: a Destination, whose icon Drawer may go without, such as for
 * the sections of a guide; a list for Rail or Bar needs icons.
 */
export type DrawerDestination = DestinationFields &
  DestinationTarget & {
    /** A decorative icon before the label; leave it out of every destination of a list, or none. */
    icon?: ReactNode;
  };

/**
 * The part classes of a form's destinations, which each form writes out as literals: an indicator
 * around the icon above the label, as in Bar and Rail, or none, for a row of icon, label and count,
 * as in Drawer.
 */
export interface DestinationClasses {
  item: string;
  indicator?: string;
  label: string;
  count: string;
}

/** A run of destinations of one group, in the list's order: Drawer's sections. */
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

/** A destination's React key: its address, else its label, which the list keeps unique. */
export const destinationKey = (destination: DrawerDestination) =>
  destination.href ?? destination.label;

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
 * button that runs onSelect. The current one reports aria-current="page" and fills its icon; one
 * with a count is named with it, such as Inbox, 3 new. Bar and Rail put the icon in an indicator,
 * with the count on it, above the label; Drawer puts the icon, the label and the count in a row.
 */
export function DestinationItem({
  classes,
  destination,
}: {
  classes: DestinationClasses;
  destination: DrawerDestination;
}) {
  const messages = useNavigationMessages();
  const { label, icon, count, current = false, href, onSelect } = destination;
  const shown = shownCount(count);
  const icons =
    icon == null ? null : (
      <NavigationIconState selected={current}>
        <DecorativeIcon>{icon}</DecorativeIcon>
      </NavigationIconState>
    );
  // The count is part of the item's name, so the badge that shows it is hidden.
  const badge = shown !== undefined && (
    <span className={classes.count} aria-hidden="true">
      {shown}
    </span>
  );
  const control =
    href === undefined ? (
      <ActionElement onClick={onSelect} />
    ) : (
      <ActionElement href={href} onClick={onSelect} />
    );
  const shared = {
    render: control,
    className: classes.item,
    'data-current': current ? '' : undefined,
    'aria-current': current ? ('page' as const) : undefined,
    'aria-label': countedName(label, count, messages),
  };
  return classes.indicator === undefined ? (
    <Row {...shared} align="center" gap={3}>
      {icons}
      <span className={classes.label}>{label}</span>
      {badge}
    </Row>
  ) : (
    <Column {...shared} align="center" gap={1}>
      <span className={classes.indicator}>
        {icons}
        {badge}
      </span>
      <span className={classes.label}>{label}</span>
    </Column>
  );
}
