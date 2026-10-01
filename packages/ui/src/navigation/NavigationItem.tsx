import type { ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { NavigationIconState } from '../MaterialSymbolState.js';
import { ActionElement, type ActionElementProps } from '../actions/ActionElement.js';

interface NavigationItemSharedProps {
  size?: 'standard' | 'compact';
  selected?: boolean;
  disabled?: boolean;
  /** Official Material Symbols automatically follow the selected state. */
  icon?: ReactNode;
  /** Optional alternate content for custom icons when selected. */
  selectedIcon?: ReactNode;
}

export type NavigationItemProps = NavigationItemSharedProps & ActionElementProps;

export function NavigationItem(props: NavigationItemProps) {
  const {
    selected = false,
    size = 'standard',
    disabled = false,
    icon,
    selectedIcon,
    className,
    children,
    ...nativeProps
  } = props;
  const iconContent = selected && selectedIcon != null ? selectedIcon : icon;
  const content = (
    <>
      {iconContent != null && (
        <NavigationIconState selected={selected}>
          <DecorativeIcon>{iconContent}</DecorativeIcon>
        </NavigationIconState>
      )}
      {children}
    </>
  );
  const navigationClassName = classNames(
    'env-navigation-item',
    selected && 'env-navigation-selected',
    size === 'compact' && 'env-navigation-compact',
    className,
  );

  return (
    <ActionElement
      {...nativeProps}
      disabled={disabled}
      className={navigationClassName}
      aria-current={props['aria-current'] ?? (selected ? 'page' : undefined)}
    >
      {content}
    </ActionElement>
  );
}
