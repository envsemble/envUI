'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { TooltipNestingContext, TooltipPopup } from '../feedback/internal/TooltipPopup.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { NavigationIconState } from '../MaterialSymbolState.js';
import { ActionElement, type ActionElementProps } from '../internal/ActionElement.js';
import { useSidebarRail } from './internal/SidebarCompact.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { navList, type NavListMessages } from '../foundations/messages/navList.js';
import { CounterBadge, type CounterBadgeProps } from '../content/CounterBadge.js';
import { Skeleton as Placeholder } from '../feedback/Skeleton.js';

/**
 * Whether an item is one of a list's own items, which renders as its list item: true for the items
 * of NavList.Root and NavList.Group, also through the application's components, and false inside an
 * item and inside an element the application writes in the list, such as its own <li>.
 */
const ListContext = createContext(false);

/** A list's children, each element the application writes in it ending the list's items. */
function listItems(children: ReactNode) {
  return Children.map(children, (child) =>
    isValidElement(child) && typeof child.type === 'string' ? (
      <ListContext value={false}>{child}</ListContext>
    ) : (
      child
    ),
  );
}

interface ItemSharedProps {
  /**
   * The item is the current destination or view: it takes the navigation selection fill and label
   * color, fills its Material Symbol, and reports aria-current="page" unless aria-current is set.
   */
  selected?: boolean;
  /**
   * The destination is unavailable: dimmed, and left out of the tab order. A disabled button cannot
   * be pressed; a disabled link has no destination and reports aria-disabled. An icon-only item
   * still shows its label on hover.
   */
  disabled?: boolean;
  /**
   * A decorative icon before the label, such as one of envUI's Material Symbols, which shows
   * filled while the item is selected and outlined otherwise, also inside a wrapper. Required with
   * iconOnly.
   */
  icon?: ReactNode;
  /**
   * The icon shown while the item is selected, for a custom icon without a filled form; Material
   * Symbols need none.
   */
  selectedIcon?: ReactNode;
  /**
   * Content at the end of the item, such as a CounterBadge or a Badge; it is part of the item's
   * accessible name. An icon-only item shows a small accent dot instead. Where the name comes from
   * aria-label, or from the label of an icon-only item, it adds the content: a number, or a
   * CounterBadge without aria-label, as a count from EnvUIProvider's messages.navList.itemCount,
   * such as Inbox, 3 new; a CounterBadge's aria-label, such as Inbox, 4 unread, or other content's
   * text or aria-label, such as Labs, Beta, as it is, through messages.navList.itemEnd.
   */
  end?: ReactNode;
}

/**
 * The text of end content for an item's name: its text, or an element's aria-label, or a
 * CounterBadge's value.
 */
function endText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(endText).filter(Boolean).join(' ');
  if (isValidElement(node)) {
    const props = node.props as { value?: unknown; children?: ReactNode; 'aria-label'?: unknown };
    if (typeof props['aria-label'] === 'string') return props['aria-label'];
    if (typeof props.value === 'string' || typeof props.value === 'number')
      return String(props.value);
    return endText(props.children);
  }
  return '';
}

/**
 * The name of an item named by its label alone, with its end content: a count, from a number or a
 * CounterBadge without aria-label, takes messages.navList.itemCount, such as Inbox, 3 new; a
 * CounterBadge's aria-label, or any other content's text, follows the label as it is, such as
 * Inbox, 4 unread or Labs, Beta.
 */
function nameWithEnd(label: string, end: ReactNode, messages: NavListMessages): string {
  const parts = Children.toArray(end);
  const only = parts.length === 1 ? parts[0] : undefined;
  if (typeof only === 'number') return messages.itemCount({ label, count: String(only) });
  if (isValidElement(only) && only.type === CounterBadge) {
    const { value, 'aria-label': badgeLabel } = only.props as CounterBadgeProps;
    return badgeLabel !== undefined && badgeLabel !== ''
      ? messages.itemEnd({ label, end: badgeLabel })
      : messages.itemCount({ label, count: String(value) });
  }
  const text = endText(end).trim();
  return text === '' ? label : messages.itemEnd({ label, end: text });
}

export type ItemProps = ItemSharedProps &
  ActionElementProps &
  (
    | { iconOnly?: false }
    | {
        /**
         * Show only the icon, in a circle as tall as the item, as in a collapsed sidebar; a tooltip
         * at the item's inline end shows aria-label on hover and keyboard focus. In a
         * sidebar rail, items with an icon show only it without this prop.
         */
        iconOnly: boolean;
        icon: ReactNode;
        /**
         * The destination's name, such as Inbox, for an icon-only item; the tooltip shows it. The
         * item's name adds its end content, such as a count.
         */
        'aria-label': string;
      }
  );

/**
 * A navigation destination: a native link with href, through the LinkProvider's link component,
 * or a button that changes the view. It shows an optional icon, its label and end content,
 * marks the current destination with selected, and shows only its icon with iconOnly or in a
 * sidebar rail. Inside NavList.Root or NavList.Group it renders its own list item.
 */
