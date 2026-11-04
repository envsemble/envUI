import { IconButton, Menu } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconFileCopy } from '@envsemble/envui/icons/FileCopy';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconShare } from '@envsemble/envui/icons/Share';

export default function DeleteFirst() {
  return (
    <Menu.Root
      aria-label="Document actions"
      trigger={<IconButton icon={<IconMoreVert />} aria-label="More actions" />}
    >
      {/* Wrong: Delete is the first item the keyboard highlights. */}
      <Menu.Item icon={<IconDelete />}>Delete</Menu.Item>
      <Menu.Item icon={<IconFileCopy />}>Duplicate</Menu.Item>
      <Menu.Item icon={<IconShare />}>Share</Menu.Item>
      <Menu.Item icon={<IconEdit />}>Rename</Menu.Item>
    </Menu.Root>
  );
}
