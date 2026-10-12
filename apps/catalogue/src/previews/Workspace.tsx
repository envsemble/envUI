import { useMemo, useState } from 'react';
import { MenuItem, MenuSeparator, Text, Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Add } from '@envsemble/envui/icons/Add';
import { Example } from './Example';
import { Preview } from './Preview';

interface SampleNode {
  id: string;
  name: string;
  children?: SampleNode[];
}

const areas = ['Decisions', 'Plans', 'Research', 'Releases', 'Retrospectives', 'Specifications'];
const topics = ['Billing', 'Catalogue', 'Onboarding', 'Search', 'Sharing', 'Sync'];

/** A few hundred generated planning documents in nested folders. */
function sampleTree(): SampleNode[] {
  return areas.map((area) => ({
    id: area,
    name: area,
    children: topics.map((topic) => ({
      id: `${area}/${topic}`,
      name: topic,
      children: Array.from({ length: 8 }, (_, index) => ({
        id: `${area}/${topic}/${index + 1}`,
        name: `${topic} ${area.toLowerCase()} ${index + 1}.md`,
      })),
    })),
  }));
}

export interface SampleRow extends TreeItem {
  name: string;
}

/** Sample expansion and selection, owned by the application as Tree expects. */
export function useSampleTree() {
  const tree = useMemo(sampleTree, []);
  const [expanded, setExpanded] = useState(() => new Set(['Plans', 'Plans/Search']));
  const [selectedId, setSelectedId] = useState<string | null>('Plans/Search/2');
  const items = useMemo(() => {
    const rows: SampleRow[] = [];
    const visit = (nodes: SampleNode[], depth: number) => {
      for (const node of nodes) {
        const open = expanded.has(node.id);
        rows.push({
          id: node.id,
          name: node.name,
          depth,
          label: node.name,
          expandable: Boolean(node.children),
          expanded: open,
          icon: node.children ? open ? <FolderOpen /> : <Folder /> : <Description />,
          detail: node.id.endsWith('/1') ? 'Draft' : undefined,
          title: node.id,
        });
        if (node.children && open) visit(node.children, depth + 1);
      }
    };
    visit(tree, 0);
    return rows;
  }, [tree, expanded]);
  return {
    items,
    selectedId,
    onOpen: (item: SampleRow) => {
      if (item.expandable)
        setExpanded((current) => {
          const next = new Set(current);
          if (next.has(item.id)) next.delete(item.id);
          else next.add(item.id);
          return next;
        });
      else setSelectedId(item.id);
    },
    onExpandedChange: (item: SampleRow, open: boolean) =>
      setExpanded((current) => {
        const next = new Set(current);
        if (open) next.add(item.id);
        else next.delete(item.id);
        return next;
      }),
    expandAll: () =>
      setExpanded(
        new Set(tree.flatMap((area) => [area.id, ...(area.children ?? []).map((t) => t.id)])),
      ),
  };
}

export function TreePreview() {
  const sample = useSampleTree();
  const [lastAction, setLastAction] = useState('');
  return (
    <Preview>
      <Example
        title="File tree"
        size="wide"
        caption="Arrow keys move, Right and Left expand and collapse, Enter opens and Space previews. Right-click a row, or press Shift+F10, for its actions."
      >
        <div className="docs-tree-frame">
          <Tree
            aria-label="Planning documents"
            items={sample.items}
            selectedId={sample.selectedId}
            onOpen={(item, { preview }) => {
              sample.onOpen(item);
              setLastAction(`${preview ? 'Previewed' : 'Opened'} ${item.name}`);
            }}
            onExpandedChange={sample.onExpandedChange}
            contextMenu={(item) =>
              item ? (
                <>
                  <MenuItem
                    icon={<Edit />}
                    shortcut="F2"
                    onClick={() => setLastAction(`Rename ${item.name}`)}
                  >
                    Rename
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem icon={<Delete />} onClick={() => setLastAction(`Delete ${item.name}`)}>
                    Delete
                  </MenuItem>
                </>
              ) : (
                <MenuItem icon={<Add />} onClick={() => setLastAction('New document')}>
                  New document
                </MenuItem>
              )
            }
          />
        </div>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {lastAction || `${sample.items.length} visible rows`}
        </Text>
      </Example>
    </Preview>
  );
}
