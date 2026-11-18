import { Avatar, Link, List, Text } from '@envsemble/envui';

const agents = [
  { id: 'review', name: 'Review agent', task: 'Reviewing the pricing page', seen: '2 min ago' },
  { id: 'release', name: 'Release agent', task: 'Waiting for the checks', seen: '14 min ago' },
  { id: 'research', name: 'Research agent', task: 'Summarising the interviews', seen: '1 h ago' },
  { id: 'billing', name: 'Billing agent', task: 'Idle', seen: 'Yesterday' },
];

export default function Agents() {
  return (
    <List.Root aria-label="Agents" style={{ inlineSize: 'min(100%, 30rem)' }}>
      {agents.map((agent) => (
        <List.Item
          key={agent.id}
          interactive
          start={<Avatar name={agent.name} size="sm" />}
          label={
            <Link href={`/agents/${agent.id}`} underline={false} data-row-target draggable={false}>
              {agent.name}
            </Link>
          }
          description={agent.task}
          end={<Text variant="caption">{agent.seen}</Text>}
        />
      ))}
    </List.Root>
  );
}
