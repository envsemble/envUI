import { IconButton, Menu } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';

export default function MenuAnatomy() {
  return (
    <Menu.Root
      aria-label="Report actions"
      align="start"
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<IconButton icon={<IconMoreVert />} aria-label="More actions" />}
    >
      <Menu.Group label="Report">
        <Menu.Item icon={<IconEdit />} shortcut="F2">
          Rename
        </Menu.Item>
        <Menu.Item icon={<IconDownload />} description="Once the report is final" disabled>
          Download PDF
        </Menu.Item>
      </Menu.Group>
      <Menu.Separator />
      <Menu.Item icon={<IconDelete />} shortcut="Del">
        Delete
      </Menu.Item>
    </Menu.Root>
  );
}
