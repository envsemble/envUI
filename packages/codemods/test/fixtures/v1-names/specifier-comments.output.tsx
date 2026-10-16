import {
Button, // The compact item replaces this once it lands.
// the settings entries
Menu
} from '@envsemble/envui';
import { Table } from '@envsemble/envui';
import { TextField } from '@envsemble/envui';
import { Alert } from '@envsemble/envui';
// @ts-ignore -- moves with the names
import { Stat } from '@envsemble/envui';

export const settings = (
  <>
    <Button>Settings</Button>
    <Menu.Item>Profile</Menu.Item>
    <Menu.Separator />
    <Table.Root caption="Members">
      <Table.Body />
    </Table.Root>
    <TextField label="Name" />
    <TextField label="Email" />
    <Alert>Saved</Alert>
    <Stat.Group>
      <Stat.Root label="Members" value={3} />
    </Stat.Group>
  </>
);
