import { Badge, List } from '@envsemble/envui';

export default function StatusInWords() {
  return (
    // Each status in its own words; the tone only adds to them.
    <List.Root aria-label="Projects" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <List.Item label="Website refresh">
        <Badge tone="success">On track</Badge>
      </List.Item>
      <List.Item label="Mobile release">
        <Badge tone="warning">At risk</Badge>
      </List.Item>
    </List.Root>
  );
}
