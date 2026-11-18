'use client';

import { Fragment, memo, useMemo, useState, type ReactNode } from 'react';
import { Button } from '../../actions/Button.js';
import { CopyButton } from '../../actions/CopyButton.js';
import { Badge } from '../../data-display/Badge.js';
import * as DescriptionList from '../../data-display/DescriptionList.js';
import { Column, Grid, Row } from '../../layout/Layout.js';
import { Surface } from '../../layout/Surface.js';
import { Text } from '../../foundations/Text.js';
import { IconContrast } from '../../icons/Contrast.js';
import { IconDarkMode } from '../../icons/DarkMode.js';
import { IconLightMode } from '../../icons/LightMode.js';
import { ResizeHandle } from '../../internal/resize/ResizeHandle.js';
import { useResizableWidth } from '../../internal/resize/useResizableWidth.js';
import { remPixels } from '../../internal/dom/lengths.js';
import * as Menu from '../../actions/menu/Menu.js';
import { SegmentedControl } from '../../forms/SegmentedControl.js';
import { Tree, type TreeItem } from '../../navigation/Tree.js';
import type { NodeData } from '../model.js';
import { knownParts } from '../parts.js';
import { conditionHolds, queriesFor, thresholdsFor } from '../queries.js';
import { labelOf } from '../readout.js';
import { tokensUsedBy } from '../usedTokens.js';
import { toRem } from '../units.js';
import { windowClassOfRem } from '../../foundations/windowClasses.js';
import { SidebarToggle, type Side } from './Controls.js';
import type { EditorTheme } from './editorTheme.js';
import { sideWidthsRem } from './sides.js';
import type { LivePage } from './useLivePage.js';

type FullMeasurement = NonNullable<LivePage['full']>;

const narrowestViewRem = 16;

function widestSidebarRem(handle: HTMLElement) {
  const sidebar = handle.closest('.env-dev-sidebar');
  const panel = handle.closest('.env-dev-panel');
  if (!sidebar || !panel) return Infinity;
  let others = 0;
  for (const other of Array.from(panel.querySelectorAll('.env-dev-sidebar')))
    if (other !== sidebar) others += other.getBoundingClientRect().width;
  const rem = remPixels(handle);
  return (panel.getBoundingClientRect().width - others) / rem - narrowestViewRem;
}

function Sidebar({
  side,
  label,
  defaultWidth,
  onWidthCommit,
  children,
}: {
  side: Side;
  label: string;
  defaultWidth: number;
  onWidthCommit: (width: number) => void;
  children: ReactNode;
}) {
  const bounds = sideWidthsRem[side];
  const growsTowardTheStart = side === 'inspector';
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
    room: widestSidebarRem,
    reverse: growsTowardTheStart,
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
      style={{ '--_dev-sidebar-width': `${resize.width}rem` }}
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
  full: LivePage['full'];
  selected: number | null;
  onSelect: (key: number | null) => void;
  onTreeHover: (key: number | null) => void;
  defaultWidth: number;
  onWidthCommit: (width: number) => void;
  onHide: () => void;
  editorTheme: { value: EditorTheme; onChange: (theme: EditorTheme) => void };
}

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
            {`${problemCount} ${problemCount === 1 ? 'problem' : 'problems'}`}
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
  full: LivePage['full'];
  selected: number | null;
  defaultWidth: number;
  onWidthCommit: (width: number) => void;
  onHide: () => void;
}

export const Inspector = memo(function Inspector({
  full,
  selected,
  defaultWidth,
  onWidthCommit,
  onHide,
}: InspectorProps) {
  const [view, setView] = useState('details');
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
      <Column className="env-dev-inspector-body">
        <Row gap={2} align="center" justify="between" className="env-dev-sidebar-head">
          <SegmentedControl
            aria-label="Inspector"
            size="sm"
            value={view}
            onValueChange={setView}
            items={[
              { value: 'details', label: 'Details' },
              { value: 'readout', label: 'Readout' },
            ]}
          />
          <SidebarToggle side="inspector" shown onClick={onHide} />
        </Row>
        <div
          role="region"
          aria-label={view === 'details' ? 'Details' : 'Readout'}
          className="env-dev-inspector-view"
        >
          {view === 'details' ? (
            current && full ? (
              <Details key={current.key} full={full} node={current} />
            ) : (
              <Text variant="body-sm">Select a node in the tree or click its plane.</Text>
            )
          ) : full ? (
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
              <WrappedReadout text={full.reading.text} />
            </Column>
          ) : null}
        </div>
      </Column>
    </Sidebar>
  );
});

function WrappedReadout({ text }: { text: string }) {
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
        <span key={index} className="env-dev-readout-line" style={{ '--_dev-indent': indent }}>
          {content || '\u00a0'}
          {'\n'}
        </span>
      ))}
    </pre>
  );
}

interface NodesProps {
  full: FullMeasurement;
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
      const listsItsChildren = node.hidden === null;
      rows.push({
        value: String(node.key),
        depth,
        node,
        label: labelOf(node),
        expandable: listsItsChildren && node.children.length > 0,
        expanded: open,
        description: node.hidden ?? undefined,
        tooltip: node.hidden ?? undefined,
        end: problems ? (
          <Badge tone="danger" variant="soft">
            {String(problems)}
          </Badge>
        ) : node.container ? (
          <Badge variant="outline">container</Badge>
        ) : undefined,
      });
      if (open && listsItsChildren)
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

const DetailsHeading = ({ children }: { children: ReactNode }) => (
  <Text variant="caption" render={<h3 />}>
    {children}
  </Text>
);

function Details({ full, node }: { full: FullMeasurement; node: NodeData }) {
  const { snapshot } = full;
  const element = snapshot.elements?.[node.index];
  const problems = full.problemsByKey.get(node.key) ?? [];
  const part = node.part ? knownParts()?.byClass.get(node.part) : undefined;
  const width = toRem(node.size.w, snapshot.rootPx);
  const queries = node.container ? queriesFor(node.container.name, snapshot.queries) : [];
  const thresholds = thresholdsFor(queries);
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
            `${width}×${toRem(node.size.h, snapshot.rootPx)}rem · ${windowClassOfRem(width)}`}
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
          <DetailsHeading>Problems</DetailsHeading>
          {problems.map((problem) => (
            <Text key={problem.message} variant="body-sm" className="env-dev-problem">
              {problem.message}
            </Text>
          ))}
        </Column>
      ) : null}
      {queries.length ? (
        <Column gap={1}>
          <DetailsHeading>Queries that ask about it</DetailsHeading>
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
          <DetailsHeading>Tokens its styles use</DetailsHeading>
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
          <DetailsHeading>Readout line</DetailsHeading>
          <WrappedReadout text={line.trimStart()} />
        </Column>
      ) : null}
    </Column>
  );
}
