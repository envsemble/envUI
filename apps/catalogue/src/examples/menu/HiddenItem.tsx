import { IconButton, Menu } from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Share } from '@envsemble/envui/icons/Share';

const final = false;

export default function HiddenItem() {
  return (
    <Menu.Root
      aria-label="Report actions"
      trigger={<IconButton icon={<MoreVert />} aria-label="More actions" />}
    >
      <Menu.Item icon={<Edit />}>Rename</Menu.Item>
      <Menu.Item icon={<Share />}>Share</Menu.Item>
      {/* Wrong: the item vanishes until the report is final, and nothing says why. */}
      {final && <Menu.Item>Download PDF</Menu.Item>}
    </Menu.Root>
  );
}
