import { List } from '@envsemble/envui';

const rows: List.ItemProps[] = [
  { title: 'Alex Morgan', description: 'Owner' },
  { title: 'Northwind Labs', description: 'Organization' },
];

export function Members(props: List.RootProps) {
  return (
    <List.Root {...props}>
      {rows.map((row) => (
        <List.Item key={row.title} {...row} />
      ))}
    </List.Root>
  );
}
