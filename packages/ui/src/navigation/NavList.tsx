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
import { useSidebarCompact } from './internal/SidebarCompact.js';
import { withDisplayName } from '../internal/withDisplayName.js';

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
   * accessible name. An icon-only item shows a small accent dot instead, hidden from assistive
   * technology, so say what the content says in its aria-label.
   */
  trailing?: ReactNode;
}

export type ItemProps = ItemSharedProps &
  ActionElementProps &
  (
    | { iconOnly?: false }
    | {
        /**
         * Show only the icon, in a circle as tall as the item, as in a collapsed sidebar; a tooltip
         * at the item's inline end shows aria-label on hover and keyboard focus. Inside a compact
         * AppShell sidebar, items with an icon show only it without this prop.
         */
        iconOnly: boolean;
        icon: ReactNode;
        /** The destination's name, such as Inbox, for an icon-only item; the tooltip shows it. */
        'aria-label': string;
      }
  );

/**
 * A navigation destination: a native link with href, through the LinkProvider's link component,
 * or a button that changes the view. It shows an optional icon, its label and trailing content,
 * marks the current destination with selected, and shows only its icon with iconOnly or inside a
 * compact AppShell sidebar. Inside NavList.Root or NavList.Group it renders its own list item.
 */
function Item(props: ItemProps) {
  const sidebarCompact = useSidebarCompact();
  const inList = useContext(ListContext);
  const {
    selected = false,

    disabled = false,
    iconOnly: requestedIconOnly = false,
    icon,
    selectedIcon,
    trailing,
    className,
    children,
    ...nativeProps
  } = props;
  // Inside a compact AppShell sidebar, items with an icon show only the icon.
  const iconOnly = requestedIconOnly || (sidebarCompact && icon != null);
  const accessibleLabel =
    props['aria-label'] ?? (iconOnly && typeof children === 'string' ? children : undefined);
  const iconContent = selected && selectedIcon != null ? selectedIcon : icon;
  const content = (
    <>
      {iconContent != null && (
        <NavigationIconState selected={selected}>
          <DecorativeIcon>{iconContent}</DecorativeIcon>
        </NavigationIconState>
      )}
      {!iconOnly && children}
      {trailing != null &&
        (iconOnly ? (
          <span className="env-nav-list-item-dot" aria-hidden="true" />
        ) : (
          <span className="env-nav-list-item-trailing">{trailing}</span>
        ))}
    </>
  );
  const navigationClassName = classNames(
    'env-nav-list-item',
    iconOnly && 'env-nav-list-item-icon-only',
    selected && 'env-nav-list-item-selected',

    className,
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
      className={navigationClassName}
      aria-label={accessibleLabel}
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
  // An item inside this one, as in its trailing content, is no item of the list.
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
 * of its own: place it in a nav element, or in a region that is one, such as AppShell's sidebar.
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
  return (
    <li {...props} className={classNames('env-nav-list-group', className)}>
      <span className="env-nav-list-group-label" id={labelId}>
        {label}
      </span>
      <ul className="env-nav-list-group-list" aria-labelledby={labelId}>
        <ListContext value>{listItems(children)}</ListContext>
      </ul>
    </li>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'NavList.Root');
const ItemPart = /* @__PURE__ */ withDisplayName(Item, 'NavList.Item');
const GroupPart = /* @__PURE__ */ withDisplayName(Group, 'NavList.Group');
export { RootPart as Root, ItemPart as Item, GroupPart as Group };
