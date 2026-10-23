/** The shapes of the Site's data from the repository; see the virtual modules in vite.config.ts. */

/** One agent's results in a benchmark run, as scripts/BenchmarkResults.mjs summarizes them. */
export interface BenchmarkAgent {
  id: string;
  /** The agent with its model and effort, such as "Claude Code, Opus 5.5, low effort". */
  label: string;
  model: string | null;
  effort: string | null;
  condition: string;
  runs: number;
  mean: number;
  median: number;
  /** The share of runs whose result type-checks, from 0 to 1. */
  typecheckPassRate: number;
  capabilities: { covered: number; total: number };
  /** Layout problems found at the four widths; null for runs before the browser step. */
  layoutProblems: number | null;
  layoutChecked: number | null;
}

/** One saved benchmark run. */
export interface BenchmarkRun {
  id: string;
  date: string;
  createdAt: string;
  fixture: string;
  conditions: string[];
  tasks: number | null;
  envui: { version: string | null; commit: string | null };
  agents: BenchmarkAgent[];
}

export interface Benchmark {
  /** Every saved run, oldest first. */
  runs: BenchmarkRun[];
  latest: BenchmarkRun | null;
}

/** A piece of a line of the release notes: text, code, or a link whose text has pieces of its own. */
export type InlinePiece =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; href: string; children: InlinePiece[] };

/** One release's entry in the release notes. */
export interface Release {
  version: string;
  /** The release's date, YYYY-MM-DD; null while it is upcoming. */
  date: string | null;
  upcoming: boolean;
  highlights: InlinePiece[][];
  breaking: InlinePiece[][];
}
