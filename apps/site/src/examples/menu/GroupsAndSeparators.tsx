import { Button, Menu } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconCreateNewFolder } from '@envsemble/envui/icons/CreateNewFolder';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconNoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconUpload } from '@envsemble/envui/icons/Upload';

export default function GroupsAndSeparators() {
  return (
    <Menu.Root
      aria-label="New"
      align="start"
      defaultOpen
      trigger={<Button start={<IconAdd />}>New</Button>}
    >
      <Menu.Group label="Documents">
        <Menu.Item start={<IconNoteAdd />}>Blank document</Menu.Item>
        <Menu.Item start={<IconDescription />}>From a template</Menu.Item>
      </Menu.Group>
      <Menu.Group label="Folders">
        <Menu.Item start={<IconCreateNewFolder />}>Folder</Menu.Item>
        <Menu.Item start={<IconFolder />} description="Everyone in Northwind can open it">
          Shared folder
        </Menu.Item>
      </Menu.Group>
      <Menu.Separator />
      <Menu.Item start={<IconUpload />}>Upload files</Menu.Item>
    </Menu.Root>
  );
}
