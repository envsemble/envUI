import {
  Button,
  // The namespace, for its types.
  Menu,
} from '@envsemble/envui';

export const item = (
  <>
    <Button>Open</Button>
    <Menu.Item>Profile</Menu.Item>
  </>
);
export type ItemProps = Menu.ItemProps;
