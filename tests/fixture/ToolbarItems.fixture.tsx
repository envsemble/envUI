import { Button, Menu, Toolbar } from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';

export const mount = 'standalone';

export default function ToolbarItemsFixture() {
  return (
    <>
      <Toolbar.Root aria-label="Editor">
        <Toolbar.Button icon={<IconFormatBold />} label="Bold" />
        <Toolbar.Item render={<Button>Share</Button>} />
        <Menu.Root
          aria-label="Block type"
          trigger={<Toolbar.Item render={<Button>Paragraph</Button>} />}
        >
          <Menu.Item>Heading</Menu.Item>
        </Menu.Root>
        <Toolbar.Input aria-label="Font size" defaultValue="14" />
      </Toolbar.Root>
      <Button>After editor toolbar</Button>
    </>
  );
}
