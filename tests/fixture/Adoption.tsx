import { useState } from 'react';
import {
  AnimatedNumber,
  AppShell,
  Avatar,
  AvatarButton,
  Button,
  ConfirmButton,
  Dialog,
  EmptyState,
  GroupedRows,
  Input,
  Row,
  LinkProvider,
  LoadingBar,
  Menu,
  MenuHeader,
  MenuItem,
  MenuSeparator,
  Meter,
  NavigationItem,
  OrganizationMenu,
  SearchField,
  Skeleton,
  Spinner,
  ThemePreferenceProvider,
  ThemeToggle,
  createThemeBootstrapScript,
  Tooltip,
  type LinkComponentProps,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Category } from '@envsemble/envui/icons/Category';
import { Logout } from '@envsemble/envui/icons/Logout';

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
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(0);
  const [homes, setHomes] = useState(3);
  return (
    <ThemePreferenceProvider storageKey="fixture-theme" className="fixture-adoption">
      <LinkProvider component={RecordingLink}>
        <section>
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
          <Menu
            aria-label="Account"
            trigger={
              <AvatarButton
                name="Alex Morgan"
                detail="alex@example.com"
                aria-label="Open account menu"
              />
            }
          >
            <MenuHeader>Alex Morgan</MenuHeader>
            <MenuItem href="/account">Account settings</MenuItem>
            <MenuSeparator />
            <MenuItem icon={<Logout />} onClick={() => setAction('Signed out')}>
              Sign out
            </MenuItem>
          </Menu>
          <output data-testid="menu-action">{action}</output>
          <OrganizationMenu
            organizations={[
              { id: 'northwind', name: 'Northwind Labs', detail: 'Admin' },
              { id: 'contoso', name: 'Contoso', detail: 'Member' },
            ]}
            currentOrganizationId={organizationId}
            onSelect={(id) => {
              setOrganizationId(id);
              setAction(`Selected ${id}`);
            }}
            onCreate={() => setAction('Create organization')}
          />
          <div data-testid="no-organization">
            <OrganizationMenu
              organizations={[]}
              currentOrganizationId={null}
              onSelect={() => undefined}
              onCreate={() => setAction('Create first organization')}
            />
          </div>
          <Skeleton width="4rem" />
          <div className="fixture-toolbar" data-testid="compact-label-toolbar">
            <Input compact showLabel label="Project filter" data-testid="compact-label" />
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
          <output data-testid="confirmed">{confirmed}</output>
          <Button onClick={() => setHomes((count) => count + 1)}>More homes</Button>
          <Button onClick={() => setHomes((count) => count - 1)}>Fewer homes</Button>
          <Button>
            Show <AnimatedNumber value={homes} data-testid="animated-number" /> homes
          </Button>
          <Button onClick={() => setLoading((value) => !value)}>Toggle loading</Button>
          <LoadingBar active={loading} label="Loading next page" />
          <output hidden data-testid="bootstrap-script">
            {createThemeBootstrapScript({ storageKey: 'bootstrap-theme' })}
          </output>
          <Tooltip content="All seats are assigned">
            <Button disabled>Assign seat</Button>
          </Tooltip>
          <GroupedRows>
            <Row
              title="Seat"
              data-testid="secondary-row"
              action={<Button variant="secondary">Remove</Button>}
            />
          </GroupedRows>
          <EmptyState tone="error" title="Products couldn’t load" description="Try again." />
          <Meter label="Seats assigned" value={7} max={5} valueText="5 of 5" />
          <Avatar name="Broken Picture" src="data:image/png;base64,invalid" label />
          <Avatar name="Organization Name" fallback="initials" label />
        </section>
      </LinkProvider>
    </ThemePreferenceProvider>
  );
}

/** A full-page AppShell, mounted with ?fixture=shell. */
export function ShellFixture() {
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(false);
  return (
    <LinkProvider component={RecordingLink}>
      <AppShell
        brand={<span data-testid="brand">B</span>}
        context={
          <button type="button" aria-expanded="false" data-testid="context-trigger">
            Organization
          </button>
        }
        title={page === 'home' ? 'Home' : 'Products'}
        navigationLabel="Fixture navigation"
        navigation={
          <>
            <NavigationItem
              href="/"
              icon={<Home />}
              selected={page === 'home'}
              onClick={() => setPage('home')}
            >
              Home
            </NavigationItem>
            <NavigationItem
              href="/products"
              icon={<Category />}
              selected={page === 'products'}
              onClick={() => setPage('products')}
            >
              Products
            </NavigationItem>
          </>
        }
        storageKey="fixture-sidebar"
        loading={loading}
      >
        <p data-testid="shell-content">Content</p>
        <button type="button" onClick={() => setLoading((value) => !value)}>
          Toggle page loading
        </button>
      </AppShell>
    </LinkProvider>
  );
}
