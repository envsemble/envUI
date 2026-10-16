import {
  Button,
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuHeader,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
} from '@envsemble/envui';
import type {
  MenuCheckboxItemProps,
  MenuDensity,
  MenuGroupProps,
  MenuHeaderProps,
  MenuItemProps,
  MenuProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSubmenuProps,
} from '@envsemble/envui';

export interface ProjectMenuProps extends Omit<MenuProps, 'children'> {
  density?: MenuDensity;
  item?: MenuItemProps;
  group?: MenuGroupProps;
  header?: MenuHeaderProps;
  checkbox?: MenuCheckboxItemProps;
  radioGroup?: MenuRadioGroupProps;
  radio?: MenuRadioItemProps;
  submenu?: MenuSubmenuProps;
}

export function ProjectMenu({ density = 'compact', ...props }: ProjectMenuProps) {
  return (
    <Menu {...props} density={density} trigger={<Button>Northwind Labs</Button>}>
      <MenuHeader>Alex Morgan</MenuHeader>
      <MenuGroup label="Project">
        <MenuItem onClick={() => {}}>Rename</MenuItem>
        <MenuItem href="/projects/northwind/settings">Settings</MenuItem>
      </MenuGroup>
      <MenuSeparator />
      <MenuCheckboxItem checked>Show archived</MenuCheckboxItem>
      <MenuRadioGroup value="name">
        <MenuRadioItem value="name">Sort by name</MenuRadioItem>
        <MenuRadioItem value="date">Sort by date</MenuRadioItem>
      </MenuRadioGroup>
      <MenuSubmenu label="Move to">
        <MenuItem>Contoso</MenuItem>
      </MenuSubmenu>
    </Menu>
  );
}
