import { Button, Menu } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { UnfoldMore } from '@envsemble/envui/icons/UnfoldMore';

export default function OrganizationSwitcherAnatomy() {
  return (
    <Menu.Root
      aria-label="Organizations"
      align="start"
      defaultOpen
      trigger={
        <Button variant="secondary" endIcon={<UnfoldMore />}>
          Northwind Labs
        </Button>
      }
    >
      <Menu.RadioGroup label="Organizations" value="northwind" onValueChange={() => {}}>
        <Menu.RadioItem value="northwind" description="Admin">
          Northwind Labs
        </Menu.RadioItem>
        <Menu.RadioItem value="contoso" description="Member">
          Contoso
        </Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Separator />
      <Menu.Item icon={<Add />}>Create organization</Menu.Item>
    </Menu.Root>
  );
}
