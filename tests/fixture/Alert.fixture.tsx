import { useState } from 'react';
import { Alert, Button, Link, Theme, type ColorScheme } from '@envsemble/envui';

export const themes = true;

export default function AlertFixture({ theme }: { theme: ColorScheme }) {
  const [dismissed, setDismissed] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <Theme theme={theme} data-testid={`alerts-${theme}`} className="fixture-section">
      <Alert title="Sync paused">Changes are saved on this device.</Alert>
      <Alert tone="success">The plan was published.</Alert>
      <Alert tone="warning" title="Blocked" actions={<Link href="#blockers">Show blockers</Link>}>
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
