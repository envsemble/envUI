import { Menu } from '@envsemble/envui/icons/Menu';
import { List as EnvList, TextField as Input, Menu as EnvMenu } from '@envsemble/envui';

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
      <EnvMenu.Item>Rename</EnvMenu.Item>
      <EnvMenu.Separator />
      <EnvList.Root>
        {List.map((name) => (
          <EnvList.Item key={name} title={name} />
        ))}
      </EnvList.Root>
    </div>
  );
}
