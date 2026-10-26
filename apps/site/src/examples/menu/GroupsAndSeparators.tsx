import { Button, Menu } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { CreateNewFolder } from '@envsemble/envui/icons/CreateNewFolder';
import { Folder } from '@envsemble/envui/icons/Folder';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { Description } from '@envsemble/envui/icons/Description';
import { Upload } from '@envsemble/envui/icons/Upload';

export default function GroupsAndSeparators() {
  return (
    <Menu.Root
      aria-label="New"
      align="start"
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<Button startIcon={<Add />}>New</Button>}
    >
      <Menu.Group label="Documents">
        <Menu.Item icon={<NoteAdd />}>Blank document</Menu.Item>
        <Menu.Item icon={<Description />}>From a template</Menu.Item>
      </Menu.Group>
      <Menu.Group label="Folders">
        <Menu.Item icon={<CreateNewFolder />}>Folder</Menu.Item>
        <Menu.Item icon={<Folder />} description="Everyone in Northwind can open it">
          Shared folder
        </Menu.Item>
      </Menu.Group>
      <Menu.Separator />
      <Menu.Item icon={<Upload />}>Upload files</Menu.Item>
    </Menu.Root>
  );
}
