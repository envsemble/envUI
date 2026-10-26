import { Alert, Column } from '@envsemble/envui';

export default function StackedAlerts() {
  return (
    // Wrong: three alerts about one situation.
    <Column gap={2} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Alert tone="warning" title="Storage almost full">
        9.2 of 10 GB used.
      </Alert>
      <Alert tone="warning">Uploads stop once the space runs out.</Alert>
      <Alert tone="danger">Backups stop once the space runs out.</Alert>
    </Column>
  );
}
