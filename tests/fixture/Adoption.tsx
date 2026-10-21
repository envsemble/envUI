import { useState } from 'react';
import {
  AnimatedNumber,
  Avatar,
  AvatarButton,
  Button,
  ConfirmButton,
  Dialog,
  EmptyState,
  List,
  TextField,
  LinkProvider,
  Menu,
  Meter,
  OrganizationSwitcher,
  SearchField,
  Spinner,
  Theme,
  ThemePreferenceProvider,
  ThemeToggle,
  createThemeBootstrapScript,
  Tooltip,
  type LinkComponentProps,
} from '@envsemble/envui';
import { Logout } from '@envsemble/envui/icons/Logout';
import { Delete } from '@envsemble/envui/icons/Delete';

/** Stands in for a router link: it records client navigation instead of loading a page. */
function RecordingLink({ href, onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
      href={href}
      data-router-link=""
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        document.body.dataset.navigatedTo = href;
      }}
    />
  );
}

/** Components added for application adoption, mounted with ?fixture=adoption. */
export function AdoptionFixture() {
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [action, setAction] = useState('');
  const [organizationId, setOrganizationId] = useState('northwind');
  const [presses, setPresses] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [homes, setHomes] = useState(3);
  const [seatsFull, setSeatsFull] = useState(false);
  return (
    <ThemePreferenceProvider storageKey="fixture-theme" className="fixture-adoption">
      <LinkProvider component={RecordingLink}>
        <section>
          <div data-testid="adoption-plain-text">Plain application text</div>
          <p data-testid="adoption-paragraph">An application paragraph</p>
          <Theme theme="light" data-testid="adoption-nested-theme">
            A themed part of the page
          </Theme>
          <ThemeToggle data-testid="theme-toggle" />
          <Button href="/projects" data-testid="router-button">
            Projects
          </Button>
          <Button href="/archived" disabled data-testid="disabled-link">
            Archived
          </Button>
          <SearchField
            label="Search members"
            placeholder="Search by name"
            value={query}
            onValueChange={setQuery}
            data-testid="search"
          />
          <Button onClick={() => setDialogOpen(true)}>Open pending dialog</Button>
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Save project"
            closeLabel="Cancel"
            pending={pending}
            actions={<Button onClick={() => setPending((value) => !value)}>Toggle pending</Button>}
          >
            <SearchField label="Search inside dialog" defaultValue="draft" />
          </Dialog>
          <Menu.Root
            aria-label="Account"
            trigger={
              <AvatarButton
                name="Alex Morgan"
                description="alex@example.com"
                aria-label="Open account menu"
              />
            }
          >
            <Menu.Header>Alex Morgan</Menu.Header>
            <Menu.Item href="/account" onClick={() => setAction('Followed account settings')}>
              Account settings
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item icon={<Logout />} onClick={() => setAction('Signed out')}>
              Sign out
            </Menu.Item>
          </Menu.Root>
          <output data-testid="menu-action">{action}</output>
          <OrganizationSwitcher
            items={[
              { id: 'northwind', label: 'Northwind Labs', description: 'Admin' },
              { id: 'contoso', label: 'Contoso', description: 'Member' },
            ]}
            value={organizationId}
            onValueChange={(id) => {
              setOrganizationId(id);
              setAction(`Selected ${id}`);
            }}
            onCreate={() => setAction('Create organization')}
          />
          <div data-testid="no-organization">
            <OrganizationSwitcher
              items={[]}
              value={null}
              onValueChange={() => undefined}
              onCreate={() => setAction('Create first organization')}
            />
          </div>
          <div className="fixture-toolbar" data-testid="compact-label-toolbar">
            <TextField showLabel label="Project filter" data-testid="compact-label" />
            <Button>Apply</Button>
          </div>
          <Button
            pending
            data-testid="pending-button"
            onClick={() => setPresses((count) => count + 1)}
          >
            Save changes
          </Button>
          <output data-testid="pending-presses">{presses}</output>
          <Spinner label="Refreshing seats" />
          <ConfirmButton
            confirmLabel="Remove Morgan?"
            armedDuration={800}
            onConfirm={() => setConfirmed((count) => count + 1)}
            data-testid="confirm-button"
          >
            Remove
          </ConfirmButton>
          <ConfirmButton
            icon={<Delete />}
            aria-label="Remove Morgan"
            confirmLabel="Remove Morgan?"
            armedDuration={800}
            onConfirm={() => setConfirmed((count) => count + 1)}
            data-testid="confirm-icon-button"
          />
          <output data-testid="confirmed">{confirmed}</output>
          <Button onClick={() => setHomes((count) => count + 1)}>More homes</Button>
          <Button onClick={() => setHomes((count) => count - 1)}>Fewer homes</Button>
          <Button>
            Show <AnimatedNumber value={homes} data-testid="animated-number" /> homes
          </Button>
          <output hidden data-testid="bootstrap-script">
            {createThemeBootstrapScript({ storageKey: 'bootstrap-theme' })}
          </output>
          <output hidden data-testid="bootstrap-contrast-script">
            {createThemeBootstrapScript({ storageKey: 'bootstrap-theme', contrast: 'high' })}
          </output>
          <Tooltip content="All seats are assigned">
            <Button disabled>Assign seat</Button>
          </Tooltip>
          <Tooltip content={seatsFull ? 'No seats left' : 'Invite a member'}>
            <Button disabled={seatsFull}>Invite member</Button>
          </Tooltip>
          <Button onClick={() => setSeatsFull((value) => !value)}>Toggle seats</Button>
          <List.Root>
            <List.Item
              label="Seat"
              data-testid="secondary-row"
              action={<Button variant="secondary">Remove</Button>}
            />
          </List.Root>
          <EmptyState tone="danger" title="Products couldn’t load" description="Try again." />
          <EmptyState headingLevel={1} title="Nothing here yet" />
          <Meter label="Seats assigned" value={7} max={5} valueText="5 of 5" />
          <Avatar name="Broken Picture" src="data:image/png;base64,invalid" named />
          <Avatar name="Organization Name" fallback="initials" named />
        </section>
      </LinkProvider>
    </ThemePreferenceProvider>
  );
}
