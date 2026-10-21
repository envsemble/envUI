'use client';

import { useId, type CSSProperties, type Ref } from 'react';
import { Button } from '../actions/Button.js';
import { Add } from '../icons/Add.js';
import { Groups3 } from '../icons/Groups3.js';
import { UnfoldMore } from '../icons/UnfoldMore.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Column } from '../foundations/Layout.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { organizationSwitcher } from '../foundations/messages/organizationSwitcher.js';
import * as Menu from './Menu.js';
import { OrganizationOptions } from './internal/OrganizationOptions.js';

export interface OrganizationSwitcherItem {
  /** Identifies the organization; it is the value onValueChange receives. */
  id: string;
  /** The organization's name, on the trigger while it is active and in the menu. */
  label: string;
  /**
   * A short muted note at the end of its row, such as the person's role in the organization; it
   * is read with the label.
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
  /**
   * Class of the menu popup, beside env-organization-switcher; ref and style go to the popup too.
   * Without organizations there is no popup.
   */
  className?: string;
  /** Class of the trigger button, or of the create button without organizations. */
  triggerClassName?: string;
  /** The menu popup's ref; the trigger is a Button of its own. */
  ref?: Ref<HTMLDivElement>;
  /** The menu popup's inline style. */
  style?: CSSProperties;
}

/** Shows the active organization and switches between the person's organizations; fits a top bar or the top of a navigation drawer. */
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
  triggerClassName,
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
        className={classNames('env-organization-switcher-trigger', triggerClassName)}
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
      className={classNames('env-organization-switcher', className)}
      ref={ref}
      style={style}
      trigger={
        <Button
          variant="secondary"
          endIcon={<UnfoldMore />}
          className={classNames('env-organization-switcher-trigger', triggerClassName)}
          disabled={disabled}
        >
          <span className="env-organization-switcher-trigger-label">
            {current?.label ?? placeholder ?? messages.placeholder}
          </span>
        </Button>
      }
    >
      <Column
        role="presentation"
        align="center"
        justify="center"
        gap={2}
        className="env-organization-switcher-header"
      >
        <DecorativeIcon>
          <Groups3 />
        </DecorativeIcon>
        <span className="env-organization-switcher-heading" id={headingId}>
          {heading ?? messages.heading}
        </span>
      </Column>
      <OrganizationOptions
        aria-labelledby={headingId}
        items={items}
        value={value}
        onValueChange={onValueChange}
        onCreate={onCreate}
        createLabel={createText}
      />
    </Menu.Root>
  );
}
