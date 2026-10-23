import { useMemo, useState } from 'react';
import { Button, Column, Row, Text, Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';

/** 50 folders of 200 logs each: over 10,000 rows when every folder is open. */
const folders = Array.from({ length: 50 }, (_, index) => `Week ${index + 1}`);
const logsPerFolder = 200;

export default function ThousandsOfRows() {
  const [expanded, setExpanded] = useState(() => new Set(['Week 1']));
  const [selected, setSelected] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      folders.flatMap((folder) => {
        const open = expanded.has(folder);
        const row: TreeItem = {
          id: folder,
          depth: 0,
          label: folder,
          icon: <Folder />,
          expandable: true,
          expanded: open,
        };
        if (!open) return [row];
        const logs: TreeItem[] = Array.from({ length: logsPerFolder }, (_, index) => ({
          id: `${folder}/${index + 1}`,
          depth: 1,
          label: `Build ${index + 1}.log`,
          icon: <Description />,
        }));
        return [row, ...logs];
      }),
    [expanded],
  );
  const setFolder = (folder: string, open: boolean) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (open) next.add(folder);
      else next.delete(folder);
      return next;
    });
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Row wrap align="center" gap={4}>
        <Button variant="secondary" onClick={() => setExpanded(new Set(folders))}>
          Expand all
        </Button>
        <Button variant="secondary" onClick={() => setExpanded(new Set())}>
          Collapse all
        </Button>
      </Row>
      {/* The tree fills its parent's height and scrolls itself. */}
      <div style={{ blockSize: '16rem' }}>
        <Tree
          aria-label="Build logs"
          items={rows}
          value={selected}
          onAction={(row) =>
            row.expandable ? setFolder(row.id, !row.expanded) : setSelected(row.id)
          }
          onExpandedChange={(row, open) => setFolder(row.id, open)}
        />
      </div>
      <Text variant="caption">{rows.length.toLocaleString('en')} visible rows</Text>
    </Column>
  );
}
