import { useState } from 'react';
import {
  AppShell,
  Avatar,
  Button,
  Dialog,
  EmptyState,
  GroupedRows,
  Row,
  LinkProvider,
  Menu,
  MenuHeader,
  MenuItem,
  MenuSeparator,
  Meter,
  NavigationItem,
  SearchField,
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
              <button type="button" aria-label="Open account menu">
                <Avatar name="Alex Morgan" size="small" />
              </button>
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
      >
        <p data-testid="shell-content">Content</p>
      </AppShell>
    </LinkProvider>
  );
}
