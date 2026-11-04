'use client';

// Dev mode's two sidebars: the nodes as a tree on one side of the 3D view, with dev mode's theme at
// its foot, and on the other the inspector, with the selected node in detail and the readout an
// agent reads. Each is resizable by its inner edge, with the grip of a resizable NavigationDrawer, and hides
// with the button in its header's outer corner.

import { Fragment, memo, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from '../../actions/Button.js';
import { CopyButton } from '../../actions/CopyButton.js';
import { Badge } from '../../content/Badge.js';
import * as DescriptionList from '../../content/DescriptionList.js';
import { Column, Grid, Row } from '../../foundations/Layout.js';
import { Surface } from '../../foundations/Surface.js';
import { Text } from '../../foundations/Text.js';
import { IconContrast } from '../../icons/Contrast.js';
import { IconDarkMode } from '../../icons/DarkMode.js';
import { IconLightMode } from '../../icons/LightMode.js';
import { ResizeHandle } from '../../internal/ResizeHandle.js';
import { useResizableWidth } from '../../internal/useResizableWidth.js';
import { remPixels } from '../../internal/lengths.js';
import * as Menu from '../../navigation/Menu.js';
import { Tabs } from '../../navigation/Tabs.js';
import { Tree, type TreeItem } from '../../navigation/Tree.js';
import type { NodeData } from '../model.js';
import { knownParts } from '../parts.js';
import { conditionHolds, queriesFor, thresholdsFor } from '../queries.js';
import { labelOf } from '../readout.js';
import { tokensUsedBy } from '../usedTokens.js';
import { toRem, windowClassOf } from '../units.js';
import { SidebarToggle, type Side } from './Controls.js';
import type { EditorTheme } from './editorTheme.js';
import { sideWidths } from './sides.js';
import type { LivePage } from './useLivePage.js';

/** The full measurement and its readout, which the sidebars show. */
type Full = NonNullable<LivePage['full']>;

/** The narrowest the 3D view gets as a sidebar widens, in rem. */
const viewLeast = 16;

/**
 * The widest a sidebar can be, in rem: all of dev mode's window but the other sidebar and the
 * narrowest view, so it widens well past half the window.
 */
function roomFor(handle: HTMLElement) {
  const sidebar = handle.closest('.env-dev-sidebar');
  const panel = handle.closest('.env-dev-panel');
  if (!sidebar || !panel) return Infinity;
  let others = 0;
  for (const other of Array.from(panel.querySelectorAll('.env-dev-sidebar')))
    if (other !== sidebar) others += other.getBoundingClientRect().width;
  const rem = remPixels(handle);
  return (panel.getBoundingClientRect().width - others) / rem - viewLeast;
}

/**
 * A sidebar: a flush, square pane on the navigation's background, as a NavigationDrawer is, resizable by its
 * inner edge with the same grip, keyboard and double click as a resizable NavigationDrawer's. It keeps its
 * width while it is dragged, rendering only itself, and hands it on once the drag ends.
 */
function Sidebar({
  side,
  label,
  defaultWidth,
  onWidthCommit,
  children,
}: {
  side: Side;
  label: string;
  /** The width it starts at, in rem, as it was last left. */
  defaultWidth: number;
  /** Receives its width in rem once a drag ends, a key moves it or a double click resets it. */
  onWidthCommit: (width: number) => void;
  children: ReactNode;
}) {
  const bounds = sideWidths[side];
  const [width, setWidth] = useState(defaultWidth);
  const resize = useResizableWidth({
    width,
    defaultWidth: bounds.default,
    minWidth: bounds.min,
    maxWidth: bounds.max,
    onWidthChange: (next, { committed }) => {
      setWidth(next);
      if (committed) onWidthCommit(next);
    },
    room: roomFor,
    // The inspector, at the window's end, grows as its handle moves toward the start.
    reverse: side === 'inspector',
    widthText: (text) => `${text} rem`,
  });
  return (
    <Surface
      background="default"
      radius="none"
      padding={0}
      render={<Column gap={0} align="stretch" render={<aside aria-label={label} />} />}
      className="env-dev-sidebar"
      data-side={side}
      style={{ '--env-dev-sidebar-width': `${resize.width}rem` } as CSSProperties}
    >
      {children}
      <ResizeHandle
        {...resize.handleProps}
        label={side === 'tree' ? 'Resize the nodes' : 'Resize the inspector'}
        grip
        className="env-dev-sidebar-resize"
      />
    </Surface>
  );
}

export interface NodeTreeProps {
  /** The full measurement, or null until the first one. */
  full: LivePage['full'];
  selected: number | null;
  onSelect: (key: number | null) => void;
  onTreeHover: (key: number | null) => void;
  /** The width it starts at, in rem. */
  defaultWidth: number;
  /** Receives its width in rem once people have resized it. */
  onWidthCommit: (width: number) => void;
  /** Hides the tree; the same button, left floating over the view, shows it again. */
  onHide: () => void;
  /** The theme of dev mode's own UI, chosen at the tree's foot; the page keeps its own. */
  editorTheme: { value: EditorTheme; onChange: (theme: EditorTheme) => void };
}

/** The nodes as a tree, in a sidebar of their own, with dev mode's theme at its foot. */
export const NodeTree = memo(function NodeTree({
  full,
  selected,
  onSelect,
  onTreeHover,
  defaultWidth,
  onWidthCommit,
  onHide,
  editorTheme,
}: NodeTreeProps) {
  const problemCount = full?.reading.problems.length ?? 0;
  return (
    <Sidebar
      side="tree"
      label="Layout nodes"
      defaultWidth={defaultWidth}
      onWidthCommit={onWidthCommit}
    >
      <Row gap={2} align="center" className="env-dev-sidebar-head">
        <SidebarToggle side="tree" shown onClick={onHide} />
        <Text variant="title" render={<h2 />}>
          Nodes
        </Text>
        {problemCount ? (
          <Badge tone="danger" variant="soft">
            {problemCount} {problemCount === 1 ? 'problem' : 'problems'}
          </Badge>
        ) : null}
      </Row>
      {full ? (
        <Nodes full={full} selected={selected} onSelect={onSelect} onTreeHover={onTreeHover} />
      ) : (
        <Text variant="body-sm" className="env-dev-sidebar-note">
          Measuring…
        </Text>
      )}
      <Row align="center" className="env-dev-sidebar-foot">
        <EditorThemeMenu {...editorTheme} />
      </Row>
    </Sidebar>
  );
});

const themeIcons: Record<EditorTheme['theme'], ReactNode> = {
  page: <IconContrast />,
  light: <IconLightMode />,
  dark: <IconDarkMode />,
};

/** The theme of dev mode's own UI: the page's, light or dark, with or without high contrast. */
function EditorThemeMenu({
  value,
  onChange,
}: {
  value: EditorTheme;
  onChange: (theme: EditorTheme) => void;
}) {
  return (
    <Menu.Root
      aria-label="Dev mode theme"
      side="top"
      align="start"
      trigger={
        <Button variant="ghost" size="sm" startIcon={themeIcons[value.theme]}>
          Dev mode theme
        </Button>
      }
    >
      <Menu.RadioGroup
        label="Dev mode theme"
        value={value.theme}
        onValueChange={(theme) => onChange({ ...value, theme: theme as EditorTheme['theme'] })}
      >
        <Menu.RadioItem value="page" icon={<IconContrast />} description="As the page is now">
          Same as the page
        </Menu.RadioItem>
        <Menu.RadioItem value="light" icon={<IconLightMode />}>
          Light
        </Menu.RadioItem>
        <Menu.RadioItem value="dark" icon={<IconDarkMode />}>
          Dark
        </Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Separator />
      <Menu.CheckboxItem
        checked={value.contrast === 'high'}
        onCheckedChange={(high) => onChange({ ...value, contrast: high ? 'high' : 'standard' })}
      >
        High contrast
      </Menu.CheckboxItem>
    </Menu.Root>
  );
}

export interface InspectorProps {
  /** The full measurement, or null until the first one. */
  full: LivePage['full'];
  selected: number | null;
  /** The width it starts at, in rem. */
  defaultWidth: number;
  /** Receives its width in rem once people have resized it. */
  onWidthCommit: (width: number) => void;
  /** Hides the inspector; the same button, left floating over the view, shows it again. */
  onHide: () => void;
}

/**
 * The selected node in detail, and the readout, in the sidebar across the view from the tree: two
 * tabs, beside the button that hides the inspector.
 */
export const Inspector = memo(function Inspector({
  full,
  selected,
  defaultWidth,
  onWidthCommit,
  onHide,
}: InspectorProps) {
  const [tab, setTab] = useState<string | null>('details');
  const current =
    full && selected !== null
      ? full.snapshot.nodes.find((node) => node.key === selected)
      : undefined;
  return (
    <Sidebar
      side="inspector"
      label="Dev mode inspector"
      defaultWidth={defaultWidth}
      onWidthCommit={onWidthCommit}
    >
      <Tabs
        aria-label="Inspector"
        size="sm"
        fill
        value={tab}
        onValueChange={setTab}
        className="env-dev-tabs"
        panelClassName="env-dev-tab-panel"
        renderList={(list) => (
          <Row gap={2} align="center" justify="between" className="env-dev-sidebar-head">
            {list}
            <SidebarToggle side="inspector" shown onClick={onHide} />
          </Row>
        )}
        items={[
          {
            value: 'details',
            button: <Button>Details</Button>,
            content:
              current && full ? (
                <Details key={current.key} full={full} node={current} />
              ) : (
                <Text variant="body-sm">Select a node in the tree or click its plane.</Text>
              ),
          },
          {
            value: 'readout',
            button: <Button>Readout</Button>,
            content: full ? (
              <Column gap={3}>
                <Text variant="body-sm">
                  What <code className="env-dev-code">envui.layout.describe()</code> returns. Try{' '}
                  <code className="env-dev-code">
                    envui.layout.at([&apos;22rem&apos;, &apos;40rem&apos;, &apos;60rem&apos;,
                    &apos;80rem&apos;])
                  </code>{' '}
                  in the console.
                </Text>
                <Row>
                  <CopyButton value={full.reading.text} variant="outline" size="sm">
                    Copy the readout
                  </CopyButton>
                </Row>
                <Readout text={full.reading.text} />
              </Column>
            ) : null,
          },
        ]}
      />
    </Sidebar>
  );
});

/**
 * The readout's text as it fits the sidebar: each line wraps within it, its continuation indented
 * under the line's own indent, so nothing runs past the edge and the nesting stays readable. The
 * text copied is the readout as it is.
 */
function Readout({ text }: { text: string }) {
  const lines = useMemo(
    () =>
      text.split('\n').map((line) => {
        const content = line.trimStart();
        return { indent: line.length - content.length, content };
      }),
    [text],
  );
  return (
    <pre className="env-dev-readout">
      {lines.map(({ indent, content }, index) => (
        <span
          key={index}
          className="env-dev-readout-line"
          style={{ '--env-dev-indent': indent } as CSSProperties}
        >
          {content || '\u00a0'}
          {'\n'}
        </span>
      ))}
    </pre>
  );
}

interface NodesProps {
  full: Full;
  selected: number | null;
  onSelect: (key: number | null) => void;
  onTreeHover: (key: number | null) => void;
}

function Nodes({ full, selected, onSelect, onTreeHover }: NodesProps) {
  const [collapsed, setCollapsed] = useState(() => new Set<number>());
  const { snapshot, problemsByKey } = full;
  const items = useMemo(() => {
    const rows: (TreeItem & { node: NodeData })[] = [];
    const visit = (node: NodeData, depth: number) => {
      const open = !collapsed.has(node.key);
      const problems = problemsByKey.get(node.key)?.length ?? 0;
      rows.push({
        value: String(node.key),
        depth,
        node,
        label: labelOf(node),
        // A hidden node's nodes are counted in its readout line, not listed.
        expandable: node.hidden === null && node.children.length > 0,
        expanded: open,
        description: node.hidden ?? undefined,
        tooltip: node.hidden ?? undefined,
        end: problems ? (
          <Badge tone="danger" variant="soft">
            {problems}
          </Badge>
        ) : node.container ? (
          <Badge variant="outline">container</Badge>
        ) : undefined,
      });
      if (open && node.hidden === null)
        for (const child of node.children) visit(snapshot.nodes[child], depth + 1);
    };
    for (const index of snapshot.tops) visit(snapshot.nodes[index], 0);
    return rows;
  }, [snapshot, collapsed, problemsByKey]);
  if (!items.length)
    return (
      <Text variant="body-sm" className="env-dev-sidebar-note">
        No layout nodes: no element under the root has a data-env-layout attribute, and no overlay
        is open.
      </Text>
    );
  return (
    // Hovering a row shows its node in the 3D view.
    <div
      className="env-dev-tree"
      onPointerOver={(event) => {
        const row = (event.target as Element).closest<HTMLElement>('[data-id]');
        onTreeHover(row ? Number(row.dataset.id) : null);
      }}
      onPointerLeave={() => onTreeHover(null)}
    >
      <Tree
        aria-label="Layout nodes"
        density="xs"
        items={items}
        value={selected === null ? null : String(selected)}
        onAction={(item) => onSelect(Number(item.value) === selected ? null : Number(item.value))}
        onExpandedChange={(item, expanded) =>
          setCollapsed((keys) => {
            const next = new Set(keys);
            if (expanded) next.delete(Number(item.value));
            else next.add(Number(item.value));
            return next;
          })
        }
      />
    </div>
  );
}

/** A heading of the details, quiet and small, as a NavigationDrawer's group headings are. */
const Heading = ({ children }: { children: ReactNode }) => (
  <Text variant="caption" render={<h3 />}>
    {children}
  </Text>
);

function Details({ full, node }: { full: Full; node: NodeData }) {
  const { snapshot } = full;
  const element = snapshot.elements?.[node.index];
  const problems = full.problemsByKey.get(node.key) ?? [];
  const part = node.part ? knownParts()?.byClass.get(node.part) : undefined;
  const width = toRem(node.size.w, snapshot.rootPx);
  const queries = node.container ? queriesFor(node.container.name, snapshot.queries) : [];
  const thresholds = thresholdsFor(queries);
  // Read once for the selected node: the tokens its style rules use.
  const tokens = useMemo(() => (element?.isConnected ? tokensUsedBy(element) : []), [element]);
  const states = element
    ? Array.from(element.attributes).filter(
        (attribute) =>
          attribute.name.startsWith('data-') &&
          !['data-env-layout', 'data-env-name'].includes(attribute.name),
      )
    : [];
  const line = full.reading.lines[node.index];
  return (
    <Column gap={4} render={<section aria-label={`Details of ${labelOf(node)}`} />}>
      <Text variant="title" render={<h2 />} className="env-dev-wrap">
        {labelOf(node)}
      </Text>
      <DescriptionList.Root layout="inline">
        <DescriptionList.Item label="Part">
          {node.part ? <code className="env-dev-code">{node.part}</code> : 'none'}
          {part ? ` · ${part.component}${part.root ? ' (root)' : ''}` : null}
        </DescriptionList.Item>
        {part?.description ? (
          <DescriptionList.Item label="What it is">{part.description}</DescriptionList.Item>
        ) : null}
        <DescriptionList.Item label="Size">
          {node.hidden ??
            `${width}×${toRem(node.size.h, snapshot.rootPx)}rem · ${windowClassOf(width)}`}
        </DescriptionList.Item>
        {states.length ? (
          <DescriptionList.Item label="State">
            <Column gap={0}>
              {states.map((attribute) => (
                <code key={attribute.name} className="env-dev-code">
                  {attribute.name}=&quot;{attribute.value}&quot;
                </code>
              ))}
            </Column>
          </DescriptionList.Item>
        ) : null}
        <DescriptionList.Item label="Container">
          {node.container
            ? `${node.container.name || '(no name)'} (${node.container.type}); ${thresholds.length ? `queried at ${thresholds.join(', ')}rem` : 'nothing queries it'}`
            : 'not a container'}
        </DescriptionList.Item>
      </DescriptionList.Root>
      {problems.length ? (
        <Column gap={1}>
          <Heading>Problems</Heading>
          {problems.map((problem) => (
            <Text key={problem.message} variant="body-sm" className="env-dev-problem">
              {problem.message}
            </Text>
          ))}
        </Column>
      ) : null}
      {queries.length ? (
        <Column gap={1}>
          <Heading>Queries that ask about it</Heading>
          {queries.map((query) => {
            const holds = conditionHolds(query.condition, width, snapshot.rootPx);
            return (
              <Text key={`${query.container}${query.condition}`} variant="body-sm">
                <code className="env-dev-code">
                  {query.container ? `${query.container} ` : ''}
                  {query.condition}
                </code>{' '}
                · {query.rules} {query.rules === 1 ? 'rule' : 'rules'}
                {holds === null ? '' : holds ? ' · holds now' : ''}
              </Text>
            );
          })}
        </Column>
      ) : null}
      {tokens.length ? (
        <Column gap={1}>
          <Heading>Tokens its styles use</Heading>
          <Grid columns="minmax(0, 1fr) auto" gap={1}>
            {tokens.map((token) => (
              <Fragment key={token.name}>
                <Text
                  variant="body-sm"
                  emphasis="default"
                  render={<code />}
                  className="env-dev-code"
                >
                  {token.name}
                </Text>
                <Text variant="body-sm" render={<span />}>
                  {token.value || '(not set)'}
                </Text>
              </Fragment>
            ))}
          </Grid>
        </Column>
      ) : null}
      {line ? (
        <Column gap={1}>
          <Heading>Readout line</Heading>
          <Readout text={line.trimStart()} />
        </Column>
      ) : null}
    </Column>
  );
}
