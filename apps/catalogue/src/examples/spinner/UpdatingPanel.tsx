import { Card, List, Spinner } from '@envsemble/envui';

const activity = [
  { id: 'comment', title: 'Sam Lee commented on Website refresh', detail: '5 minutes ago' },
  { id: 'upload', title: 'Priya Shah uploaded budget.xlsx', detail: '1 hour ago' },
  { id: 'invite', title: 'Alex Morgan joined Northwind', detail: 'Yesterday' },
];

export default function UpdatingPanel() {
  return (
    // The activity shown stays while newer entries load; the spinner says it is updating.
    <Card title="Recent activity" meta={<Spinner size="sm" label="Updating activity" />}>
      <List.Root aria-label="Recent activity" aria-busy="true">
        {activity.map((entry) => (
          <List.Item key={entry.id} label={entry.title} description={entry.detail} />
        ))}
      </List.Root>
    </Card>
  );
}
