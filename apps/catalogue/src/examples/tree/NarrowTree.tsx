import { Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

const rows: TreeItem[] = [
  {
    id: 'eng',
    depth: 0,
    label: 'Engineering',
    icon: <FolderOpen />,
    expandable: true,
    expanded: true,
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
];

export default function NarrowTree() {
  return (
    // The tree fills its parent's height and scrolls itself.
    <div style={{ blockSize: '7rem' }}>
      <Tree aria-label="Files" items={rows} />
    </div>
  );
}
