import { TextField as Field, Menu as Dropdown, type TextFieldProps as FieldProps } from '@envsemble/envui';

export function Search(props: FieldProps) {
  return (
    <Dropdown.Root trigger={<Field {...props} label="Search" />}>
      <Dropdown.Item>Contoso</Dropdown.Item>
      <Dropdown.Item>Northwind Labs</Dropdown.Item>
    </Dropdown.Root>
  );
}
