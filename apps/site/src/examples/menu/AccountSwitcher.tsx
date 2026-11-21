import { Avatar, Button, Menu } from '@envsemble/envui';
import { IconPersonAdd } from '@envsemble/envui/icons/PersonAdd';

export default function AccountSwitcher() {
  return (
    <Menu.Root
      aria-label="Switch account"
      align="start"
      defaultOpen
      trigger={<Button>Alex Morgan</Button>}
    >
      <Menu.RadioGroup label="Accounts" defaultValue="alex">
        <Menu.RadioItem
          value="alex"
          start={<Avatar name="Alex Morgan" size="sm" />}
          description="alex@example.com"
        >
          Alex Morgan
        </Menu.RadioItem>
        <Menu.RadioItem
          value="northwind"
          start={<Avatar name="Northwind" size="sm" />}
          description="team@northwind.example.com"
        >
          Northwind
        </Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Separator />
      <Menu.Item start={<IconPersonAdd />}>Add account</Menu.Item>
    </Menu.Root>
  );
}
