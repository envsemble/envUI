import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Button } from '../actions/Button.js';
import { Add } from '../icons/Add.js';
import { Groups3 } from '../icons/Groups3.js';
import { UnfoldMore } from '../icons/UnfoldMore.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Menu } from './Menu.js';

export interface OrganizationMenuOrganization {
  id: string;
  name: string;
  /** A short muted note after the name, such as the person's role in the organization. */
  detail?: string;
}

export interface OrganizationMenuProps {
  /** Organizations the signed-in person belongs to, in display order. */
  organizations: readonly OrganizationMenuOrganization[];
  /** The active organization, or null before one is chosen. */
  currentOrganizationId: string | null;
  /** Called with the chosen organization; the application switches and reports progress. */
  onSelect: (organizationId: string) => void;
  /** Offers creating an organization at the end of the menu, or as the only action without organizations. */
  onCreate?: () => void;
  /** Heading inside the menu. */
  heading?: string;
  /** Label of the create action. */
  createLabel?: string;
  /** Trigger text while no organization is active. */
  placeholder?: string;
  /** Prevents opening, for example while a switch is in progress. */
  disabled?: boolean;
  /** Accessible name of the menu. */
  'aria-label'?: string;
  className?: string;
}

/** Shows the active organization and switches between the person's organizations; fits AppShell's context area. */
export function OrganizationMenu({
  organizations,
  currentOrganizationId,
  onSelect,
  onCreate,
  heading = 'Organizations',
  createLabel = 'Create organization',
  placeholder = 'Choose organization',
  disabled,
  'aria-label': label = 'Organizations',
  className,
}: OrganizationMenuProps) {
  if (organizations.length === 0) {
    return onCreate ? (
      <Button
        variant="secondary"
        startIcon={<Add />}
        className={classNames('env-organization-trigger', className)}
        onClick={onCreate}
        disabled={disabled}
      >
        <span className="env-organization-trigger-label">{createLabel}</span>
      </Button>
    ) : null;
  }

  const current = organizations.find((organization) => organization.id === currentOrganizationId);
  return (
    <Menu
      aria-label={label}
      align="start"
      className="env-organization-menu"
      trigger={
        <Button
          variant="secondary"
          endIcon={<UnfoldMore />}
          className={classNames('env-organization-trigger', className)}
          disabled={disabled}
        >
          <span className="env-organization-trigger-label">{current?.name ?? placeholder}</span>
        </Button>
      }
    >
      <div role="presentation" className="env-organization-menu-header">
        <DecorativeIcon>
          <Groups3 />
        </DecorativeIcon>
        <span className="env-organization-menu-heading">{heading}</span>
      </div>
      <BaseMenu.RadioGroup
        className="env-organization-menu-options"
        value={current?.id ?? null}
        onValueChange={(organizationId: string) => {
          if (organizationId !== current?.id) onSelect(organizationId);
        }}
      >
        {organizations.map((organization) => (
          <BaseMenu.RadioItem
            key={organization.id}
            value={organization.id}
            closeOnClick
            className="env-menu-item env-organization-menu-option"
          >
            <span className="env-organization-menu-radio" aria-hidden="true">
              <BaseMenu.RadioItemIndicator className="env-organization-menu-radio-dot" />
            </span>
            <span className="env-menu-item-label">{organization.name}</span>
            {/* The space keeps the detail a separate word in the item's accessible name. */}
            {organization.detail && (
              <>
                {' '}
                <span className="env-organization-menu-detail">{organization.detail}</span>
              </>
            )}
          </BaseMenu.RadioItem>
        ))}
      </BaseMenu.RadioGroup>
      {onCreate && (
        <BaseMenu.Item className="env-organization-menu-create" onClick={onCreate}>
          <DecorativeIcon>
            <Add />
          </DecorativeIcon>
          {createLabel}
        </BaseMenu.Item>
      )}
    </Menu>
  );
}
