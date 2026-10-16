import { Menubar, MenubarMenu, MenuItem } from '@envsemble/envui';
import type { MenubarMenuOpenChangeDetails, MenubarMenuProps, MenubarProps } from '@envsemble/envui';

export function EditorMenubar(props: MenubarProps & { file?: MenubarMenuProps }) {
  const onOpenChange = (open: boolean, details: MenubarMenuOpenChangeDetails) => {
    void open;
    void details;
  };
  return (
    <Menubar {...props}>
      <MenubarMenu label="File" onOpenChange={onOpenChange}>
        <MenuItem>New document</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Edit">
        <MenuItem>Undo</MenuItem>
      </MenubarMenu>
    </Menubar>
  );
}
