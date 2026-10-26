import { Badge, List } from '@envsemble/envui';

export default function StatusInColor() {
  return (
    // The same word in every tone: only the color says which project is at risk.
    <List.Root aria-label="Projects" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <List.Item label="Website refresh">
        <Badge tone="success">Status</Badge>
      </List.Item>
      <List.Item label="Mobile release">
        <Badge tone="warning">Status</Badge>
      </List.Item>
    </List.Root>
  );
}
