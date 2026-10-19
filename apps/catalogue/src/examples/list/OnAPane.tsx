import { List, Surface } from '@envsemble/envui';

export default function OnAPane() {
  return (
    <Surface background="muted" padding={3}>
      <List.Root aria-label="Connected accounts">
        <List.Item label="Calendar" description="alex.morgan@example.com" />
        <List.Item label="Storage" description="Northwind shared drive" />
      </List.Root>
    </Surface>
  );
}
