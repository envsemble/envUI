import { Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

// The same icon on folders and documents: only the chevrons tell them apart.
const rows: TreeItem[] = [
  {
    id: 'design',
    depth: 0,
    label: 'Design',
    icon: <Description />,
    expandable: true,
    expanded: true,
  },
  { id: 'design/brand.md', depth: 1, label: 'Brand.md', icon: <Description /> },
  { id: 'design/research.md', depth: 1, label: 'Research.md', icon: <Description /> },
  { id: 'finance', depth: 0, label: 'Finance', icon: <Description />, expandable: true },
];

export default function OneIconForAll() {
  return (
    <div style={{ blockSize: '9rem', inlineSize: 'min(100%, 16rem)' }}>
      <Tree aria-label="Files" items={rows} />
    </div>
  );
}
