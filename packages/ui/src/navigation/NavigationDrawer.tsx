'use client';

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Column } from '../foundations/Layout.js';
import { classNames } from '../internal/classNames.js';
import {
  destinationKey,
  DestinationItem,
  destinationSections,
  useNavigationMessages,
  type DrawerDestination,
} from './internal/Destinations.js';

export interface NavigationDrawerProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  /**
   * The application's destinations, the same array Bar and Rail take: each a row with its icon, its
   * label and its count. A heading starts each run of destinations of one `group`.
   */
  destinations: readonly DrawerDestination[];
  /** Content above the destinations, such as the application's name or a search trigger. */
  header?: ReactNode;
  /** Content below the destinations, at the bottom of the drawer, such as the account's menu. */
  footer?: ReactNode;
  /**
   * Names the navigation landmark, such as Main or Project; give each landmark of a page its own.
   * @default messages.navigation.label, Main
   */
  'aria-label'?: string;
}

/** A group's heading and its destinations, a list of its own named by the heading. */
function Section({ group, items }: { group: string; items: DrawerDestination[] }) {
  const headingId = useId();
  return (
    <Column render={<li />} className="env-drawer-section" align="stretch" gap={1}>
      <span className="env-drawer-heading" id={headingId}>
        {group}
      </span>
      <Column render={<ul />} aria-labelledby={headingId} align="stretch" gap={1}>
        {items.map((destination) => (
          <li key={destinationKey(destination)}>
            <DestinationItem form="drawer" destination={destination} />
          </li>
        ))}
      </Column>
    </Column>
  );
}

/**
 * The navigation drawer for expanded and larger windows: a column at the window's start with every
 * destination as a row of icon, label and count, under the headings of their groups. A `nav`
 * landmark; the current destination reports aria-current="page", and every destination is a tab
 * stop. Its list scrolls where the drawer is shorter than its destinations.
 */
export function NavigationDrawer({
  destinations,
  header,
  footer,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  className,
  ...props
}: NavigationDrawerProps) {
  const messages = useNavigationMessages();
  return (
    <Column
      render={<nav />}
      {...props}
      aria-label={label ?? (labelledBy === undefined ? messages.label : undefined)}
      aria-labelledby={labelledBy}
      className={classNames('env-drawer', className)}
      align="stretch"
      gap={3}
    >
      {header != null && (
        <Column className="env-drawer-header" gap={2}>
          {header}
        </Column>
      )}
      <Column render={<ul />} className="env-drawer-list" align="stretch" gap={1}>
        {destinationSections(destinations).map((section, index) =>
          section.group === undefined ? (
            section.items.map((destination) => (
              <li key={destinationKey(destination)}>
                <DestinationItem form="drawer" destination={destination} />
              </li>
            ))
          ) : (
            <Section
              key={`${index}-${section.group}`}
              group={section.group}
              items={section.items}
            />
          ),
        )}
      </Column>
      {footer != null && (
        <Column className="env-drawer-footer" gap={2}>
          {footer}
        </Column>
      )}
    </Column>
  );
}
