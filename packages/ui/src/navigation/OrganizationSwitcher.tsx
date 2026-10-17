'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useId, type CSSProperties, type Ref } from 'react';
import { Button } from '../actions/Button.js';
import { Add } from '../icons/Add.js';
import { Groups3 } from '../icons/Groups3.js';
import { UnfoldMore } from '../icons/UnfoldMore.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { organizationSwitcher } from '../foundations/messages/organizationSwitcher.js';
import * as Menu from './Menu.js';

export interface OrganizationSwitcherItem {
  /** Identifies the organization; it is the value onValueChange receives. */
  id: string;
  /** The organization's name, on the trigger while it is active and in the menu. */
  name: string;
  /**
   * A short muted note at the end of its row, such as the person's role in the organization; it
   * is read with the name.
   */
  description?: string;
}

export interface OrganizationSwitcherProps {
  /** Organizations the signed-in person belongs to, in display order. */
  items: readonly OrganizationSwitcherItem[];
  /** The active organization's id, or null before one is chosen. */
  value: string | null;
  /**
   * Called with the id of the organization chosen, unless it is the active one; the application
   * switches and reports progress.
   */
  onValueChange: (value: string) => void;
  /** Offers creating an organization at the end of the menu, or as the only action without organizations. */
  onCreate?: () => void;
  /**
   * Heading inside the menu.
   * @default 'Organizations', or EnvUIProvider's messages.organizationSwitcher.heading
   */
  heading?: string;
  /**
   * Label of the create action.
   * @default 'Create organization', or EnvUIProvider's messages.organizationSwitcher.create
   */
  createLabel?: string;
  /**
   * Trigger text while no organization is active.
   * @default 'Choose organization', or EnvUIProvider's messages.organizationSwitcher.placeholder
   */
  placeholder?: string;
  /**
   * Prevents opening, for example while a switch is in progress.
   * @default false
   */
  disabled?: boolean;
  /**
   * Accessible name of the menu.
   * @default 'Organizations', or EnvUIProvider's messages.organizationSwitcher.label
   */
  'aria-label'?: string;
  /** Class of the trigger button, or of the create button without organizations. */
  className?: string;
  /** The menu popup's ref; the trigger is a Button of its own. */
  ref?: Ref<HTMLDivElement>;
  /** The menu popup's inline style. */
  style?: CSSProperties;
}

/** Shows the active organization and switches between the person's organizations; fits AppShell's context area. */
export function OrganizationSwitcher({
  items,
  value,
  onValueChange,
  onCreate,
  heading,
  createLabel,
  placeholder,
  disabled,
  'aria-label': label,
  className,
  ref,
  style,
}: OrganizationSwitcherProps) {
  const messages = useMessages('organizationSwitcher', organizationSwitcher);
  const headingId = useId();
  const createText = createLabel ?? messages.create;
  if (items.length === 0) {
    return onCreate ? (
      <Button
        variant="secondary"
        startIcon={<Add />}
        className={classNames('env-organization-switcher-trigger', className)}
        onClick={onCreate}
        disabled={disabled}
      >
        <span className="env-organization-switcher-trigger-label">{createText}</span>
      </Button>
    ) : null;
  }

  const current = items.find((item) => item.id === value);
  return (
    <Menu.Root
      aria-label={label ?? messages.label}
      align="start"
      className="env-organization-switcher"
      ref={ref}
      style={style}
      trigger={
        <Button
          variant="secondary"
          endIcon={<UnfoldMore />}
          className={classNames('env-organization-switcher-trigger', className)}
          disabled={disabled}
        >
          <span className="env-organization-switcher-trigger-label">
            {current?.name ?? placeholder ?? messages.placeholder}
          </span>
        </Button>
      }
    >
      <div role="presentation" className="env-organization-switcher-header">
        <DecorativeIcon>
          <Groups3 />
        </DecorativeIcon>
        <span className="env-organization-switcher-heading" id={headingId}>
          {heading ?? messages.heading}
        </span>
      </div>
      <Menu.RadioGroup
        aria-labelledby={headingId}
        className="env-organization-switcher-options"
        value={current?.id ?? null}
        onValueChange={(next) => {
          if (next !== current?.id) onValueChange(next);
        }}
      >
        {items.map((item) => (
          <Menu.RadioItem
            key={item.id}
            value={item.id}
            className="env-organization-switcher-option"
            end={
              item.description ? (
                <span className="env-organization-switcher-description">{item.description}</span>
              ) : undefined
            }
          >
            {item.name}
          </Menu.RadioItem>
        ))}
      </Menu.RadioGroup>
      {onCreate && (
        <BaseMenu.Item className="env-organization-switcher-create" onClick={onCreate}>
          <DecorativeIcon>
            <Add />
          </DecorativeIcon>
          {createText}
        </BaseMenu.Item>
      )}
    </Menu.Root>
  );
}
