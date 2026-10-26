import { Avatar, Button, Column, List, placeholders } from '@envsemble/envui';

interface Member {
  id: string;
  name: string;
  role: string;
}

export default function SkeletonInPlace({ members }: { members?: Member[] }) {
  return (
    <Column gap={4} align="start" style={{ inlineSize: 'min(100%, 20rem)' }}>
      {/* The list itself, over placeholder rows until the members arrive: what follows keeps its
          place as they land. */}
      <List.Root aria-label="Members" skeleton={!members} style={{ inlineSize: '100%' }}>
        {(members ?? placeholders<Member>(3)).map((member) => (
          <List.Item
            key={member.id}
            start={<Avatar name={member.name ?? ''} size="sm" />}
            label={member.name}
            description={member.role}
          />
        ))}
      </List.Root>
      <Button variant="secondary">Invite people</Button>
    </Column>
  );
}
