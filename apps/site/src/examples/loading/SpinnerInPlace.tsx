import { Avatar, Button, Column, List, Spinner } from '@envsemble/envui';

interface Member {
  id: string;
  name: string;
  role: string;
}

export default function SpinnerInPlace({ members }: { members?: Member[] }) {
  return (
    <Column gap={4} align="start" style={{ inlineSize: 'min(100%, 20rem)' }}>
      {/* A spinner where a list of a known shape will appear: what follows jumps when it lands. */}
      {members ? (
        <List.Root aria-label="Members" style={{ inlineSize: '100%' }}>
          {members.map((member) => (
            <List.Item
              key={member.id}
              start={<Avatar name={member.name} size="sm" />}
              label={member.name}
              description={member.role}
            />
          ))}
        </List.Root>
      ) : (
        <Spinner label="Loading members" showLabel />
      )}
      <Button variant="secondary">Invite people</Button>
    </Column>
  );
}
