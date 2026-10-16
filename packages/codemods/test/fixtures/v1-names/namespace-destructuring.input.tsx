import * as ui from '@envsemble/envui';
import { Menu, Table } from '@envsemble/envui';

// Parts taken out of a namespace: 1.0 code, which must stay as it is.
const { Root, Item } = Menu;
const { Cell: TableCell } = ui.Table;
let Head;
({ Head } = Table);

export function Settings() {
  return (
    <Root trigger="Settings">
      <Item>Profile</Item>
      <Head />
      <TableCell>Owner</TableCell>
    </Root>
  );
}
