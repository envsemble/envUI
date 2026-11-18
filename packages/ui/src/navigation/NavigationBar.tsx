'use client';

import type { ComponentPropsWithRef } from 'react';
import { Column, Row } from '../layout/Layout.js';
import { Badge } from '../data-display/Badge.js';
import { classNames } from '../internal/classNames.js';
import { inSkeleton, skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import { ActionElement } from '../internal/control/ActionElement.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { IconMoreHoriz } from '../icons/MoreHoriz.js';
import * as Menu from '../actions/menu/Menu.js';
import {
  countedName,
  destinationKey,
  DestinationItem,
  holdsCurrent,
  shownCount,
  useNavigationMessages,
  type DestinationClasses,
} from './internal/DestinationItem.js';
import type { Destination } from './destinations.js';
import { backgroundAttribute, type NavigationBackground } from './navigationBackground.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/NavigationBar.css';

const mostDestinationsShownBeforeMore = 5;

const barClasses: DestinationClasses = {
  item: 'env-navigation-bar-item',
  indicator: 'env-navigation-bar-indicator',
  label: 'env-navigation-bar-label',
  count: 'env-navigation-bar-count',
};

export interface NavigationBarProps
  extends Omit<ComponentPropsWithRef<'nav'>, 'children'>, SkeletonProps {
  /**
   * The application's destinations, the same array NavigationRail and NavigationDrawer take. Give the bar 3 to 5: past
   * 5 it shows the first 4 and a More item that opens the rest in a menu. Groups and nested
   * destinations don't show: a destination whose `children` hold the current one takes the current
   * fill.
   */
  destinations: readonly Destination[];
  /**
   * The bar's background, named as Surface's and Card's: default, the default surface color, the
   * app frame's own fill that stands apart from the page; page, the page's background, the same as
   * the content beside it, from which a Scaffold sets it apart with a hairline. On a surface, such
   * as a Sheet, both take the surface's color.
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
 * The navigation bar for compact windows, such as phones: up to five destinations side by side,
 * each an icon above its label, at the bottom of the window. A `nav` landmark; the current
 * destination reports aria-current="page", and every destination is a tab stop.
 */
export function NavigationBar({
  destinations,
  background = 'default',
  'aria-label': label,
  'aria-labelledby': labelledBy,
  skeleton = false,
  className,
  ...props
}: NavigationBarProps) {
  const messages = useNavigationMessages();
  const overflow = destinations.length > mostDestinationsShownBeforeMore;
  const shown = overflow
    ? destinations.slice(0, mostDestinationsShownBeforeMore - 1)
    : destinations;
  const rest = overflow ? destinations.slice(mostDestinationsShownBeforeMore - 1) : [];
  const restCount = rest.reduce(
    (sum, { count }) => (shownCount(count) === undefined ? sum : sum + (count ?? 0)),
    0,
  );
  const restShown = shownCount(restCount);
  const restCurrent = rest.some(
    (destination) => destination.current === true || holdsCurrent(destination.children),
  );
  const restName = countedName(messages.more, restCount, messages) ?? messages.more;
  const moreState = {
    'data-current': flag(restCurrent),
    'aria-label': restCurrent ? messages.moreCurrent({ name: restName }) : restName,
  };
  return (
    <nav
      {...props}
      aria-label={label ?? (labelledBy === undefined ? messages.label : undefined)}
      aria-labelledby={labelledBy}
      {...skeletonAttributes(skeleton)}
      className={classNames('env-navigation-bar', className)}
      data-background={backgroundAttribute(background)}
    >
      {inSkeleton(
        skeleton,
        <Row render={<ul />} className="env-navigation-bar-list">
          {shown.map((destination) => (
            <li key={destinationKey(destination)}>
              <DestinationItem classes={barClasses} destination={destination} topLevel />
            </li>
          ))}
          {overflow && (
            <li>
              <Menu.Root
                aria-label={messages.more}
                side="top"
                trigger={
                  <Column
                    render={<ActionElement />}
                    className="env-navigation-bar-item env-navigation-bar-more"
                    {...moreState}
                    align="center"
                    gap={1}
                  >
                    <span className="env-navigation-bar-label">{messages.more}</span>
                    {restShown !== undefined && ' '}
                    <span className="env-navigation-bar-indicator">
                      <DecorativeIcon>
                        <IconMoreHoriz />
                      </DecorativeIcon>
                      {restShown !== undefined && (
                        <span className="env-navigation-bar-count" aria-hidden="true">
                          {restShown}
                        </span>
                      )}
                    </span>
                  </Column>
                }
              >
                {rest.map((destination) => {
                  const count = shownCount(destination.count);
                  const inside = !destination.current && holdsCurrent(destination.children);
                  const shared = {
                    icon: destination.icon,
                    'aria-current': destination.current
                      ? ('page' as const)
                      : inside
                        ? ('true' as const)
                        : undefined,
                    'aria-label': countedName(destination.label, destination.count, messages),
                    end:
                      count === undefined ? undefined : <Badge count={count} aria-hidden="true" />,
                    children: destination.label,
                  };
                  return destination.href === undefined ? (
                    <Menu.Item
                      key={destinationKey(destination)}
                      {...shared}
                      onClick={destination.onClick}
                    />
                  ) : (
                    <Menu.Item
                      key={destinationKey(destination)}
                      {...shared}
                      href={destination.href}
                      onClick={destination.onClick}
                    />
                  );
                })}
              </Menu.Root>
            </li>
          )}
        </Row>,
      )}
    </nav>
  );
}
