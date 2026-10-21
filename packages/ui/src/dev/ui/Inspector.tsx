'use client';

// The inspector beside the 3D view: the nodes as a tree, the selected node in detail, and the
// readout an agent reads.

import { useMemo, useState } from 'react';
import { Badge } from '../../content/Badge.js';
import { Code } from '../../content/Code.js';
import { Text } from '../../foundations/Text.js';
import { Tabs } from '../../navigation/Tabs.js';
import { Tree, type TreeItem } from '../../navigation/Tree.js';
import { Button } from '../../actions/Button.js';
import type { NodeData, Snapshot } from '../model.js';
import { knownParts } from '../parts.js';
import { conditionHolds, queriesFor, thresholdsFor } from '../queries.js';
import { labelOf } from '../readout.js';
import { tokensUsedBy } from '../usedTokens.js';
import { toRem, windowClassOf } from '../units.js';
import type { LivePage } from './useLivePage.js';

export interface InspectorProps {
  live: LivePage;
  selected: number | null;
  onSelect: (key: number | null) => void;
  onTreeHover: (key: number | null) => void;
  onClose: () => void;
}

export function Inspector({ live, selected, onSelect, onTreeHover, onClose }: InspectorProps) {
  const [tab, setTab] = useState<string | null>('nodes');
  const full = live.full;
  const problemCount = full?.reading.problems.length ?? 0;
  return (
    <aside className="env-dev-inspector" aria-label="Dev mode inspector">
      <Tabs
        aria-label="Inspector"
        className="env-dev-tabs"
        panelClassName="env-dev-tab-panel"
        value={tab}
        onValueChange={setTab}
        size="sm"
        renderList={(list) => (
          <div className="env-dev-inspector-head">
            {list}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
        items={[
          {
            value: 'nodes',
            button: <Button>Nodes{problemCount ? ` · ${problemCount} problems` : ''}</Button>,
            content: full ? (
              <Nodes
                snapshot={full.snapshot}
                live={live}
                selected={selected}
                onSelect={onSelect}
                onTreeHover={onTreeHover}
              />
            ) : (
              <Text emphasis="muted">Measuring…</Text>
            ),
          },
          {
            value: 'readout',
            button: <Button>Readout</Button>,
            content: full ? (
              <>
                <Text variant="body-sm" emphasis="muted">
                  What <Code>envui.layout.describe()</Code> returns. Try{' '}
                  <Code>envui.layout.at(['22rem', '40rem', '60rem', '80rem'])</Code> in the console.
                </Text>
                <CopyReadout text={full.reading.text} />
                <pre className="env-dev-readout">{full.reading.text}</pre>
              </>
            ) : null,
          },
        ]}
      />
    </aside>
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
  const current =
    selected === null ? undefined : snapshot.nodes.find((node) => node.key === selected);
  return (
    <>
      {items.length ? (
        // Hovering a row shows its node in the 3D view.
        <div
          onPointerOver={(event) => {
            const row = (event.target as Element).closest<HTMLElement>('[data-id]');
            onTreeHover(row ? Number(row.dataset.id) : null);
          }}
          onPointerLeave={() => onTreeHover(null)}
        >
          <Tree
            aria-label="Layout nodes"
            className="env-dev-tree"
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
      ) : (
        <Text emphasis="muted">
          No layout nodes: no element under the root has a data-env-layout attribute, and no overlay
          is open.
        </Text>
      )}
      {current ? (
        <Details key={current.key} snapshot={snapshot} node={current} live={live} />
      ) : (
        <Text variant="body-sm" emphasis="muted">
          Select a node in the tree or click its plane.
        </Text>
      )}
    </>
  );
}

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
    <section className="env-dev-details" aria-label={`Details of ${labelOf(node)}`}>
      <Text variant="title" render={<h2 />}>
        {labelOf(node)}
      </Text>
      <dl>
        <dt>Part</dt>
        <dd>
          {node.part ? <Code>{node.part}</Code> : 'none'}
          {part ? ` · ${part.component}${part.root ? ' (root)' : ''}` : null}
        </dd>
        {part?.description ? (
          <>
            <dt>What it is</dt>
            <dd>{part.description}</dd>
          </>
        ) : null}
        <dt>Size</dt>
        <dd>
          {node.hidden ??
            `${width}×${toRem(node.size.h, snapshot.rootPx)}rem · ${windowClassOf(width)}`}
        </dd>
        {states.length ? (
          <>
            <dt>State</dt>
            <dd>{states.map((attribute) => `${attribute.name}="${attribute.value}"`).join(' ')}</dd>
          </>
        ) : null}
        <dt>Container</dt>
        <dd>
          {node.container
            ? `${node.container.name || '(no name)'} (${node.container.type}); ${thresholds.length ? `queried at ${thresholds.join(', ')}rem` : 'nothing queries it'}`
            : 'not a container'}
        </dd>
      </dl>
      {queries.length ? (
        <>
          <Text variant="body-sm" render={<h3 />}>
            Queries that ask about it
          </Text>
          <ul>
            {queries.map((query) => {
              const holds = conditionHolds(query.condition, width, snapshot.rootPx);
              return (
                <li key={`${query.container}${query.condition}`}>
                  <Code>
                    {query.container ? `${query.container} ` : ''}
                    {query.condition}
                  </Code>{' '}
                  · {query.rules} {query.rules === 1 ? 'rule' : 'rules'}
                  {holds === null ? '' : holds ? ' · holds now' : ''}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      {problems.length ? (
        <>
          <Text variant="body-sm" render={<h3 />}>
            Problems
          </Text>
          <ul>
            {problems.map((problem) => (
              <li key={problem.message} className="env-dev-problem">
                {problem.message}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {tokens.length ? (
        <>
          <Text variant="body-sm" render={<h3 />}>
            Tokens its styles use
          </Text>
          <div className="env-dev-tokens">
            {tokens.map((token) => (
              <span key={token.name} style={{ display: 'contents' }}>
                <Code>{token.name}</Code>
                <span>{token.value || '(not set)'}</span>
              </span>
            ))}
          </div>
        </>
      ) : null}
      {line ? (
        <>
          <Text variant="body-sm" render={<h3 />}>
            Readout line
          </Text>
          <pre className="env-dev-readout">{line}</pre>
        </>
      ) : null}
    </section>
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
