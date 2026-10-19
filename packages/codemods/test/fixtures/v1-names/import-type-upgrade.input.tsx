import type { Menu as ActionsMenu } from '@envsemble/envui';
import { Button, MenuItem } from '@envsemble/envui';

export type ActionsMenuProps = React.ComponentProps<typeof ActionsMenu>;
export const item = (
  <MenuItem>
    <Button>Contoso</Button>
  </MenuItem>
);
