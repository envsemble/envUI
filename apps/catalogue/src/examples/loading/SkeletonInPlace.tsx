import { Avatar, List, placeholders } from '@envsemble/envui';

interface Member {
  id: string;
  name: string;
  role: string;
}

export default function SkeletonInPlace({ members }: { members?: Member[] }) {
  // The list itself, over placeholder rows until the members arrive.
  return (
    <List.Root aria-label="Members" skeleton={!members} style={{ inlineSize: 'min(100%, 20rem)' }}>
      {(members ?? placeholders<Member>(3)).map((member) => (
        <List.Item
          key={member.id}
          start={<Avatar name={member.name ?? ''} size="sm" />}
          label={member.name}
          description={member.role}
        />
      ))}
    </List.Root>
  );
}
