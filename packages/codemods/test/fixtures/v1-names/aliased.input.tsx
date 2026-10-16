import { Input as Field, Menu as Dropdown, MenuItem as Item, type InputProps as FieldProps } from '@envsemble/envui';

export function Search(props: FieldProps) {
  return (
    <Dropdown trigger={<Field {...props} label="Search" />}>
      <Item>Contoso</Item>
      <Item>Northwind Labs</Item>
    </Dropdown>
  );
}
