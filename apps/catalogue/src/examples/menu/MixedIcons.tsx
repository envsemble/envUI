import { Button, Menu } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Upload } from '@envsemble/envui/icons/Upload';

export default function MixedIcons() {
  return (
    <Menu.Root aria-label="New" trigger={<Button startIcon={<Add />}>New</Button>}>
      {/* Wrong: one item with an icon stands out from its set for no reason. */}
      <Menu.Item>New document</Menu.Item>
      <Menu.Item>New folder</Menu.Item>
      <Menu.Item icon={<Upload />}>Upload files</Menu.Item>
    </Menu.Root>
  );
}
