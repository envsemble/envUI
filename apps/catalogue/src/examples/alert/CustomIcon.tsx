import { Alert, Stack } from '@envsemble/envui';
import { Construction } from '@envsemble/envui/icons/Construction';

export default function CustomIcon() {
  return (
    <Stack gap={3}>
      <Alert icon={<Construction />} title="Maintenance on Saturday">
        Northwind is read-only from 06:00 to 08:00 UTC while the database is upgraded.
      </Alert>
      <Alert tone="success" icon={false}>
        Priya Shah accepted the invitation.
      </Alert>
    </Stack>
  );
}
