import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { useContext, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { TooltipNestingContext, TooltipPopup } from '../feedback/internal/TooltipPopup.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { NavigationIconState } from '../MaterialSymbolState.js';
import { ActionElement, type ActionElementProps } from '../internal/ActionElement.js';
import { useSidebarCompact } from './AppShell.js';

interface NavigationItemSharedProps {
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

export type NavigationItemProps = NavigationItemSharedProps &
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

export function NavigationItem(props: NavigationItemProps) {
  const sidebarCompact = useSidebarCompact();
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
          <span className="env-navigation-dot" aria-hidden="true" />
        ) : (
          <span className="env-navigation-trailing">{trailing}</span>
        ))}
    </>
  );
  const navigationClassName = classNames(
    'env-navigation-item',
    iconOnly && 'env-navigation-icon-only',
    selected && 'env-navigation-selected',
    size === 'compact' && 'env-navigation-compact',
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
  return (
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
}
