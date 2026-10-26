import { Alert, Button } from '@envsemble/envui';

export default function BlockedRelease() {
  return (
    <Alert
      tone="warning"
      title="Two decisions are blocked"
      action={<Button variant="secondary">Review blockers</Button>}
      style={{ inlineSize: 'min(100%, 32rem)' }}
    >
      The release can’t start until both are resolved.
    </Alert>
  );
}
