'use client';

// Dev mode's two sidebars: the nodes as a tree on one side of the 3D view, and on the other the
// inspector, with the selected node in detail and the readout an agent reads.

import { useMemo, useState, type ReactNode } from 'react';
import { Button, IconButton } from '../../actions/Button.js';
import { Badge } from '../../content/Badge.js';
import * as DescriptionList from '../../content/DescriptionList.js';
import { Tooltip } from '../../feedback/Tooltip.js';
import { Column, Grid, Row } from '../../foundations/Layout.js';
import { Surface } from '../../foundations/Surface.js';
import { Text } from '../../foundations/Text.js';
import { Close } from '../../icons/Close.js';
import { Tabs } from '../../navigation/Tabs.js';
import { Tree, type TreeItem } from '../../navigation/Tree.js';
import type { NodeData, Snapshot } from '../model.js';
import { knownParts } from '../parts.js';
import { conditionHolds, queriesFor, thresholdsFor } from '../queries.js';
import { labelOf } from '../readout.js';
import { tokensUsedBy } from '../usedTokens.js';
import { toRem, windowClassOf } from '../units.js';
import type { LivePage } from './useLivePage.js';

/** A sidebar: a flush, square pane on the navigation's color, as a Drawer is. */
function Sidebar({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Surface
      background="default"
      radius="none"
      padding={0}
      render={<Column gap={2} render={<aside aria-label={label} />} />}
      className="env-dev-sidebar"
    >
      {children}
    </Surface>
  );
}

export interface NodeTreeProps {
  live: LivePage;
  selected: number | null;
  onSelect: (key: number | null) => void;
  onTreeHover: (key: number | null) => void;
}

/** The nodes as a tree, in a sidebar of their own. */
export function NodeTree({ live, selected, onSelect, onTreeHover }: NodeTreeProps) {
  const full = live.full;
  const problemCount = full?.reading.problems.length ?? 0;
  return (
    <Sidebar label="Layout nodes">
      <Row gap={2} align="center" className="env-dev-sidebar-head">
        <Text variant="body-sm" emphasis="default" render={<h2 />} className="env-dev-heading">
          Nodes
        </Text>
        {problemCount ? (
          <Text variant="body-sm" render={<span />}>
            {problemCount} {problemCount === 1 ? 'problem' : 'problems'}
          </Text>
        ) : null}
      </Row>
      {full ? (
        <Nodes
          snapshot={full.snapshot}
          live={live}
          selected={selected}
          onSelect={onSelect}
          onTreeHover={onTreeHover}
        />
      ) : (
        <Text variant="body-sm" className="env-dev-sidebar-note">
          Measuring…
        </Text>
      )}
    </Sidebar>
  );
}

export interface InspectorProps {
  live: LivePage;
  selected: number | null;
  onClose: () => void;
}

/** The selected node in detail, and the readout, in the sidebar across the view from the tree. */
export function Inspector({ live, selected, onClose }: InspectorProps) {
  const [tab, setTab] = useState<string | null>('details');
  const full = live.full;
  const current =
    full && selected !== null
      ? full.snapshot.nodes.find((node) => node.key === selected)
      : undefined;
  return (
    <Sidebar label="Dev mode inspector">
      <Tabs
        aria-label="Inspector"
        className="env-dev-tabs"
        panelClassName="env-dev-tab-panel"
        value={tab}
        onValueChange={setTab}
        size="sm"
        renderList={(list) => (
          <Row gap={2} align="center" justify="between" className="env-dev-sidebar-head">
            {list}
            <Tooltip content="Close dev mode (Esc)">
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Close />}
                aria-label="Close"
                onClick={onClose}
              />
            </Tooltip>
          </Row>
        )}
        items={[
          {
            value: 'details',
            button: <Button>Details</Button>,
            content:
              current && full ? (
                <Details key={current.key} snapshot={full.snapshot} node={current} live={live} />
              ) : (
                <Text variant="body-sm">Select a node in the tree or click its plane.</Text>
              ),
          },
          {
            value: 'readout',
            button: <Button>Readout</Button>,
            content: full ? (
              <>
                <Text variant="body-sm">
                  What <code className="env-dev-code">envui.layout.describe()</code> returns. Try{' '}
                  <code className="env-dev-code">
                    envui.layout.at(['22rem', '40rem', '60rem', '80rem'])
                  </code>{' '}
                  in the console.
                </Text>
                <CopyReadout text={full.reading.text} />
                <pre className="env-dev-readout">{full.reading.text}</pre>
              </>
            ) : null,
          },
        ]}
      />
    </Sidebar>
  );
}

interface NodesProps {
  snapshot: Snapshot;
  live: LivePage;
  selected: number | null;
  onSelect: (key: number | null) => void;
  onTreeHover: (key: number | null) => void;
}

function Nodes({ snapshot, live, selected, onSelect, onTreeHover }: NodesProps) {
  const [collapsed, setCollapsed] = useState(() => new Set<number>());
  const problemsByKey = live.full?.problemsByKey;
  const items = useMemo(() => {
    const rows: (TreeItem & { node: NodeData })[] = [];
    const visit = (node: NodeData, depth: number) => {
      const open = !collapsed.has(node.key);
      const problems = problemsByKey?.get(node.key)?.length ?? 0;
      rows.push({
        id: String(node.key),
        depth,
        node,
        label: labelOf(node),
        // A hidden node's nodes are counted in its readout line, not listed.
        expandable: node.hidden === null && node.children.length > 0,
        expanded: open,
        description: node.hidden ?? undefined,
        title: node.hidden ?? undefined,
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
        onAction={(item) => onSelect(Number(item.id) === selected ? null : Number(item.id))}
        onExpandedChange={(item, expanded) =>
          setCollapsed((keys) => {
            const next = new Set(keys);
            if (expanded) next.delete(Number(item.id));
            else next.add(Number(item.id));
            return next;
          })
        }
      />
    </div>
  );
}

/** A heading of the details, quiet and small, as a side column's section headings are. */
const Heading = ({ children }: { children: ReactNode }) => (
  <Text variant="body-sm" emphasis="default" render={<h3 />} className="env-dev-heading">
    {children}
  </Text>
);

function Details({ snapshot, node, live }: { snapshot: Snapshot; node: NodeData; live: LivePage }) {
  const element = snapshot.elements?.[node.index];
  const problems = live.full?.problemsByKey.get(node.key) ?? [];
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
  const line = live.full?.reading.lines[node.index];
  return (
    <Column gap={4} render={<section aria-label={`Details of ${labelOf(node)}`} />}>
      <Text variant="body-sm" emphasis="default" render={<h2 />} className="env-dev-heading">
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
          <Grid columns="minmax(0, 1fr) auto" gap={1} className="env-dev-tokens">
            {tokens.map((token) => (
              <span key={token.name} style={{ display: 'contents' }}>
                <code className="env-dev-code">{token.name}</code>
                <span className="env-dev-quiet">{token.value || '(not set)'}</span>
              </span>
            ))}
          </Grid>
        </Column>
      ) : null}
      {line ? (
        <Column gap={1}>
          <Heading>Readout line</Heading>
          <pre className="env-dev-readout" data-wrap="">
            {line}
          </pre>
        </Column>
      ) : null}
    </Column>
  );
}

/**
 * Copies the readout. A plain button that says when it copied: CopyButton's tooltip would open
 * outside dev mode's UI, where the readout would list it as an overlay of the page.
 */
function CopyReadout({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          void navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          });
        }}
      >
        {copied ? 'Copied' : 'Copy the readout'}
      </Button>
    </div>
  );
}
