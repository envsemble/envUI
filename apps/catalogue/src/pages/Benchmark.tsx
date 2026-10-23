import { useId } from 'react';
import { Column, Disclosure, Table, Text } from '@envsemble/envui';
import benchmark from 'virtual:envui-benchmark';
import type { BenchmarkAgent, BenchmarkRun } from './SiteData';

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));

const percent = (share: number) => `${Math.round(share * 100)}%`;

/** What a run measured, in one quiet line: its date, the envUI build, the tasks and the app. */
function RunFacts({ run }: { run: BenchmarkRun }) {
  const build = [run.envui.version && `envUI ${run.envui.version}`, run.envui.commit]
    .filter(Boolean)
    .join(' at ');
  const facts = [
    formatDate(run.date),
    build,
    run.tasks && `${run.tasks} tasks`,
    `${run.fixture === 'hard' ? 'the app with hand-rolled components' : 'the plain app'}`,
  ].filter(Boolean);
  return (
    <Text variant="body-sm" emphasis="muted">
      {run.id} · {facts.join(' · ')}
    </Text>
  );
}

/** The newest run's scores, one row per agent. */
function LatestScores({ run }: { run: BenchmarkRun }) {
  return (
    <Table.Root aria-label={`Scores of run ${run.id}`} density="sm" narrowLayout="stack">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Agent</Table.HeaderCell>
          <Table.HeaderCell numeric>Mean</Table.HeaderCell>
          <Table.HeaderCell numeric>Median</Table.HeaderCell>
          <Table.HeaderCell numeric>Type check passes</Table.HeaderCell>
          <Table.HeaderCell numeric>Capabilities covered</Table.HeaderCell>
          <Table.HeaderCell numeric>Layout problems</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {run.agents.map((agent) => (
          <Table.Row key={agent.id}>
            <Table.Cell>{agent.label}</Table.Cell>
            <Table.Cell numeric label="Mean">
              {agent.mean}
            </Table.Cell>
            <Table.Cell numeric label="Median">
              {agent.median}
            </Table.Cell>
            <Table.Cell numeric label="Type check passes">
              {percent(agent.typecheckPassRate)}
            </Table.Cell>
            <Table.Cell numeric label="Capabilities covered">
              {agent.capabilities.covered} of {agent.capabilities.total}
            </Table.Cell>
            <Table.Cell numeric label="Layout problems">
              {agent.layoutProblems ?? 'Not checked'}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/** One bar: an agent's mean score on a track from 0 to 100. */
function ScoreBar({ agent }: { agent: BenchmarkAgent }) {
  return (
    <div className="docs-bench-bar-row">
      <Text variant="body-sm" className="docs-bench-bar-label">
        {agent.label}
      </Text>
      <svg className="docs-bench-bar" aria-hidden="true" focusable="false">
        <title>{`${agent.label}: ${agent.mean}`}</title>
        <rect className="docs-bench-bar-track" x="0" y="0" width="100%" height="100%" rx="4" />
        <rect
          className="docs-bench-bar-value"
          x="0"
          y="0"
          width={`${Math.max(0, Math.min(100, agent.mean))}%`}
          height="100%"
          rx="4"
        />
      </svg>
      <Text variant="body-sm" className="docs-bench-bar-value-label">
        {agent.mean}
      </Text>
    </div>
  );
}

/**
 * The mean score of every agent in every run, oldest run first, as horizontal bars on a 0 to 100
 * scale. One color: each bar is named by its agent beside it, not by a legend. The chart is an
 * image for assistive technology, named and described here, and its data follows as a table.
 */
function ScoresChart({ runs }: { runs: BenchmarkRun[] }) {
  const id = useId();
  const description = runs
    .map(
      (run) => `${run.id}: ${run.agents.map((agent) => `${agent.label} ${agent.mean}`).join(', ')}`,
    )
    .join('; ');
  return (
    <Column gap={4} render={<figure />} className="docs-bench-figure">
      <div
        role="img"
        aria-labelledby={`${id}-caption`}
        aria-describedby={`${id}-description`}
        className="docs-bench-chart"
      >
        {runs.map((run) => (
          <Column key={run.id} gap={2} className="docs-bench-chart-run">
            <RunFacts run={run} />
            {run.agents.map((agent) => (
              <ScoreBar key={agent.id} agent={agent} />
            ))}
          </Column>
        ))}
        <div className="docs-bench-axis" aria-hidden="true">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
      <Text id={`${id}-description`} className="docs-visually-hidden">
        {description}
      </Text>
      <Text id={`${id}-caption`} render={<figcaption />} variant="body-sm" emphasis="muted">
        Mean score out of 100 by run and agent, oldest run first.
      </Text>
      <Disclosure title="The chart's data as a table">
        <Table.Root aria-label="Mean score by run and agent" density="sm" narrowLayout="stack">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Run</Table.HeaderCell>
              <Table.HeaderCell>Agent</Table.HeaderCell>
              <Table.HeaderCell numeric>Mean</Table.HeaderCell>
              <Table.HeaderCell numeric>Median</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {runs.flatMap((run) =>
              run.agents.map((agent) => (
                <Table.Row key={`${run.id}-${agent.id}`}>
                  <Table.Cell>{run.id}</Table.Cell>
                  <Table.Cell label="Agent">{agent.label}</Table.Cell>
                  <Table.Cell numeric label="Mean">
                    {agent.mean}
                  </Table.Cell>
                  <Table.Cell numeric label="Median">
                    {agent.median}
                  </Table.Cell>
                </Table.Row>
              )),
            )}
          </Table.Body>
        </Table.Root>
      </Disclosure>
    </Column>
  );
}

/**
 * What differs between the runs, so the chart is read fairly: other agents, the harder app and
 * the layout check, which later runs added.
 */
export function runNotes(runs: BenchmarkRun[]) {
  const notes: string[] = [];
  const agentsOf = (run: BenchmarkRun) => run.agents.map((agent) => agent.label).join('|');
  if (new Set(runs.map(agentsOf)).size > 1) notes.push('Runs differ in the agents they ran.');
  if (runs.some((run) => run.fixture === 'hard'))
    notes.push(
      'The runs on the app with hand-rolled components give agents its own buttons and dialogs to imitate.',
    );
  const layout = runs.findIndex((run) => run.agents.some((agent) => agent.layoutChecked !== null));
  if (layout > 0)
    notes.push(
      `The layout check at four widths began with ${runs[layout].id}; earlier scores leave it out.`,
    );
  if (notes.length) notes.push("Compare a run's agents with each other more than across runs.");
  return notes;
}

/** The benchmark page's content: what it measures, the newest run's scores and every run's. */
export function Benchmark() {
  const { latest, runs } = benchmark;
  return (
    <Column gap={7} className="docs-article docs-bench">
      <Column gap={3}>
        <Text>
          The benchmark gives coding agents real product tasks, such as a settings form, a sidebar
          or a table of projects, in a small app that uses envUI, phrased the way a product engineer
          would ask without naming any component.
        </Text>
        <Text>
          Each result is scored on how much of what the agent built uses envUI rather than
          hand-rolled elements and styles, on its layout rendered in a browser at four widths, and
          on type errors. A score is out of 100.
        </Text>
      </Column>
      {latest ? (
        <Column gap={4} render={<section aria-labelledby="benchmark-latest" />}>
          <Column gap={1}>
            <Text render={<h2 id="benchmark-latest" />} variant="title">
              Latest run
            </Text>
            <RunFacts run={latest} />
          </Column>
          <LatestScores run={latest} />
        </Column>
      ) : (
        <Text emphasis="muted">No run has been saved yet.</Text>
      )}
      {runs.length > 0 && (
        <Column gap={4} render={<section aria-labelledby="benchmark-runs" />}>
          <Column gap={2}>
            <Text render={<h2 id="benchmark-runs" />} variant="title">
              Scores by run
            </Text>
            {runNotes(runs).length > 0 && <Text>{runNotes(runs).join(' ')}</Text>}
          </Column>
          <ScoresChart runs={runs} />
        </Column>
      )}
    </Column>
  );
}
