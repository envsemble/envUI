import { Alert, Column } from '@envsemble/envui';
import { IconConstruction } from '@envsemble/envui/icons/Construction';

export default function CustomIcon() {
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 32rem)' }}>
      <Alert icon={<IconConstruction />} title="Maintenance on Saturday">
        Northwind is read-only from 06:00 to 08:00 UTC while the database is upgraded.
      </Alert>
      <Alert tone="success" icon={false}>
        Priya Shah accepted the invitation.
      </Alert>
    </Column>
  );
}
