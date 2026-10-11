import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { useLinkComponent } from './LinkProvider.js';

export interface MenuProps {
  /** The control that opens the menu; it receives the menu button semantics and ref. */
  trigger: ReactElement;
  /** Accessible name of the menu. */
  'aria-label': string;
  /** MenuHeader, MenuItem and MenuSeparator elements. */
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** A list of actions and destinations that opens from a trigger; keyboard and focus follow the menu pattern. */
export function Menu({
  trigger,
  'aria-label': label,
  children,
  side = 'bottom',
  align = 'end',
  open,
  defaultOpen,
  onOpenChange,
  className,
}: MenuProps) {
  const theme = useTheme();
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <Theme theme={theme} className="env-menu-theme">
          <BaseMenu.Positioner
            side={side}
            align={align}
            sideOffset={8}
            className="env-menu-positioner"
          >
            <BaseMenu.Popup
              className={classNames('env-menu', className)}
              // Base UI names the menu after its trigger; the menu's own label replaces that name.
              render={(props) => <div {...props} aria-labelledby={undefined} aria-label={label} />}
            >
              {children}
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </Theme>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export interface MenuHeaderProps extends ComponentPropsWithRef<'div'> {
  children: ReactNode;
}

/** Non-interactive context at the top of a menu, such as the signed-in account. */
export function MenuHeader({ className, ...props }: MenuHeaderProps) {
  return (
    <div role="presentation" {...props} className={classNames('env-menu-header', className)} />
  );
}

interface MenuItemSharedProps {
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export type MenuItemProps = MenuItemSharedProps &
  (
    | { href: string; onClick?: never; target?: string; rel?: string }
    | { href?: undefined; onClick?: () => void; target?: never; rel?: never }
  );

/** One action (onClick) or destination (href) in a Menu. Destinations use the LinkProvider's link. */
export function MenuItem({ icon, children, disabled, className, ...props }: MenuItemProps) {
  const LinkComponent = useLinkComponent();
  const content = (
    <>
      {icon != null && <DecorativeIcon>{icon}</DecorativeIcon>}
      <span className="env-menu-item-label">{children}</span>
    </>
  );
  const itemClassName = classNames('env-menu-item', className);
  if (props.href !== undefined) {
    return (
      <BaseMenu.LinkItem
        className={itemClassName}
        render={<LinkComponent href={props.href} target={props.target} rel={props.rel} />}
        aria-disabled={disabled || undefined}
      >
        {content}
      </BaseMenu.LinkItem>
    );
  }
  return (
    <BaseMenu.Item className={itemClassName} disabled={disabled} onClick={props.onClick}>
      {content}
    </BaseMenu.Item>
  );
}

/** Separates groups of menu items. */
export function MenuSeparator() {
  return <BaseMenu.Separator className="env-menu-separator" />;
}
