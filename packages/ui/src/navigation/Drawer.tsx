'use client';

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Column } from '../foundations/Layout.js';
import { classNames } from '../internal/classNames.js';
import { inSkeleton } from '../foundations/inSkeleton.js';
import { skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import {
  destinationKey,
  DestinationItem,
  destinationSections,
  useNavigationMessages,
  type DestinationClasses,
  type DrawerDestination,
} from './internal/Destinations.js';
import { backgroundAttribute, type NavigationBackground } from './internal/background.js';

/** The part classes of the drawer's destinations: a row of icon, label and count. */
const drawerClasses: DestinationClasses = {
  item: 'env-drawer-item',
  label: 'env-drawer-label',
  count: 'env-drawer-count',
};

export interface DrawerProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'>, SkeletonProps {
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
   * The level of the groups' headings, which assistive technology lists with the page's headings:
   * one below the heading the drawer sits under, such as 3 in a drawer under an h2.
   * @default 2
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /**
   * The drawer's background, named as Surface's and Card's: default, the navigation's background,
   * the default surface color, as a plain rectangle; page, the page's background, so it sits on the
   * page. On a surface, such as a Sheet, both take the surface's color. Set it on its own, such as
   * a Drawer with its background under a TopBar with page.
   * @default 'default'
   */
  background?: NavigationBackground;
  /**
   * Names the navigation landmark, such as Main or Project; give each landmark of a page its own.
   * @default messages.navigation.label, Main
   */
  'aria-label'?: string;
}

/** A group's heading and its destinations, a list of its own named by the heading. */
function Section({
  group,
  items,
  level,
}: {
  group: string;
  items: DrawerDestination[];
  level: 2 | 3 | 4 | 5 | 6;
}) {
  const headingId = useId();
  const Heading = `h${level}` as const;
  return (
    <Column render={<li />} className="env-drawer-section" align="stretch" gap={1}>
      <Heading className="env-drawer-heading" id={headingId}>
        {group}
      </Heading>
      <Column render={<ul />} aria-labelledby={headingId} align="stretch" gap={1}>
        {items.map((destination) => (
          <li key={destinationKey(destination)}>
            <DestinationItem classes={drawerClasses} destination={destination} />
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
export function Drawer({
  destinations,
  header,
  footer,
  headingLevel = 2,
  background = 'default',
  'aria-label': label,
  'aria-labelledby': labelledBy,
  skeleton = false,
  className,
  ...props
}: DrawerProps) {
  const messages = useNavigationMessages();
  return (
    <Column
      render={<nav />}
      {...props}
      aria-label={label ?? (labelledBy === undefined ? messages.label : undefined)}
      aria-labelledby={labelledBy}
      {...skeletonAttributes(skeleton)}
      className={classNames('env-drawer', className)}
      data-background={backgroundAttribute(background)}
      align="stretch"
      gap={3}
    >
      {inSkeleton(
        skeleton,
        <>
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
                    <DestinationItem classes={drawerClasses} destination={destination} />
                  </li>
                ))
              ) : (
                <Section
                  key={`${index}-${section.group}`}
                  group={section.group}
                  items={section.items}
                  level={headingLevel}
                />
              ),
            )}
          </Column>
          {footer != null && (
            <Column className="env-drawer-footer" gap={2}>
              {footer}
            </Column>
          )}
        </>,
      )}
    </Column>
  );
}
