import { useState } from 'react';
import { Tree, type TreeItem } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconFolderOpen } from '@envsemble/envui/icons/FolderOpen';
import { usePointer, type PointerStep } from '../motion/Motion';

const row = (id: string) => `.env-tree-item[data-id="${id}"]`;
const chevron = (id: string) => `${row(id)} .env-tree-chevron`;

/*
 * Design collapsed by its chevron, Roadmap.md chosen in Engineering, which rises under it, and
 * Design expanded again and Brand.md chosen, as it began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: row('design/brand.md'), x: 0.6 },
  { wait: 200 },
  { to: chevron('design'), duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 700 },
  { to: row('engineering/roadmap.md'), x: 0.45, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { to: chevron('design'), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: row('design/brand.md'), x: 0.45, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

const files = [
  { id: 'design', label: 'Design', children: ['Brand.md', 'Research.md'] },
  { id: 'engineering', label: 'Engineering', children: ['Roadmap.md'] },
];

/** Two folders of files, both open, Brand.md chosen. */
export default function TreeTile() {
  const [closed, setClosed] = useState<ReadonlySet<string>>(new Set());
  const [selected, setSelected] = useState('design/brand.md');
  usePointer(script);
  const toggle = (id: string, open: boolean) =>
    setClosed((current) => {
      const next = new Set(current);
      if (open) next.delete(id);
      else next.add(id);
      return next;
    });
  const rows: TreeItem[] = files.flatMap((folder) => {
    const open = !closed.has(folder.id);
    const head: TreeItem = {
      value: folder.id,
      depth: 0,
      label: folder.label,
      icon: open ? <IconFolderOpen /> : <IconFolder />,
      expandable: true,
      expanded: open,
    };
    if (!open) return [head];
    return [
      head,
      ...folder.children.map((name) => ({
        value: `${folder.id}/${name.toLowerCase()}`,
        depth: 1,
        label: name,
        icon: <IconDescription />,
      })),
    ];
  });
  return (
    <div style={{ blockSize: '9rem', inlineSize: '11rem' }}>
      <Tree
        aria-label="Files"
        items={rows}
        value={selected}
        onAction={(item) =>
          item.expandable ? toggle(item.value, !item.expanded) : setSelected(item.value)
        }
        onExpandedChange={(item, open) => toggle(item.value, open)}
      />
    </div>
  );
}
