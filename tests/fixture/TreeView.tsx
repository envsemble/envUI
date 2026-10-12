import { useMemo, useState } from 'react';
import {
  MenuItem,
  MenuSeparator,
  Theme,
  Tree,
  type ThemeValue,
  type TreeItem,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';

interface FileNode {
  id: string;
  name: string;
  children?: FileNode[];
}

/** 40 folders of 30 documents, with a nested folder in the first: over 1,200 rows when expanded. */
function sampleFiles(): FileNode[] {
  return Array.from({ length: 40 }, (_, folder) => ({
    id: `folder-${folder + 1}`,
    name: `Folder ${String(folder + 1).padStart(2, '0')}`,
    children: [
      ...(folder === 0
        ? [
            {
              id: 'folder-1/nested',
              name: 'Nested',
              children: [{ id: 'folder-1/nested/deep.md', name: 'Deep.md' }],
            },
          ]
        : []),
      ...Array.from({ length: 30 }, (_, file) => ({
        id: `folder-${folder + 1}/doc-${file + 1}.md`,
        name: `Doc ${file + 1}.md`,
      })),
    ],
  }));
}

interface FileRow extends TreeItem {
  node: FileNode;
}

function flatten(nodes: FileNode[], expanded: Set<string>, depth = 0, rows: FileRow[] = []) {
  for (const node of nodes) {
    const isOpen = expanded.has(node.id);
    rows.push({
      id: node.id,
      depth,
      node,
      expandable: Boolean(node.children),
      expanded: node.children ? isOpen : undefined,
      label: node.name,
      icon: node.children ? <Folder /> : <Description />,
      detail: node.id === 'folder-1/doc-4.md' ? 'In progress' : undefined,
      title: node.id,
      disabled: node.id === 'folder-1/doc-6.md',
    });
    if (node.children && isOpen) flatten(node.children, expanded, depth + 1, rows);
  }
  return rows;
}

export function TreeFixture({ theme }: { theme: ThemeValue }) {
  const files = useMemo(sampleFiles, []);
  const [expanded, setExpanded] = useState(() => new Set(['folder-1', 'folder-2']));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const rows = useMemo(() => flatten(files, expanded), [files, expanded]);
  const record = (entry: string) => setLog((current) => [...current.slice(-4), entry]);
  return (
    <Theme theme={theme} data-testid={`tree-${theme}`} className="fixture-section">
      <div className="fixture-tree-frame">
        <Tree
          aria-label={`Files ${theme}`}
          items={rows}
          selectedId={selectedId}
          onOpen={(item, { preview }) => {
            setSelectedId(item.id);
            record(`${preview ? 'preview' : 'open'} ${item.id}`);
          }}
          onExpandedChange={(item, open) => {
            setExpanded((current) => {
              const next = new Set(current);
              if (open) next.add(item.id);
              else next.delete(item.id);
              return next;
            });
            record(`${open ? 'expand' : 'collapse'} ${item.id}`);
          }}
          contextMenu={(item) =>
            item ? (
              <>
                <MenuItem onClick={() => record(`rename ${item.id}`)}>
                  Rename {item.node.name}
                </MenuItem>
                <MenuSeparator />
                <MenuItem onClick={() => record(`delete ${item.id}`)}>Delete</MenuItem>
              </>
            ) : (
              <MenuItem onClick={() => record('new file')}>New file</MenuItem>
            )
          }
        />
      </div>
      <div className="fixture-actions">
        <button type="button" onClick={() => setSelectedId('folder-2/doc-25.md')}>
          Select a distant document
        </button>
        <button
          type="button"
          onClick={() =>
            setExpanded(new Set([...files.map((folder) => folder.id), 'folder-1/nested']))
          }
        >
          Expand all
        </button>
      </div>
      <output data-testid={`tree-log-${theme}`}>{log.join('\n')}</output>
    </Theme>
  );
}
