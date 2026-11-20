import { Button, Menu } from '@envsemble/envui';
import { IconExpandMore } from '@envsemble/envui/icons/ExpandMore';
import { IconFeedback } from '@envsemble/envui/icons/Feedback';
import { IconKeyboard } from '@envsemble/envui/icons/Keyboard';
import { IconMenuBook } from '@envsemble/envui/icons/MenuBook';
import { IconOpenInNew } from '@envsemble/envui/icons/OpenInNew';

export default function Destinations() {
  return (
    <Menu.Root
      aria-label="Help"
      align="start"
      defaultOpen
      trigger={
        <Button variant="secondary" end={<IconExpandMore />}>
          Help
        </Button>
      }
    >
      <Menu.Item href="/help/guide" start={<IconMenuBook />}>
        User guide
      </Menu.Item>
      <Menu.Item href="/help/shortcuts" start={<IconKeyboard />} shortcut="Ctrl+/">
        Keyboard shortcuts
      </Menu.Item>
      <Menu.Item
        href="https://status.example.com"
        target="_blank"
        rel="noopener noreferrer"
        start={<IconOpenInNew />}
        description="Opens in a new tab"
      >
        Service status
      </Menu.Item>
      <Menu.Separator />
      <Menu.Item start={<IconFeedback />}>Send feedback</Menu.Item>
    </Menu.Root>
  );
}
