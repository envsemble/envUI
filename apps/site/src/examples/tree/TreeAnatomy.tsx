import { useState } from 'react';
import { Tree, type TreeItem, Badge } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolderOpen } from '@envsemble/envui/icons/FolderOpen';

const rowsFor = (open: boolean): TreeItem[] =>
  [
    {
      value: 'design',
      depth: 0,
      label: 'Design',
      icon: <IconFolderOpen />,
      expandable: true,
      expanded: open,
      end: <Badge count={2} aria-label="2 unread" />,
    },
    {
      value: 'design/brand.md',
      depth: 1,
      label: 'Brand.md',
      icon: <IconDescription />,
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
        onAction={(row) => row.value === 'design' && setOpen(!open)}
        onExpandedChange={(row, expanded) => row.value === 'design' && setOpen(expanded)}
      />
    </div>
  );
}
