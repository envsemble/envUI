import { Alert, Button } from '@envsemble/envui';

export default function OneAlert() {
  return (
    <Alert
      tone="warning"
      title="Storage almost full"
      action={<Button variant="secondary">Upgrade storage</Button>}
      style={{ inlineSize: 'min(100%, 24rem)' }}
    >
      9.2 of 10 GB used. Uploads and backups stop once the space runs out.
    </Alert>
  );
}
