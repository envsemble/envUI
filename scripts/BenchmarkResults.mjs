// The agent benchmark's saved runs, bench/results/<run-id>/results.json, read into the little the
// Site's Benchmark page shows: each run's agents and their scores. The catalogue reads them when
// it builds, through the virtual module in apps/catalogue/vite.config.ts, so the page shows the
// newest run without anyone copying numbers.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const benchmarkResultsDirectory = fileURLToPath(
  new URL('../bench/results/', import.meta.url),
);

/** A model's name as people say it, such as Opus 5.5 for claude-opus-5-5; others as they are. */
export function modelName(model) {
  const claude = /^claude-([a-z]+)-(\d+)-(\d+)$/.exec(model ?? '');
  if (!claude) return model ?? 'unknown model';
  const [, family, major, minor] = claude;
  return `${family[0].toUpperCase()}${family.slice(1)} ${major}.${minor}`;
}

/**
 * An agent's name with its model and effort, such as "Claude Code, Opus 5.5, low effort". Later
 * runs label the agent with its model already; earlier ones name the tool alone.
 */
export function agentLabel(agent) {
  const label = agent.label ?? 'Agent';
  const model = modelName(agent.model);
  const named = label.includes(model) ? label : `${label}, ${model}`;
  return agent.effort ? `${named}, ${agent.effort} effort` : named;
}

/** One run's results.json as the page shows it. */
export function summarizeRun(results) {
  const agents = results.aggregates.map((aggregate) => {
    const agent = results.agents?.[aggregate.agent] ?? {};
    return {
      id: aggregate.agent,
      label: agentLabel(agent),
      model: agent.model ?? null,
      effort: agent.effort ?? null,
      condition: aggregate.condition,
      runs: aggregate.runs,
      mean: aggregate.score.mean,
      median: aggregate.score.median,
      typecheckPassRate: aggregate.typecheckPassRate,
      capabilities: aggregate.capabilities,
      // Runs before the browser step have no layout check; the page says so rather than 0.
      layoutProblems: aggregate.layout ? aggregate.layout.problems : null,
      layoutChecked: aggregate.layout ? aggregate.layout.checked : null,
    };
  });
  return {
    id: results.runId,
    date: results.date,
    createdAt: results.createdAt,
    fixture: results.fixture,
    conditions: results.conditions,
    tasks: results.settings?.tasks?.length ?? null,
    envui: {
      version: results.envui?.version ?? null,
      commit: results.envui?.sourceCommit?.slice(0, 7) ?? null,
    },
    agents,
  };
}

/** Every saved run, oldest first, by when it was made. */
export function readBenchmarkRuns(directory = benchmarkResultsDirectory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(directory, entry.name, 'results.json'))
    .filter((file) => existsSync(file))
    .map((file) => summarizeRun(JSON.parse(readFileSync(file, 'utf8'))))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

/** The newest run, which the page's scores are of. */
export const latestRun = (runs) => runs.at(-1);

/** The page's data: every run, oldest first, and the newest. */
export function readBenchmark(directory = benchmarkResultsDirectory) {
  const runs = readBenchmarkRuns(directory);
  return { runs, latest: latestRun(runs) ?? null };
}
