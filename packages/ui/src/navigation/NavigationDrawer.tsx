'use client';

import { Collapsible } from '@base-ui/react/collapsible';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Column } from '../foundations/Layout.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import { TooltipPopup, tooltipDelay } from '../internal/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { useLatest } from '../internal/useLatest.js';
import { ResizeHandle } from '../internal/ResizeHandle.js';
import { containerWidth, useResizableWidth } from '../internal/useResizableWidth.js';
import { inSkeleton } from '../foundations/internal/inSkeleton.js';
import { skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import {
  destinationKey,
  DestinationItem,
  destinationSections,
  useNavigationMessages,
  type DestinationClasses,
  type NavigationDrawerDestination,
} from './internal/Destinations.js';
import { backgroundAttribute, type NavigationBackground } from './internal/background.js';
import type { ResizeDetails } from '../internal/resizeDetails.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/NavigationDrawer.css';

/** The part classes of the drawer's destinations: a row of icon, label and count. */
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
   * The level of the groups' headings, which assistive technology lists with the page's headings:
   * one below the heading the drawer sits under, such as 3 in a drawer under an h2.
   * @default 2
   */
  headingLevel?: Exclude<HeadingLevel, 1>;
  /**
   * The drawer's background, named as Surface's and Card's: default, the navigation's background,
   * the default surface color, as a plain rectangle; page, the page's background, so it sits on the
   * page. On a surface, such as a Sheet, both take the surface's color; a Sheet's is the
   * navigation's background, so it keeps its color in a narrow window. Set it on its own, such as
   * a NavigationDrawer with its background under a TopBar with page.
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

/**
 * Whether a one-line label or heading is cut short with an ellipsis, measured as it resizes; never
 * where labels wrap.
 */
function useCut(ref: RefObject<HTMLElement | null>, oneLine: boolean) {
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!oneLine || !element) {
      setCut(false);
      return;
    }
    const measure = () => setCut(element.scrollWidth > element.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, oneLine]);
  return cut;
}

/**
 * What every destination of a drawer reads: whether labels keep to one line, and the open sections.
 */
interface DrawerState {
  oneLine: boolean;
  expanded: ReadonlySet<string>;
  setExpanded: (key: string, open: boolean) => void;
}

/**
 * A destination's control, such as a link. In a resizable drawer, whose labels keep to one line, a
 * label cut short with an ellipsis shows in full in a tooltip beside the drawer, on hover and
 * keyboard focus. The tooltip stays in place while the label fits, so the item and its focus are
 * kept as the drawer is resized. `as` renders the item as another trigger, such as the button that
 * opens a section.
 */
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
    <DestinationItem classes={drawerClasses} destination={destination} labelRef={label} end={end} />
  );
  const item = as ? as(destinationItem) : destinationItem;
  return oneLine ? (
    <BaseTooltip.Root disabled={!cut}>
      <BaseTooltip.Trigger delay={tooltipDelay} render={item} />
      {cut && <TooltipPopup content={destination.label} side="inline-end" />}
    </BaseTooltip.Root>
  ) : (
    item
  );
}

/** A section's chevron, which points down, and up while the section is open. */
const chevron = (
  <span className="env-icon env-navigation-drawer-chevron" aria-hidden="true">
    <IconChevronRight />
  </span>
);

/**
 * A destination with destinations nested under it: a section that opens and closes, its nested
 * destinations in a list below it, indented. A destination with a target is its link or button,
 * with a button at its end that opens and closes the section; one without is only its heading, a
 * button that does. A closed section keeps its links in the page, hidden until found, so search
 * engines and the browser's find in page reach them; find in page opens it.
 */
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
        <DrawerControl
          destination={destination}
          oneLine={state.oneLine}
          end={chevron}
          as={(item) => <Collapsible.Trigger render={item} />}
        />
      ) : (
        <div className="env-navigation-drawer-branch-row">
          <DrawerControl destination={destination} oneLine={state.oneLine} />
          <Collapsible.Trigger
            className="env-navigation-drawer-toggle"
            aria-label={messages.contents({ label: destination.label })}
          >
            {chevron}
          </Collapsible.Trigger>
        </div>
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

/** One destination of the drawer, in its list: a row, or a section that opens and closes. */
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
      <DrawerControl destination={destination} oneLine={state.oneLine} />
    </li>
  );
}

/**
 * A group's heading and its destinations, a list of its own named by the heading. A heading cut
 * short in a resizable drawer gives its full text as its title, since a heading takes no focus for a
 * tooltip.
 */
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
  return (
    <Column render={<li />} className="env-navigation-drawer-section" align="stretch" gap={1}>
      <Heading
        ref={heading}
        className="env-navigation-drawer-group-label"
        id={headingId}
        title={cut ? group : undefined}
      >
        {group}
      </Heading>
      <Column render={<ul />} aria-labelledby={headingId} align="stretch" gap={1}>
        {items.map((destination) => (
          <DrawerItem key={destinationKey(destination)} destination={destination} state={state} />
        ))}
      </Column>
    </Column>
  );
}

