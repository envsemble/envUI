import { useMemo, useState } from 'react';
import {
  Button,
  DocumentTabs,
  Menu,
  Surface,
  Text,
  Tree,
  type DocumentTab,
  type TreeItem,
  Kbd,
} from '@envsemble/envui';
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
function useSampleTree() {
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
        caption={
          <>
            <Kbd>↑</Kbd> and <Kbd>↓</Kbd> move, <Kbd>→</Kbd> and <Kbd>←</Kbd> expand and collapse,{' '}
            <Kbd>Enter</Kbd> opens and <Kbd>Space</Kbd> previews. Right-click a row, or press{' '}
            <Kbd keys={['Shift', 'F10']} />, for its actions.
          </>
        }
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
                  <Menu.Item
                    icon={<Edit />}
                    shortcut="F2"
                    onClick={() => setLastAction(`Rename ${item.name}`)}
                  >
                    Rename
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item icon={<Delete />} onClick={() => setLastAction(`Delete ${item.name}`)}>
                    Delete
                  </Menu.Item>
                </>
              ) : (
                <Menu.Item icon={<Add />} onClick={() => setLastAction('New document')}>
                  New document
                </Menu.Item>
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

const openDocuments: DocumentTab[] = [
  { id: 'plans/search/roadmap.md', label: 'Roadmap.md' },
  { id: 'plans/search/decisions.md', label: 'Decisions.md' },
  { id: 'research/sync/interviews.md', label: 'Interviews.md', preview: true },
  { id: 'releases/2026-10.md', label: 'October release notes and follow-ups.md' },
  { id: 'specifications/sharing.md', label: 'Sharing.md' },
].map((tab) => ({ ...tab, icon: <Description />, title: tab.id }));

export function DocumentTabsPreview() {
  const [tabs, setTabs] = useState(openDocuments);
  const [value, setValue] = useState<string | null>(openDocuments[0]!.id);
  const active = tabs.find((tab) => tab.id === value);
  return (
    <Preview>
      <Example
        title="Open documents"
        size="wide"
        caption={
          <>
            Click or use <Kbd>←</Kbd> and <Kbd>→</Kbd> to switch, double-click the italic preview
            tab to keep it, and close with the button, a middle click or <Kbd>Delete</Kbd>. Right
            click or <Kbd>Shift</Kbd>+<Kbd>F10</Kbd> to close one or all tabs from the menu.
          </>
        }
      >
        <Surface tone="pane" padding={0} className="docs-document-tabs">
          <DocumentTabs
            aria-label="Open documents"
            items={tabs}
            value={value}
            panelId="docs-document-panel"
            onValueChange={setValue}
            onClose={(id) => {
              const index = tabs.findIndex((tab) => tab.id === id);
              const remaining = tabs.filter((tab) => tab.id !== id);
              setTabs(remaining);
              if (id === value)
                setValue(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
            }}
            onCloseAll={() => {
              setTabs([]);
              setValue(null);
            }}
            onPin={(id) =>
              setTabs((current) =>
                current.map((tab) => (tab.id === id ? { ...tab, preview: false } : tab)),
              )
            }
          />
          <div id="docs-document-panel" role="tabpanel" className="docs-document-panel">
            {active ? (
              <Text tone="muted">{active.title}</Text>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setTabs(openDocuments);
                  setValue(openDocuments[0]!.id);
                }}
              >
                Reopen the sample documents
              </Button>
            )}
          </div>
        </Surface>
      </Example>
    </Preview>
  );
}
