import { Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

// Each row is named as its item is; the full path is the row's tooltip.
const rows: TreeItem[] = [
  {
    id: 'design',
    depth: 0,
    label: 'Design',
    icon: <FolderOpen />,
    expandable: true,
    expanded: true,
  },
  {
    id: 'design/brand.md',
    depth: 1,
    label: 'Brand.md',
    icon: <Description />,
    title: 'Design/Brand.md',
  },
  {
    id: 'design/research.md',
    depth: 1,
    label: 'Research.md',
    icon: <Description />,
    title: 'Design/Research.md',
  },
];

export default function NamesWithPathInTitle() {
  return (
    <div style={{ blockSize: '7rem', inlineSize: 'min(100%, 16rem)' }}>
      <Tree aria-label="Files" items={rows} />
    </div>
  );
}
