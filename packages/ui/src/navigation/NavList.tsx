import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  createContext,
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

/** Inside NavList.Root or NavList.Group, an item renders as a list item. */
const ListContext = createContext(false);

interface ItemSharedProps {
  size?: 'standard' | 'compact';
  selected?: boolean;
  disabled?: boolean;
  /** Official Material Symbols automatically follow the selected state. */
  icon?: ReactNode;
  /** Optional alternate content for custom icons when selected. */
  selectedIcon?: ReactNode;
  /** End content, such as a CounterBadge; icon-only items show a small dot instead. */
  trailing?: ReactNode;
}

export type ItemProps = ItemSharedProps &
  ActionElementProps &
  (
    | { iconOnly?: false }
    | {
        /** Hide the visible label, as in a compact sidebar; a tooltip shows it on hover and focus. */
        iconOnly: boolean;
        icon: ReactNode;
        'aria-label': string;
      }
  );

/** A navigation destination: a link with href, or a button that changes the view. */
function Item(props: ItemProps) {
  const sidebarCompact = useSidebarCompact();
  const inList = useContext(ListContext);
  const {
    selected = false,
    size = 'standard',
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
    size === 'compact' && 'env-nav-list-item-compact',
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
  return inList ? <li>{control}</li> : control;
}

export type RootProps = ComponentPropsWithRef<'ul'>;

/**
 * A plain list of navigation items and groups, for a sidebar or anywhere else. Name it with
 * aria-label or aria-labelledby when the page has more than one; it adds no landmark of its own.
 */
function Root({ className, children, ...props }: RootProps) {
  return (
    <ul {...props} className={classNames('env-nav-list', className)}>
      <ListContext value>{children}</ListContext>
    </ul>
  );
}

export interface GroupProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
  /** The group's visible heading, which also names its list. */
  label: ReactNode;
  /** The group's NavList.Item elements. */
  children: ReactNode;
}

/** Related items under a small heading, inside NavList.Root. */
function Group({ label, children, className, ...props }: GroupProps) {
  const labelId = useId();
  return (
    <li {...props} className={classNames('env-nav-list-group', className)}>
      <span className="env-nav-list-group-label" id={labelId}>
        {label}
      </span>
      <ul className="env-nav-list-group-list" aria-labelledby={labelId}>
        <ListContext value>{children}</ListContext>
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
