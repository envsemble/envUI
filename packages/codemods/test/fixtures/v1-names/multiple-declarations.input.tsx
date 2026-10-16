// Account actions.
import { Button } from '@envsemble/envui';
import { MenuItem } from '@envsemble/envui';
import { MenuSeparator } from '@envsemble/envui';
import { Input } from '@envsemble/envui';

export function Actions() {
  return (
    <div>
      <Button>Open</Button>
      <MenuItem>Rename</MenuItem>
      <MenuSeparator />
      <Input label="Name" />
    </div>
  );
}
