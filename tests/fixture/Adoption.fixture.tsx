import { useState } from 'react';
import {
  Avatar,
  AvatarButton,
  Button,
  ConfirmButton,
  Dialog,
  DialogClose,
  Kbd,
  List,
  TextField,
  LinkProvider,
  Menu,
  Meter,
  SearchField,
  Spinner,
  Theme,
  ThemePreferenceProvider,
  ThemeToggle,
  createThemeBootstrapScript,
  Tooltip,
  type LinkComponentProps,
  Column,
  Text,
} from '@envsemble/envui';
import { useStoredThemePreference } from '@envsemble/envui/theme-storage';
import { IconError } from '@envsemble/envui/icons/Error';
import { IconLogout } from '@envsemble/envui/icons/Logout';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconSearch } from '@envsemble/envui/icons/Search';

export const mount = 'root';

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

export default function AdoptionFixture() {
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [action, setAction] = useState('');
  const [presses, setPresses] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [seatsFull, setSeatsFull] = useState(false);
  const storedTheme = useStoredThemePreference({ storageKey: 'fixture-theme' });
  return (
    <ThemePreferenceProvider {...storedTheme} className="fixture-adoption">
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
            actions={
              <>
                <Button variant="outline" onClick={() => setPending((value) => !value)}>
                  Toggle pending
                </Button>
                <DialogClose>Discard</DialogClose>
                <Button>Save</Button>
              </>
            }
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
            <Menu.Header>
              <Column align="center" gap={1} padding={2} style={{ textAlign: 'center' }}>
                <Avatar name="Alex Morgan" size="lg" data-testid="account-avatar" />
                <Text data-testid="account-name">Alex Morgan</Text>
                <Text variant="body-sm" emphasis="muted">
                  alex@example.com
                </Text>
              </Column>
            </Menu.Header>
            <Menu.Item href="/account" onClick={() => setAction('Followed account settings')}>
              Account settings
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item start={<IconLogout />} onClick={() => setAction('Signed out')}>
              Sign out
            </Menu.Item>
          </Menu.Root>
          <output data-testid="menu-action">{action}</output>
          <div className="fixture-toolbar" data-testid="compact-label-toolbar">
            <TextField visibleLabel label="Project filter" data-testid="compact-label" />
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
          <div style={{ inlineSize: '20rem' }}>
            <Button
              variant="secondary"
              fullWidth
              start={<IconSearch />}
              end={<Kbd keys={['Ctrl', 'K']} aria-hidden />}
              aria-keyshortcuts="Control+K"
              data-testid="end-button"
            >
              Search
            </Button>
          </div>
          <Spinner label="Refreshing seats" />
          <ConfirmButton
            confirmLabel="Remove Morgan"
            armedDuration={800}
            onConfirm={() => setConfirmed((count) => count + 1)}
            data-testid="confirm-button"
          >
            Remove
          </ConfirmButton>
          <ConfirmButton
            icon={<IconDelete />}
            aria-label="Remove Morgan"
            confirmLabel="Remove"
            armedDuration={800}
            onConfirm={() => setConfirmed((count) => count + 1)}
            data-testid="confirm-icon-button"
          />
          <output data-testid="confirmed">{confirmed}</output>
          <output hidden data-testid="bootstrap-script">
            {createThemeBootstrapScript({}, { preference: 'dark' })}
          </output>
          <output hidden data-testid="bootstrap-contrast-script">
            {createThemeBootstrapScript({ contrast: 'high' })}
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
              end={<Button variant="secondary">Remove</Button>}
            />
          </List.Root>
          <Column role="alert" gap={4} padding={5}>
            <IconError
              width="1.5rem"
              height="1.5rem"
              style={{ color: 'var(--env-color-fg-danger)' }}
            />
            <Column gap={2}>
              <Text render={<h4 />} variant="title">
                Products couldn’t load
              </Text>
              <Text variant="body-sm">Try again.</Text>
            </Column>
          </Column>
          <Column gap={4} padding={5}>
            <Column gap={2}>
              <Text render={<h1 />} variant="title">
                Nothing here yet
              </Text>
            </Column>
          </Column>
          <Meter label="Seats assigned" value={7} max={5} valueText="5 of 5" />
          <Avatar name="Broken Picture" src="data:image/png;base64,invalid" named />
          <Avatar name="Organization Name" fallback="initials" named />
        </section>
      </LinkProvider>
    </ThemePreferenceProvider>
  );
}
