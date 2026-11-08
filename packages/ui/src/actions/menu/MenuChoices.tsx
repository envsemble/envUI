'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { IconCheck } from '../../icons/Check.js';
import { classNames } from '../../internal/classNames.js';
import { Grid } from '../../layout/Layout.js';
import { useMenuItemContent, type ItemContentProps } from './MenuItem.js';
import '../../styles/Base.css';
import '../../styles/Menu.css';

export interface GroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Small heading that names the group for assistive technology too. */
  label: ReactNode;
  /** Items of the group. */
  children: ReactNode;
}

/** A labelled group of related items, with a small heading above its rows. */
export function Group({ label, children, className, ...props }: GroupProps) {
  return (
    <BaseMenu.Group
      {...props}
      render={<Grid />}
      className={classNames('env-menu-group', className)}
    >
      <BaseMenu.GroupLabel className="env-menu-group-label">{label}</BaseMenu.GroupLabel>
      {children}
    </BaseMenu.Group>
  );
}

export interface RadioGroupProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange'
> {
  /** Value of the checked item, or null for none, for a group the application controls. */
  value?: string | null;
  /**
   * Value of the item an uncontrolled group starts with checked, or null for none.
   * @default null
   */
  defaultValue?: string | null;
  /** Called with the chosen item's value. */
  onValueChange?: (value: string) => void;
  /** Menu.RadioItem elements. */
  children: ReactNode;
  /** Optional heading; the group is then labelled like Menu.Group. */
  label?: ReactNode;
  /** Id of a heading elsewhere in the menu that names the group, in place of label. */
  'aria-labelledby'?: string;
}

/** One choice among several items; the checked item shows a check mark. */
export function RadioGroup({
  value,
  defaultValue = null,
  onValueChange,
  children,
  label,
  'aria-labelledby': labelledBy,
  className,
  ...props
}: RadioGroupProps) {
  return (
    <BaseMenu.RadioGroup
      {...props}
      render={<Grid />}
      aria-labelledby={labelledBy}
      className={classNames('env-menu-group', className)}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next: string) => onValueChange?.(next)}
    >
      {label != null && (
        <BaseMenu.GroupLabel className="env-menu-group-label">{label}</BaseMenu.GroupLabel>
      )}
      {children}
    </BaseMenu.RadioGroup>
  );
}

/** The check mark of a checked radio or checkbox item; the slot keeps labels aligned. */
function CheckIndicator({ kind }: { kind: 'radio' | 'checkbox' }) {
  const Indicator = kind === 'radio' ? BaseMenu.RadioItemIndicator : BaseMenu.CheckboxItemIndicator;
  return (
    <span className="env-menu-item-indicator-slot" aria-hidden="true">
      <Indicator className="env-icon env-menu-item-indicator">
        <IconCheck />
      </Indicator>
    </span>
  );
}

export interface RadioItemProps extends Omit<ItemContentProps, 'shortcut'> {
  /** The value the Menu.RadioGroup reports when this item is chosen. */
  value: string;
  /**
   * The item stays in place, dimmed, but cannot be chosen.
   * @default false
   */
  disabled?: boolean;
  /**
   * Close the menu after choosing.
   * @default true
   */
  closeOnClick?: boolean;
  /** Class of the item's row. */
  className?: string;
}

/** One option of a Menu.RadioGroup. */
export function RadioItem({
  value,
  disabled,
  closeOnClick = true,
  className,
  ...contentProps
}: RadioItemProps) {
  const { content, accessibility } = useMenuItemContent(
    contentProps,
    <CheckIndicator kind="radio" />,
  );
  return (
    <BaseMenu.RadioItem
      value={value}
      disabled={disabled}
      closeOnClick={closeOnClick}
      className={classNames('env-menu-item env-menu-choice', className)}
      {...accessibility}
    >
      {content}
    </BaseMenu.RadioItem>
  );
}

export interface CheckboxItemProps extends ItemContentProps {
  /** Whether the option is on, for an item the application controls; a check mark shows while it is. */
  checked?: boolean;
  /**
   * Whether an uncontrolled item starts on.
   * @default false
   */
  defaultChecked?: boolean;
  /** Called with the new state when the item is toggled. */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * The item stays in place, dimmed, but cannot be toggled.
   * @default false
   */
  disabled?: boolean;
  /** Close the menu after toggling; off by default, so several options can change. */
  closeOnClick?: boolean;
  /** Class of the item's row. */
  className?: string;
}

/** An independent on/off option; a check mark shows while it is on. */
export function CheckboxItem({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  closeOnClick = false,
  className,
  ...contentProps
}: CheckboxItemProps) {
  const { content, accessibility } = useMenuItemContent(
    contentProps,
    <CheckIndicator kind="checkbox" />,
  );
  return (
    <BaseMenu.CheckboxItem
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(next: boolean) => onCheckedChange?.(next)}
      disabled={disabled}
      closeOnClick={closeOnClick}
      className={classNames('env-menu-item env-menu-choice', className)}
      {...accessibility}
    >
      {content}
    </BaseMenu.CheckboxItem>
  );
}
