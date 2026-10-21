import { useState } from 'react';
import { Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';
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
    },
    { id: 'design/brand.md', depth: 1, label: 'Brand.md', icon: <Description /> },
    { id: 'design/research.md', depth: 1, label: 'Research.md', icon: <Description /> },
    { id: 'finance', depth: 0, label: 'Finance', icon: <Folder />, expandable: true },
  ].filter((row) => open || row.depth === 0);

export default function TellKindsApart() {
  const [open, setOpen] = useState(true);
  return (
    // The tree fills its parent's height and scrolls itself.
    <div style={{ blockSize: '9rem', inlineSize: 'min(100%, 16rem)' }}>
      <Tree
        aria-label="Files"
        items={rowsFor(open)}
        onAction={(row) => row.id === 'design' && setOpen(!open)}
        onExpandedChange={(row, expanded) => row.id === 'design' && setOpen(expanded)}
      />
    </div>
  );
}
