import { useMemo, useState } from 'react';
import { CounterBadge, Tree, type TreeItem } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Send } from '@envsemble/envui/icons/Send';

interface Mailbox extends TreeItem {
  parent?: string;
}

const mailboxes: Mailbox[] = [
  {
    id: 'inbox',
    depth: 0,
    label: 'Inbox',
    icon: <Inbox />,
    end: <CounterBadge value={12} aria-label="12 unread" />,
  },
  { id: 'clients', depth: 0, label: 'Clients', icon: <Folder />, expandable: true },
  {
    id: 'clients/northwind',
    parent: 'clients',
    depth: 1,
    label: 'Northwind',
    icon: <Folder />,
    description: 'Shared',
    end: <CounterBadge value={3} aria-label="3 unread" />,
  },
  { id: 'clients/example', parent: 'clients', depth: 1, label: 'Example Inc.', icon: <Folder /> },
  { id: 'sent', depth: 0, label: 'Sent', icon: <Send /> },
  {
    id: 'archive',
    depth: 0,
    label: 'Archive',
    icon: <Archive />,
    description: 'Offline',
    disabled: true,
  },
];

export default function RowDensity() {
  const [clientsOpen, setClientsOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>('inbox');
  // A collapsed folder leaves its children out of the visible rows.
  const rows = useMemo(
    () =>
      mailboxes
        .filter((mailbox) => mailbox.parent !== 'clients' || clientsOpen)
        .map((mailbox) => (mailbox.expandable ? { ...mailbox, expanded: clientsOpen } : mailbox)),
    [clientsOpen],
  );
  return (
    // The tree fills its parent's height and scrolls itself.
    <div style={{ blockSize: '15rem', inlineSize: 'min(100%, 20rem)' }}>
      <Tree
        aria-label="Mailboxes"
        density="md"
        items={rows}
        value={selected}
        onAction={(row) => (row.expandable ? setClientsOpen(!row.expanded) : setSelected(row.id))}
        onExpandedChange={(_, open) => setClientsOpen(open)}
      />
    </div>
  );
}
