import { Button, MenuItem } from '@envsemble/envui';
import type {
  // The namespace, for its types.
  Menu,
} from '@envsemble/envui';

export const item = (
  <>
    <Button>Open</Button>
    <MenuItem>Profile</MenuItem>
  </>
);
export type ItemProps = Menu.ItemProps;
