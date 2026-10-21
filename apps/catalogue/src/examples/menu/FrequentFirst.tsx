import { IconButton, Menu } from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Edit } from '@envsemble/envui/icons/Edit';
import { FileCopy } from '@envsemble/envui/icons/FileCopy';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Share } from '@envsemble/envui/icons/Share';

export default function FrequentFirst() {
  return (
    <Menu.Root
      aria-label="Document actions"
      trigger={<IconButton icon={<MoreVert />} aria-label="More actions" />}
    >
      <Menu.Item icon={<Share />}>Share</Menu.Item>
      <Menu.Item icon={<Edit />}>Rename</Menu.Item>
      <Menu.Item icon={<FileCopy />}>Duplicate</Menu.Item>
      <Menu.Separator />
      <Menu.Item icon={<Delete />}>Delete</Menu.Item>
    </Menu.Root>
  );
}
