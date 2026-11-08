import { useMemo, useState } from 'react';
import { Column, Text, Tree, type TreeItem } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconFolderOpen } from '@envsemble/envui/icons/FolderOpen';
import { Example } from '../../figures/Example';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

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
    ],
  },
  {
    path: 'engineering',
    name: 'Engineering',
    children: [
      { path: 'engineering/architecture.md', name: 'Architecture.md' },
      { path: 'engineering/roadmap.md', name: 'Roadmap.md' },
    ],
  },
  { path: 'finance', name: 'Finance', children: [] },
];

const row = (id: string) => `.env-tree-item[data-id="${id}"]`;
const logo = row('design/brand/logo.md');

/*
 * The pointer clicks Logo.md: it is previewed, as the line below says. A double click opens it to
 * keep. Then the pointer opens Engineering by its chevron, and the tree starts anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: logo, x: 0.3, y: 6 },
  { to: logo, x: 0.3, y: 0.5, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1500 },
  { doubleClick: true },
  { wait: 1500 },
  { to: `${row('engineering')} .env-tree-chevron`, duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 1300 },
  { leave: true },
  { wait: 700 },
  { cue: 'renew' },
  { wait: 600 },
];

function Files() {
  const [expanded, setExpanded] = useState(() => new Set(['design', 'design/brand']));
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState('Nothing open');
  const rows = useMemo(() => {
    const visible: TreeItem[] = [];
    const visit = (nodes: FileNode[], depth: number) => {
      for (const node of nodes) {
        const open = expanded.has(node.path);
        visible.push({
          value: node.path,
          depth,
          label: node.name,
          expandable: Boolean(node.children),
          expanded: open,
          icon: node.children ? open ? <IconFolderOpen /> : <IconFolder /> : <IconDescription />,
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
    <Column gap={3} style={{ inlineSize: 'min(100%, 18rem)' }}>
      <div style={{ blockSize: '14rem' }}>
        <Tree
          aria-label="Files"
          items={rows}
          value={selected}
          onAction={(item, { preview }) => {
            if (item.expandable) return setFolder(item.value, !item.expanded);
            setSelected(item.value);
            setStatus(`${preview ? 'Previewing' : 'Opened'} ${String(item.label)}`);
          }}
          onExpandedChange={(item, open) => setFolder(item.value, open)}
        />
      </div>
      <Text variant="body-sm" emphasis="muted">
        {status}
      </Text>
    </Column>
  );
}

function Opening() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <Files />
    </Renew>
  );
}

/** A file previewed by a click and opened by a double click, and a folder opened by its chevron. */
// eslint-disable-next-line no-restricted-syntax -- previewing is the tree's own word, its action's `preview`
export default function OpeningAndPreviewing() {
  return (
    <Example size="wide">
      <MotionStage label="a click previewing and a double click opening">
        <Opening />
      </MotionStage>
    </Example>
  );
}
