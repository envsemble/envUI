import type { ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
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
}

export type NavigationItemProps = NavigationItemSharedProps &
  ActionElementProps &
  (
    | { iconOnly?: false }
    | {
        /** Hide the visible label when a sidebar is collapsed. */
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
    </>
  );
  const navigationClassName = classNames(
    'env-navigation-item',
    iconOnly && 'env-navigation-icon-only',
    selected && 'env-navigation-selected',
    size === 'compact' && 'env-navigation-compact',
    className,
  );

  return (
    <ActionElement
      {...nativeProps}
      disabled={disabled}
      className={navigationClassName}
      aria-label={accessibleLabel}
      title={iconOnly ? (nativeProps.title ?? accessibleLabel) : nativeProps.title}
      aria-current={props['aria-current'] ?? (selected ? 'page' : undefined)}
    >
      {content}
    </ActionElement>
  );
}
