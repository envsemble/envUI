import { useState, type CSSProperties } from 'react';
import {
  AnimatedNumber,
  AppShell,
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
  NavList,
  OrganizationSwitcher,
  SearchField,
  Skeleton,
  Spinner,
  Theme,
  ThemePreferenceProvider,
  ThemeToggle,
  createThemeBootstrapScript,
  Tooltip,
  type LinkComponentProps,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Category } from '@envsemble/envui/icons/Category';
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
                detail="alex@example.com"
                aria-label="Open account menu"
              />
            }
          >
            <Menu.Header>Alex Morgan</Menu.Header>
            <Menu.Item href="/account">Account settings</Menu.Item>
            <Menu.Separator />
            <Menu.Item icon={<Logout />} onClick={() => setAction('Signed out')}>
              Sign out
            </Menu.Item>
          </Menu.Root>
          <output data-testid="menu-action">{action}</output>
          <OrganizationSwitcher
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
            <OrganizationSwitcher
              organizations={[]}
              currentOrganizationId={null}
              onSelect={() => undefined}
              onCreate={() => setAction('Create first organization')}
            />
          </div>
          <Skeleton width="4rem" />
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
              title="Seat"
              data-testid="secondary-row"
              action={<Button variant="secondary">Remove</Button>}
            />
          </List.Root>
          <EmptyState tone="danger" title="Products couldn’t load" description="Try again." />
          <EmptyState headingLevel={1} title="Nothing here yet" />
          <Meter label="Seats assigned" value={7} max={5} valueText="5 of 5" />
          <Avatar name="Broken Picture" src="data:image/png;base64,invalid" label />
          <Avatar name="Organization Name" fallback="initials" label />
        </section>
      </LinkProvider>
    </ThemePreferenceProvider>
  );
}

/**
 * Two shells on one page, the second with a taller topbar that can be hidden or removed, mounted
 * with ?fixture=two-shells.
 */
export function TwoShellsFixture() {
  const [first, setFirst] = useState(true);
  const [second, setSecond] = useState<'shown' | 'hidden' | 'gone'>('shown');
  return (
    <>
      <div hidden={!first}>
        <AppShell
          brand={<span>A</span>}
          title="First"
          navigationLabel="First navigation"
          navigation={
            <NavList.Item href="/" icon={<Home />}>
              Home
            </NavList.Item>
          }
        >
          <div className="fixture-two-shells-actions">
            <button type="button" onClick={() => setSecond('hidden')}>
              Hide the second shell
            </button>
            <button type="button" onClick={() => setSecond('shown')}>
              Show the second shell
            </button>
            <button type="button" onClick={() => setSecond('gone')}>
              Remove the second shell
            </button>
            <button type="button" onClick={() => setFirst(false)}>
              Hide the first shell
            </button>
          </div>
        </AppShell>
      </div>
      {second !== 'gone' && (
        <div
          hidden={second === 'hidden'}
          style={{ '--env-topbar-height': '5rem' } as CSSProperties}
        >
          <AppShell
            brand={<span>B</span>}
            title="Second"
            navigationLabel="Second navigation"
            navigation={
              <NavList.Item href="/second" icon={<Category />}>
                Second home
              </NavList.Item>
            }
          >
            <p>Second content</p>
          </AppShell>
        </div>
      )}
    </>
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
            <NavList.Item
              href="/"
              icon={<Home />}
              selected={page === 'home'}
              onClick={() => setPage('home')}
            >
              Home
            </NavList.Item>
            <NavList.Item
              href="/products"
              icon={<Category />}
              selected={page === 'products'}
              onClick={() => setPage('products')}
            >
              Products
            </NavList.Item>
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
