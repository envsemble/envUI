'use client';

import { Collapsible } from '@base-ui/react/collapsible';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Column } from '../layout/Layout.js';
import { Slot } from '../internal/layout/Slot.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import { CutLabelTooltip } from '../internal/popup/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { useLatest } from '../internal/useLatest.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import { ResizeHandle } from '../layout/ResizeHandle.js';
import { containerWidth, useResizableWidth } from '../internal/resize/useResizableWidth.js';
import { inSkeleton, skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import {
  destinationKey,
  DestinationItem,
  destinationSections,
  destinationText,
  useNavigationMessages,
  type DestinationClasses,
} from './internal/DestinationItem.js';
import type { NavigationDrawerDestination } from './destinations.js';
import { backgroundAttribute, type NavigationBackground } from './navigationBackground.js';
import type { ResizeDetails } from '../internal/resize/resizeDetails.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import { flag } from '../internal/flag.js';
import { rendersContent } from '../internal/react/rendersContent.js';
import '../styles/Base.css';
import '../styles/NavigationDrawer.css';

const drawerClasses: DestinationClasses = {
  item: 'env-navigation-drawer-item',
  label: 'env-navigation-drawer-label',
  count: 'env-navigation-drawer-count',
};

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

function useCut(ref: RefObject<HTMLElement | null>, oneLine: boolean) {
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!oneLine || !element) {
      setCut(false);
      return;
    }
    const measure = () => setCut(element.scrollWidth > element.clientWidth);
    if (typeof ResizeObserver === 'undefined') return measure();
    const firstMeasuresOnceLaidOutNotAtMount = new ResizeObserver(measure);
    firstMeasuresOnceLaidOutNotAtMount.observe(element);
    return () => firstMeasuresOnceLaidOutNotAtMount.disconnect();
  }, [ref, oneLine]);
  return cut;
}

interface DrawerState {
  oneLine: boolean;
  groupEnd: ((group: string) => ReactNode) | undefined;
  expanded: ReadonlySet<string>;
  setExpanded: (key: string, open: boolean) => void;
}

function DrawerControl({
  destination,
  oneLine,
  end,
  as,
}: {
  destination: NavigationDrawerDestination;
  oneLine: boolean;
  end?: ReactNode;
  as?: (item: ReactElement) => ReactElement;
}) {
  const label = useRef<HTMLSpanElement>(null);
  const cut = useCut(label, oneLine);
  const destinationItem = (
    <DestinationItem
      classes={drawerClasses}
      destination={destination}
      labelRef={label}
      badge={
        destination.badge != null && (
          <Slot className="env-navigation-drawer-badge" element="span" layout="row" shrink="never">
            {destination.badge}
          </Slot>
        )
      }
      end={end}
    />
  );
  const item = as ? as(destinationItem) : destinationItem;
  return oneLine ? (
    <CutLabelTooltip cut={cut} label={destination.label} side="inline-end">
      {item}
    </CutLabelTooltip>
  ) : (
    item
  );
}

const chevron = (
  <span className="env-icon env-navigation-drawer-chevron" aria-hidden="true">
    <IconChevronRight />
  </span>
);

function DrawerRow({
  destination,
  toggle,
  children,
}: {
  destination: NavigationDrawerDestination;
  toggle?: ReactNode;
  children: ReactNode;
}) {
  if (destination.end == null && toggle == null) return children;
  return (
    <div className="env-navigation-drawer-row">
      {children}
      {destination.end != null && (
        <Slot className="env-navigation-drawer-end" layout="row" shrink="never">
          {destination.end}
        </Slot>
      )}
      {toggle}
    </div>
  );
}

