import { IconButton, Menu } from '@envsemble/envui';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconShare } from '@envsemble/envui/icons/Share';

export default function DisabledWithReason() {
  return (
    <Menu.Root
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      aria-label="Report actions"
      trigger={<IconButton icon={<IconMoreVert />} aria-label="More actions" />}
    >
      <Menu.Item icon={<IconEdit />}>Rename</Menu.Item>
      <Menu.Item icon={<IconShare />}>Share</Menu.Item>
      <Menu.Item icon={<IconDownload />} description="Available once the report is final" disabled>
        Download PDF
      </Menu.Item>
    </Menu.Root>
  );
}
