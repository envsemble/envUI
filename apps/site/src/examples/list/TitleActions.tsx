import { Avatar, Button, List } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';

const members = [
  { id: 'alex', name: 'Alex Morgan', role: 'Owner' },
  { id: 'sam', name: 'Sam Lee', role: 'Editor' },
];

export default function TitleActions() {
  return (
    <List.Root
      title="Members"
      headingLevel={3}
      description="People who can edit Website refresh."
      headerEnd={
        <Button size="sm" variant="outline" start={<IconAdd />}>
          Add member
        </Button>
      }
      style={{ inlineSize: 'min(100%, 28rem)' }}
    >
      {members.map(({ id, name, role }) => (
        <List.Item
          key={id}
          start={<Avatar name={name} size="sm" />}
          label={name}
          description={role}
        />
      ))}
    </List.Root>
  );
}
