'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Column } from '../foundations/Layout.js';
import { classNames } from '../internal/classNames.js';
import { inSkeleton } from '../foundations/internal/inSkeleton.js';
import { skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import {
  destinationKey,
  DestinationItem,
  useNavigationMessages,
  type Destination,
  type DestinationClasses,
} from './internal/Destinations.js';
import { backgroundAttribute, type NavigationBackground } from './internal/background.js';
import '../styles/Base.css';
import '../styles/NavigationRail.css';

/** The part classes of the rail's destinations. */
const railClasses: DestinationClasses = {
  item: 'env-rail-item',
  indicator: 'env-rail-indicator',
  label: 'env-rail-label',
  count: 'env-rail-count',
};

export interface NavigationRailProps
  extends Omit<ComponentPropsWithRef<'nav'>, 'children'>,
    SkeletonProps {
  /**
   * The application's destinations, the same array NavigationBar and NavigationDrawer take, each an icon above a short
   * label. Groups don't show: the destinations follow one another in the array's order. Nested
   * destinations don't show either: a destination whose `children` hold the current one takes the
   * current fill.
   */
  destinations: readonly Destination[];
  /**
   * Content above the destinations, such as a button that opens a Sheet with the NavigationDrawer, or the
   * main action of the page.
   */
  header?: ReactNode;
  /** Content at the bottom of the rail, such as the account's AvatarButton. */
  footer?: ReactNode;
  /**
   * The rail's background, named as Surface's and Card's: default, the navigation's background,
   * the default surface color, as a plain rectangle; page, the page's background, so it sits on the
   * page. On a surface, such as a Sheet, both take the surface's color; a Sheet's is the
   * navigation's background, so it keeps its color in a narrow window. Set it on its own, such as
   * a NavigationRail with its background beside a TopBar with page.
   * @default 'default'
   */
  background?: NavigationBackground;
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
export function NavigationRail({
  destinations,
  header,
  footer,
  background = 'default',
  'aria-label': label,
  'aria-labelledby': labelledBy,
  skeleton = false,
  className,
  ...props
}: NavigationRailProps) {
  const messages = useNavigationMessages();
  return (
    <Column
      render={<nav />}
      {...props}
      aria-label={label ?? (labelledBy === undefined ? messages.label : undefined)}
      aria-labelledby={labelledBy}
      {...skeletonAttributes(skeleton)}
      className={classNames('env-rail', className)}
      data-background={backgroundAttribute(background)}
      align="center"
      gap={4}
    >
      {inSkeleton(
        skeleton,
        <>
          {header != null && (
            <Column className="env-rail-header" align="center" gap={2}>
              {header}
            </Column>
          )}
          <Column render={<ul />} className="env-rail-list" align="stretch" gap={1}>
            {destinations.map((destination) => (
              <li key={destinationKey(destination)}>
                <DestinationItem classes={railClasses} destination={destination} topLevel />
              </li>
            ))}
          </Column>
          {footer != null && (
            <Column className="env-rail-footer" align="center" gap={2}>
              {footer}
            </Column>
          )}
        </>,
      )}
    </Column>
  );
}
