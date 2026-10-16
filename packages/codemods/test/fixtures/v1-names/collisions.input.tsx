import { Menu } from '@envsemble/envui/icons/Menu';
import { GroupedRows, Input, MenuItem, MenuSeparator, Row } from '@envsemble/envui';

const List = ['Alex Morgan', 'Contoso'];

function TextField(props: { label: string }) {
  return <label>{props.label}</label>;
}

export function Toolbar() {
  return (
    <div>
      <Menu />
      <TextField label="Owner" />
      <Input label="Name" />
      <MenuItem>Rename</MenuItem>
      <MenuSeparator />
      <GroupedRows>
        {List.map((name) => (
          <Row key={name} title={name} />
        ))}
      </GroupedRows>
    </div>
  );
}
