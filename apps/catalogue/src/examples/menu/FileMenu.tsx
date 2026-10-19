import { useState } from 'react';
import { Button, Menu } from '@envsemble/envui';
import { History } from '@envsemble/envui/icons/History';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { Print } from '@envsemble/envui/icons/Print';
import { Save } from '@envsemble/envui/icons/Save';

const recentDocuments = ['Quarterly report', 'Meeting notes', 'Budget'];

export default function FileMenu() {
  const [wordWrap, setWordWrap] = useState(true);
  const [theme, setTheme] = useState('system');
  return (
    <Menu.Root
      aria-label="Document"
      align="start"
      trigger={<Button variant="secondary">Document</Button>}
    >
      <Menu.Item icon={<NoteAdd />} shortcut="Ctrl+N">
        New document
      </Menu.Item>
      <Menu.Submenu label="Open recent" icon={<History />}>
        {recentDocuments.map((name) => (
          <Menu.Item key={name}>{name}</Menu.Item>
        ))}
        <Menu.Separator />
        <Menu.Item>Clear recent</Menu.Item>
      </Menu.Submenu>
      <Menu.Item icon={<Save />} shortcut="Ctrl+S">
        Save
      </Menu.Item>
      <Menu.Item icon={<Print />} shortcut="Ctrl+P">
        Print
      </Menu.Item>
      <Menu.Separator />
      <Menu.Group label="View">
        <Menu.CheckboxItem checked={wordWrap} onCheckedChange={setWordWrap} shortcut="Alt+Z">
          Word wrap
        </Menu.CheckboxItem>
        <Menu.Submenu label="Theme">
          <Menu.RadioGroup value={theme} onValueChange={setTheme}>
            <Menu.RadioItem value="light">Light</Menu.RadioItem>
            <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
            <Menu.RadioItem value="system">System</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Submenu>
      </Menu.Group>
    </Menu.Root>
  );
}
