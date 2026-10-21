import { Alert, Button } from '@envsemble/envui';

export default function ProblemInTitle() {
  return (
    <Alert
      tone="warning"
      title="Sync paused"
      action={<Button variant="secondary">Reconnect</Button>}
      style={{ inlineSize: 'min(100%, 24rem)' }}
    >
      Changes are saved on this device until you reconnect.
    </Alert>
  );
}
