import { useState } from 'react';
import { Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

const rowsFor = (open: boolean): TreeItem[] =>
  [
    {
      id: 'eng',
      depth: 0,
      label: 'Engineering',
      icon: <FolderOpen />,
      expandable: true,
      expanded: open,
    },
    {
      id: 'eng/checklist.md',
      depth: 1,
      label: 'Release checklist.md',
      icon: <Description />,
      description: 'Shared',
    },
    {
      id: 'eng/roadmap.md',
      depth: 1,
      label: 'Roadmap.md',
      icon: <Description />,
      description: 'Draft',
    },
  ].filter((row) => open || row.depth === 0);

export default function NarrowTree() {
  const [open, setOpen] = useState(true);
  return (
    // The tree fills its parent's height and scrolls itself.
    <div style={{ blockSize: '7rem' }}>
      <Tree
        aria-label="Files"
        items={rowsFor(open)}
        onAction={(row) => row.id === 'eng' && setOpen(!open)}
        onExpandedChange={(row, expanded) => row.id === 'eng' && setOpen(expanded)}
      />
    </div>
  );
}
