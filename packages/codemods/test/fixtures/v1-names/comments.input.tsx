// Settings menu.
import { Menu, Button } from '@envsemble/envui';
// @ts-expect-error -- the 0.x types lack the item's hint.
import { MenuItem } from '@envsemble/envui';
import {
  // eslint-disable-next-line envui/no-renamed-exports -- moving in the next pull request
  Input,
  /* The banner keeps its name. */ Notice as Banner,
} from '@envsemble/envui';
import { useState } from 'react';

export function Settings() {
  const [open, setOpen] = useState(false);
  return (
    <Menu trigger={<Button onClick={() => setOpen(!open)}>Settings</Button>}>
      <MenuItem hint="Ctrl+P">Profile</MenuItem>
      <Input label="Name" />
      <Banner>Saved</Banner>
    </Menu>
  );
}
