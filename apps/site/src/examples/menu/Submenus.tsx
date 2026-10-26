import { useState } from 'react';
import { Button, Menu, Column, Text } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { Link } from '@envsemble/envui/icons/Link';
import { Send } from '@envsemble/envui/icons/Send';
import { Share } from '@envsemble/envui/icons/Share';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];
const formats = ['PDF', 'Word document', 'Markdown'];

export default function Submenus() {
  const [lastAction, setLastAction] = useState('');
  return (
    <Column gap={4} align="start">
      <Menu.Root
        aria-label="Share"
        align="start"
        trigger={
          <Button variant="secondary" startIcon={<Share />}>
            Share
          </Button>
        }
      >
        <Menu.Item icon={<Link />} onClick={() => setLastAction('Copied the link')}>
          Copy link
        </Menu.Item>
        <Menu.Submenu label="Send to" icon={<Send />}>
          {people.map((person) => (
            <Menu.Item key={person} onClick={() => setLastAction(`Sent to ${person}`)}>
              {person}
            </Menu.Item>
          ))}
        </Menu.Submenu>
        <Menu.Submenu label="Export as" icon={<Download />}>
          {formats.map((format) => (
            <Menu.Item key={format} onClick={() => setLastAction(`Exported as ${format}`)}>
              {format}
            </Menu.Item>
          ))}
        </Menu.Submenu>
      </Menu.Root>
      <Text variant="body-sm" role="status">
        {lastAction}
      </Text>
    </Column>
  );
}
