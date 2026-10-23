import { IconButton, Menu } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { Edit } from '@envsemble/envui/icons/Edit';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Share } from '@envsemble/envui/icons/Share';

export default function DisabledWithReason() {
  return (
    <Menu.Root
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      aria-label="Report actions"
      trigger={<IconButton icon={<MoreVert />} aria-label="More actions" />}
    >
      <Menu.Item icon={<Edit />}>Rename</Menu.Item>
      <Menu.Item icon={<Share />}>Share</Menu.Item>
      <Menu.Item icon={<Download />} description="Available once the report is final" disabled>
        Download PDF
      </Menu.Item>
    </Menu.Root>
  );
}
