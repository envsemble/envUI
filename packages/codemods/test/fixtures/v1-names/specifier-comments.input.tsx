import {
  Button,
  // The compact item replaces this once it lands.
  MenuItem, // the settings entries
  MenuSeparator,
} from '@envsemble/envui';
import { Table, /* The body of the members table. */ TableBody } from '@envsemble/envui';
import { TextField, /* The old name. */ Input } from '@envsemble/envui';
// @ts-expect-error -- not exported by the installed 1.0
import { Notice } from '@envsemble/envui';
// @ts-ignore -- moves with the names
// @ts-expect-error -- not exported by the installed 1.0
import { StatGroup } from '@envsemble/envui';
import { Stat } from '@envsemble/envui';

export const settings = (
  <>
    <Button>Settings</Button>
    <MenuItem>Profile</MenuItem>
    <MenuSeparator />
    <Table caption="Members">
      <TableBody />
    </Table>
    <Input label="Name" />
    <TextField label="Email" />
    <Notice>Saved</Notice>
    <StatGroup>
      <Stat label="Members" value={3} />
    </StatGroup>
  </>
);
