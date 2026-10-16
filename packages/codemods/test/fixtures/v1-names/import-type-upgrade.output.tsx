import { Button, Menu as ActionsMenu } from '@envsemble/envui';

export type ActionsMenuProps = React.ComponentProps<typeof ActionsMenu.Root>;
export const item = (
  <ActionsMenu.Item>
    <Button>Contoso</Button>
  </ActionsMenu.Item>
);
