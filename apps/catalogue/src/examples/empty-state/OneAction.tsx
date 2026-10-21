import { Button, Card, EmptyState } from '@envsemble/envui';
import { PersonAdd } from '@envsemble/envui/icons/PersonAdd';

export default function OneAction() {
  return (
    <Card style={{ inlineSize: 'min(100%, 22rem)' }}>
      <EmptyState
        headingLevel={3}
        title="No members yet"
        description="Invite people to work on Northwind launch."
        action={<Button startIcon={<PersonAdd />}>Invite people</Button>}
      />
    </Card>
  );
}
