import { useState } from 'react';
import { Tree, type TreeItem } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolderOpen } from '@envsemble/envui/icons/FolderOpen';

const rowsFor = (open: boolean): TreeItem[] =>
  [
    {
      value: 'eng',
      depth: 0,
      label: 'Engineering',
      icon: <IconFolderOpen />,
      expandable: true,
      expanded: open,
    },
    {
      value: 'eng/checklist.md',
      depth: 1,
      label: 'Release checklist.md',
      icon: <IconDescription />,
      description: 'Shared',
    },
    {
      value: 'eng/roadmap.md',
      depth: 1,
      label: 'Roadmap.md',
      icon: <IconDescription />,
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
        onAction={(row) => row.value === 'eng' && setOpen(!open)}
        onExpandedChange={(row, expanded) => row.value === 'eng' && setOpen(expanded)}
      />
    </div>
  );
}
