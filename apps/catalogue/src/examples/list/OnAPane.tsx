import { List } from '@envsemble/envui';

export default function OnAPane() {
  return (
    <List.Root contrast aria-label="Connected accounts">
      <List.Item title="Calendar" detail="alex.morgan@example.com" />
      <List.Item title="Storage" detail="Northwind shared drive" />
    </List.Root>
  );
}
