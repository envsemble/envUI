'use client';

import type { ComponentPropsWithRef } from 'react';
import { Column, Row } from '../foundations/Layout.js';
import { CounterBadge } from '../content/CounterBadge.js';
import { classNames } from '../internal/classNames.js';
import { ActionElement } from '../internal/ActionElement.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { MoreHoriz } from '../icons/MoreHoriz.js';
import * as Menu from './Menu.js';
import {
  countedName,
  destinationKey,
  DestinationItem,
  shownCount,
  useNavigationMessages,
  type Destination,
  type DestinationClasses,
} from './internal/Destinations.js';

/** The most destinations the bar shows; past it, the last place opens the rest in a menu. */
const barLimit = 5;

/** The part classes of the bar's destinations. */
const barClasses: DestinationClasses = {
  item: 'env-bar-item',
  indicator: 'env-bar-indicator',
  label: 'env-bar-label',
  count: 'env-bar-count',
};

export interface BarProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  /**
   * The application's destinations, the same array Rail and Drawer take. Give the bar 3 to 5: past
   * 5 it shows the first 4 and a More item that opens the rest in a menu. Groups don't show.
   */
  destinations: readonly Destination[];
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
export function Bar({
  destinations,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  className,
  ...props
}: BarProps) {
  const messages = useNavigationMessages();
  const overflow = destinations.length > barLimit;
  const shown = overflow ? destinations.slice(0, barLimit - 1) : destinations;
  const rest = overflow ? destinations.slice(barLimit - 1) : [];
  // The More item counts what its menu holds, and shows the current fill when it holds the current
  // destination.
  const restCount = rest.reduce(
    (sum, { count }) => (shownCount(count) === undefined ? sum : sum + (count ?? 0)),
    0,
  );
  const restShown = shownCount(restCount);
  const restCurrent = rest.some((destination) => destination.current);
  return (
    <nav
      {...props}
      aria-label={label ?? (labelledBy === undefined ? messages.label : undefined)}
      aria-labelledby={labelledBy}
      className={classNames('env-bar', className)}
    >
      <Row render={<ul />} className="env-bar-list">
        {shown.map((destination) => (
          <li key={destinationKey(destination)}>
            <DestinationItem classes={barClasses} destination={destination} />
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
                  className="env-bar-item env-bar-more"
                  data-current={restCurrent ? '' : undefined}
                  aria-label={countedName(messages.more, restCount, messages)}
                  align="center"
                  gap={1}
                >
                  <span className="env-bar-indicator">
                    <DecorativeIcon>
                      <MoreHoriz />
                    </DecorativeIcon>
                    {restShown !== undefined && (
                      <span className="env-bar-count" aria-hidden="true">
                        {restShown}
                      </span>
                    )}
                  </span>
                  <span className="env-bar-label">{messages.more}</span>
                </Column>
              }
            >
              {rest.map((destination) => {
                const count = shownCount(destination.count);
                const shared = {
                  icon: destination.icon,
                  'aria-current': destination.current ? ('page' as const) : undefined,
                  end:
                    count === undefined ? undefined : (
                      <CounterBadge value={count} aria-label={messages.count({ count })} />
                    ),
                  children: destination.label,
                };
                return destination.href === undefined ? (
                  <Menu.Item
                    key={destinationKey(destination)}
                    {...shared}
                    onClick={destination.onSelect}
                  />
                ) : (
                  <Menu.Item
                    key={destinationKey(destination)}
                    {...shared}
                    href={destination.href}
                    onClick={destination.onSelect}
                  />
                );
              })}
            </Menu.Root>
          </li>
        )}
      </Row>
    </nav>
  );
}
