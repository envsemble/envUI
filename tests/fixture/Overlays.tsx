import { useState } from 'react';
import {
  Button,
  Dialog,
  HoverCard,
  TextField,
  Link,
  Alert,
  Popover,
  Column,
  Text,
  Theme,
  type ThemeValue,
  Sheet,
} from '@envsemble/envui';

export function AlertsFixture({ theme }: { theme: ThemeValue }) {
  const [dismissed, setDismissed] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <Theme theme={theme} data-testid={`alerts-${theme}`} className="fixture-section">
      <Alert title="Sync paused">Changes are saved on this device.</Alert>
      <Alert tone="success">The plan was published.</Alert>
      <Alert tone="warning" title="Blocked" action={<Link href="#blockers">Show blockers</Link>}>
        Two decisions are waiting for review.
      </Alert>
      {!dismissed && (
        <Alert tone="danger" title="Could not load the index" onDismiss={() => setDismissed(true)}>
          The search service did not respond.
        </Alert>
      )}
      <Alert tone="info" icon={false}>
        No icon here.
      </Alert>
      <Button variant="secondary" onClick={() => setFailed(true)}>
        Fail the save {theme}
      </Button>
      {failed && (
        <Alert tone="danger" announce title="Save failed">
          Try again in a moment.
        </Alert>
      )}
    </Theme>
  );
}

export function PopoverFixture({ theme }: { theme: ThemeValue }) {
  const [saved, setSaved] = useState('');
  return (
    <Theme theme={theme} data-testid={`popover-${theme}`} className="fixture-section">
      <div className="fixture-actions">
        <Popover
          title="Document details"
          trigger={<Button variant="secondary">Details {theme}</Button>}
        >
          <Text>Last changed today by Alex.</Text>
        </Popover>
        <Popover
          aria-label={`Rename ${theme}`}
          width="lg"
          trigger={<Button variant="secondary">Rename {theme}</Button>}
        >
          {(close) => (
            <Column gap={3}>
              <TextField label="Name" name="name" defaultValue="Roadmap.md" />
              <Button
                onClick={() => {
                  setSaved('Renamed');
                  close();
                }}
              >
                Save name
              </Button>
            </Column>
          )}
        </Popover>
      </div>
      <output data-testid={`popover-result-${theme}`}>{saved}</output>
    </Theme>
  );
}

export function DialogVariantsFixture() {
  return (
    <Theme theme="light" className="fixture-section">
      <div className="fixture-actions">
        <Dialog
          title="Wide details"
          width="lg"
          trigger={<Button variant="secondary">Open wide dialog</Button>}
        >
          <Text>Content-heavy dialogs use the wide size.</Text>
        </Dialog>
        <Dialog
          title="Search plans"
          placement="top"
          trigger={<Button variant="secondary">Open top dialog</Button>}
        >
          <TextField label="Search" name="search" />
        </Dialog>
        <Sheet
          side="end"
          title="Report details"
          trigger={<Button variant="secondary">Open panel</Button>}
        >
          <Text>A panel at the right edge.</Text>
        </Sheet>
        <Sheet
          side="end"
          title="Wide report details"
          width="lg"
          trigger={<Button variant="secondary">Open wide panel</Button>}
        >
          <Text>A wide panel for content-heavy details.</Text>
        </Sheet>
      </div>
    </Theme>
  );
}

export function HoverCardFixture({ theme }: { theme: ThemeValue }) {
  const [changes, setChanges] = useState<string[]>([]);
  return (
    <Theme theme={theme} data-testid={`hover-card-${theme}`} className="fixture-section">
      <div className="fixture-actions">
        <Button variant="secondary">Before {theme}</Button>
        <HoverCard
          trigger={<Link href="#roadmap">Roadmap {theme}</Link>}
          onOpenChange={(open) => setChanges((current) => [...current, String(open)])}
        >
          <Text>Changed today by Alex. 3 open decisions, 1 blocked.</Text>
        </HoverCard>
      </div>
      <output data-testid={`hover-card-changes-${theme}`}>{changes.join(' ')}</output>
    </Theme>
  );
}
