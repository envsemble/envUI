'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Column } from '../foundations/Layout.js';
import { classNames } from '../internal/classNames.js';
import {
  destinationKey,
  DestinationItem,
  useNavigationMessages,
  type Destination,
} from './internal/Destinations.js';

export interface RailProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  /**
   * The application's destinations, the same array Bar and Drawer take, each an icon above a short
   * label. Groups don't show: the destinations follow one another in the array's order.
   */
  destinations: readonly Destination[];
  /**
   * Content above the destinations, such as a button that opens a Sheet with the Drawer, or the
   * main action of the page.
   */
  header?: ReactNode;
  /** Content at the bottom of the rail, such as the account's AvatarButton. */
  footer?: ReactNode;
  /**
   * Names the navigation landmark, such as Main or Project; give each landmark of a page its own.
   * @default messages.navigation.label, Main
   */
  'aria-label'?: string;
}

/**
 * The navigation rail for medium windows, such as tablets: a narrow column at the window's start
 * with the destinations one under another, each an icon above a short label. A `nav` landmark; the
 * current destination reports aria-current="page", and every destination is a tab stop.
 */
export function Rail({
  destinations,
  header,
  footer,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  className,
  ...props
}: RailProps) {
  const messages = useNavigationMessages();
  return (
    <Column
      render={<nav />}
      {...props}
      aria-label={label ?? (labelledBy === undefined ? messages.label : undefined)}
      aria-labelledby={labelledBy}
      className={classNames('env-rail', className)}
      align="center"
      gap={4}
    >
      {header != null && (
        <Column className="env-rail-header" align="center" gap={2}>
          {header}
        </Column>
      )}
      <Column render={<ul />} className="env-rail-list" align="stretch" gap={1}>
        {destinations.map((destination) => (
          <li key={destinationKey(destination)}>
            <DestinationItem form="rail" destination={destination} />
          </li>
        ))}
      </Column>
      {footer != null && (
        <Column className="env-rail-footer" align="center" gap={2}>
          {footer}
        </Column>
      )}
    </Column>
  );
}
