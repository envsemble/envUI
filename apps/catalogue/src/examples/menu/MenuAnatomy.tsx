import { IconButton, Menu } from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Download } from '@envsemble/envui/icons/Download';
import { Edit } from '@envsemble/envui/icons/Edit';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

export default function MenuAnatomy() {
  return (
    <Menu.Root
      aria-label="Report actions"
      align="start"
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<IconButton icon={<MoreVert />} aria-label="More actions" />}
    >
      <Menu.Group label="Report">
        <Menu.Item icon={<Edit />} shortcut="F2">
          Rename
        </Menu.Item>
        <Menu.Item icon={<Download />} description="Once the report is final" disabled>
          Download PDF
        </Menu.Item>
      </Menu.Group>
      <Menu.Separator />
      <Menu.Item icon={<Delete />} shortcut="Del">
        Delete
      </Menu.Item>
    </Menu.Root>
  );
}
