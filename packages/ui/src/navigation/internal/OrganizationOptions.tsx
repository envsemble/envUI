'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Add } from '../../icons/Add.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';
import * as Menu from '../Menu.js';

/** One organization in OrganizationSwitcher's menu or AccountMenu's organization submenu. */
export interface OrganizationOption {
  id: string;
  name: string;
  description?: string;
}

/**
 * The organization rows OrganizationSwitcher and AccountMenu.OrganizationSubmenu share: one radio
 * item per organization, with its description at the end, and the create action after them.
 */
export function OrganizationOptions({
  items,
  value,
  onValueChange,
  onCreate,
  createLabel,
  'aria-labelledby': labelledBy,
}: {
  items: readonly OrganizationOption[];
  value: string | null;
  onValueChange: (value: string) => void;
  onCreate?: () => void;
  createLabel: string;
  'aria-labelledby'?: string;
}) {
  const current = items.find((item) => item.id === value);
  return (
    <>
      <Menu.RadioGroup
        aria-labelledby={labelledBy}
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
          {createLabel}
        </BaseMenu.Item>
      )}
    </>
  );
}
