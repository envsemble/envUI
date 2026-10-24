'use client';

import { useId, type ComponentPropsWithRef, type CSSProperties, type ReactNode } from 'react';
import { Column } from '../foundations/Layout.js';
import { classNames } from '../internal/classNames.js';
import { ResizeHandle } from '../internal/ResizeHandle.js';
import { containerWidth, useResizableWidth } from '../internal/useResizableWidth.js';
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
  /**
   * Lets people resize the drawer by its inner edge, the end edge: a handle there that the pointer
   * drags and the arrow keys move, between `minWidth` and `maxWidth`, which a double click returns
   * to `defaultWidth`. Leave it out of a drawer in a sheet of a narrow window.
   * @default false
   */
  resizable?: boolean;
  /**
   * The drawer's width in rem while `resizable`, for a drawer the application controls with
   * onWidthChange, such as a width it keeps for the next visit.
   */
  width?: number;
  /**
   * The width in rem a `resizable` drawer starts at until people resize it, and that a double click
   * on the handle returns it to.
   * @default 17.5
   */
  defaultWidth?: number;
  /**
   * Receives each new width of a `resizable` drawer, in rem: while dragging with committed false,
   * and with committed true as a drag ends, a key moves the handle or a double click resets it.
   * Store the committed width to keep it, and pass it back as `width`.
   */
  onWidthChange?: (width: number, details: { committed: boolean }) => void;
  /**
   * The smallest width of a `resizable` drawer, in rem.
   * @default 15
   */
  minWidth?: number;
  /**
   * The largest width of a `resizable` drawer, in rem. It never takes more than half its
   * container, such as the Scaffold, or of the window.
   * @default 30
   */
  maxWidth?: number;
  /**
   * The resize handle's name.
   * @default 'Resize navigation', or EnvUIProvider's messages.navigation.resize
   */
  resizeLabel?: string;
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

/** The widest a resizable drawer can be, in rem: half its container's width. */
const roomFor = (handle: HTMLElement) => containerWidth(handle.parentElement ?? handle) / 2;

/**
 * The navigation drawer for expanded and larger windows: a column at the window's start with every
 * destination as a row of icon, label and count, under the headings of their groups. A `nav`
 * landmark; the current destination reports aria-current="page", and every destination is a tab
 * stop. Its list scrolls where the drawer is shorter than its destinations. With `resizable`,
 * people resize it by its end edge.
 */
export function Drawer({
  destinations,
  header,
  footer,
  headingLevel = 2,
  background = 'default',
  'aria-label': label,
  'aria-labelledby': labelledBy,
  resizable = false,
  width: controlledWidth,
  defaultWidth = 17.5,
  onWidthChange,
  minWidth = 15,
  maxWidth = 30,
  resizeLabel,
  skeleton = false,
  className,
  style,
  ...props
}: DrawerProps) {
  const messages = useNavigationMessages();
  const resize = useResizableWidth({
    width: controlledWidth,
    defaultWidth,
    minWidth,
    maxWidth,
    onWidthChange,
    room: roomFor,
    reverse: false,
    widthText: (width) => messages.width({ width }),
  });
  return (
    <Column
      render={<nav />}
      {...props}
      aria-label={label ?? (labelledBy === undefined ? messages.label : undefined)}
      aria-labelledby={labelledBy}
      {...skeletonAttributes(skeleton)}
      className={classNames('env-drawer', className)}
      style={
        resizable
          ? ({
              '--env-drawer-width': `${resize.width}rem`,
              '--env-drawer-min-width': `${resize.handleProps.min}rem`,
              '--env-drawer-max-width': `${resize.handleProps.max}rem`,
              ...style,
            } as CSSProperties)
          : style
      }
      data-background={backgroundAttribute(background)}
      data-resizable={resizable ? '' : undefined}
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
      {resizable && (
        <ResizeHandle
          {...resize.handleProps}
          label={resizeLabel ?? messages.resize}
          className="env-drawer-resize-handle"
        />
      )}
    </Column>
  );
}
