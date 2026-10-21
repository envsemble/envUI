import { Alert, Button } from '@envsemble/envui';

export default function AlertAnatomy() {
  return (
    <Alert
      tone="warning"
      title="Two decisions are blocked"
      action={<Button variant="secondary">Review blockers</Button>}
      onDismiss={() => {}}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    >
      The release can’t start until both are resolved.
    </Alert>
  );
}
