import { IconButton, Menu, Tooltip } from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconFileCopy } from '@envsemble/envui/icons/FileCopy';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';

export default function MenuTrigger() {
  return (
    <Menu.Root
      aria-label="Invoice actions"
      align="start"
      trigger={
        <Tooltip content="More actions">
          <IconButton icon={<IconMoreVert />} aria-label="More actions" />
        </Tooltip>
      }
    >
      <Menu.Item start={<IconFileCopy />}>Duplicate</Menu.Item>
      <Menu.Item start={<IconArchive />}>Archive</Menu.Item>
    </Menu.Root>
  );
}
