import { useState } from 'react';
import { CounterBadge, IconButton, Menu, Stack, Text } from '@envsemble/envui';
import { Comment } from '@envsemble/envui/icons/Comment';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Download } from '@envsemble/envui/icons/Download';
import { Edit } from '@envsemble/envui/icons/Edit';
import { FileCopy } from '@envsemble/envui/icons/FileCopy';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

export default function IconsAndShortcuts() {
  const [lastAction, setLastAction] = useState('');
  return (
    <Stack align="start">
      <Menu.Root
        aria-label="Report actions"
        align="start"
        trigger={<IconButton icon={<MoreVert />} aria-label="More actions" />}
      >
        <Menu.Item icon={<Edit />} shortcut="F2" onClick={() => setLastAction('Rename')}>
          Rename
        </Menu.Item>
        <Menu.Item icon={<FileCopy />} shortcut="Ctrl+D" onClick={() => setLastAction('Duplicate')}>
          Duplicate
        </Menu.Item>
        <Menu.Item
          icon={<Comment />}
          trailing={<CounterBadge value={3} aria-label="3 unresolved" />}
          onClick={() => setLastAction('Show comments')}
        >
          Show comments
        </Menu.Item>
        <Menu.Item icon={<Download />} description="Available once the report is final" disabled>
          Download PDF
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<Delete />} shortcut="Del" onClick={() => setLastAction('Delete')}>
          Delete
        </Menu.Item>
      </Menu.Root>
      <Text variant="supporting" role="status">
        {lastAction && `Chose ${lastAction}`}
      </Text>
    </Stack>
  );
}
