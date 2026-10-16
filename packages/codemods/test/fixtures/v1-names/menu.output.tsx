import { Button, Menu } from '@envsemble/envui';

export interface ProjectMenuProps extends Omit<Menu.RootProps, 'children'> {
  item?: Menu.ItemProps;
  group?: Menu.GroupProps;
  header?: Menu.HeaderProps;
  checkbox?: Menu.CheckboxItemProps;
  radioGroup?: Menu.RadioGroupProps;
  radio?: Menu.RadioItemProps;
  submenu?: Menu.SubmenuProps;
}

export function ProjectMenu({ density = 'compact', ...props }: ProjectMenuProps) {
  return (
    <Menu.Root {...props} density={density} trigger={<Button>Northwind Labs</Button>}>
      <Menu.Header>Alex Morgan</Menu.Header>
      <Menu.Group label="Project">
        <Menu.Item onClick={() => {}}>Rename</Menu.Item>
        <Menu.Item href="/projects/northwind/settings">Settings</Menu.Item>
      </Menu.Group>
      <Menu.Separator />
      <Menu.CheckboxItem checked>Show archived</Menu.CheckboxItem>
      <Menu.RadioGroup value="name">
        <Menu.RadioItem value="name">Sort by name</Menu.RadioItem>
        <Menu.RadioItem value="date">Sort by date</Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Submenu label="Move to">
        <Menu.Item>Contoso</Menu.Item>
      </Menu.Submenu>
    </Menu.Root>
  );
}
