import { GroupedRows, Row, type GroupedRowsProps, type RowProps } from '@envsemble/envui';

const rows: RowProps[] = [
  { title: 'Alex Morgan', description: 'Owner' },
  { title: 'Northwind Labs', description: 'Organization' },
];

export function Members(props: GroupedRowsProps) {
  return (
    <GroupedRows {...props}>
      {rows.map((row) => (
        <Row key={row.title} {...row} />
      ))}
    </GroupedRows>
  );
}
