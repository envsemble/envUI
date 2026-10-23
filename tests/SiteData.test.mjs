// The Site's data from the repository: the benchmark's saved runs and the release notes, which the
// Benchmark and Changelog pages read when the catalogue builds.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  agentLabel,
  latestRun,
  readBenchmark,
  readBenchmarkRuns,
} from '../scripts/BenchmarkResults.mjs';
import {
  inlinePieces,
  parseReleaseNotes,
  readReleaseNotes,
  releaseNotesProblems,
} from '../scripts/ReleaseNotes.mjs';

/** A results.json with what the page reads. */
const results = (runId, createdAt, mean) => ({
  runId,
  createdAt,
  date: createdAt.slice(0, 10),
  conditions: ['baseline'],
  fixture: 'basic',
  envui: { version: '1.0.0', sourceCommit: '0123456789abcdef' },
  agents: { opus: { label: 'Claude Code', model: 'claude-opus-5-5', effort: 'low' } },
  settings: { tasks: ['sidebar', 'settings-form'] },
  aggregates: [
    {
      condition: 'baseline',
      agent: 'opus',
      runs: 2,
      score: { mean, median: mean },
      typecheckPassRate: 1,
      capabilities: { covered: 4, total: 5 },
    },
  ],
});

test('the saved benchmark runs load, and the newest is the latest', () => {
  const { runs, latest } = readBenchmark();
  assert.ok(runs.length > 0, 'bench/results has runs');
  for (const run of runs) {
    assert.ok(run.id && run.date, run.id);
    assert.ok(run.agents.length > 0, run.id);
    for (const agent of run.agents) {
      assert.ok(agent.mean >= 0 && agent.mean <= 100, `${run.id} ${agent.id}`);
      assert.ok(agent.capabilities.covered <= agent.capabilities.total);
    }
  }
  const newest = [...runs].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  assert.equal(latest.id, newest.id);
});

test('the latest run is the one made last, whatever the folder names', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bench-results-'));
  try {
    const save = (folder, data) => {
      mkdirSync(join(directory, folder));
      writeFileSync(join(directory, folder, 'results.json'), JSON.stringify(data));
    };
    save('b-older', results('older', '2026-10-01T10:00:00.000Z', 80));
    save('a-newer', results('newer', '2026-10-20T10:00:00.000Z', 90));
    mkdirSync(join(directory, 'no-results'));
    const runs = readBenchmarkRuns(directory);
    assert.deepEqual(
      runs.map((run) => run.id),
      ['older', 'newer'],
    );
    const latest = latestRun(runs);
    assert.equal(latest.id, 'newer');
    assert.equal(latest.agents[0].label, 'Claude Code, Opus 5.5, low effort');
    assert.equal(latest.agents[0].layoutProblems, null);
    assert.equal(latest.envui.commit, '0123456');
    assert.deepEqual(readBenchmark(join(directory, 'missing')), { runs: [], latest: null });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("an agent's label names its model once", () => {
  assert.equal(
    agentLabel({ label: 'Claude Code, Haiku 5.5', model: 'claude-haiku-5-5', effort: 'high' }),
    'Claude Code, Haiku 5.5, high effort',
  );
  assert.equal(agentLabel({ label: 'Agent', model: 'other-model' }), 'Agent, other-model');
});

test('the release notes hold: newest first, five highlights at most, links to sections of the Docs', () => {
  const releases = readReleaseNotes();
  assert.ok(releases.length >= 10);
  assert.equal(releases.at(-1).version, '0.1.0');
  assert.ok(releases.every((release) => release.highlights.length <= 5));
});

test('the release notes checks find what is wrong', () => {
  const releases = parseReleaseNotes(`## 0.1.0 — 2026-10-10

- One.

### Breaking changes

- No link.
- [A missing section](/docs/migration#nowhere).

## 0.2.0 — Upcoming

- Two.
`);
  const problems = releaseNotesProblems(releases, { '/docs/migration': new Set(['tokens']) });
  assert.deepEqual(problems, [
    'Release 0.1.0 comes before 0.2.0; list the newest first.',
    'Release 0.1.0 has a breaking change without a link.',
    "Release 0.1.0 links to /docs/migration#nowhere, a section that page doesn't have.",
    'Release 0.2.0 is upcoming but not the newest.',
  ]);
  assert.deepEqual(inlinePieces('Use [`Row`](/docs/migration#tokens) now'), [
    { kind: 'text', text: 'Use ' },
    { kind: 'link', href: '/docs/migration#tokens', children: [{ kind: 'code', text: 'Row' }] },
    { kind: 'text', text: ' now' },
  ]);
});