function DrawerBranch({
  destination,
  nested,
  state,
}: {
  destination: NavigationDrawerDestination;
  nested: readonly NavigationDrawerDestination[];
  state: DrawerState;
}) {
  const messages = useNavigationMessages();
  const key = destinationKey(destination);
  const heading = destination.href === undefined && destination.onClick === undefined;
  return (
    <Collapsible.Root
      open={state.expanded.has(key)}
      onOpenChange={(open) => state.setExpanded(key, open)}
      render={<li />}
      className="env-navigation-drawer-branch"
    >
      {heading ? (
        <DrawerRow destination={destination}>
          <DrawerControl
            destination={destination}
            oneLine={state.oneLine}
            end={chevron}
            as={(item) => <Collapsible.Trigger render={item} />}
          />
        </DrawerRow>
      ) : (
        <DrawerRow
          destination={destination}
          toggle={
            <Collapsible.Trigger
              className="env-navigation-drawer-toggle"
              aria-label={messages.contents({ label: destinationText(destination) })}
            >
              {chevron}
            </Collapsible.Trigger>
          }
        >
          <DrawerControl destination={destination} oneLine={state.oneLine} />
        </DrawerRow>
      )}
      <Collapsible.Panel
        hiddenUntilFound
        render={<ul />}
        className="env-navigation-drawer-children"
      >
        {nested.map((child) => (
          <DrawerItem key={destinationKey(child)} destination={child} state={state} />
        ))}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

function DrawerItem({
  destination,
  state,
}: {
  destination: NavigationDrawerDestination;
  state: DrawerState;
}) {
  const nested = destination.children;
  if (nested !== undefined && nested.length > 0)
    return <DrawerBranch destination={destination} nested={nested} state={state} />;
  return (
    <li>
      <DrawerRow destination={destination}>
        <DrawerControl destination={destination} oneLine={state.oneLine} />
      </DrawerRow>
    </li>
  );
}

function Section({
  group,
  items,
  level,
  state,
}: {
  group: string;
  items: NavigationDrawerDestination[];
  level: Exclude<HeadingLevel, 1>;
  state: DrawerState;
}) {
  const headingId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const cut = useCut(heading, state.oneLine);
  const Heading = `h${level}` as const;
  const end = state.groupEnd?.(group);
  const headingElement = (
    <Heading
      ref={heading}
      className="env-navigation-drawer-group-label"
      id={headingId}
      title={cut ? group : undefined}
    >
      {group}
    </Heading>
  );
  return (
    <Column render={<li />} className="env-navigation-drawer-section" align="stretch" gap={1}>
      {rendersContent(end) ? (
        <div className="env-navigation-drawer-group-row">
          {headingElement}
          <Slot className="env-navigation-drawer-group-end" layout="row" shrink="never">
            {end}
          </Slot>
        </div>
      ) : (
        headingElement
      )}
      <Column render={<ul />} aria-labelledby={headingId} align="stretch" gap={1}>
        {items.map((destination) => (
          <DrawerItem key={destinationKey(destination)} destination={destination} state={state} />
        ))}
      </Column>
    </Column>
  );
}

function keysOfSectionsHoldingCurrent(
  destinations: readonly NavigationDrawerDestination[],
): string[] {
  for (const destination of destinations) {
    const nested = destination.children;
    if (nested === undefined || nested.length === 0) continue;
    if (nested.some((child) => child.current === true)) return [destinationKey(destination)];
    const inner = keysOfSectionsHoldingCurrent(nested);
    if (inner.length > 0) return [destinationKey(destination), ...inner];
  }
  return [];
}

const unionInOrder = (keys: readonly string[], more: readonly string[]) => [
  ...new Set([...keys, ...more]),
];

function useExpanded(
  destinations: readonly NavigationDrawerDestination[],
  expanded: readonly string[] | undefined,
  defaultExpanded: readonly string[],
  onExpandedChange: ((expanded: string[]) => void) | undefined,
): Pick<DrawerState, 'expanded' | 'setExpanded'> {
  const path = keysOfSectionsHoldingCurrent(destinations);
  const pathKey = JSON.stringify(path);
  const [shown, change, keepOwn] = useControllableState<readonly string[], string[]>({
    value: expanded,
    defaultValue: unionInOrder(defaultExpanded, path),
    onChange: onExpandedChange,
  });
  const controlled = expanded !== undefined;
  const [ownPath, setOwnPath] = useState(pathKey);
  const currentMovedWithinOwnState = !controlled && ownPath !== pathKey;
  if (currentMovedWithinOwnState) {
    setOwnPath(pathKey);
    keepOwn(unionInOrder(shown, path));
  }
  const latest = useLatest(shown);
  useEffect(
    function openApplicationsSectionsHoldingCurrent() {
      if (!controlled) return;
      const keys = JSON.parse(pathKey) as string[];
      if (keys.some((key) => !latest.current.includes(key)))
        change(unionInOrder(latest.current, keys));
    },
    [latest, change, controlled, pathKey],
  );
  const set = useMemo(() => new Set(shown), [shown]);
  const setExpanded = useCallback(
    (key: string, open: boolean) => {
      const current = latest.current;
      change(open ? unionInOrder(current, [key]) : current.filter((each) => each !== key));
    },
    [latest, change],
  );
  return { expanded: set, setExpanded };
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
  const messages = useNavigationMessages();
  const { expanded, setExpanded } = useExpanded(
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
            <Section
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
      data-background={backgroundAttribute(background)}
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