function Item(props: ItemProps) {
  const inRail = useSidebarRail();
  const inList = useContext(ListContext);
  const messages = useMessages('navList', navList);
  const {
    selected = false,
    disabled = false,
    iconOnly: requestedIconOnly = false,
    icon,
    selectedIcon,
    end,
    className,
    children,
    ...nativeProps
  } = props;
  // In a sidebar rail, items with an icon show only the icon.
  const iconOnly = requestedIconOnly || (inRail && icon != null);
  const accessibleLabel =
    props['aria-label'] ?? (iconOnly && typeof children === 'string' ? children : undefined);
  // An icon-only item shows its end content as a dot, so a name it takes from its label, which
  // leaves the end content out, says it; so does a labelled item named by aria-label.
  const itemName =
    accessibleLabel !== undefined && end != null
      ? nameWithEnd(accessibleLabel, end, messages)
      : accessibleLabel;
  const iconContent = selected && selectedIcon != null ? selectedIcon : icon;
  const content = (
    <>
      {iconContent != null && (
        <NavigationIconState selected={selected}>
          <DecorativeIcon>{iconContent}</DecorativeIcon>
        </NavigationIconState>
      )}
      {!iconOnly && children}
      {end != null &&
        (iconOnly ? (
          <span className="env-nav-list-item-dot" aria-hidden="true" />
        ) : (
          <span className="env-nav-list-item-end">{end}</span>
        ))}
    </>
  );

  // An icon-only item shows its label in a tooltip at its inline end, unless the application
  // already describes it with its own Tooltip. The tooltip root stays in place while the item
  // changes between icon-only and labelled, so the element and its focus are kept.
  const nestedInTooltip = useContext(TooltipNestingContext);
  const tooltip = iconOnly && !nestedInTooltip ? accessibleLabel : undefined;
  // A disabled control receives no pointer events, so a wrapper carries the hover for its tooltip.
  // It takes no focus, as the disabled item takes none.
  const hoverWrapper = tooltip !== undefined && disabled;
  const item = (
    <ActionElement
      {...nativeProps}
      disabled={disabled}
      className={classNames('env-nav-list-item', className)}
      data-icon-only={iconOnly ? '' : undefined}
      data-selected={selected ? '' : undefined}
      aria-label={itemName}
      aria-current={props['aria-current'] ?? (selected ? 'page' : undefined)}
    >
      {content}
    </ActionElement>
  );
  const control = (
    <BaseTooltip.Root disabled={tooltip === undefined}>
      <BaseTooltip.Trigger
        delay={400}
        render={hoverWrapper ? <span className="env-tooltip-disabled-target" /> : item}
      >
        {hoverWrapper ? item : undefined}
      </BaseTooltip.Trigger>
      {tooltip !== undefined && <TooltipPopup content={tooltip} side="inline-end" />}
    </BaseTooltip.Root>
  );
  // An item inside this one, as in its end content, is no item of the list.
  return inList ? (
    <li>
      <ListContext value={false}>{control}</ListContext>
    </li>
  ) : (
    control
  );
}

export type RootProps = ComponentPropsWithRef<'ul'>;

/**
 * A plain list of navigation items and groups, for a sidebar or anywhere else. It adds no landmark
 * of its own: place it in a nav element, or in a region that is one, such as a Sidebar.Root.
 * Name it with aria-label or aria-labelledby when the page has more than one.
 */
function Root({ className, children, ...props }: RootProps) {
  return (
    <ul {...props} className={classNames('env-nav-list', className)}>
      <ListContext value>{listItems(children)}</ListContext>
    </ul>
  );
}

export interface GroupProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
  /**
   * The group's visible heading, such as Settings, in small muted text above its items; it also
   * names the group's list for assistive technology.
   */
  label: ReactNode;
  /** The group's NavList.Item elements, each of which renders its own list item. */
  children: ReactNode;
}

/** Related items under a small heading, as an item of NavList.Root with a list of its own. */
function Group({ label, children, className, ...props }: GroupProps) {
  const labelId = useId();
  // In a sidebar rail the label is visually hidden, as the rail's group headings are; it still
  // names the group's list.
  const inRail = useSidebarRail();
  return (
    <li {...props} className={classNames('env-nav-list-group', className)}>
      <span className="env-nav-list-group-label" id={labelId} data-rail={inRail ? '' : undefined}>
        {label}
      </span>
      <ul className="env-nav-list-group-list" aria-labelledby={labelId}>
        <ListContext value>{listItems(children)}</ListContext>
      </ul>
    </li>
  );
}

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'ul'>, 'children'> {
  /**
   * How many placeholder items it shows.
   * @default 3
   */
  items?: number;
}

/**
 * Placeholders in the shape of a NavList.Root's items while the navigation loads, such as in a
 * sidebar before the account's data arrives: an icon and a label each, at the items' height, and
 * only the icon in a sidebar rail. Hidden from assistive technology; put the frame in a
 * LoadingState, which names what loads.
 */
function Skeleton({ items = 3, className, ...props }: SkeletonProps) {
  const inRail = useSidebarRail();
  return (
    <ul
      aria-hidden="true"
      {...props}
      className={classNames('env-nav-list', 'env-nav-list-skeleton', className)}
    >
      {Array.from({ length: items }, (_, index) => (
        <li key={index}>
          <span className="env-nav-list-skeleton-item" data-icon-only={inRail ? '' : undefined}>
            <Placeholder
              width="var(--env-control-icon-size)"
              height="var(--env-control-icon-size)"
            />
            {!inRail && (
              <Placeholder width={`${4.25 + ((index * 1.5) % 2.5)}rem`} height="0.75rem" />
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'NavList.Root');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'NavList.Item');
const GroupPart = /* @__PURE__ */ withDisplayName(Group, 'NavList.Group');
const SkeletonPart = /* @__PURE__ */ withDisplayName(Skeleton, 'NavList.Skeleton');
export { RootPart as Root, ItemPart as Item, GroupPart as Group, SkeletonPart as Skeleton };
