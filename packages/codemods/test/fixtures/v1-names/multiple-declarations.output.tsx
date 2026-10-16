// Account actions.
import { Button } from '@envsemble/envui';
import { Menu } from '@envsemble/envui';
import { TextField } from '@envsemble/envui';

export function Actions() {
  return (
    <div>
      <Button>Open</Button>
      <Menu.Item>Rename</Menu.Item>
      <Menu.Separator />
      <TextField label="Name" />
    </div>
  );
}
