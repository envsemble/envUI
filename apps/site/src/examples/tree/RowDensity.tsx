import { useMemo, useState } from 'react';
import { Tree, type TreeItem, type TreeProps, Badge } from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSend } from '@envsemble/envui/icons/Send';

interface Mailbox extends TreeItem {
  parent?: string;
}

const mailboxes: Mailbox[] = [
  {
    value: 'inbox',
    depth: 0,
    label: 'Inbox',
    start: <IconInbox />,
    end: <Badge count={12} aria-label="12 unread" />,
  },
  { value: 'clients', depth: 0, label: 'Clients', start: <IconFolder />, expandable: true },
  {
    value: 'clients/northwind',
    parent: 'clients',
    depth: 1,
    label: 'Northwind',
    start: <IconFolder />,
    description: 'Shared with 4',
    end: <Badge count={3} aria-label="3 unread" />,
  },
  {
    value: 'clients/example',
    parent: 'clients',
    depth: 1,
    label: 'Example Inc.',
    start: <IconFolder />,
  },
  { value: 'sent', depth: 0, label: 'Sent', start: <IconSend /> },
  {
    value: 'archive',
    depth: 0,
    label: 'Archive',
    start: <IconArchive />,
    description: 'Offline',
    disabled: true,
  },
];

export default function RowDensity({ density = 'md' }: Pick<TreeProps<TreeItem>, 'density'>) {
  const [clientsOpen, setClientsOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>('inbox');
  const visibleRows = useMemo(
    () =>
      mailboxes
        .filter((mailbox) => mailbox.parent !== 'clients' || clientsOpen)
        .map((mailbox) => (mailbox.expandable ? { ...mailbox, expanded: clientsOpen } : mailbox)),
    [clientsOpen],
  );
  return (
    <div style={{ blockSize: '16.5rem', inlineSize: 'min(100%, 20rem)' }}>
      <Tree
        aria-label="Mailboxes"
        density={density}
        items={visibleRows}
        value={selected}
        onAction={(row) =>
          row.expandable ? setClientsOpen(!row.expanded) : setSelected(row.value)
        }
        onExpandedChange={(_, open) => setClientsOpen(open)}
      />
    </div>
  );
}
