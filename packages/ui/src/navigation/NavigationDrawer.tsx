'use client';

import { useMemo, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Column } from '../layout/Layout.js';
import { Slot } from '../internal/layout/Slot.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { navigation } from '../foundations/messages/navigation.js';
import { ResizeHandle } from '../layout/ResizeHandle.js';
import { containerWidth, useResizableWidth } from '../internal/resize/useResizableWidth.js';
import { inSkeleton, skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import { destinationKey } from './internal/destinationModel.js';
import { destinationSections } from './internal/navigationDrawer/destinationSections.js';
import {
  DrawerItem,
  DrawerSection,
  type DrawerState,
} from './internal/navigationDrawer/DrawerRows.js';
import { useExpandedSections } from './internal/navigationDrawer/useExpandedSections.js';
import type { NavigationDrawerDestination } from './destinations.js';
import type { NavigationBackground } from './navigationBackground.js';
import type { ResizeDetails } from '../internal/resize/resizeDetails.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/NavigationDrawer.css';

export interface NavigationDrawerProps
  extends Omit<ComponentPropsWithRef<'nav'>, 'children'>, SkeletonProps {
  /**
   * The application's destinations, the same array NavigationBar and NavigationRail take: each a row with its icon, its
   * label and its count. A heading starts each run of destinations of one `group`. A destination
   * with `children` is a section that opens and closes, with them under it, indented.
   */
  destinations: readonly NavigationDrawerDestination[];
  /**
   * The open sections, for a drawer whose sections the application keeps open, such as for the
   * next visit: each a destination with `children`, named by its `id`, else its `href`, else its
   * label. Update it from onExpandedChange. Leave it out for the drawer to keep its own.
   */
  expanded?: readonly string[];
  /**
   * The sections open at first, as in `expanded`, for a drawer that keeps its own. The sections
   * that hold the current destination open as well.
   * @default []
   */
  defaultExpanded?: readonly string[];
  /**
   * Receives the open sections, as in `expanded`, as one opens or closes, and as the current
   * destination moves into a closed section, which opens.
   */
  onExpandedChange?: (expanded: string[]) => void;
  /** Content above the destinations, such as the application's name or a search trigger. */
  header?: ReactNode;
  /** Content below the destinations, at the bottom of the drawer, such as the account's menu. */
  footer?: ReactNode;
  /**
   * Content after a group's heading, outside it, such as an IconButton that adds a project to
   * Projects, a Menu of the group's actions or a count. It keeps its size, and the heading gives
   * way to it.
   */
  groupEnd?: (group: string) => ReactNode;
  /**
   * The level of the groups' headings, which assistive technology lists with the page's headings:
   * one below the heading the drawer sits under, such as 3 in a drawer under an h2.
   * @default 2
   */
  headingLevel?: Exclude<HeadingLevel, 1>;
  /**
   * The drawer's background, named as Surface's and Card's: default, the default surface color, the
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
  /**
   * Lets people resize the drawer by its inner edge, the end edge: a handle there that the pointer
   * drags and the arrow keys move, between `minWidth` and `maxWidth`, which a double click returns
   * to `defaultWidth`. Its labels and headings keep to one line: one that doesn't fit ends in an
   * ellipsis, a label cut short shows in full in a tooltip and a heading in its title. Leave it out
   * of a drawer in a sheet of a narrow window.
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
  onWidthChange?: (width: number, details: ResizeDetails) => void;
  /**
   * The smallest width people can resize a `resizable` drawer to, in rem; it never takes more than
   * its container.
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

const noOpenSections: readonly string[] = [];

const halfContainerWidthInRem = (handle: HTMLElement) =>
  containerWidth(handle.parentElement ?? handle) / 2;

/**
 * The navigation drawer for expanded and larger windows: a column at the window's start with every
 * destination as a row of icon, label and count, under the headings of their groups, and nested
 * destinations in sections that open and close. It is `--env-navigation-drawer-width` wide and never
 * wider than its container, so it also serves as a side list of a page's sections in a narrow
 * column. A `nav` landmark; the current destination reports
 * aria-current="page", and every destination and section button is a tab stop. Its list scrolls where the drawer is shorter than its destinations. With `resizable`,
 * people resize it by its end edge.
 */
export function NavigationDrawer({
  destinations,
  expanded: expandedProp,
  defaultExpanded = noOpenSections,
  onExpandedChange,
  header,
  footer,
  groupEnd,
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
}: NavigationDrawerProps) {
  const messages = useMessages('navigation', navigation);
  const { expanded, setExpanded } = useExpandedSections(
    destinations,
    expandedProp,
    defaultExpanded,
    onExpandedChange,
  );
  const listKeptAcrossResizeMoves = useMemo(() => {
    const state: DrawerState = { oneLine: resizable, groupEnd, expanded, setExpanded };
    return (
      <Column render={<ul />} className="env-navigation-drawer-list" align="stretch" gap={1}>
        {destinationSections(destinations).map((section, index) =>
          section.group === undefined ? (
            section.items.map((destination) => (
              <DrawerItem
                key={destinationKey(destination)}
                destination={destination}
                state={state}
              />
            ))
          ) : (
            <DrawerSection
              key={`${index}-${section.group}`}
              group={section.group}
              items={section.items}
              level={headingLevel}
              state={state}
            />
          ),
        )}
      </Column>
    );
  }, [destinations, resizable, groupEnd, expanded, setExpanded, headingLevel]);
  const resize = useResizableWidth({
    width: controlledWidth,
    defaultWidth,
    minWidth,
    maxWidth,
    onWidthChange,
    room: halfContainerWidthInRem,
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
      className={classNames('env-navigation-drawer', className)}
      style={
        resizable
          ? {
              '--env-navigation-drawer-width': `${resize.width}rem`,
              '--_navigation-drawer-max-width': `${resize.handleProps.max}rem`,
              ...style,
            }
          : style
      }
      data-background={background}
      data-resizable={flag(resizable)}
      align="stretch"
      gap={3}
    >
      {inSkeleton(
        skeleton,
        <>
          {header != null && <Slot className="env-navigation-drawer-header">{header}</Slot>}
          {listKeptAcrossResizeMoves}
          {footer != null && <Slot className="env-navigation-drawer-footer">{footer}</Slot>}
        </>,
      )}
      {resizable && (
        <ResizeHandle
          {...resize.handleProps}
          label={resizeLabel ?? messages.resize}
          grip
          className="env-navigation-drawer-resize-handle"
        />
      )}
    </Column>
  );
}
