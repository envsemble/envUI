import { Menubar, Menu } from '@envsemble/envui';

export function EditorMenubar(props: Menubar.RootProps & { file?: Menubar.MenuProps }) {
  const onOpenChange = (open: boolean, details: Menubar.MenuOpenChangeDetails) => {
    void open;
    void details;
  };
  return (
    <Menubar.Root {...props}>
      <Menubar.Menu label="File" onOpenChange={onOpenChange}>
        <Menu.Item>New document</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit">
        <Menu.Item>Undo</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
