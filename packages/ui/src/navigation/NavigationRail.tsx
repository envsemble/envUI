'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Column } from '../layout/Layout.js';
import { Slot } from '../internal/layout/Slot.js';
import { CutLabelTooltip } from '../internal/popup/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import {
  inSkeleton,
  skeletonAttributes,
  type SkeletonProps,
} from '../internal/skeleton/skeleton.js';
import {
  destinationKey,
  DestinationItem,
  useNavigationMessages,
  type DestinationClasses,
} from './internal/DestinationItem.js';
import type { Destination } from './destinations.js';
import type { NavigationBackground } from './navigationBackground.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/NavigationRail.css';

const railClasses: DestinationClasses = {
  item: 'env-navigation-rail-item',
  indicator: 'env-navigation-rail-indicator',
  label: 'env-navigation-rail-label',
  count: 'env-navigation-rail-count',
};

export interface NavigationRailProps
  extends Omit<ComponentPropsWithRef<'nav'>, 'children'>, SkeletonProps {
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
   * The rail's background, named as Surface's and Card's: default, the default surface color, the
   * app frame's own fill that stands apart from the page; page, the page's background, the same as
   * the content beside it, from which a Scaffold sets it apart with a hairline. On a surface, such
   * as a Sheet, both take the surface's color.
   * @default 'default'
   */
  background?: NavigationBackground;
  /**
   * Whether the destinations' labels show under their icons. False shows the icons only, for an
   * icon-only rail such as a code editor's activity bar: each label still names its destination
   * and shows in a tooltip on hover and keyboard focus.
   * @default true
   */
  visibleLabel?: boolean;
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
  visibleLabel = true,
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
      className={classNames('env-navigation-rail', className)}
      data-background={background}
      data-label-hidden={flag(!visibleLabel)}
      align="center"
      gap={4}
    >
      {inSkeleton(
        skeleton,
        <>
          {header != null && <Slot className="env-navigation-rail-header">{header}</Slot>}
          <Column render={<ul />} className="env-navigation-rail-list" align="stretch" gap={1}>
            {destinations.map((destination) => {
              const item = (
                <DestinationItem classes={railClasses} destination={destination} topLevel />
              );
              return (
                <li key={destinationKey(destination)}>
                  {!visibleLabel ? (
                    <CutLabelTooltip cut label={destination.label} side="inline-end">
                      {item}
                    </CutLabelTooltip>
                  ) : (
                    item
                  )}
                </li>
              );
            })}
          </Column>
          {footer != null && <Slot className="env-navigation-rail-footer">{footer}</Slot>}
        </>,
      )}
    </Column>
  );
}
