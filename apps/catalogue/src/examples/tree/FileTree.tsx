import { useMemo, useState } from 'react';
import { Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

interface FileNode {
  path: string;
  name: string;
  children?: FileNode[];
}

const files: FileNode[] = [
  {
    path: 'design',
    name: 'Design',
    children: [
      {
        path: 'design/brand',
        name: 'Brand',
        children: [
          { path: 'design/brand/colors.md', name: 'Colors.md' },
          { path: 'design/brand/logo.md', name: 'Logo.md' },
        ],
      },
      { path: 'design/research.md', name: 'Research.md' },
    ],
  },
  {
    path: 'engineering',
    name: 'Engineering',
    children: [
      { path: 'engineering/architecture.md', name: 'Architecture.md' },
      { path: 'engineering/release-checklist.md', name: 'Release checklist.md' },
      { path: 'engineering/roadmap.md', name: 'Roadmap.md' },
    ],
  },
  {
    path: 'finance',
    name: 'Finance',
    children: [
      { path: 'finance/budget.md', name: 'Budget.md' },
      { path: 'finance/invoices.md', name: 'Invoices.md' },
    ],
  },
  { path: 'readme.md', name: 'Readme.md' },
];

export default function FileTree() {
  const [expanded, setExpanded] = useState(() => new Set(['design', 'design/brand']));
  const [selected, setSelected] = useState<string | null>('design/brand/colors.md');
  // The visible rows in order: an expanded folder is followed by its children.
  const rows = useMemo(() => {
    const visible: TreeItem[] = [];
    const visit = (nodes: FileNode[], depth: number) => {
      for (const node of nodes) {
        const open = expanded.has(node.path);
        visible.push({
          id: node.path,
          depth,
          label: node.name,
          expandable: Boolean(node.children),
          expanded: open,
          icon: node.children ? open ? <FolderOpen /> : <Folder /> : <Description />,
          title: node.path,
        });
        if (node.children && open) visit(node.children, depth + 1);
      }
    };
    visit(files, 0);
    return visible;
  }, [expanded]);
  const setFolder = (path: string, open: boolean) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (open) next.add(path);
      else next.delete(path);
      return next;
    });
  return (
    // The tree fills its parent's height and scrolls itself.
    <div style={{ blockSize: '15rem', inlineSize: 'min(100%, 20rem)' }}>
      <Tree
        aria-label="Files"
        items={rows}
        value={selected}
        onAction={(row) =>
          row.expandable ? setFolder(row.id, !row.expanded) : setSelected(row.id)
        }
        onExpandedChange={(row, open) => setFolder(row.id, open)}
      />
    </div>
  );
}
