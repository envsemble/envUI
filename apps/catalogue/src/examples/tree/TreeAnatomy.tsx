import { CounterBadge, Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

const rows: TreeItem[] = [
  {
    id: 'design',
    depth: 0,
    label: 'Design',
    icon: <FolderOpen />,
    expandable: true,
    expanded: true,
    end: <CounterBadge value={2} aria-label="2 unread" />,
  },
  {
    id: 'design/brand.md',
    depth: 1,
    label: 'Brand.md',
    icon: <Description />,
    description: 'Draft',
  },
];

export default function TreeAnatomy() {
  return (
    <div style={{ blockSize: '5rem', inlineSize: 'min(100%, 18rem)' }}>
      <Tree aria-label="Files" items={rows} />
    </div>
  );
}
