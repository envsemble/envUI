// Settings menu.
import { Menu, Button } from '@envsemble/envui';
import {
  // eslint-disable-next-line envui/no-renamed-exports -- moving in the next pull request
  TextField,
  /* The banner keeps its name. */ Alert as Banner,
} from '@envsemble/envui';
import { useState } from 'react';

export function Settings() {
  const [open, setOpen] = useState(false);
  return (
    <Menu.Root trigger={<Button onClick={() => setOpen(!open)}>Settings</Button>}>
      <Menu.Item hint="Ctrl+P">Profile</Menu.Item>
      <TextField label="Name" />
      <Banner>Saved</Banner>
    </Menu.Root>
  );
}
