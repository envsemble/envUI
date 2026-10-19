import { IconButton, Menu, Tooltip } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { FileCopy } from '@envsemble/envui/icons/FileCopy';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

export default function MenuTrigger() {
  return (
    <Menu.Root
      aria-label="Invoice actions"
      align="start"
      trigger={
        // The Tooltip passes the menu button's props and ref on to the IconButton.
        <Tooltip content="More actions">
          <IconButton icon={<MoreVert />} aria-label="More actions" />
        </Tooltip>
      }
    >
      <Menu.Item icon={<FileCopy />}>Duplicate</Menu.Item>
      <Menu.Item icon={<Archive />}>Archive</Menu.Item>
    </Menu.Root>
  );
}