/** The keys of the sections that hold the current destination, from the outermost in. */
function currentPath(destinations: readonly NavigationDrawerDestination[]): string[] {
  for (const destination of destinations) {
    const nested = destination.children;
    if (nested === undefined || nested.length === 0) continue;
    if (nested.some((child) => child.current === true)) return [destinationKey(destination)];
    const inner = currentPath(nested);
    if (inner.length > 0) return [destinationKey(destination), ...inner];
  }
  return [];
}

/** The keys of both lists, each once, in their order. */
const joined = (keys: readonly string[], more: readonly string[]) => [
  ...new Set([...keys, ...more]),
];

/**
 * The open sections: the application's, with `expanded` and onExpandedChange, or the drawer's own,
 * which start with `defaultExpanded`. The sections that hold the current destination open as it
 * becomes current: the drawer's own at once, and the application's through onExpandedChange.
 */
function useExpanded(
  destinations: readonly NavigationDrawerDestination[],
  expanded: readonly string[] | undefined,
  defaultExpanded: readonly string[],
  onExpandedChange: ((expanded: string[]) => void) | undefined,
): Pick<DrawerState, 'expanded' | 'setExpanded'> {
  const path = currentPath(destinations);
  // One string for the path, which changes only as the current destination moves.
  const pathKey = JSON.stringify(path);
  const [own, setOwn] = useState<readonly string[]>(() => joined(defaultExpanded, path));
  const [ownPath, setOwnPath] = useState(pathKey);
  const controlled = expanded !== undefined;
  if (!controlled && ownPath !== pathKey) {
    // A new current destination opens its sections in the same render, as on a page load.
    setOwnPath(pathKey);
    setOwn((open) => joined(open, path));
  }
  const shown = controlled ? expanded : own;
  // The latest open sections, so the effect below and setExpanded, one function across renders,
  // read them: a render that changes neither, such as one for each move of a resize, leaves the
  // destinations as they are.
  const latest = useLatest({ shown, controlled, onExpandedChange });
  useEffect(() => {
    if (!controlled) return;
    const { shown: open, onExpandedChange: change } = latest.current;
    const keys = JSON.parse(pathKey) as string[];
    if (keys.some((key) => !open.includes(key))) change?.(joined(open, keys));
  }, [latest, controlled, pathKey]);
  const set = useMemo(() => new Set(shown), [shown]);
  const setExpanded = useCallback(
    (key: string, open: boolean) => {
      const { shown: current, controlled: kept, onExpandedChange: change } = latest.current;
      const next = open ? joined(current, [key]) : current.filter((each) => each !== key);
      if (!kept) setOwn(next);
      change?.(next);
    },
    [latest],
  );
  return { expanded: set, setExpanded };
}

/** No open sections, the default of `defaultExpanded`, kept as one array across renders. */
const noKeys: readonly string[] = [];

/** The widest a resizable drawer can be, in rem: half its container's width. */
const roomFor = (handle: HTMLElement) => containerWidth(handle.parentElement ?? handle) / 2;

/**
 * The navigation drawer for expanded and larger windows: a column at the window's start with every
 * destination as a row of icon, label and count, under the headings of their groups, and nested
 * destinations in sections that open and close. A `nav` landmark; the current destination reports
 * aria-current="page", and every destination and section button is a tab stop. Its list scrolls where the drawer is shorter than its destinations. With `resizable`,
 * people resize it by its end edge.
 */
export function NavigationDrawer({
  destinations,
  expanded: expandedProp,
  defaultExpanded = noKeys,
  onExpandedChange,
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
}: NavigationDrawerProps) {
  const messages = useNavigationMessages();
  const { expanded, setExpanded } = useExpanded(
    destinations,
    expandedProp,
    defaultExpanded,
    onExpandedChange,
  );
  // The destinations render again only as they, the open sections or the heading level change, not
  // as the drawer's width does: a resize renders the drawer and its handle on each move, and a
  // long list of destinations, each with its tooltip, would make it lag.
  const list = useMemo(() => {
    const state: DrawerState = { oneLine: resizable, expanded, setExpanded };
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
  }, [destinations, resizable, expanded, setExpanded, headingLevel]);
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
      className={classNames('env-navigation-drawer', className)}
      style={
        resizable
          ? ({
              '--env-navigation-drawer-width': `${resize.width}rem`,
              '--env-navigation-drawer-min-width': `${resize.handleProps.min}rem`,
              '--env-navigation-drawer-max-width': `${resize.handleProps.max}rem`,
              ...style,
            } as CSSProperties)
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
          {header != null && (
            <Column className="env-navigation-drawer-header" gap={2}>
              {header}
            </Column>
          )}
          {list}
          {footer != null && (
            <Column className="env-navigation-drawer-footer" gap={2}>
              {footer}
            </Column>
          )}
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
