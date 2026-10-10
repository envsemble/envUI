import { useState } from 'react';
import {
  Avatar,
  Button,
  Dialog,
  EmptyState,
  GroupedRows,
  Row,
  LinkProvider,
  Meter,
  SearchField,
  ThemePreferenceProvider,
  ThemeToggle,
  createThemeBootstrapScript,
  Tooltip,
  type LinkComponentProps,
} from '@envsemble/envui';

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
        </section>
      </LinkProvider>
    </ThemePreferenceProvider>
  );
}
