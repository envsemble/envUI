import { useState } from 'react';
import { IconButton, Menu, Column, Text, Badge } from '@envsemble/envui';
import { IconComment } from '@envsemble/envui/icons/Comment';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconFileCopy } from '@envsemble/envui/icons/FileCopy';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';

export default function IconsAndShortcuts() {
  const [lastAction, setLastAction] = useState('');
  return (
    <Column gap={4} align="start">
      <Menu.Root
        aria-label="Report actions"
        align="start"
        trigger={<IconButton icon={<IconMoreVert />} aria-label="More actions" />}
      >
        <Menu.Item icon={<IconEdit />} shortcut="F2" onClick={() => setLastAction('Rename')}>
          Rename
        </Menu.Item>
        <Menu.Item
          icon={<IconFileCopy />}
          shortcut="Ctrl+D"
          onClick={() => setLastAction('Duplicate')}
        >
          Duplicate
        </Menu.Item>
        <Menu.Item
          icon={<IconComment />}
          end={<Badge count={3} aria-label="3 unresolved" />}
          onClick={() => setLastAction('Show comments')}
        >
          Show comments
        </Menu.Item>
        <Menu.Item
          icon={<IconDownload />}
          description="Available once the report is final"
          disabled
        >
          Download PDF
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          icon={<IconDelete />}
          tone="danger"
          shortcut="Del"
          onClick={() => setLastAction('Delete')}
        >
          Delete
        </Menu.Item>
      </Menu.Root>
      <Text variant="body-sm" role="status">
        {lastAction && `Chose ${lastAction}`}
      </Text>
    </Column>
  );
}
