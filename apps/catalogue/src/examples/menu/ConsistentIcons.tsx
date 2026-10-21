import { Button, Menu } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { CreateNewFolder } from '@envsemble/envui/icons/CreateNewFolder';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { Upload } from '@envsemble/envui/icons/Upload';

export default function ConsistentIcons() {
  // Shown open in the docs; without defaultOpen, it opens from its trigger.
  return (
    <Menu.Root aria-label="New" defaultOpen trigger={<Button startIcon={<Add />}>New</Button>}>
      <Menu.Item icon={<NoteAdd />}>New document</Menu.Item>
      <Menu.Item icon={<CreateNewFolder />}>New folder</Menu.Item>
      <Menu.Item icon={<Upload />}>Upload files</Menu.Item>
    </Menu.Root>
  );
}
