import { useState } from 'react';
import { CounterBadge, Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

const rowsFor = (open: boolean): TreeItem[] =>
  [
    {
      id: 'design',
      depth: 0,
      label: 'Design',
      icon: <FolderOpen />,
      expandable: true,
      expanded: open,
      end: <CounterBadge value={2} aria-label="2 unread" />,
    },
    {
      id: 'design/brand.md',
      depth: 1,
      label: 'Brand.md',
      icon: <Description />,
      description: 'Draft',
    },
  ].filter((row) => open || row.depth === 0);

export default function TreeAnatomy() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ blockSize: '5rem', inlineSize: 'min(100%, 18rem)' }}>
      <Tree
        aria-label="Files"
        items={rowsFor(open)}
        onAction={(row) => row.id === 'design' && setOpen(!open)}
        onExpandedChange={(row, expanded) => row.id === 'design' && setOpen(expanded)}
      />
    </div>
  );
}
