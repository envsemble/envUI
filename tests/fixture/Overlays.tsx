import { useState } from 'react';
import {
  Button,
  Dialog,
  Input,
  Link,
  Notice,
  Popover,
  Stack,
  Text,
  Theme,
  type ThemeValue,
} from '@envsemble/envui';

export function NoticesFixture({ theme }: { theme: ThemeValue }) {
  const [dismissed, setDismissed] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <Theme theme={theme} data-testid={`notices-${theme}`} className="fixture-section">
      <Notice title="Sync paused">Changes are saved on this device.</Notice>
      <Notice tone="success">The plan was published.</Notice>
      <Notice tone="warning" title="Blocked" action={<Link href="#blockers">Show blockers</Link>}>
        Two decisions are waiting for review.
      </Notice>
      {!dismissed && (
        <Notice tone="error" title="Could not load the index" onDismiss={() => setDismissed(true)}>
          The planning repository is unavailable.
        </Notice>
      )}
      <Notice tone="info" icon={false}>
        No icon here.
      </Notice>
      <Button variant="secondary" onClick={() => setFailed(true)}>
        Fail the save {theme}
      </Button>
      {failed && (
        <Notice tone="error" announce title="Save failed">
          Try again in a moment.
        </Notice>
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
          width="wide"
          trigger={<Button variant="secondary">Rename {theme}</Button>}
        >
          {(close) => (
            <Stack gap={3}>
              <Input label="Name" name="name" defaultValue="Roadmap.md" />
              <Button
                onClick={() => {
                  setSaved('Renamed');
                  close();
                }}
              >
                Save name
              </Button>
            </Stack>
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
          size="wide"
          trigger={<Button variant="secondary">Open wide dialog</Button>}
        >
          <Text>Content-heavy dialogs use the wide size.</Text>
        </Dialog>
        <Dialog
          title="Search plans"
          placement="top"
          trigger={<Button variant="secondary">Open top dialog</Button>}
        >
          <Input label="Search" name="search" />
        </Dialog>
      </div>
    </Theme>
  );
}
