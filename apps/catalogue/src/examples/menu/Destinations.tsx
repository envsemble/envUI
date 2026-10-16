import { Button, Menu } from '@envsemble/envui';
import { ExpandMore } from '@envsemble/envui/icons/ExpandMore';
import { Feedback } from '@envsemble/envui/icons/Feedback';
import { Keyboard } from '@envsemble/envui/icons/Keyboard';
import { MenuBook } from '@envsemble/envui/icons/MenuBook';
import { OpenInNew } from '@envsemble/envui/icons/OpenInNew';

export default function Destinations() {
  return (
    <Menu.Root
      aria-label="Help"
      align="start"
      trigger={
        <Button variant="secondary" endIcon={<ExpandMore />}>
          Help
        </Button>
      }
    >
      <Menu.Item href="/help/guide" icon={<MenuBook />}>
        User guide
      </Menu.Item>
      <Menu.Item href="/help/shortcuts" icon={<Keyboard />} shortcut="Ctrl+/">
        Keyboard shortcuts
      </Menu.Item>
      <Menu.Item
        href="https://status.example.com"
        target="_blank"
        rel="noopener noreferrer"
        icon={<OpenInNew />}
        description="Opens in a new tab"
      >
        Service status
      </Menu.Item>
      <Menu.Separator />
      <Menu.Item icon={<Feedback />}>Send feedback</Menu.Item>
    </Menu.Root>
  );
}
