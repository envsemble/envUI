import { useState } from 'react';
import { Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

// Full paths as labels: they repeat the folder and are cut short before the name.
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
    { id: 'design/brand.md', depth: 1, label: 'Workspace/Design/Brand.md', icon: <Description /> },
    {
      id: 'design/research.md',
      depth: 1,
      label: 'Workspace/Design/Research.md',
      icon: <Description />,
    },
  ].filter((row) => open || row.depth === 0);

export default function PathsAsNames() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ blockSize: '7rem', inlineSize: 'min(100%, 16rem)' }}>
      <Tree
        aria-label="Files"
        items={rowsFor(open)}
        onAction={(row) => row.id === 'design' && setOpen(!open)}
        onExpandedChange={(row, expanded) => row.id === 'design' && setOpen(expanded)}
      />
    </div>
  );
}
